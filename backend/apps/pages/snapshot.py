"""Published snapshot: the last admin-approved version of a memorial page.

Guests are served this snapshot while a newer owner edit waits for review, so
unapproved content never reaches them. The helpers here only read attributes of
the objects they receive (no model imports, no queries), so the data migration
can call them with historical models.

Snapshot layout (``SNAPSHOT_VERSION`` 1)::

    {
        "version": 1,
        "captured_at": "2026-11-25T10:00:00+00:00",
        "page": {"first_name": ..., "birth_date": "1940-01-01" | None, ...},
        "timeline_entries": [{"id", "year", "title", "description", "order"}],
        "military_awards": [{"id", "name", "description", "awarded_date",
                             "model_3d_url", "order"}],
        "media_ids": ["<uuid>", ...],
    }

Media are stored by id only: file URLs are signed per request and expire.
"""
from __future__ import annotations

from collections.abc import Iterable
from datetime import date, datetime
from typing import Any

SNAPSHOT_VERSION = 1

# Subject fields guests see; everything else in the page detail stays live.
SNAPSHOT_PAGE_FIELDS: tuple[str, ...] = (
    "first_name", "last_name", "page_type",
    "birth_date", "death_date", "biography",
    "military_rank", "military_branch", "service_start", "service_end",
)
_DATE_FIELDS = frozenset({"birth_date", "death_date", "service_start", "service_end"})

# Media types that live in the owner-editable content (the living portrait video
# is admin-uploaded and stays live, so it is not part of the snapshot).
SNAPSHOT_MEDIA_EXCLUDED_TYPES: tuple[str, ...] = ("living_portrait",)


def _iso(value: date | datetime | None) -> str | None:
    """ISO-format a date/datetime, keeping None."""
    return value.isoformat() if value else None


def build_snapshot(
    page: Any,
    timeline_entries: Iterable[Any],
    military_awards: Iterable[Any],
    media_ids: Iterable[Any],
    captured_at: datetime,
) -> dict[str, Any]:
    """Build the JSON-serializable snapshot from already-filtered, non-deleted rows."""
    page_data: dict[str, Any] = {}
    for field in SNAPSHOT_PAGE_FIELDS:
        value = getattr(page, field)
        page_data[field] = _iso(value) if field in _DATE_FIELDS else value

    timeline = sorted(timeline_entries, key=lambda e: (e.year, e.order))
    awards = sorted(military_awards, key=lambda a: a.order)
    return {
        "version": SNAPSHOT_VERSION,
        "captured_at": captured_at.isoformat(),
        "page": page_data,
        "timeline_entries": [
            {
                "id": str(entry.id),
                "year": entry.year,
                "title": entry.title,
                "description": entry.description,
                "order": entry.order,
            }
            for entry in timeline
        ],
        "military_awards": [
            {
                "id": str(award.id),
                "name": award.name,
                "description": award.description,
                "awarded_date": _iso(award.awarded_date),
                "model_3d_url": award.model_3d_url,
                "order": award.order,
            }
            for award in awards
        ],
        "media_ids": [str(media_id) for media_id in media_ids],
    }


def snapshot_media_ids(snapshot: dict[str, Any] | None) -> set[str]:
    """Return the media ids recorded in a snapshot (empty set when there is none)."""
    if not snapshot:
        return set()
    return {str(media_id) for media_id in snapshot.get("media_ids", [])}
