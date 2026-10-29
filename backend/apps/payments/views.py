"""Stripe Checkout endpoints: plans, checkout, webhook, session status."""
from __future__ import annotations

import json
import logging

import stripe
from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import QuerySet
from django.views.decorators.csrf import csrf_exempt
from rest_framework import serializers, status, viewsets
from rest_framework.exceptions import NotFound
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.api.exceptions import AlreadyPaid, PaymentsUnavailable
from apps.api.views import success
from apps.pages.models import MemorialPage, PageState

from .models import Payment
from .plans import PLANS
from .services import handle_event

logger = logging.getLogger(__name__)


class CheckoutSerializer(serializers.Serializer):
    """Checkout request body."""

    package = serializers.ChoiceField(choices=list(PLANS))
    consent_ai = serializers.BooleanField(required=False, default=False)

    def validate(self, attrs: dict) -> dict:
        """Premium needs explicit consent to AI animation of the portrait."""
        explicit = self.initial_data.get("consent_ai") is True  # no "yes"/1 coercion
        if attrs["package"] == "premium" and not (attrs["consent_ai"] and explicit):
            raise serializers.ValidationError(
                {"consent_ai": "Consent is required for the Premium package."}
            )
        return attrs


class PaymentViewSet(viewsets.ViewSet):
    """Plans, checkout and session status."""

    throttle_scope: str | None = None

    def get_permissions(self) -> list:
        """Plans are public; everything else needs a login."""
        return [AllowAny()] if self.action == "plans" else [IsAuthenticated()]

    def plans(self, request: Request) -> Response:
        """List purchasable plans."""
        return success(
            [
                {
                    "id": p.id,
                    "name": p.name,
                    "amount_cents": p.amount_cents,
                    "currency": p.currency,
                    "available": p.available,
                }
                for p in PLANS.values()
            ]
        )

    def checkout(self, request: Request, slug: str | None = None) -> Response:
        """Create a Stripe Checkout Session for a draft page (page owner only)."""
        page = MemorialPage.objects.filter(slug=slug, owner=request.user).first()
        if page is None:
            raise NotFound("Page not found.")
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plan = PLANS[serializer.validated_data["package"]]
        consent_ai = serializer.validated_data["consent_ai"]

        if page.is_paid:
            raise AlreadyPaid()
        if page.state != PageState.DRAFT:
            raise DjangoValidationError(f"Cannot pay: page is '{page.state}', expected 'draft'.")
        if not plan.available:
            raise PaymentsUnavailable()

        front = settings.FRONTEND_URL.rstrip("/")
        try:
            session = stripe.checkout.Session.create(
                api_key=settings.STRIPE_SECRET_KEY,
                mode="payment",
                line_items=[{"price": plan.price_id, "quantity": 1}],
                success_url=front + "/success?session_id={CHECKOUT_SESSION_ID}",
                cancel_url=f"{front}/dashboard?checkout=canceled&page={page.slug}",
                client_reference_id=str(page.pk),
                customer_email=request.user.email,
                metadata={
                    "page_id": str(page.pk),
                    "user_id": str(request.user.pk),
                    "package": plan.id,
                    "consent_ai": "true" if consent_ai else "false",
                },
            )
        except stripe.StripeError:
            logger.exception("Stripe checkout session creation failed (page %s)", page.pk)
            raise PaymentsUnavailable() from None

        Payment.objects.create(
            page=page,
            user=request.user,
            package=plan.id,
            amount_cents=plan.amount_cents,
            currency=plan.currency,
            stripe_session_id=session["id"],
            consent_ai=consent_ai,
        )
        return success({"checkout_url": session["url"]})

    def session_status(self, request: Request, session_id: str | None = None) -> Response:
        """Status of a Checkout Session for the paying user or an admin."""
        payment = self._payments().filter(stripe_session_id=session_id or "").first()
        if payment is None or not (
            request.user.is_admin or payment.user_id == request.user.id
        ):
            raise NotFound("Not found.")
        page = payment.page
        return success(
            {
                "status": payment.status,
                "package": payment.package,
                "page": {
                    "slug": page.slug,
                    "state": page.state,
                    "first_name": page.first_name,
                    "last_name": page.last_name,
                },
            }
        )

    @staticmethod
    def _payments() -> QuerySet:
        """Payments with their page joined."""
        return Payment.objects.select_related("page")


class StripeWebhookView(APIView):
    """Stripe -> us. Authenticated by signature only; never throttled."""

    authentication_classes: list = []
    permission_classes = [AllowAny]
    throttle_classes: list = []

    @staticmethod
    def _bad(message: str, code: str, http_status: int = status.HTTP_400_BAD_REQUEST) -> Response:
        """Error envelope."""
        return Response({"success": False, "error": message, "code": code}, status=http_status)

    def post(self, request: Request) -> Response:
        """Verify the signature, then process the event idempotently."""
        secret = settings.STRIPE_WEBHOOK_SECRET
        if not secret:
            return self._bad(
                "Payments are temporarily unavailable.",
                "PAYMENTS_UNAVAILABLE",
                status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        payload = request.body
        header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
        try:
            stripe.Webhook.construct_event(payload, header, secret)
            event = json.loads(payload)
        except (ValueError, stripe.SignatureVerificationError):
            return self._bad("Invalid signature.", "INVALID_SIGNATURE")
        handle_event(event)
        return success(None)


# Stripe cannot send CSRF tokens (APIView is already exempt; explicit for clarity).
webhook_view = csrf_exempt(StripeWebhookView.as_view())
