"""Reports app config."""
from __future__ import annotations

from django.apps import AppConfig


class ReportsConfig(AppConfig):
    """Public complaints about memorial pages."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.reports"
