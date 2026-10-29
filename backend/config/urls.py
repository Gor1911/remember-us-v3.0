"""Root URL configuration."""
from __future__ import annotations

from django.contrib import admin
from django.urls import include, path

from apps.media.signing import serve_signed_media

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include("apps.api.urls")),
    # Private media: only reachable through signed, expiring URLs.
    path("media/s/<str:token>/<str:name>", serve_signed_media, name="signed-media"),
]
