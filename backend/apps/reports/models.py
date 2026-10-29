"""Public complaints about memorial pages."""
from __future__ import annotations

from django.conf import settings
from django.db import models

from apps.core.models import BaseModel


class ReportCategory(models.TextChoices):
    """Why the page is reported."""

    INAPPROPRIATE = "inappropriate", "Inappropriate content"
    PRIVACY = "privacy", "Privacy"
    COPYRIGHT = "copyright", "Copyright"
    IMPERSONATION = "impersonation", "Impersonation"
    OTHER = "other", "Other"


class ReportStatus(models.TextChoices):
    """Moderation status of a report."""

    OPEN = "open", "Open"
    RESOLVED = "resolved", "Resolved"
    DISMISSED = "dismissed", "Dismissed"


class Report(BaseModel):
    """A complaint filed by a visitor."""

    page = models.ForeignKey("pages.MemorialPage", on_delete=models.CASCADE, related_name="reports")
    category = models.CharField(max_length=20, choices=ReportCategory.choices)
    message = models.TextField()
    contact_email = models.EmailField(blank=True)
    status = models.CharField(
        max_length=20, choices=ReportStatus.choices, default=ReportStatus.OPEN, db_index=True
    )
    resolution_note = models.TextField(blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="resolved_reports",
    )
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "Report"
        verbose_name_plural = "Reports"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.category} [{self.status}]"
