"""Read-only payment admin."""
from __future__ import annotations

from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    """Payments are written by the checkout/webhook flow only."""

    list_display = ["created_at", "package", "amount_cents", "currency", "status", "user"]
    list_filter = ["status", "package"]
    search_fields = ["user__email", "stripe_session_id"]
    readonly_fields = [f.name for f in Payment._meta.fields]

    def has_add_permission(self, request, obj=None) -> bool:
        """Payments are never created by hand."""
        return False

    def has_delete_permission(self, request, obj=None) -> bool:
        """Payments are never deleted."""
        return False
