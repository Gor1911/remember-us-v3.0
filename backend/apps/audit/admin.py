"""Read-only admin for the audit log."""
from __future__ import annotations

from django.contrib import admin

from .models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    """Audit entries can be inspected but never added, edited or deleted."""

    list_display = ["created_at", "action", "target_type", "target_id", "actor"]
    list_filter = ["action", "target_type"]
    search_fields = ["target_id", "actor__email"]
    readonly_fields = [f.name for f in AuditLog._meta.fields]

    def has_add_permission(self, request, obj=None) -> bool:
        """Entries are written by the application only."""
        return False

    def has_change_permission(self, request, obj=None) -> bool:
        """Entries are immutable."""
        return False

    def has_delete_permission(self, request, obj=None) -> bool:
        """Entries are never deleted."""
        return False
