"""Existing ACTIVE pages get a published snapshot of their current (approved) content.

Pages in MODERATION or DRAFT are left without one: their live content may hold
unapproved edits, so they stay invisible to guests until the next approval.
"""
from __future__ import annotations

from django.db import migrations
from django.utils import timezone

from apps.pages.snapshot import SNAPSHOT_MEDIA_EXCLUDED_TYPES, build_snapshot


def populate(apps, schema_editor) -> None:
    """Snapshot every non-deleted ACTIVE page that has none yet."""
    MemorialPage = apps.get_model("pages", "MemorialPage")
    TimelineEntry = apps.get_model("pages", "TimelineEntry")
    MilitaryAward = apps.get_model("pages", "MilitaryAward")
    MediaFile = apps.get_model("media", "MediaFile")

    now = timezone.now()
    pages = MemorialPage._base_manager.filter(
        state="active", is_deleted=False, published_snapshot__isnull=True
    )
    for page in pages.iterator():
        media_ids = (
            MediaFile._base_manager.filter(page_id=page.pk, is_deleted=False)
            .exclude(media_type__in=SNAPSHOT_MEDIA_EXCLUDED_TYPES)
            .values_list("id", flat=True)
        )
        page.published_snapshot = build_snapshot(
            page,
            TimelineEntry._base_manager.filter(page_id=page.pk, is_deleted=False),
            MilitaryAward._base_manager.filter(page_id=page.pk, is_deleted=False),
            media_ids,
            captured_at=page.approved_at or now,
        )
        page.save(update_fields=["published_snapshot"])


class Migration(migrations.Migration):

    dependencies = [
        ("pages", "0006_published_snapshot"),
        ("media", "0004_p0_2"),
    ]

    operations = [
        migrations.RunPython(populate, migrations.RunPython.noop),
    ]
