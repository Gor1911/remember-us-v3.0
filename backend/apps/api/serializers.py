"""DRF serializers — never expose internal IDs, use UUIDs only."""
from __future__ import annotations

from rest_framework import serializers

from apps.media.models import MediaFile
from apps.pages.models import MemorialPage, MilitaryAward, TimelineEntry
from apps.qr.models import QRCode
from apps.users.models import User


# --- User ---

class UserPublicSerializer(serializers.ModelSerializer):
    """Minimal user info for public display (no email exposed)."""

    class Meta:
        model = User
        fields = ["id", "display_name", "role"]


class UserDetailSerializer(serializers.ModelSerializer):
    """Full user info — only returned to the user themselves or admin."""

    class Meta:
        model = User
        fields = ["id", "email", "display_name", "role", "created_at"]
        read_only_fields = ["id", "created_at"]


class UserCreateSerializer(serializers.ModelSerializer):
    """Register a new user."""

    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["email", "password", "display_name"]

    def create(self, validated_data: dict) -> User:
        """Create user with hashed password. New users get Owner role so they can create pages."""
        from apps.users.models import UserRole
        return User.objects.create_user(role=UserRole.OWNER, **validated_data)


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
        request = self.context.get("request")
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url if obj.file else None


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
        request = self.context.get("request")
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


# --- Memorial Page ---

class MemorialPageListSerializer(serializers.ModelSerializer):
    """Lightweight listing — no heavy nested data."""

    owner = UserPublicSerializer(read_only=True)
    primary_portrait = serializers.SerializerMethodField()

    class Meta:
        model = MemorialPage
        fields = [
            "id", "slug", "page_type", "state",
            "first_name", "last_name", "birth_date", "death_date",
            "owner", "primary_portrait", "created_at",
        ]
        read_only_fields = ["id", "slug", "state", "created_at"]

    def get_primary_portrait(self, obj: MemorialPage) -> str | None:
        portrait = obj.media_files.filter(
            media_type="portrait", is_primary_portrait=True
        ).first()
        if portrait and portrait.file:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(portrait.file.url)
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
        """Auto-generate unique slug and assign owner."""
        from apps.qr.utils import generate_unique_slug

        request = self.context["request"]
        page = MemorialPage.objects.create(
            slug=generate_unique_slug(),
            owner=request.user,
            **validated_data,
        )
        return page


class MemorialPageUpdateSerializer(serializers.ModelSerializer):
    """Update page content — triggers MODERATION reset if page was ACTIVE."""

    class Meta:
        model = MemorialPage
        fields = [
            "first_name", "last_name", "birth_date", "death_date", "biography",
            "military_rank", "military_branch", "service_start", "service_end",
        ]

    def update(self, instance: MemorialPage, validated_data: dict) -> MemorialPage:
        """Apply update and reset to MODERATION if page was ACTIVE."""
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.mark_edited_by_owner()  # handles ACTIVE → MODERATION
        instance.save()
        return instance
