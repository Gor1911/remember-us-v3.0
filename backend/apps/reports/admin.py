"""Admin for reports."""
from __future__ import annotations

from django.contrib import admin

from .models import Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    """Inspect complaints (resolving happens through the API so it is audited)."""

    list_display = ["created_at", "category", "status", "page"]
    list_filter = ["status", "category"]
    raw_id_fields = ["page", "resolved_by"]
