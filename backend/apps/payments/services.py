"""Webhook event handling (idempotent) and confirmation email."""
from __future__ import annotations

import logging
from typing import Any

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone

from apps.audit.utils import log_action
from apps.pages.models import AnimationStatus, PageState

from .models import Payment, PaymentStatus
from .plans import PLANS

logger = logging.getLogger(__name__)


def _send_confirmation(payment: Payment) -> None:
    """Email the payer. Failures are logged and swallowed (must not break the webhook)."""
    plan = PLANS.get(payment.package)
    try:
        send_mail(
            subject="Your Remember US payment is confirmed",
            message=(
                f"Thank you. We received your one-time payment for the "
                f"{plan.name if plan else payment.package} package "
                f"(${payment.amount_cents / 100:.2f}).\n\n"
                "Your memorial has been submitted for review. We will notify you once it is "
                "approved. One-time payment, no renewals; you can download a full archive "
                "at any time."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[payment.user.email],
        )
    except Exception:  # noqa: BLE001
        logger.exception("Payment confirmation email failed (payment %s)", payment.pk)


def _mark_paid(payment: Payment, session: dict[str, Any]) -> bool:
    """Apply a successful payment. Returns False when it was already processed."""
    with transaction.atomic():
        payment = Payment.objects.select_for_update().select_related("page", "user").get(
            pk=payment.pk
        )
        if payment.status == PaymentStatus.PAID:
            return False
        payment.status = PaymentStatus.PAID
        payment.stripe_payment_intent_id = str(session.get("payment_intent") or "")
        if session.get("amount_total"):
            payment.amount_cents = int(session["amount_total"])
        payment.save()

        page = payment.page
        already_paid = page.is_paid
        page.is_paid = True
        page.package_type = payment.package
        page.paid_at = timezone.now()
        if payment.package == "premium" and page.portrait_animation_status in (
            AnimationStatus.NONE,
        ):
            page.portrait_animation_status = AnimationStatus.PENDING
        if page.state == PageState.DRAFT:
            page.state = PageState.MODERATION
        page.save()
        log_action(
            None,
            "payment.paid",
            payment,
            package=payment.package,
            amount_cents=payment.amount_cents,
            currency=payment.currency,
            page_id=str(page.pk),
            duplicate_payment=already_paid,
        )
    _send_confirmation(payment)
    return True


def _set_status(payment: Payment, new_status: str, action: str, allowed_from: set[str]) -> None:
    """Move a payment to `new_status` if its current status allows it, and audit it."""
    with transaction.atomic():
        payment = Payment.objects.select_for_update().get(pk=payment.pk)
        if payment.status == new_status or payment.status not in allowed_from:
            return
        payment.status = new_status
        payment.save(update_fields=["status", "updated_at"])
        log_action(None, action, payment, package=payment.package, page_id=str(payment.page_id))


def handle_event(event: dict[str, Any]) -> None:
    """Dispatch a verified Stripe event. Unknown events and unknown sessions are ignored."""
    event_type = event.get("type", "")
    obj = (event.get("data") or {}).get("object") or {}

    if event_type == "charge.refunded":
        intent = obj.get("payment_intent")
        if not intent or obj.get("refunded") is False:
            return
        payment = Payment.objects.filter(stripe_payment_intent_id=intent).first()
        if payment:
            _set_status(payment, PaymentStatus.REFUNDED, "payment.refunded", {PaymentStatus.PAID})
        return

    if not event_type.startswith("checkout.session."):
        return
    payment = Payment.objects.filter(stripe_session_id=obj.get("id", "")).first()
    if payment is None:
        return

    if event_type in ("checkout.session.completed", "checkout.session.async_payment_succeeded"):
        if obj.get("payment_status") == "paid":
            _mark_paid(payment, obj)
    elif event_type == "checkout.session.async_payment_failed":
        _set_status(payment, PaymentStatus.FAILED, "payment.failed", {PaymentStatus.PENDING})
    elif event_type == "checkout.session.expired":
        _set_status(payment, PaymentStatus.EXPIRED, "payment.expired", {PaymentStatus.PENDING})
