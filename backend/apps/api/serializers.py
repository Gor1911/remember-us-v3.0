"""DRF serializers — never expose internal IDs, use UUIDs only."""
from __future__ import annotations

from datetime import date
from typing import Any

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from apps.media.models import MediaFile, MediaType
from apps.media.signing import Audience, signed_file_url
from apps.media.validators import detect_media_kind
from apps.pages.models import (
    AnimationStatus,
    MemorialPage,
    MilitaryAward,
    PageState,
    TimelineEntry,
)
from apps.pages.snapshot import SNAPSHOT_PAGE_FIELDS, snapshot_media_ids
from apps.qr.models import QRCode
from apps.users.models import User


def is_privileged(request: Any, page: MemorialPage) -> bool:
    """True when the requester is the page owner or an admin (sees the live record)."""
    user = getattr(request, "user", None)
    return bool(
        user and user.is_authenticated and (user.is_admin or page.owner_id == user.id)
    )


def media_audience(request: Any, page: MemorialPage) -> Audience:
    """Signed-URL audience for media of this page shown to this requester."""
    return "privileged" if is_privileged(request, page) else "guest"


# --- User ---

class UserPublicSerializer(serializers.ModelSerializer):
    """Minimal user info for public display (no email exposed)."""

    class Meta:
        model = User
        fields = ["id", "display_name", "role"]


class UserOwnerSerializer(serializers.ModelSerializer):
    """Owner info for authenticated page listings (owners see themselves, admins see all)."""

    class Meta:
        model = User
        fields = ["id", "email", "display_name", "role"]


class UserDetailSerializer(serializers.ModelSerializer):
    """Full user info — only returned to the user themselves or admin."""

    class Meta:
        model = User
        fields = ["id", "email", "display_name", "role", "created_at", "terms_accepted_at", "terms_version"]
        read_only_fields = ["id", "created_at", "terms_accepted_at", "terms_version"]


class UserCreateSerializer(serializers.ModelSerializer):
    """Register a new user."""

    password = serializers.CharField(write_only=True, min_length=8)
    accept_terms = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = User
        fields = ["email", "password", "display_name", "accept_terms"]

    def create(self, validated_data: dict) -> User:
        """Create user with hashed password. New users get Owner role so they can create pages."""
        from django.utils import timezone

        from apps.users.models import UserRole
        validated_data.pop("accept_terms", None)
        return User.objects.create_user(
            role=UserRole.OWNER,
            terms_accepted_at=timezone.now(),
            terms_version=settings.LEGAL_TERMS_VERSION,
            **validated_data,
        )


# --- Media ---

class MediaFileSerializer(serializers.ModelSerializer):
    """Media file representation — URL instead of path."""

    file_url = serializers.SerializerMethodField()

    class Meta:
        model = MediaFile
        fields = [
            "id", "media_type", "file_url", "original_filename",
            "is_primary_portrait", "caption", "alt_text", "order",
        ]
        read_only_fields = ["id", "file_url"]

    def get_file_url(self, obj: MediaFile) -> str | None:
        """Return an absolute signed URL (guest-scoped unless owner/admin)."""
        request = self.context.get("request")
        return signed_file_url(request, obj, "media", media_audience(request, obj.page))

    def to_representation(self, instance: MediaFile) -> dict:
        """Hide the original filename from everyone except the page owner and admins."""
        data = super().to_representation(instance)
        if not is_privileged(self.context.get("request"), instance.page):
            data.pop("original_filename", None)
        return data


class MediaUploadSerializer(serializers.Serializer):
    """Validate an upload: type is detected server-side, never trusted from client."""

    file = serializers.FileField()
    caption = serializers.CharField(max_length=500, required=False, allow_blank=True, default="")
    alt_text = serializers.CharField(max_length=300, required=False, allow_blank=True, default="")
    is_primary_portrait = serializers.BooleanField(required=False, default=False)

    def validate_file(self, value):
        """Detect real type (image/video), enforce allow-list and size limits."""
        detected = detect_media_kind(value)
        if detected is None:
            raise serializers.ValidationError(
                "Unsupported or corrupt file. Allowed: JPEG, PNG, WebP images; MP4, WebM videos."
            )
        kind, mime = detected
        if kind == "image":
            limit = settings.MAX_IMAGE_UPLOAD_BYTES
        else:
            limit = settings.MAX_VIDEO_UPLOAD_BYTES
        if value.size > limit:
            raise serializers.ValidationError(
                f"File too large. Maximum for {kind}s is {limit // (1024 * 1024)} MB."
            )
        self._kind = kind
        self._mime = mime
        return value

    def validate(self, attrs: dict) -> dict:
        """Derive media_type from the detected kind and check the portrait flag."""
        kind = getattr(self, "_kind", None)
        if attrs.get("is_primary_portrait") and kind != "image":
            raise serializers.ValidationError(
                {"is_primary_portrait": "Only images can be the primary portrait."}
            )
        if kind == "video":
            attrs["media_type"] = MediaType.VIDEO
        elif attrs.get("is_primary_portrait"):
            attrs["media_type"] = MediaType.PORTRAIT
        else:
            attrs["media_type"] = MediaType.PHOTO
        attrs["mime_type"] = self._mime
        return attrs


# --- Timeline ---

MAX_TIMELINE_ENTRIES = 30
MAX_MILITARY_AWARDS = 30
MIN_TIMELINE_YEAR = 1800


class TimelineEntrySerializer(serializers.ModelSerializer):
    """Read representation of a timeline entry."""

    class Meta:
        model = TimelineEntry
        fields = ["id", "year", "title", "description", "order"]
        read_only_fields = ["id"]


class TimelineEntryWriteSerializer(serializers.Serializer):
    """One timeline item in a create/update payload (order = list index)."""

    year = serializers.IntegerField(min_value=MIN_TIMELINE_YEAR)
    title = serializers.CharField(max_length=200)
    description = serializers.CharField(
        max_length=1000, required=False, allow_blank=True, default=""
    )

    def validate_year(self, value: int) -> int:
        """No future years. Years outside the subject's lifetime are allowed."""
        current = timezone.localdate().year
        if value > current:
            raise serializers.ValidationError(
                f"Ensure this value is less than or equal to {current}."
            )
        return value


# --- Military Awards ---

class MilitaryAwardSerializer(serializers.ModelSerializer):
    """Read representation of a military award."""

    class Meta:
        model = MilitaryAward
        fields = ["id", "name", "description", "awarded_date", "model_3d_url", "order"]
        read_only_fields = ["id"]


class MilitaryAwardWriteSerializer(serializers.Serializer):
    """One award in a create/update payload (order = list index)."""

    name = serializers.CharField(max_length=200)
    description = serializers.CharField(
        max_length=1000, required=False, allow_blank=True, default=""
    )
    awarded_date = serializers.DateField(required=False, allow_null=True, default=None)

    def validate_awarded_date(self, value: date | None) -> date | None:
        """An award cannot be dated in the future."""
        if value and value > timezone.localdate():
            raise serializers.ValidationError("Award date cannot be in the future.")
        return value


def replace_timeline_and_awards(page: MemorialPage, validated_data: dict) -> None:
    """Replace the page's timeline / awards when their key was sent (soft delete + create).

    Pops ``timeline_entries`` and ``military_awards`` from ``validated_data``.
    Must run inside the transaction that saves the page.
    """
    now = timezone.now()
    entries = validated_data.pop("timeline_entries", None)
    if entries is not None:
        TimelineEntry.objects.filter(page=page).update(is_deleted=True, updated_at=now)
        TimelineEntry.objects.bulk_create(
            TimelineEntry(page=page, order=index, **item) for index, item in enumerate(entries)
        )
    awards = validated_data.pop("military_awards", None)
    if awards is not None:
        MilitaryAward.objects.filter(page=page).update(is_deleted=True, updated_at=now)
        MilitaryAward.objects.bulk_create(
            MilitaryAward(page=page, order=index, **item) for index, item in enumerate(awards)
        )


# --- QR ---

class QRCodeSerializer(serializers.ModelSerializer):
    qr_url = serializers.SerializerMethodField()

    class Meta:
        model = QRCode
        fields = ["id", "qr_url", "scan_count", "last_scanned_at"]
        read_only_fields = ["id", "qr_url", "scan_count", "last_scanned_at"]

    def get_qr_url(self, obj: QRCode) -> str | None:
        """Return a signed, expiring URL for the QR image."""
        return signed_file_url(self.context.get("request"), obj, "qr")


# --- Memorial Page ---

class MemorialPageListSerializer(serializers.ModelSerializer):
    """Lightweight listing (owner/admin only) — no heavy nested data."""

    owner = UserOwnerSerializer(read_only=True)
    has_published_version = serializers.BooleanField(read_only=True)
    primary_portrait = serializers.SerializerMethodField()
    hidden = serializers.SerializerMethodField()

    class Meta:
        model = MemorialPage
        fields = [
            "id", "slug", "page_type", "state",
            "first_name", "last_name", "birth_date", "death_date",
            "owner", "primary_portrait", "moderation_note", "created_at",
            "is_paid", "package_type", "paid_at", "portrait_animation_status",
            "hidden", "hidden_reason", "has_published_version",
        ]
        read_only_fields = fields

    def get_hidden(self, obj: MemorialPage) -> bool:
        """True when an admin took the page down."""
        return obj.is_hidden

    def get_primary_portrait(self, obj: MemorialPage) -> str | None:
        prefetched = getattr(obj, "primary_portrait_files", None)
        if prefetched is not None:
            portrait = prefetched[0] if prefetched else None
        else:
            portrait = obj.media_files.filter(
                media_type="portrait", is_primary_portrait=True
            ).first()
        if portrait and portrait.file:
            return signed_file_url(self.context.get("request"), portrait, "media")
        return None


class MemorialPageDetailSerializer(serializers.ModelSerializer):
    """Full page detail with all nested data."""

    owner = UserPublicSerializer(read_only=True)
    timeline_entries = TimelineEntrySerializer(many=True, read_only=True)
    military_awards = MilitaryAwardSerializer(many=True, read_only=True)
    media_files = MediaFileSerializer(many=True, read_only=True)
    qr_code = QRCodeSerializer(read_only=True)
    memorial_url = serializers.ReadOnlyField()
    full_name = serializers.ReadOnlyField()
    portrait_animated_url = serializers.SerializerMethodField()
    hidden = serializers.SerializerMethodField()
    has_published_version = serializers.BooleanField(read_only=True)

    class Meta:
        model = MemorialPage
        fields = [
            "id", "slug", "page_type", "state",
            "first_name", "last_name", "full_name",
            "birth_date", "death_date", "biography",
            "military_rank", "military_branch", "service_start", "service_end",
            "portrait_animated_url", "portrait_animation_status",
            "owner", "approved_at", "memorial_url",
            "timeline_entries", "military_awards", "media_files", "qr_code",
            "is_paid", "package_type", "paid_at", "hidden", "hidden_reason",
            "has_published_version", "created_at", "updated_at",
        ]
        read_only_fields = fields

    # Visible only to the page owner and admins.
    PRIVATE_FIELDS = (
        "is_paid", "package_type", "paid_at", "hidden", "hidden_reason", "qr_code",
        "has_published_version",
    )

    def get_hidden(self, obj: MemorialPage) -> bool:
        """True when an admin took the page down."""
        return obj.is_hidden

    def get_portrait_animated_url(self, obj: MemorialPage) -> str | None:
        """Signed URL of the admin-uploaded living portrait; only when status is `done`."""
        if obj.portrait_animation_status != AnimationStatus.DONE:
            return None
        video = (
            obj.media_files.filter(media_type=MediaType.LIVING_PORTRAIT)
            .order_by("-created_at")
            .first()
        )
        if video is None:
            return None
        request = self.context.get("request")
        return signed_file_url(request, video, "media", media_audience(request, obj))

    def to_representation(self, instance: MemorialPage) -> dict:
        """Strip owner/admin-only fields for everyone else; keep the gallery video-free.

        Guests of a page whose newer edit is not approved get the published snapshot
        instead of the live content (same keys, state reported as ``active``).
        """
        data = super().to_representation(instance)
        data["media_files"] = [
            m for m in data["media_files"] if m["media_type"] != MediaType.LIVING_PORTRAIT
        ]
        if not is_privileged(self.context.get("request"), instance):
            if instance.serves_snapshot_to_guests:
                self._apply_snapshot(instance, data)
            for field in self.PRIVATE_FIELDS:
                data.pop(field, None)
        return data

    def _apply_snapshot(self, instance: MemorialPage, data: dict) -> None:
        """Overwrite owner-editable content with the last approved version."""
        snapshot = instance.published_snapshot or {}
        page_data = snapshot.get("page", {})
        for field in SNAPSHOT_PAGE_FIELDS:
            data[field] = page_data.get(field)
        first, last = page_data.get("first_name") or "", page_data.get("last_name") or ""
        data["full_name"] = f"{first} {last}".strip()
        data["timeline_entries"] = [
            {key: item.get(key) for key in ("id", "year", "title", "description", "order")}
            for item in snapshot.get("timeline_entries", [])
        ]
        data["military_awards"] = [
            {
                "id": item.get("id"),
                "name": item.get("name"),
                "description": item.get("description"),
                "awarded_date": item.get("awarded_date"),
                "model_3d_url": item.get("model_3d_url") or "",
                "order": item.get("order"),
            }
            for item in snapshot.get("military_awards", [])
        ]
        data["media_files"] = MediaFileSerializer(
            guest_snapshot_media(instance), many=True, context=self.context
        ).data
        data["state"] = PageState.ACTIVE.value
        data["updated_at"] = snapshot.get("captured_at") or data.get("updated_at")


def guest_snapshot_media(page: MemorialPage) -> list[MediaFile]:
    """Media of the published snapshot, soft-deleted rows included (gallery order)."""
    ids = snapshot_media_ids(page.published_snapshot)
    if not ids:
        return []
    return list(
        MediaFile.all_objects.select_related("page")
        .filter(page=page, id__in=ids)
        .exclude(media_type=MediaType.LIVING_PORTRAIT)
    )


def guest_media_files(page: MemorialPage) -> list[MediaFile]:
    """Gallery media a guest may see for this page (snapshot or live)."""
    if page.serves_snapshot_to_guests:
        return guest_snapshot_media(page)
    return list(
        page.media_files.select_related("page").exclude(media_type=MediaType.LIVING_PORTRAIT)
    )


_DATE_PAIRS: tuple[tuple[str, str, str], ...] = (
    ("birth_date", "death_date", "Date of passing cannot be earlier than date of birth."),
    ("service_start", "service_end", "Service end cannot be earlier than service start."),
)


class MemorialPageContentMixin(serializers.Serializer):
    """Content rules shared by create and update: biography, date order, timeline, awards.

    ``timeline_entries`` / ``military_awards``: when present, the list replaces the
    page's existing rows entirely (order = list index); when absent, rows are untouched.
    """

    instance: MemorialPage | None

    timeline_entries = serializers.ListField(
        child=TimelineEntryWriteSerializer(),
        required=False,
        max_length=MAX_TIMELINE_ENTRIES,
    )
    military_awards = serializers.ListField(
        child=MilitaryAwardWriteSerializer(),
        required=False,
        max_length=MAX_MILITARY_AWARDS,
    )

    def validate_biography(self, value: str) -> str:
        """Trim and require a meaningful biography (same rule as the create form)."""
        value = (value or "").strip()
        minimum = settings.MIN_BIOGRAPHY_LENGTH
        if len(value) < minimum:
            raise serializers.ValidationError(
                f"Biography must be at least {minimum} characters."
            )
        return value

    def validate(self, attrs: dict) -> dict:
        """Reject date ranges that end before they start (merging stored values on update)."""
        errors: dict[str, str] = {}
        for start_field, end_field, message in _DATE_PAIRS:
            start = attrs.get(start_field, getattr(self.instance, start_field, None))
            end = attrs.get(end_field, getattr(self.instance, end_field, None))
            if start and end and end < start:
                errors[end_field] = message
        if errors:
            raise serializers.ValidationError(errors)
        return attrs


class MemorialPageCreateSerializer(MemorialPageContentMixin, serializers.ModelSerializer):
    """Create a new memorial page — slug is auto-generated."""

    biography = serializers.CharField(trim_whitespace=False)

    class Meta:
        model = MemorialPage
        fields = [
            "page_type", "first_name", "last_name",
            "birth_date", "death_date", "biography",
            "military_rank", "military_branch", "service_start", "service_end",
            "timeline_entries", "military_awards",
        ]

    def create(self, validated_data: dict) -> MemorialPage:
        """Assign owner and create timeline/awards in one transaction.

        The slug is generated by MemorialPage.save().
        """
        request = self.context["request"]
        children = {
            key: validated_data.pop(key)
            for key in ("timeline_entries", "military_awards")
            if key in validated_data
        }
        with transaction.atomic():
            page = MemorialPage.objects.create(owner=request.user, **validated_data)
            replace_timeline_and_awards(page, children)
        return page


class MemorialPageUpdateSerializer(MemorialPageContentMixin, serializers.ModelSerializer):
    """Update page content."""

    class Meta:
        model = MemorialPage
        fields = [
            "first_name", "last_name", "birth_date", "death_date", "biography",
            "military_rank", "military_branch", "service_start", "service_end",
            "timeline_entries", "military_awards",
        ]

    def update(self, instance: MemorialPage, validated_data: dict) -> MemorialPage:
        """Apply field updates and list replacements atomically.

        Re-moderation is decided by the view (owner only).
        """
        with transaction.atomic():
            replace_timeline_and_awards(instance, validated_data)
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
        return instance


class HideSerializer(serializers.Serializer):
    """Reason for a takedown."""

    reason = serializers.CharField(max_length=1000)


class LivingPortraitUploadSerializer(serializers.Serializer):
    """Admin upload of the finished Living Portrait video (mp4/webm, up to 100 MB)."""

    file = serializers.FileField()

    def validate_file(self, value):
        """Require a real mp4/webm and enforce the size limit."""
        detected = detect_media_kind(value)
        if detected is None or detected[0] != "video":
            raise serializers.ValidationError("Unsupported file. Allowed: MP4 or WebM video.")
        limit = settings.MAX_LIVING_PORTRAIT_BYTES
        if value.size > limit:
            raise serializers.ValidationError(
                f"File too large. Maximum is {limit // (1024 * 1024)} MB."
            )
        self.mime = detected[1]
        return value


class LivingPortraitStatusSerializer(serializers.Serializer):
    """Manual status updates (not `done`: that is set by uploading the video)."""

    status = serializers.ChoiceField(choices=["processing", "failed", "pending"])
