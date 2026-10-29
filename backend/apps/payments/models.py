"""Payment records (one per Stripe Checkout Session)."""
from __future__ import annotations

from django.conf import settings
from django.db import models

from apps.core.models import BaseModel


class PaymentStatus(models.TextChoices):
    """Lifecycle of a Checkout Session."""

    PENDING = "pending", "Pending"
    PAID = "paid", "Paid"
    FAILED = "failed", "Failed"
    EXPIRED = "expired", "Expired"
    REFUNDED = "refunded", "Refunded"


class Payment(BaseModel):
    """A one-time payment for a memorial page package."""

    page = models.ForeignKey("pages.MemorialPage", on_delete=models.PROTECT, related_name="payments")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="payments"
    )
    package = models.CharField(max_length=20)
    amount_cents = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default="usd")
    stripe_session_id = models.CharField(max_length=255, unique=True)
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, db_index=True)
    status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING, db_index=True
    )
    consent_ai = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Payment"
        verbose_name_plural = "Payments"
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.package} {self.amount_cents} {self.currency} [{self.status}]"
