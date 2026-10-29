"""Server-side media type detection (never trust the client content type)."""
from __future__ import annotations

import os
from typing import IO

from PIL import Image

IMAGE_FORMATS: dict[str, tuple[str, set[str]]] = {
    "JPEG": ("image/jpeg", {".jpg", ".jpeg"}),
    "PNG": ("image/png", {".png"}),
    "WEBP": ("image/webp", {".webp"}),
}
VIDEO_EXTENSIONS: dict[str, str] = {".mp4": "video/mp4", ".webm": "video/webm"}
_WEBM_MAGIC = b"\x1a\x45\xdf\xa3"


def detect_media_kind(file_obj: IO[bytes]) -> tuple[str, str] | None:
    """Return ("image"|"video", mime) for an allowed file, else None.

    Images are verified with Pillow; videos by extension plus container signature.
    The file position is reset to 0 afterwards.
    """
    ext = os.path.splitext(getattr(file_obj, "name", "") or "")[1].lower()
    try:
        file_obj.seek(0)
        head = file_obj.read(16)
        file_obj.seek(0)

        if ext in VIDEO_EXTENSIONS:
            if ext == ".mp4" and head[4:8] == b"ftyp":
                return "video", "video/mp4"
            if ext == ".webm" and head[:4] == _WEBM_MAGIC:
                return "video", "video/webm"
            return None

        with Image.open(file_obj) as img:
            fmt = img.format or ""
            img.verify()
        if fmt in IMAGE_FORMATS and ext in IMAGE_FORMATS[fmt][1]:
            return "image", IMAGE_FORMATS[fmt][0]
        return None
    except Exception:  # noqa: BLE001 - any parse failure means "not a valid image"
        return None
    finally:
        try:
            file_obj.seek(0)
        except Exception:  # noqa: BLE001
            pass
