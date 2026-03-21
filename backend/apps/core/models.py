"""Shared base model inherited by all domain models."""
from __future__ import annotations

import uuid

from django.db import models
from django.utils import timezone


class SoftDeleteManager(models.Manager):
    """Default manager — excludes soft-deleted records."""

    def get_queryset(self) -> models.QuerySet:
        """Return only non-deleted records."""
        return super().get_queryset().filter(is_deleted=False)


class AllObjectsManager(models.Manager):
    """Manager that includes soft-deleted records."""

    def get_queryset(self) -> models.QuerySet:
        """Return all records including deleted."""
        return super().get_queryset()


class BaseModel(models.Model):
    """Abstract base with UUID PK, timestamps, and soft delete."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_deleted = models.BooleanField(default=False, db_index=True)

    objects = SoftDeleteManager()
    all_objects = AllObjectsManager()

    class Meta:
        abstract = True

    def soft_delete(self) -> None:
        """Mark record as deleted without removing from database."""
        self.is_deleted = True
        self.updated_at = timezone.now()
        self.save(update_fields=["is_deleted", "updated_at"])

    def restore(self) -> None:
        """Restore a soft-deleted record."""
        self.is_deleted = False
        self.updated_at = timezone.now()
        self.save(update_fields=["is_deleted", "updated_at"])
