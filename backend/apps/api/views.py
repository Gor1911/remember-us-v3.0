"""DRF viewsets — all responses wrapped in { success, data } envelope."""
from __future__ import annotations

import logging
import os
from uuid import UUID

from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.db import transaction
from django.db.models import Prefetch, QuerySet
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from apps.audit.utils import log_action
from apps.media.models import MediaFile, MediaType
from apps.pages.models import MemorialPage, PageState
from apps.qr.models import QRCode, QRScanLog
from apps.users.models import User

from .exceptions import PaymentRequired
from .export import build_export_zip
from .permissions import (
    CanAccessMemorialPage,
    IsAdmin,
)
from .serializers import (
    MediaFileSerializer,
    MediaUploadSerializer,
    MemorialPageCreateSerializer,
    MemorialPageDetailSerializer,
    MemorialPageListSerializer,
    MemorialPageUpdateSerializer,
    UserCreateSerializer,
    UserDetailSerializer,
)

logger = logging.getLogger(__name__)


def success(data=None, status_code: int = status.HTTP_200_OK) -> Response:
    """Return standard success envelope."""
    return Response({"success": True, "data": data}, status=status_code)


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------


class AuthViewSet(viewsets.ViewSet):
    """Registration endpoint. JWT tokens via simplejwt /api/v1/token/."""

    permission_classes = [AllowAny]
    throttle_scope: str | None = None  # set per-route in urls.py

    def get_permissions(self):
        """Registration and password reset are open; everything else requires a login."""
        if self.action in ("register", "password_reset", "password_reset_confirm"):
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=["post"])
    def register(self, request: Request) -> Response:
        """Create a new user account."""
        accepted = serializers.BooleanField(default=False).run_validation(
            request.data.get("accept_terms", False)
        )
        if accepted is not True:
            raise ValidationError("You must accept the Terms of Service and Privacy Policy.")
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return success(
            UserDetailSerializer(user).data,
            status_code=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"], url_path="password-reset")
    def password_reset(self, request: Request) -> Response:
        """Email a reset link. Always 200 for a well-formed email (no enumeration)."""
        email = request.data.get("email")
        try:
            if not isinstance(email, str):
                raise DjangoValidationError("Enter a valid email address.")
            email = email.strip()
            validate_email(email)
        except DjangoValidationError:
            raise ValidationError({"email": "Enter a valid email address."}) from None
        user = User.objects.filter(email__iexact=email, is_active=True, is_deleted=False).first()
        if user is not None:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            link = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?uid={uid}&token={token}"
            try:
                send_mail(
                    subject="Reset your Remember US password",
                    message=(
                        "We received a request to reset your Remember US password.\n\n"
                        f"Open this link to choose a new password:\n{link}\n\n"
                        "If you did not request this, you can ignore this email."
                    ),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                )
            except Exception:  # noqa: BLE001 — mail failure must not change the response
                # Same 200 as for unknown emails, otherwise the status reveals the account.
                # Never log the link: it contains the reset token.
                logger.exception("Password reset email could not be sent (user %s)", user.pk)
        return success(None)

    @action(detail=False, methods=["post"], url_path="password-reset/confirm")
    def password_reset_confirm(self, request: Request) -> Response:
        """Set a new password using the emailed uid + token."""
        uid, token, password = (request.data.get(k) for k in ("uid", "token", "password"))
        invalid = Response(
            {"success": False, "error": "Invalid or expired reset link.", "code": "INVALID_TOKEN"},
            status=status.HTTP_400_BAD_REQUEST,
        )
        if not isinstance(password, str) or not password:
            raise ValidationError({"password": "This field is required."})
        if not (isinstance(uid, str) and uid and isinstance(token, str) and token):
            return invalid
        try:
            user_pk = UUID(force_str(urlsafe_base64_decode(uid)))
        except (ValueError, TypeError, OverflowError):
            return invalid
        user = User.objects.filter(pk=user_pk, is_active=True, is_deleted=False).first()
        if user is None or not default_token_generator.check_token(user, token):
            return invalid
        try:
            validate_password(password, user)
        except DjangoValidationError as exc:
            raise ValidationError({"password": list(exc.messages)}) from None
        user.set_password(password)
        user.save(update_fields=["password"])
        return success(None)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def me(self, request: Request) -> Response:
        """Return current user profile."""
        return success(UserDetailSerializer(request.user).data)

    @action(detail=False, methods=["post"], url_path="me/delete", permission_classes=[IsAuthenticated])
    def delete_account(self, request: Request) -> Response:
        """Permanently deactivate and anonymize the current account (soft delete)."""
        user = request.user
        password = request.data.get("password")
        if not isinstance(password, str) or not password or not user.check_password(password):
            return Response(
                {"success": False, "error": "Incorrect password.", "code": "INVALID_PASSWORD"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if user.is_last_active_admin():
            return Response(
                {
                    "success": False,
                    "error": (
                        "You are the only administrator. Assign another administrator "
                        "before deleting this account."
                    ),
                    "code": "LAST_ADMIN",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.delete_account()
        log_action(user, "account.delete", user)
        return success(None)


# ---------------------------------------------------------------------------
# Memorial Pages
# ---------------------------------------------------------------------------


class MemorialPageViewSet(viewsets.ViewSet):
    """CRUD + state transitions for memorial pages."""

    throttle_scope: str | None = None  # set per-route in urls.py

    def get_permissions(self):
        if self.action in ["retrieve", "scan"]:
            return [AllowAny()]
        if self.action in ["approve", "reject", "list_moderation"]:
            return [IsAdmin()]
        return [IsAuthenticated()]

    def list(self, request: Request) -> Response:
        """List owner's pages (or all pages for admin)."""
        if request.user.is_admin:
            qs = MemorialPage.objects.all()
        else:
            qs = MemorialPage.objects.filter(owner=request.user)
        serializer = MemorialPageListSerializer(
            _with_list_relations(qs), many=True, context={"request": request}
        )
        return success(serializer.data)

    def create(self, request: Request) -> Response:
        """Create a new memorial page (Owner only)."""
        if not request.user.can_edit:
            return Response(
                {"success": False, "error": "Only owners can create pages.", "code": "FORBIDDEN"},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = MemorialPageCreateSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        page = serializer.save()
        return success(
            MemorialPageDetailSerializer(page, context={"request": request}).data,
            status_code=status.HTTP_201_CREATED,
        )

    def retrieve(self, request: Request, slug: str | None = None) -> Response:
        """Retrieve a memorial page by hashed slug."""
        page = get_object_or_404(MemorialPage, slug=slug)
        permission = CanAccessMemorialPage()
        if not permission.has_object_permission(request, self, page):
            return Response(
                {"success": False, "error": "Page not found.", "code": "NOT_FOUND"},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = MemorialPageDetailSerializer(page, context={"request": request})
        return success(serializer.data)

    def update(self, request: Request, slug: str | None = None) -> Response:
        """Update memorial page content."""
        page = get_object_or_404(MemorialPage, slug=slug)
        self._check_page_ownership(request, page)
        serializer = MemorialPageUpdateSerializer(
            page, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        _flag_owner_edit(request, page)
        return success(
            MemorialPageDetailSerializer(page, context={"request": request}).data
        )

    def destroy(self, request: Request, slug: str | None = None) -> Response:
        """Soft-delete a memorial page."""
        page = get_object_or_404(MemorialPage, slug=slug)
        self._check_page_ownership(request, page)
        page.soft_delete()
        return success(None, status_code=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"])
    def submit(self, request: Request, slug: str | None = None) -> Response:
        """Submit page for moderation (DRAFT → MODERATION)."""
        page = get_object_or_404(MemorialPage, slug=slug, owner=request.user)
        if page.state == PageState.DRAFT and not page.is_paid and not request.user.is_admin:
            raise PaymentRequired()
        page.submit_for_moderation()
        return success({"state": page.state})

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def approve(self, request: Request, slug: str | None = None) -> Response:
        """Approve page (MODERATION → ACTIVE). Admin only."""
        page = get_object_or_404(MemorialPage, slug=slug)
        page.approve(request.user)
        log_action(request.user, "page.approve", page)
        return success({"state": page.state})

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def reject(self, request: Request, slug: str | None = None) -> Response:
        """Reject page back to DRAFT with a note. Admin only."""
        page = get_object_or_404(MemorialPage, slug=slug)
        note = request.data.get("note", "")
        page.reject(request.user, note=note)
        log_action(request.user, "page.reject", page, has_note=bool(note))
        return success({"state": page.state, "moderation_note": page.moderation_note})

    @action(detail=False, methods=["get"], url_path="moderation", permission_classes=[IsAdmin])
    def list_moderation(self, request: Request) -> Response:
        """List all pages pending moderation. Admin only.

        Payment is enforced at submit; owner edits of pages approved before payments
        existed also land here unpaid and must not be hidden from review.
        """
        qs = _with_list_relations(MemorialPage.objects.filter(state=PageState.MODERATION))
        serializer = MemorialPageListSerializer(qs, many=True, context={"request": request})
        return success(serializer.data)

    @action(
        detail=True,
        methods=["get"],
        permission_classes=[AllowAny],
        url_path="scan",
    )
    def scan(self, request: Request, slug: str | None = None) -> Response:
        """Public QR scan endpoint — throttled with the `scan` scope."""
        page = get_object_or_404(MemorialPage, slug=slug, state=PageState.ACTIVE)
        if page.is_hidden:
            raise NotFound("Page not found.")

        qr = QRCode.objects.filter(page=page).first()
        if qr is not None:
            record_qr_scan(request, qr)

        return success({"slug": page.slug, "redirect": page.memorial_url})

    @action(detail=True, methods=["get"], url_path="export")
    def export(self, request: Request, slug: str | None = None) -> Response:
        """Download all page data and media as a ZIP (page owner or admin)."""
        page = get_object_or_404(MemorialPage, slug=slug)
        if not (request.user.is_admin or page.owner_id == request.user.id):
            return Response(
                {"success": False, "error": "Page not found.", "code": "NOT_FOUND"},
                status=status.HTTP_404_NOT_FOUND,
            )
        archive = build_export_zip(page)
        log_action(request.user, "page.export", page)
        return FileResponse(
            archive,
            as_attachment=True,
            filename=f"remember-us-{page.slug}.zip",
            content_type="application/zip",
        )

    def _check_page_ownership(self, request: Request, page: MemorialPage) -> None:
        """Raise 403 if user doesn't own the page and is not admin."""
        if not (request.user.is_admin or page.owner == request.user):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You don't have permission to modify this page.")


# ---------------------------------------------------------------------------
# Media Upload
# ---------------------------------------------------------------------------


class MediaFileViewSet(viewsets.ViewSet):
    """Upload and manage media files for memorial pages."""

    permission_classes = [IsAuthenticated]

    def _get_page(self, slug: str, request: Request) -> MemorialPage:
        """Get page and verify write access."""
        page = get_object_or_404(MemorialPage, slug=slug)
        if not (request.user.is_admin or page.owner == request.user):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("No access to this page.")
        return page

    def list(self, request: Request, page_slug: str | None = None) -> Response:
        """List media files for a page."""
        page = get_object_or_404(MemorialPage, slug=page_slug)
        permission = CanAccessMemorialPage()
        if not permission.has_object_permission(request, self, page):
            return Response(
                {"success": False, "error": "Not found.", "code": "NOT_FOUND"},
                status=status.HTTP_404_NOT_FOUND,
            )
        files = page.media_files.exclude(media_type=MediaType.LIVING_PORTRAIT)
        return success(
            MediaFileSerializer(files, many=True, context={"request": request}).data
        )

    def create(self, request: Request, page_slug: str | None = None) -> Response:
        """Upload a new media file."""
        page = self._get_page(page_slug, request)
        upload = MediaUploadSerializer(data=request.data)
        upload.is_valid(raise_exception=True)
        data = upload.validated_data
        file_obj = data["file"]

        with transaction.atomic():
            if data["is_primary_portrait"]:
                page.media_files.filter(is_primary_portrait=True).update(
                    is_primary_portrait=False
                )
            media = MediaFile.objects.create(
                page=page,
                uploaded_by=request.user,
                file=file_obj,
                original_filename=os.path.basename(file_obj.name)[:255],
                file_size=file_obj.size,
                mime_type=data["mime_type"],
                media_type=data["media_type"],
                is_primary_portrait=data["is_primary_portrait"],
                caption=data["caption"],
                alt_text=data["alt_text"],
            )
        _flag_owner_edit(request, page)
        return success(
            MediaFileSerializer(media, context={"request": request}).data,
            status_code=status.HTTP_201_CREATED,
        )

    def destroy(self, request: Request, page_slug: str | None = None, pk=None) -> Response:
        """Delete a media file."""
        page = self._get_page(page_slug, request)
        media = get_object_or_404(
            MediaFile.objects.exclude(media_type=MediaType.LIVING_PORTRAIT), id=pk, page=page
        )
        media.soft_delete()
        _flag_owner_edit(request, page)
        return success(None, status_code=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def record_qr_scan(request: Request, qr: QRCode) -> None:
    """Count a scan and keep an anonymous-ish scan log entry."""
    qr.record_scan()
    QRScanLog.objects.create(
        qr_code=qr,
        ip_address=_get_client_ip(request),
        user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
        referrer=request.META.get("HTTP_REFERER", "")[:200],
    )


def _flag_owner_edit(request: Request, page: MemorialPage) -> None:
    """Send an ACTIVE page back to MODERATION, but only for non-admin (Owner) edits."""
    if not request.user.is_admin:
        page.mark_edited_by_owner()


def _with_list_relations(qs: QuerySet) -> QuerySet:
    """Avoid N+1 in list serializers: join owner, prefetch primary portraits."""
    return qs.select_related("owner").prefetch_related(
        Prefetch(
            "media_files",
            queryset=MediaFile.objects.filter(
                media_type="portrait", is_primary_portrait=True
            ),
            to_attr="primary_portrait_files",
        )
    )


def _get_client_ip(request: Request) -> str | None:
    """Return the client IP.

    X-Forwarded-For is honoured only when settings.TRUST_X_FORWARDED_FOR is on
    (nginx appends the real peer, so the rightmost entry is the trustworthy one).
    """
    if getattr(settings, "TRUST_X_FORWARDED_FOR", False):
        x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
        if x_forwarded:
            return x_forwarded.split(",")[-1].strip()
    return request.META.get("REMOTE_ADDR")
