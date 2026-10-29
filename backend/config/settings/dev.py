"""Development settings."""
from __future__ import annotations

from pathlib import Path

from .base import *  # noqa: F401, F403

DEBUG = True

# SQLite for local development — no Postgres required
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": Path(__file__).resolve().parent.parent.parent / "db.sqlite3",
    }
}

# Show all SQL in dev
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "console": {"class": "logging.StreamHandler"},
    },
    "loggers": {
        "django.db.backends": {
            "handlers": ["console"],
            "level": "DEBUG",
        },
    },
}

# In-process cache so throttling works without Redis in dev/tests
CACHES = {"default": {"BACKEND": "django.core.cache.backends.locmem.LocMemCache"}}

RATELIMIT_ENABLE = False

# Allow all origins in dev
CORS_ALLOW_ALL_ORIGINS = True

# Use local file storage in dev
DEFAULT_FILE_STORAGE = "django.core.files.storage.FileSystemStorage"

# Print emails to the console unless EMAIL_BACKEND is set explicitly
EMAIL_BACKEND = env("EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend")  # noqa: F405
