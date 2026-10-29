"""Page actions beyond CRUD: access (link + QR), takedown, Living Portrait, public QR resolve."""
from __future__ import annotations

import os
from typing import Any

from django.db import transaction
from django.http import HttpResponse
from rest_framework import status, viewsets
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from apps.audit.utils import log_action
from apps.media.models import MediaFile, MediaType
from apps.media.signing import signed_file_url
from apps.pages.models import AnimationStatus, MemorialPage
from apps.qr import services as qr_services
from apps.qr.models import QRCode
from apps.qr.utils import generate_qr_image, generate_unique_slug

from .permissions import IsAdmin
from .serializers import (
    HideSerializer,
    LivingPortraitStatusSerializer,
    LivingPortraitUploadSerializer,
    MemorialPageDetailSerializer,
)
from .views import record_qr_scan, success


def get_managed_page(request: Request, slug: str | None) -> MemorialPage:
    """Return the page for its owner or an admin; 404 for everyone else."""
    page = MemorialPage.objects.select_related("owner").filter(slug=slug).first()
    user = request.user
    if page is None or not (user.is_admin or page.owner_id == user.id):
        raise NotFound("Page not found.")
    return page


def build_access(request: Request, page: MemorialPage) -> dict[str, Any]:
    """PageAccess payload: the shareable link plus the state of the QR key."""
    qr = qr_services.get_qr(page)
    if qr is None:
        qr_data: dict[str, Any] = {
            "exists": False,
            "is_active": False,
            "qr_target_url": None,
            "image_url": None,
            "scan_count": 0,
            "last_scanned_at": None,
            "legacy_link_qr": False,
        }
    else:
        qr_data = {
            "exists": True,
            "is_active": qr.is_active,
            "qr_target_url": qr.target_url,
            "image_url": signed_file_url(request, qr, "qr"),
            "scan_count": qr.scan_count,
            "last_scanned_at": qr.last_scanned_at,
            "legacy_link_qr": qr.legacy_link_qr,
        }
    return {"memorial_url": page.memorial_url, "qr": qr_data}


class PageAccessViewSet(viewsets.ViewSet):
    """Web link + QR management for the page owner / admin."""

    permission_classes = [IsAuthenticated]
    throttle_scope: str | None = None  # set per-route in urls.py

    def access(self, request: Request, slug: str | None = None) -> Response:
        """Current link and QR state."""
        page = get_managed_page(request, slug)
        return success(build_access(request, page))

    def rotate_link(self, request: Request, slug: str | None = None) -> Response:
        """Issue a new web link (slug). The old one 404s immediately; the QR is unaffected."""
        page = get_managed_page(request, slug)
        page.slug = generate_unique_slug()
        page.save(update_fields=["slug", "updated_at"])
        log_action(request.user, "page.rotate_link", page)
        data = build_access(request, page)
        data["slug"] = page.slug
        return success(data)

    def qr_generate(self, request: Request, slug: str | None = None) -> Response:
        """Create the QR if missing (image encodes /q/<token>)."""
        page = get_managed_page(request, slug)
        _, created = qr_services.create_or_get_qr(page)
        log_action(request.user, "qr.generate", page, created=created)
        return success(
            build_access(request, page),
            status_code=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def _existing_qr(self, request: Request, slug: str | None) -> tuple[MemorialPage, QRCode]:
        """Page + its QR, 404 when the QR was never generated."""
        page = get_managed_page(request, slug)
        qr = qr_services.get_qr(page)
        if qr is None:
            raise NotFound("QR code not found.")
        return page, qr

    def qr_disable(self, request: Request, slug: str | None = None) -> Response:
        """Stop the QR from resolving (can be re-enabled)."""
        page, qr = self._existing_qr(request, slug)
        qr.is_active = False
        qr.save(update_fields=["is_active", "updated_at"])
        log_action(request.user, "qr.disable", page)
        return success(build_access(request, page))

    def qr_enable(self, request: Request, slug: str | None = None) -> Response:
        """Re-enable a disabled QR."""
        page, qr = self._existing_qr(request, slug)
        qr.is_active = True
        qr.save(update_fields=["is_active", "updated_at"])
        log_action(request.user, "qr.enable", page)
        return success(build_access(request, page))

    def qr_rotate(self, request: Request, slug: str | None = None) -> Response:
        """New QR token + image. Printed/engraved codes stop working."""
        page, qr = self._existing_qr(request, slug)
        qr_services.rotate_token(qr)
        log_action(request.user, "qr.rotate", page)
        return success(build_access(request, page))

    def qr_download(self, request: Request, slug: str | None = None) -> HttpResponse:
        """Download the QR as PNG or SVG (`?format=png|svg`, default png)."""
        _, qr = self._existing_qr(request, slug)
        fmt = request.query_params.get("format", "png").lower()
        if fmt == "png":
            body, content_type = generate_qr_image(qr.target_url), "image/png"
        elif fmt == "svg":
            body, content_type = qr_services.render_svg(qr.target_url), "image/svg+xml"
        else:
            raise ValidationError({"format": "Use png or svg."})
        response = HttpResponse(body, content_type=content_type)
        response["Content-Disposition"] = (
            f'attachment; filename="remember-us-qr-{qr.page.slug}.{fmt}"'
        )
        response["Cache-Control"] = "private, no-store"
        return response


class QRResolveViewSet(viewsets.ViewSet):
    """Public: turn a scanned QR token into the page slug."""

    permission_classes = [AllowAny]
    throttle_scope: str | None = None  # `scan`, set in urls.py

    def resolve(self, request: Request, token: str | None = None) -> Response:
        """Return {slug} for an active QR of a live page, otherwise one generic 404."""
        qr = (
            QRCode.objects.select_related("page")
            .filter(token=token or "", is_active=True)
            .first()
        )
        if qr is None or not qr.page.is_publicly_visible:
            raise NotFound("Not found.")
        record_qr_scan(request, qr)
        return success({"slug": qr.page.slug})


class PageAdminViewSet(viewsets.ViewSet):
    """Admin-only page actions: takedown and the manual Living Portrait workflow."""

    permission_classes = [IsAdmin]

    def _page(self, slug: str | None) -> MemorialPage:
        """Any non-deleted page by slug."""
        page = MemorialPage.objects.select_related("owner").filter(slug=slug).first()
        if page is None:
            raise NotFound("Page not found.")
        return page

    @staticmethod
    def _detail(request: Request, page: MemorialPage) -> dict[str, Any]:
        """Serialize the page detail for the requesting admin."""
        return MemorialPageDetailSerializer(page, context={"request": request}).data

    def hide(self, request: Request, slug: str | None = None) -> Response:
        """Take a page down."""
        page = self._page(slug)
        serializer = HideSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reason = serializer.validated_data["reason"]
        page.hide(reason)
        log_action(request.user, "page.hide", page, reason=reason)
        return success({"hidden": True})

    def unhide(self, request: Request, slug: str | None = None) -> Response:
        """Lift a takedown."""
        page = self._page(slug)
        page.unhide()
        log_action(request.user, "page.unhide", page)
        return success({"hidden": False})

    def living_portrait_upload(self, request: Request, slug: str | None = None) -> Response:
        """Store the finished video and mark the portrait `done`."""
        page = self._page(slug)
        serializer = LivingPortraitUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        file_obj = serializer.validated_data["file"]
        with transaction.atomic():
            for old in page.media_files.filter(media_type=MediaType.LIVING_PORTRAIT):
                old.soft_delete()
            MediaFile.objects.create(
                page=page,
                uploaded_by=request.user,
                file=file_obj,
                original_filename=os.path.basename(file_obj.name)[:255],
                file_size=file_obj.size,
                mime_type=serializer.mime,
                media_type=MediaType.LIVING_PORTRAIT,
            )
            page.portrait_animation_status = AnimationStatus.DONE
            page.save(update_fields=["portrait_animation_status", "updated_at"])
        log_action(request.user, "living_portrait.upload", page, size=file_obj.size)
        return success(self._detail(request, page))

    def living_portrait_delete(self, request: Request, slug: str | None = None) -> Response:
        """Soft-delete the video; status goes back to `pending`."""
        page = self._page(slug)
        with transaction.atomic():
            for video in page.media_files.filter(media_type=MediaType.LIVING_PORTRAIT):
                video.soft_delete()
            page.portrait_animation_status = AnimationStatus.PENDING
            page.save(update_fields=["portrait_animation_status", "updated_at"])
        log_action(request.user, "living_portrait.delete", page)
        return success(self._detail(request, page))

    def living_portrait_status(self, request: Request, slug: str | None = None) -> Response:
        """Set processing / failed / pending by hand."""
        page = self._page(slug)
        serializer = LivingPortraitStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_status = serializer.validated_data["status"]
        page.portrait_animation_status = new_status
        page.save(update_fields=["portrait_animation_status", "updated_at"])
        log_action(request.user, "living_portrait.status", page, status=new_status)
        return success(self._detail(request, page))
