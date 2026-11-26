"""Signed, expiring URLs for private media and QR files.

Tokens carry an audience. URLs handed to the page owner / admins are
``privileged`` (non-deleted files of a non-deleted page). URLs handed to
everyone else are ``guest`` tokens: they serve only files that belong to the
page's guest version (live media of an ACTIVE page, or the media recorded in
``published_snapshot`` while an edit is in review, soft-deleted ones included).
"""
from __future__ import annotations

import mimetypes
import os
import re
import time
from typing import Any, Literal
from urllib.parse import quote

from django.conf import settings
from django.core import signing
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.files.storage import FileSystemStorage
from django.http import FileResponse, Http404, HttpRequest, HttpResponse

from apps.media.models import MediaFile, MediaType
from apps.pages.snapshot import snapshot_media_ids
from apps.qr.models import QRCode

SIGNING_SALT = "remember-us.media-url.v1"
Kind = Literal["media", "qr"]
Audience = Literal["privileged", "guest"]
_KINDS: tuple[str, ...] = ("media", "qr")
_GUEST = "g"
_EXT_RE = re.compile(r"^\.[a-z0-9]{1,5}$")


def max_age() -> int:
    """Return the lifetime of a signed URL in seconds."""
    return int(getattr(settings, "MEDIA_URL_MAX_AGE", 6 * 3600))


def make_token(kind: Kind, obj_id: Any, audience: Audience = "privileged") -> str:
    """Sign an object id + kind (+ guest audience) into an opaque, expiring token."""
    payload: dict[str, Any] = {"k": kind, "i": str(obj_id), "x": int(time.time()) + max_age()}
    if audience == "guest":
        payload["a"] = _GUEST
    return signing.dumps(payload, salt=SIGNING_SALT, compress=True)


def read_token(token: str) -> tuple[str, str, int, Audience] | None:
    """Validate a token; return (kind, object id, seconds remaining, audience) or None."""
    try:
        payload = signing.loads(token, salt=SIGNING_SALT, max_age=max_age())
        kind, obj_id, expires = payload["k"], payload["i"], int(payload["x"])
        audience: Audience = "guest" if payload.get("a") == _GUEST else "privileged"
    except (signing.BadSignature, KeyError, TypeError, ValueError, AttributeError):
        return None
    remaining = expires - int(time.time())
    if kind not in _KINDS or remaining <= 0:
        return None
    return kind, obj_id, remaining, audience


def _safe_name(obj: MediaFile | QRCode, kind: Kind) -> str:
    """Return a neutral file name (object id + normalized extension)."""
    field = obj.file if kind == "media" else obj.image
    ext = os.path.splitext(field.name or "")[1].lower()
    return f"{obj.id.hex}{ext if _EXT_RE.match(ext) else ''}"


def signed_file_url(
    request: HttpRequest | None,
    obj: MediaFile | QRCode,
    kind: Kind,
    audience: Audience = "privileged",
) -> str | None:
    """Return an absolute, expiring URL for the object's file (or None if no file).

    Pass ``audience="guest"`` for URLs given to anyone but the page owner / admins.
    """
    field = obj.file if kind == "media" else obj.image
    if not field:
        return None
    if not isinstance(field.storage, FileSystemStorage):
        # Remote storage (S3): presigned URL with AWS_QUERYSTRING_EXPIRE.
        return field.storage.url(field.name)
    token = make_token(kind, obj.id, audience)
    path = f"{settings.MEDIA_URL}s/{token}/{_safe_name(obj, kind)}"
    return request.build_absolute_uri(path) if request else path


def is_guest_visible_media(media: MediaFile) -> bool:
    """True when a guest may load this file (it belongs to the page's guest version)."""
    page = media.page
    if not page.has_guest_version:
        return False
    if media.media_type == MediaType.LIVING_PORTRAIT:
        # Admin-uploaded, not owner-editable: always served live.
        return not media.is_deleted
    if page.serves_snapshot_to_guests:
        return str(media.id) in snapshot_media_ids(page.published_snapshot)
    return not media.is_deleted


def _guest_media(obj_id: str) -> MediaFile | None:
    """Media row for a guest token (soft-deleted rows allowed if still in the snapshot)."""
    try:
        media = MediaFile.all_objects.select_related("page").filter(pk=obj_id).first()
    except (ValueError, DjangoValidationError):
        return None
    if media is None or not is_guest_visible_media(media):
        return None
    return media


def serve_signed_media(request: HttpRequest, token: str, name: str) -> HttpResponse:
    """Serve a private file after validating the signed token (plain 404 otherwise)."""
    parsed = read_token(token)
    if parsed is None:
        raise Http404
    kind, obj_id, remaining, audience = parsed
    if audience == "guest":
        if kind != "media":
            raise Http404
        obj = _guest_media(obj_id)
    else:
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
