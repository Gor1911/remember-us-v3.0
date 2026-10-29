"""DRF serializers — never expose internal IDs, use UUIDs only."""
from __future__ import annotations

from django.conf import settings
from rest_framework import serializers

from apps.media.models import MediaFile, MediaType
from apps.media.signing import signed_file_url
from apps.media.validators import detect_media_kind
from apps.pages.models import MemorialPage, MilitaryAward, TimelineEntry
from apps.qr.models import QRCode
from apps.users.models import User

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
        """Return absolute URL for the file."""
        return signed_file_url(self.context.get("request"), obj, "media")

    def to_representation(self, instance: MediaFile) -> dict:
        """Hide the original filename from everyone except the page owner and admins."""
        data = super().to_representation(instance)
        request = self.context.get("request")
        user = getattr(request, "user", None)
        allowed = bool(
            user
            and user.is_authenticated
            and (user.is_admin or instance.page.owner_id == user.id)
        )
        if not allowed:
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

class TimelineEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TimelineEntry
        fields = ["id", "year", "title", "description", "order"]
        read_only_fields = ["id"]


# --- Military Awards ---

class MilitaryAwardSerializer(serializers.ModelSerializer):
    class Meta:
        model = MilitaryAward
        fields = ["id", "name", "description", "awarded_date", "model_3d_url", "order"]
        read_only_fields = ["id"]


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
    """Lightweight listing — no heavy nested data."""

    owner = UserOwnerSerializer(read_only=True)
    primary_portrait = serializers.SerializerMethodField()

    class Meta:
        model = MemorialPage
        fields = [
            "id", "slug", "page_type", "state",
            "first_name", "last_name", "birth_date", "death_date",
            "owner", "primary_portrait", "moderation_note", "created_at",
        ]
        read_only_fields = ["id", "slug", "state", "moderation_note", "created_at"]

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
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "slug", "state", "portrait_animated_url",
            "portrait_animation_status", "approved_at", "created_at", "updated_at",
        ]


class MemorialPageCreateSerializer(serializers.ModelSerializer):
    """Create a new memorial page — slug is auto-generated."""

    class Meta:
        model = MemorialPage
        fields = [
            "page_type", "first_name", "last_name",
            "birth_date", "death_date", "biography",
            "military_rank", "military_branch", "service_start", "service_end",
        ]

    def create(self, validated_data: dict) -> MemorialPage:
        """Assign owner; the slug is generated by MemorialPage.save()."""
        request = self.context["request"]
        return MemorialPage.objects.create(owner=request.user, **validated_data)


class MemorialPageUpdateSerializer(serializers.ModelSerializer):
    """Update page content."""

    class Meta:
        model = MemorialPage
        fields = [
            "first_name", "last_name", "birth_date", "death_date", "biography",
            "military_rank", "military_branch", "service_start", "service_end",
        ]

    def update(self, instance: MemorialPage, validated_data: dict) -> MemorialPage:
        """Apply field updates. Re-moderation is decided by the view (owner only)."""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
