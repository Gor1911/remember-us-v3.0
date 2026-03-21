"""Staging / demo settings — production-like but without S3 and with HTTP."""
from __future__ import annotations

from .prod import *  # noqa: F401, F403

# Local file storage instead of S3
DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"
STATICFILES_STORAGE = "django.contrib.staticfiles.storage.StaticFilesStorage"

# No SSL redirect — no TLS cert yet (IP-only deploy)
SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
SECURE_HSTS_SECONDS = 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = False
SECURE_HSTS_PRELOAD = False
