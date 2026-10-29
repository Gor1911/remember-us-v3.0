"""Production settings."""
from __future__ import annotations

from .base import *  # noqa: F401, F403

DEBUG = False

# Security
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
X_FRAME_OPTIONS = "DENY"
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# nginx sits in front and appends the peer address to X-Forwarded-For
TRUST_X_FORWARDED_FOR = env.bool("TRUST_X_FORWARDED_FOR", default=True)  # noqa: F405
REST_FRAMEWORK = {  # noqa: F405
    **REST_FRAMEWORK,  # noqa: F405
    "NUM_PROXIES": 1 if TRUST_X_FORWARDED_FOR else 0,
}

# Email: SMTP (EMAIL_HOST / EMAIL_HOST_USER / EMAIL_HOST_PASSWORD from env)
EMAIL_BACKEND = env("EMAIL_BACKEND", default="django.core.mail.backends.smtp.EmailBackend")  # noqa: F405

# Behind nginx: Django authorizes media, nginx serves via internal /protected-media/
# (ignored when S3 storage returns presigned URLs).
MEDIA_USE_X_ACCEL = env.bool("MEDIA_USE_X_ACCEL", default=True)  # noqa: F405

# S3 media storage
DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
STATICFILES_STORAGE = "storages.backends.s3boto3.S3StaticStorage"

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "WARNING",
    },
}
