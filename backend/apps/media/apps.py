from __future__ import annotations

from django.apps import AppConfig


class MediaConfig(AppConfig):
    """Media app — photo/video uploads for memorial pages."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.media"
