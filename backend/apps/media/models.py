"""Media upload models — portraits, videos, documents."""
from __future__ import annotations

import os
import re
import uuid

from django.conf import settings
from django.db import models

from apps.core.models import BaseModel


class MediaType(models.TextChoices):
    """Supported media types."""

    PORTRAIT = "portrait", "Portrait Photo"
    PHOTO = "photo", "Photo"
    VIDEO = "video", "Video"
    DOCUMENT = "document", "Document"
    MODEL_3D = "model_3d", "3D Model"


_EXT_RE = re.compile(r"^\.[a-z0-9]{1,5}$")


def upload_to(instance: MediaFile, filename: str) -> str:
    """Generate an unguessable path: media/<page uuid>/<uuid4 hex><ext>."""
    ext = os.path.splitext(filename)[1].lower()
    if ext == ".jpeg":
        ext = ".jpg"
    if not _EXT_RE.match(ext):
        ext = ""
    return f"media/{instance.page_id}/{uuid.uuid4().hex}{ext}"


class MediaFile(BaseModel):
    """A file attached to a memorial page."""

    page = models.ForeignKey(
        "pages.MemorialPage",
        on_delete=models.CASCADE,
        related_name="media_files",
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="uploaded_media",
    )
    media_type = models.CharField(
        max_length=20,
        choices=MediaType.choices,
        default=MediaType.PHOTO,
        db_index=True,
    )
    file = models.FileField(upload_to=upload_to)
    original_filename = models.CharField(max_length=255, blank=True)
    file_size = models.PositiveIntegerField(default=0, help_text="Size in bytes")
    mime_type = models.CharField(max_length=100, blank=True)

    # For portrait: is this the primary portrait used for Living Portrait AI
    is_primary_portrait = models.BooleanField(default=False)

    # Caption / alt text
    caption = models.CharField(max_length=500, blank=True)
    alt_text = models.CharField(max_length=300, blank=True)

    # Display order
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        verbose_name = "Media File"
        verbose_name_plural = "Media Files"
        ordering = ["order", "-created_at"]

    def __str__(self) -> str:
        return f"{self.media_type}: {self.original_filename} ({self.page.slug})"

    def save(self, *args, **kwargs) -> None:
        """Ensure only one primary portrait per page."""
        if self.is_primary_portrait and self.media_type == MediaType.PORTRAIT:
            MediaFile.objects.filter(
                page=self.page,
                media_type=MediaType.PORTRAIT,
                is_primary_portrait=True,
            ).exclude(pk=self.pk).update(is_primary_portrait=False)
        super().save(*args, **kwargs)
