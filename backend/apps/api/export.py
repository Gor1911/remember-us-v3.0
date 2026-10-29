"""Owner data export: build a ZIP with memorial.json and the page's media files."""
from __future__ import annotations

import json
import re
import shutil
import tempfile
import zipfile
from datetime import date, datetime
from typing import IO

from django.utils import timezone

from apps.pages.models import MemorialPage

EXPORT_SCHEMA_VERSION = 1
_SPOOL_BYTES = 16 * 1024 * 1024
_UNSAFE = re.compile(r"[^A-Za-z0-9._-]+")


def sanitize_filename(name: str) -> str:
    """Return a filesystem-safe name (no separators, no leading dots, bounded length)."""
    base = re.split(r"[\\/]", name or "")[-1]
    base = _UNSAFE.sub("_", base).lstrip("._") or "file"
    return base[-100:]


def _iso(value: date | datetime | None) -> str | None:
    """ISO-format a date/datetime or return None."""
    return value.isoformat() if value else None


def build_metadata(page: MemorialPage, media_entries: list[dict]) -> dict:
    """Assemble the memorial.json document."""
    return {
        "schema_version": EXPORT_SCHEMA_VERSION,
        "exported_at": timezone.now().isoformat(),
        "page": {
            "id": str(page.id),
            "slug": page.slug,
            "page_type": page.page_type,
            "state": page.state,
            "first_name": page.first_name,
            "last_name": page.last_name,
            "birth_date": _iso(page.birth_date),
            "death_date": _iso(page.death_date),
            "biography": page.biography,
            "military_rank": page.military_rank,
            "military_branch": page.military_branch,
            "service_start": _iso(page.service_start),
            "service_end": _iso(page.service_end),
            "created_at": _iso(page.created_at),
            "updated_at": _iso(page.updated_at),
        },
        "timeline_entries": [
            {
                "id": str(t.id),
                "year": t.year,
                "title": t.title,
                "description": t.description,
                "order": t.order,
            }
            for t in page.timeline_entries.all()
        ],
        "military_awards": [
            {
                "id": str(a.id),
                "name": a.name,
                "description": a.description,
                "awarded_date": _iso(a.awarded_date),
                "model_3d_url": a.model_3d_url,
                "order": a.order,
            }
            for a in page.military_awards.all()
        ],
        "media": media_entries,
    }


def _copy_field(zf: zipfile.ZipFile, arcname: str, field) -> bool:
    """Stream a storage file into the archive; return False if it cannot be read."""
    try:
        src = field.open("rb")
    except (FileNotFoundError, OSError, ValueError):
        return False
    with src, zf.open(zipfile.ZipInfo(arcname), "w", force_zip64=True) as dst:
        shutil.copyfileobj(src, dst, 1024 * 1024)
    return True


def build_export_zip(page: MemorialPage) -> IO[bytes]:
    """Build the export archive in a spooled temp file (disk-backed when large)."""
    tmp = tempfile.SpooledTemporaryFile(max_size=_SPOOL_BYTES)  # noqa: SIM115
    media_entries: list[dict] = []
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_STORED) as zf:
        for media in page.media_files.all():
            name = sanitize_filename(media.original_filename or media.file.name)
            arcname = f"media/{media.id}-{name}"
            included = bool(media.file) and _copy_field(zf, arcname, media.file)
            media_entries.append(
                {
                    "id": str(media.id),
                    "media_type": media.media_type,
                    "original_filename": media.original_filename,
                    "mime_type": media.mime_type,
                    "file_size": media.file_size,
                    "is_primary_portrait": media.is_primary_portrait,
                    "caption": media.caption,
                    "alt_text": media.alt_text,
                    "order": media.order,
                    "uploaded_at": _iso(media.created_at),
                    "archive_path": arcname if included else None,
                }
            )
        qr = page.qr_code if hasattr(page, "qr_code") else None
        if qr is not None and not qr.is_deleted and qr.image:
            _copy_field(zf, "qr.png", qr.image)
        zf.writestr(
            "memorial.json",
            json.dumps(build_metadata(page, media_entries), indent=2, ensure_ascii=False),
            compress_type=zipfile.ZIP_DEFLATED,
        )
    tmp.seek(0)
    return tmp
