from __future__ import annotations

from django.apps import AppConfig


class PagesConfig(AppConfig):
    """Pages app — memorial pages with state machine."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.pages"
