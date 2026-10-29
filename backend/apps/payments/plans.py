"""Static plan catalogue (the charged price is the configured Stripe Price)."""
from __future__ import annotations

from dataclasses import dataclass

from django.conf import settings


def stripe_configured() -> bool:
    """True when the Stripe secret key is set."""
    return bool(getattr(settings, "STRIPE_SECRET_KEY", ""))


@dataclass(frozen=True)
class Plan:
    """A purchasable package."""

    id: str
    name: str
    amount_cents: int
    currency: str

    @property
    def price_id(self) -> str:
        """Configured Stripe Price id ('' when missing)."""
        return getattr(settings, f"STRIPE_PRICE_{self.id.upper()}", "") or ""

    @property
    def available(self) -> bool:
        """Stripe is configured and this plan has a price id."""
        return stripe_configured() and bool(self.price_id)


PLANS: dict[str, Plan] = {
    "standard": Plan("standard", "Standard", 9900, "usd"),
    "premium": Plan("premium", "Premium", 14900, "usd"),
}
