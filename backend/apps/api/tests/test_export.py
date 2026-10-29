"""Owner data export (ZIP)."""
from __future__ import annotations

import io
import json
import zipfile

from rest_framework.test import APIClient

from apps.pages.models import MilitaryAward, TimelineEntry

from .conftest import auth, png_upload


def seed(client: APIClient, page) -> None:
    TimelineEntry.objects.create(page=page, year=1950, title="Born")
    MilitaryAward.objects.create(page=page, name="Medal")
    resp = client.post(
        f"/api/v1/pages/{page.slug}/media/",
        {"file": png_upload("evil name.png")},
        format="multipart",
    )
    assert resp.status_code == 201
    client.post(f"/api/v1/pages/{page.slug}/qr/generate/")


def open_zip(resp) -> zipfile.ZipFile:
    return zipfile.ZipFile(io.BytesIO(b"".join(resp.streaming_content)))


def test_owner_exports_any_state(api_client, owner, draft_page):
    c = auth(api_client, owner)
    seed(c, draft_page)
    resp = c.get(f"/api/v1/pages/{draft_page.slug}/export/")
    assert resp.status_code == 200
    assert resp["Content-Type"] == "application/zip"
    assert f'filename="remember-us-{draft_page.slug}.zip"' in resp["Content-Disposition"]
    zf = open_zip(resp)
    names = zf.namelist()
    assert "memorial.json" in names and "qr.png" in names
    doc = json.loads(zf.read("memorial.json"))
    assert doc["schema_version"] == 1 and doc["exported_at"]
    assert doc["page"]["slug"] == draft_page.slug
    assert doc["timeline_entries"][0]["title"] == "Born"
    assert doc["military_awards"][0]["name"] == "Medal"
    entry = doc["media"][0]
    assert entry["original_filename"] == "evil name.png"
    assert entry["archive_path"] in names
    assert entry["archive_path"] == f"media/{entry['id']}-evil_name.png"
    assert zf.read(entry["archive_path"]).startswith(b"\x89PNG")


def test_deleted_media_excluded(api_client, owner, draft_page):
    c = auth(api_client, owner)
    seed(c, draft_page)
    draft_page.media_files.first().soft_delete()
    resp = c.get(f"/api/v1/pages/{draft_page.slug}/export/")
    assert json.loads(open_zip(resp).read("memorial.json"))["media"] == []


def test_admin_can_export(api_client, admin_user, draft_page):
    resp = auth(api_client, admin_user).get(f"/api/v1/pages/{draft_page.slug}/export/")
    assert resp.status_code == 200


def test_other_owner_denied(api_client, other_owner, draft_page):
    resp = auth(api_client, other_owner).get(f"/api/v1/pages/{draft_page.slug}/export/")
    assert resp.status_code == 404
    assert resp.json()["success"] is False


def test_guest_unauthenticated_401(api_client, draft_page):
    resp = api_client.get(f"/api/v1/pages/{draft_page.slug}/export/")
    assert resp.status_code == 401
    assert resp.json()["success"] is False


def test_deleted_page_404(api_client, owner, draft_page):
    draft_page.soft_delete()
    resp = auth(api_client, owner).get(f"/api/v1/pages/{draft_page.slug}/export/")
    assert resp.status_code == 404
