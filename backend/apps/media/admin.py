from __future__ import annotations

from django.contrib import admin

from .models import MediaFile


@admin.register(MediaFile)
class MediaFileAdmin(admin.ModelAdmin):
    list_display = ["original_filename", "page", "media_type", "is_primary_portrait", "order", "created_at"]
    list_filter = ["media_type", "is_primary_portrait"]
    search_fields = ["original_filename", "page__first_name", "page__last_name"]
    raw_id_fields = ["page", "uploaded_by"]
    ordering = ["page", "order"]
