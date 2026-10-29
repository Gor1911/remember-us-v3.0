"""Signed, expiring URLs for private media and QR files."""
from __future__ import annotations

import mimetypes
import os
import re
import time
from typing import Any, Literal
from urllib.parse import quote

from django.conf import settings
from django.core import signing
from django.core.files.storage import FileSystemStorage
from django.http import FileResponse, Http404, HttpRequest, HttpResponse

from apps.media.models import MediaFile
from apps.qr.models import QRCode

SIGNING_SALT = "remember-us.media-url.v1"
Kind = Literal["media", "qr"]
_KINDS: tuple[str, ...] = ("media", "qr")
_EXT_RE = re.compile(r"^\.[a-z0-9]{1,5}$")


def max_age() -> int:
    """Return the lifetime of a signed URL in seconds."""
    return int(getattr(settings, "MEDIA_URL_MAX_AGE", 6 * 3600))


def make_token(kind: Kind, obj_id: Any) -> str:
    """Sign an object id + kind into an opaque, expiring token."""
    return signing.dumps(
        {"k": kind, "i": str(obj_id), "x": int(time.time()) + max_age()},
        salt=SIGNING_SALT,
        compress=True,
    )


def read_token(token: str) -> tuple[str, str, int] | None:
    """Validate a token; return (kind, object id, seconds remaining) or None."""
    try:
        payload = signing.loads(token, salt=SIGNING_SALT, max_age=max_age())
        kind, obj_id, expires = payload["k"], payload["i"], int(payload["x"])
    except (signing.BadSignature, KeyError, TypeError, ValueError):
        return None
    remaining = expires - int(time.time())
    if kind not in _KINDS or remaining <= 0:
        return None
    return kind, obj_id, remaining


def _safe_name(obj: MediaFile | QRCode, kind: Kind) -> str:
    """Return a neutral file name (object id + normalized extension)."""
    field = obj.file if kind == "media" else obj.image
    ext = os.path.splitext(field.name or "")[1].lower()
    return f"{obj.id.hex}{ext if _EXT_RE.match(ext) else ''}"


def signed_file_url(request: HttpRequest | None, obj: MediaFile | QRCode, kind: Kind) -> str | None:
    """Return an absolute, expiring URL for the object's file (or None if no file)."""
    field = obj.file if kind == "media" else obj.image
    if not field:
        return None
    if not isinstance(field.storage, FileSystemStorage):
        # Remote storage (S3): presigned URL with AWS_QUERYSTRING_EXPIRE.
        return field.storage.url(field.name)
    path = f"{settings.MEDIA_URL}s/{make_token(kind, obj.id)}/{_safe_name(obj, kind)}"
    return request.build_absolute_uri(path) if request else path


def serve_signed_media(request: HttpRequest, token: str, name: str) -> HttpResponse:
    """Serve a private file after validating the signed token (plain 404 otherwise)."""
    parsed = read_token(token)
    if parsed is None:
        raise Http404
    kind, obj_id, remaining = parsed
    model = MediaFile if kind == "media" else QRCode
    obj = model.objects.select_related("page").filter(pk=obj_id).first()
    if obj is None or obj.page.is_deleted:
        raise Http404
    field = obj.file if kind == "media" else obj.image
    if not field:
        raise Http404

    content_type = (
        getattr(obj, "mime_type", "")
        or mimetypes.guess_type(field.name)[0]
        or "application/octet-stream"
    )
    if kind == "qr":
        content_type = "image/png"

    if getattr(settings, "MEDIA_USE_X_ACCEL", False):
        response: HttpResponse = HttpResponse(content_type=content_type)
        response["X-Accel-Redirect"] = "/protected-media/" + quote(field.name)
    else:
        try:
            response = FileResponse(field.open("rb"), content_type=content_type)
        except (FileNotFoundError, OSError, ValueError):
            raise Http404 from None
    response["Content-Disposition"] = "inline"
    response["X-Content-Type-Options"] = "nosniff"
    response["Cache-Control"] = f"private, max-age={remaining}"
    return response
