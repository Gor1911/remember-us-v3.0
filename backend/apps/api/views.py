"""DRF viewsets — all responses wrapped in { success, data } envelope."""
from __future__ import annotations

from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from apps.media.models import MediaFile
from apps.pages.models import MemorialPage, MilitaryAward, PageState, TimelineEntry
from apps.qr.models import QRCode
from apps.users.models import User

from .permissions import (
    CanAccessMemorialPage,
    IsAdmin,
    IsOwnerOrAdmin,
    IsPageOwner,
)
from .serializers import (
    MediaFileSerializer,
    MemorialPageCreateSerializer,
    MemorialPageDetailSerializer,
    MemorialPageListSerializer,
    MemorialPageUpdateSerializer,
    MilitaryAwardSerializer,
    QRCodeSerializer,
    TimelineEntrySerializer,
    UserCreateSerializer,
    UserDetailSerializer,
)


def success(data=None, status_code: int = status.HTTP_200_OK) -> Response:
    """Return standard success envelope."""
    return Response({"success": True, "data": data}, status=status_code)


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------


class AuthViewSet(viewsets.ViewSet):
    """Registration endpoint. JWT tokens via simplejwt /api/v1/token/."""

    permission_classes = [AllowAny]

    @action(detail=False, methods=["post"])
    def register(self, request: Request) -> Response:
        """Create a new user account."""
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return success(
            UserDetailSerializer(user).data,
            status_code=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def me(self, request: Request) -> Response:
        """Return current user profile."""
        return success(UserDetailSerializer(request.user).data)


# ---------------------------------------------------------------------------
# Memorial Pages
# ---------------------------------------------------------------------------


class MemorialPageViewSet(viewsets.ViewSet):
    """CRUD + state transitions for memorial pages."""

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
            qs, many=True, context={"request": request}
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
        page.submit_for_moderation()
        return success({"state": page.state})

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def approve(self, request: Request, slug: str | None = None) -> Response:
        """Approve page (MODERATION → ACTIVE). Admin only."""
        page = get_object_or_404(MemorialPage, slug=slug)
        page.approve(request.user)
        return success({"state": page.state})

    @action(detail=True, methods=["post"], permission_classes=[IsAdmin])
    def reject(self, request: Request, slug: str | None = None) -> Response:
        """Reject page back to DRAFT with a note. Admin only."""
        page = get_object_or_404(MemorialPage, slug=slug)
        note = request.data.get("note", "")
        page.reject(request.user, note=note)
        return success({"state": page.state, "moderation_note": page.moderation_note})

    @action(detail=False, methods=["get"], url_path="moderation", permission_classes=[IsAdmin])
    def list_moderation(self, request: Request) -> Response:
        """List all pages pending moderation. Admin only."""
        qs = MemorialPage.objects.filter(state=PageState.MODERATION)
        serializer = MemorialPageListSerializer(qs, many=True, context={"request": request})
        return success(serializer.data)

    @action(detail=True, methods=["get"], permission_classes=[AllowAny], url_path="scan")
    def scan(self, request: Request, slug: str | None = None) -> Response:
        """Public QR scan endpoint — rate-limited in production."""
        page = get_object_or_404(MemorialPage, slug=slug, state=PageState.ACTIVE)

        # Log the scan
        try:
            qr = page.qr_code
            from apps.qr.models import QRScanLog
            qr.record_scan()
            QRScanLog.objects.create(
                qr_code=qr,
                ip_address=_get_client_ip(request),
                user_agent=request.META.get("HTTP_USER_AGENT", "")[:500],
                referrer=request.META.get("HTTP_REFERER", "")[:200],
            )
        except QRCode.DoesNotExist:
            pass

        return success({"slug": page.slug, "redirect": page.memorial_url})

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
        files = page.media_files.all()
        return success(
            MediaFileSerializer(files, many=True, context={"request": request}).data
        )

    def create(self, request: Request, page_slug: str | None = None) -> Response:
        """Upload a new media file."""
        page = self._get_page(page_slug, request)
        file_obj = request.FILES.get("file")
        if not file_obj:
            return Response(
                {"success": False, "error": "No file provided.", "code": "NO_FILE"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        media = MediaFile.objects.create(
            page=page,
            uploaded_by=request.user,
            file=file_obj,
            original_filename=file_obj.name,
            file_size=file_obj.size,
            mime_type=file_obj.content_type or "",
            media_type=request.data.get("media_type", "photo"),
            is_primary_portrait=request.data.get("is_primary_portrait", False),
            caption=request.data.get("caption", ""),
            alt_text=request.data.get("alt_text", ""),
        )
        return success(
            MediaFileSerializer(media, context={"request": request}).data,
            status_code=status.HTTP_201_CREATED,
        )

    def destroy(self, request: Request, page_slug: str | None = None, pk=None) -> Response:
        """Delete a media file."""
        page = self._get_page(page_slug, request)
        media = get_object_or_404(MediaFile, id=pk, page=page)
        media.soft_delete()
        return success(None, status_code=status.HTTP_204_NO_CONTENT)


# ---------------------------------------------------------------------------
# QR Code
# ---------------------------------------------------------------------------


class QRCodeViewSet(viewsets.ViewSet):
    """Generate and retrieve QR codes."""

    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["post"], url_path="generate")
    def generate(self, request: Request, page_slug: str | None = None) -> Response:
        """Generate or regenerate QR code for a page."""
        page = get_object_or_404(MemorialPage, slug=page_slug)
        if not (request.user.is_admin or page.owner == request.user):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()

        from apps.qr.utils import generate_qr_image
        from django.core.files.base import ContentFile

        qr, created = QRCode.objects.get_or_create(page=page)
        png_bytes = generate_qr_image(page.memorial_url)
        qr.image.save(f"{page.slug}.png", ContentFile(png_bytes), save=True)

        return success(
            QRCodeSerializer(qr, context={"request": request}).data,
            status_code=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _get_client_ip(request: Request) -> str | None:
    """Extract real client IP, respecting X-Forwarded-For."""
    x_forwarded = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded:
        return x_forwarded.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")
