"""Memorial page models with DRAFT → MODERATION → ACTIVE state machine."""
from __future__ import annotations

from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from apps.core.models import BaseModel


class PageState(models.TextChoices):
    """Memorial page lifecycle states."""

    DRAFT = "draft", "Draft"
    MODERATION = "moderation", "On Moderation"
    ACTIVE = "active", "Active"


class PageType(models.TextChoices):
    """Page template type — affects design palette."""

    CIVILIAN = "civilian", "Civilian"
    MILITARY = "military", "Military"


class MemorialPage(BaseModel):
    """A closed memorial page accessible only via hashed slug."""

    slug = models.CharField(
        max_length=30,
        unique=True,
        db_index=True,
        help_text="Hashed URL path (e.g. sh2-98x-z1). Never expose numeric IDs.",
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="owned_pages",
    )
    state = models.CharField(
        max_length=20,
        choices=PageState.choices,
        default=PageState.DRAFT,
        db_index=True,
    )
    page_type = models.CharField(
        max_length=20,
        choices=PageType.choices,
        default=PageType.CIVILIAN,
    )

    # Subject info
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    birth_date = models.DateField(null=True, blank=True)
    death_date = models.DateField(null=True, blank=True)
    biography = models.TextField(blank=True)

    # Military-specific
    military_rank = models.CharField(max_length=100, blank=True)
    military_branch = models.CharField(max_length=100, blank=True)
    service_start = models.DateField(null=True, blank=True)
    service_end = models.DateField(null=True, blank=True)

    # Living Portrait AI
    portrait_animated_url = models.URLField(blank=True)
    portrait_animation_status = models.CharField(
        max_length=20,
        default="pending",
        choices=[
            ("pending", "Pending"),
            ("processing", "Processing"),
            ("done", "Done"),
            ("failed", "Failed"),
        ],
    )

    # Moderation
    moderation_note = models.TextField(blank=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="approved_pages",
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Memorial Page"
        verbose_name_plural = "Memorial Pages"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.first_name} {self.last_name} [{self.state}] /{self.slug}"

    # --- State machine transitions ---

    def submit_for_moderation(self) -> None:
        """Move DRAFT → MODERATION. Owner action."""
        if self.state != PageState.DRAFT:
            raise ValidationError(
                f"Cannot submit: page is '{self.state}', expected 'draft'."
            )
        self.state = PageState.MODERATION
        self.save(update_fields=["state", "updated_at"])

    def approve(self, admin_user) -> None:
        """Move MODERATION → ACTIVE. Admin-only action."""
        from apps.users.models import UserRole

        if admin_user.role != UserRole.ADMIN:
            raise ValidationError("Only admins can approve pages.")
        if self.state != PageState.MODERATION:
            raise ValidationError(
                f"Cannot approve: page is '{self.state}', expected 'moderation'."
            )
        from django.utils import timezone

        self.state = PageState.ACTIVE
        self.approved_by = admin_user
        self.approved_at = timezone.now()
        self.save(update_fields=["state", "approved_by", "approved_at", "updated_at"])

    def reject(self, admin_user, note: str = "") -> None:
        """Move MODERATION → DRAFT with a note."""
        from apps.users.models import UserRole

        if admin_user.role != UserRole.ADMIN:
            raise ValidationError("Only admins can reject pages.")
        if self.state != PageState.MODERATION:
            raise ValidationError(
                f"Cannot reject: page is '{self.state}', expected 'moderation'."
            )
        self.state = PageState.DRAFT
        self.moderation_note = note
        self.save(update_fields=["state", "moderation_note", "updated_at"])

    def mark_edited_by_owner(self) -> None:
        """Any Owner edit on ACTIVE resets to MODERATION (rule requirement)."""
        if self.state == PageState.ACTIVE:
            self.state = PageState.MODERATION
            self.save(update_fields=["state", "updated_at"])

    # --- Helpers ---

    @property
    def is_active(self) -> bool:
        """Check if page is publicly accessible."""
        return self.state == PageState.ACTIVE

    @property
    def full_name(self) -> str:
        """Return subject's full name."""
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def memorial_url(self) -> str:
        """Return frontend URL for this memorial."""
        from django.conf import settings as django_settings

        return f"{django_settings.FRONTEND_URL}/{self.slug}"


class TimelineEntry(BaseModel):
    """A single entry in the Bento-Timeline biography block."""

    page = models.ForeignKey(
        MemorialPage,
        on_delete=models.CASCADE,
        related_name="timeline_entries",
    )
    year = models.IntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        verbose_name = "Timeline Entry"
        verbose_name_plural = "Timeline Entries"
        ordering = ["year", "order"]

    def __str__(self) -> str:
        return f"{self.page.full_name} — {self.year}: {self.title}"


class MilitaryAward(BaseModel):
    """Military award/medal for 3D Three.js rendering."""

    page = models.ForeignKey(
        MemorialPage,
        on_delete=models.CASCADE,
        related_name="military_awards",
    )
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    awarded_date = models.DateField(null=True, blank=True)
    model_3d_url = models.URLField(blank=True, help_text="GLB/GLTF file for Three.js")
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        verbose_name = "Military Award"
        verbose_name_plural = "Military Awards"
        ordering = ["order"]

    def __str__(self) -> str:
        return f"{self.name} — {self.page.full_name}"
