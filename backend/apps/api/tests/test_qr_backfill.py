"""The QR backfill migration step: token, legacy flag and a NEW image; old file is kept."""
from __future__ import annotations

import importlib

from django.apps import apps
from django.core.files.base import ContentFile

from apps.qr.models import QRCode


def test_backfill_gives_token_legacy_flag_and_new_image(active_page, settings):
    settings.FRONTEND_URL = "https://app.example.com"
    qr = QRCode(page=active_page)
    qr.image.save("old-slug.png", ContentFile(b"old-bytes"), save=False)
    qr.save()
    old_name = qr.image.name
    QRCode.objects.filter(pk=qr.pk).update(token="legacy-placeholder")

    migration = importlib.import_module("apps.qr.migrations.0003_backfill_tokens")
    migration.backfill(apps, None)

    qr.refresh_from_db()
    assert qr.token != "legacy-placeholder" and len(qr.token) >= 20
    assert qr.legacy_link_qr is True
    assert qr.image.name != old_name
    assert qr.image.storage.exists(old_name)  # old file kept
    assert qr.image.read(4) == b"\x89PNG"
