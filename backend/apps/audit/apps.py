"""Audit app config."""
from __future__ import annotations

from django.apps import AppConfig


class AuditConfig(AppConfig):
    """Append-only log of sensitive actions."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.audit"
