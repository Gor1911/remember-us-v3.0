from __future__ import annotations

from django.apps import AppConfig


class CoreConfig(AppConfig):
    """Core app — shared base models and utilities."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.core"
