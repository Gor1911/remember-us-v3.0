"""Admin for memorial pages."""
from __future__ import annotations

from django.contrib import admin

from apps.media.models import MediaFile

from .models import MemorialPage, MilitaryAward, TimelineEntry


class TimelineEntryInline(admin.TabularInline):
    model = TimelineEntry
    extra = 0
    ordering = ["year", "order"]


class MilitaryAwardInline(admin.TabularInline):
    model = MilitaryAward
    extra = 0
    ordering = ["order"]


class MediaFileInline(admin.TabularInline):
    model = MediaFile
    extra = 1
    fields = ["file", "media_type", "is_primary_portrait", "caption", "order"]
    ordering = ["order"]


@admin.register(MemorialPage)
class MemorialPageAdmin(admin.ModelAdmin):
    list_display = ["full_name", "slug", "page_type", "state", "owner", "created_at"]
    list_filter = ["state", "page_type"]
    search_fields = ["first_name", "last_name", "slug"]
    readonly_fields = ["slug", "created_at", "updated_at", "approved_at", "memorial_url"]
    inlines = [TimelineEntryInline, MilitaryAwardInline, MediaFileInline]

    actions = ["approve_pages"]

    @admin.action(description="Approve selected pages")
    def approve_pages(self, request, queryset):
        """Bulk approve pages from admin panel."""
        for page in queryset.filter(state="moderation"):
            page.approve(request.user)
        self.message_user(request, "Selected pages approved.")
