"""Payments app config."""
from __future__ import annotations

from django.apps import AppConfig


class PaymentsConfig(AppConfig):
    """Stripe Checkout payments."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.payments"
