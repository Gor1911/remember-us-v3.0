from __future__ import annotations

from django.apps import AppConfig


class QRConfig(AppConfig):
    """QR app — code generation and hashed path management."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.qr"
