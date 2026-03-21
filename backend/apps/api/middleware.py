"""Middleware for security headers on memorial pages."""
from __future__ import annotations

from django.conf import settings
from django.http import HttpRequest, HttpResponse


class NoIndexMiddleware:
    """Add X-Robots-Tag: noindex to all memorial page API responses."""

    def __init__(self, get_response) -> None:
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        """Inject noindex header on all non-admin responses."""
        response = self.get_response(request)

        if getattr(settings, "MEMORIAL_NOINDEX", True):
            # Apply to all API endpoints (memorial data must never be indexed)
            if request.path.startswith("/api/"):
                response["X-Robots-Tag"] = "noindex, nofollow"
                response["X-Content-Type-Options"] = "nosniff"

        return response
