"""Published snapshot: guests keep the last approved version while an edit is in review."""
from __future__ import annotations

import importlib
import json
from urllib.parse import urlparse

import pytest
from django.apps import apps as django_apps
from django.test import Client
from rest_framework.test import APIClient

from apps.media.models import MediaFile
from apps.media.signing import make_token
from apps.pages.models import MemorialPage, MilitaryAward, PageState, TimelineEntry
from apps.qr.models import QRCode
from apps.users.models import UserRole

from .conftest import auth, make_user, png_upload

OLD_BIO = "He loved the sea and his family."
NEW_BIO = "He loved the mountains and his dogs."
PRIVATE_FIELDS = (
    "is_paid", "package_type", "paid_at", "hidden", "hidden_reason", "qr_code",
    "has_published_version",
)


def page_url(page: MemorialPage, suffix: str = "") -> str:
    return f"/api/v1/pages/{page.slug}/{suffix}"


def upload(client: APIClient, page: MemorialPage, **extra) -> dict:
    resp = client.post(
        page_url(page, "media/"), {"file": png_upload(), **extra}, format="multipart"
    )
    assert resp.status_code == 201, resp.content
    return resp.json()["data"]


def path_of(url: str) -> str:
    return urlparse(url).path


def guest_token_path(media_id: str) -> str:
    return f"/media/s/{make_token('media', media_id, 'guest')}/x.png"


def guest_get(page: MemorialPage) -> dict:
    resp = APIClient().get(page_url(page))
    assert resp.status_code == 200, resp.content
    return resp.json()["data"]


@pytest.fixture
def guest(db):
    return make_user("guest@test.com", UserRole.GUEST)


@pytest.fixture
def live(db, owner, admin_user) -> dict:
    """An approved page with biography, timeline, award, a portrait and a gallery photo."""
    page = MemorialPage.objects.create(
        slug="lv12-ab34-cd56", owner=owner, first_name="Jane", last_name="Smith",
        biography=OLD_BIO, page_type="military", birth_date="1940-02-03",
    )
    TimelineEntry.objects.create(page=page, year=1960, title="Enlisted", order=0)
    MilitaryAward.objects.create(page=page, name="Purple Heart", awarded_date="1962-01-01")
    client = auth(APIClient(), owner)
    portrait = upload(client, page, is_primary_portrait=True)
    photo = upload(client, page)
    page.submit_for_moderation()
    resp = auth(APIClient(), admin_user).post(page_url(page, "approve/"))
    assert resp.status_code == 200
    page.refresh_from_db()
    return {"page": page, "portrait": portrait["id"], "photo": photo["id"], "client": client}


@pytest.fixture
def edited(live) -> dict:
    """The owner edits the live page: new bio + timeline, deletes the photo, adds a new one."""
    page, client = live["page"], live["client"]
    resp = client.patch(page_url(page), {
        "biography": NEW_BIO,
        "timeline_entries": [{"year": 1999, "title": "Retired"}],
        "military_awards": [],
    }, format="json")
    assert resp.status_code == 200
    assert client.delete(page_url(page, f"media/{live['photo']}/")).status_code == 204
    new_photo = upload(client, page)
    page.refresh_from_db()
    assert page.state == PageState.MODERATION
    return {**live, "new_photo": new_photo}


@pytest.mark.django_db
class TestSnapshotOnApprove:
    def test_approve_stores_snapshot(self, live):
        page = live["page"]
        snap = page.published_snapshot
        assert snap["version"] == 1 and snap["captured_at"]
        assert snap["page"]["biography"] == OLD_BIO
        assert snap["page"]["birth_date"] == "1940-02-03"
        assert snap["page"]["page_type"] == "military"
        assert [(t["year"], t["title"]) for t in snap["timeline_entries"]] == [(1960, "Enlisted")]
        assert [(a["name"], a["awarded_date"]) for a in snap["military_awards"]] == [
            ("Purple Heart", "1962-01-01"),
        ]
        assert set(snap["media_ids"]) == {live["portrait"], live["photo"]}
        dumped = json.dumps(snap)
        assert "/media/s/" not in dumped and "http" not in dumped  # never signed URLs

    def test_never_approved_page_has_no_snapshot(self, draft_page):
        assert draft_page.published_snapshot is None
        assert not draft_page.has_published_version and not draft_page.has_guest_version

    def test_reapprove_refreshes_snapshot(self, edited, admin_user):
        page = edited["page"]
        assert auth(APIClient(), admin_user).post(page_url(page, "approve/")).status_code == 200
        data = guest_get(page)
        assert data["biography"] == NEW_BIO
        assert {m["id"] for m in data["media_files"]} == {
            edited["portrait"], edited["new_photo"]["id"],
        }
        # The photo deleted before this approval is gone for guests now.
        assert Client().get(guest_token_path(edited["photo"])).status_code == 404


@pytest.mark.django_db
class TestGuestSeesApprovedVersion:
    def test_guest_gets_snapshot_content(self, edited):
        page = edited["page"]
        data = guest_get(page)
        assert data["state"] == "active"
        assert data["biography"] == OLD_BIO
        assert data["full_name"] == "Jane Smith"
        assert [(t["year"], t["title"], t["order"]) for t in data["timeline_entries"]] == [
            (1960, "Enlisted", 0),
        ]
        assert [a["name"] for a in data["military_awards"]] == ["Purple Heart"]
        assert set(data["military_awards"][0]) == {
            "id", "name", "description", "awarded_date", "model_3d_url", "order",
        }
        ids = {m["id"] for m in data["media_files"]}
        assert ids == {edited["portrait"], edited["photo"]}  # deleted-after-approval photo stays
        assert edited["new_photo"]["id"] not in json.dumps(data)
        for field in PRIVATE_FIELDS:
            assert field not in data
        assert all("original_filename" not in m for m in data["media_files"])

    def test_guest_response_shape_matches_live_page(self, edited, active_page):
        assert set(guest_get(edited["page"])) == set(guest_get(active_page))

    def test_guest_media_urls(self, edited):
        data = guest_get(edited["page"])
        for media in data["media_files"]:
            resp = Client().get(path_of(media["file_url"]))
            assert resp.status_code == 200, media  # includes the soft-deleted photo
        # A photo uploaded after approval is refused for guest tokens.
        assert Client().get(guest_token_path(edited["new_photo"]["id"])).status_code == 404

    def test_guest_media_list_endpoint(self, edited, guest):
        resp = auth(APIClient(), guest).get(page_url(edited["page"], "media/"))
        assert resp.status_code == 200
        assert {m["id"] for m in resp.json()["data"]} == {edited["portrait"], edited["photo"]}

    def test_owner_sees_live_content(self, edited):
        resp = edited["client"].get(page_url(edited["page"]))
        data = resp.json()["data"]
        assert data["state"] == "moderation"
        assert data["has_published_version"] is True
        assert data["biography"] == NEW_BIO
        assert [t["title"] for t in data["timeline_entries"]] == ["Retired"]
        assert data["military_awards"] == []
        assert {m["id"] for m in data["media_files"]} == {
            edited["portrait"], edited["new_photo"]["id"],
        }
        # The owner's (privileged) URL for the new photo works.
        assert Client().get(path_of(edited["new_photo"]["file_url"])).status_code == 200
        listed = edited["client"].get("/api/v1/pages/").json()["data"]
        assert listed[0]["has_published_version"] is True

    def test_admin_sees_live_content(self, edited, admin_user):
        data = auth(APIClient(), admin_user).get(page_url(edited["page"])).json()["data"]
        assert data["state"] == "moderation" and data["biography"] == NEW_BIO
        assert data["has_published_version"] is True
        rows = auth(APIClient(), admin_user).get("/api/v1/pages/moderation/").json()["data"]
        assert rows[0]["has_published_version"] is True

    def test_active_page_guest_gets_live(self, live):
        data = guest_get(live["page"])
        assert data["state"] == "active" and data["biography"] == OLD_BIO

    def test_scan_and_qr_resolve_work_in_review(self, edited):
        page = edited["page"]
        assert edited["client"].post(page_url(page, "qr/generate/")).status_code == 201
        token = QRCode.objects.get(page=page).token
        resp = APIClient().get(f"/api/v1/qr/{token}/")
        assert resp.status_code == 200 and resp.json()["data"] == {"slug": page.slug}
        resp = APIClient().get(page_url(page, "scan/"))
        assert resp.status_code == 200 and resp.json()["data"]["slug"] == page.slug

    def test_report_allowed_in_review(self, edited):
        resp = APIClient().post(page_url(edited["page"], "reports/"), {
            "category": "other", "message": "Something is wrong here.",
        }, format="json")
        assert resp.status_code == 201, resp.content

    def test_admin_edit_on_active_refreshes_snapshot(self, live, admin_user):
        page = live["page"]
        fixed = "Admin fixed a typo in this story."
        resp = auth(APIClient(), admin_user).patch(page_url(page), {"biography": fixed})
        assert resp.status_code == 200
        live["client"].patch(page_url(page), {"biography": NEW_BIO})
        page.refresh_from_db()
        assert page.state == PageState.MODERATION
        assert guest_get(page)["biography"] == fixed


@pytest.mark.django_db
class TestRejectHideDelete:
    def test_reject_keeps_snapshot_visible(self, edited, admin_user):
        page = edited["page"]
        resp = auth(APIClient(), admin_user).post(page_url(page, "reject/"), {"note": "No"})
        assert resp.status_code == 200 and resp.json()["data"]["state"] == "draft"
        data = guest_get(page)
        assert data["state"] == "active" and data["biography"] == OLD_BIO
        owner_view = edited["client"].get(page_url(page)).json()["data"]
        assert owner_view["state"] == "draft" and owner_view["biography"] == NEW_BIO

    def test_resubmit_after_reject_needs_no_payment(self, edited, admin_user):
        page = edited["page"]
        assert not page.is_paid  # approved before payments existed
        auth(APIClient(), admin_user).post(page_url(page, "reject/"))
        resp = edited["client"].post(page_url(page, "submit/"))
        assert resp.status_code == 200 and resp.json()["data"]["state"] == "moderation"

    def test_hidden_page_with_snapshot_invisible(self, edited):
        page = edited["page"]
        edited["client"].post(page_url(page, "qr/generate/"))
        token = QRCode.objects.get(page=page).token
        page.hide("takedown")
        assert APIClient().get(page_url(page)).status_code == 404
        assert APIClient().get(page_url(page, "scan/")).status_code == 404
        assert APIClient().get(f"/api/v1/qr/{token}/").status_code == 404
        assert Client().get(guest_token_path(edited["portrait"])).status_code == 404
        resp = APIClient().post(page_url(page, "reports/"), {
            "category": "other", "message": "Something is wrong here.",
        }, format="json")
        assert resp.status_code == 404

    def test_deleted_page_with_snapshot_invisible(self, edited):
        page = edited["page"]
        page.soft_delete()
        assert APIClient().get(page_url(page)).status_code == 404
        assert APIClient().get(page_url(page, "scan/")).status_code == 404
        assert Client().get(guest_token_path(edited["portrait"])).status_code == 404


@pytest.mark.django_db
class TestNeverApproved:
    def test_moderation_without_snapshot_invisible(self, owner, draft_page, guest):
        client = auth(APIClient(), owner)
        media = upload(client, draft_page)
        client.post(page_url(draft_page, "qr/generate/"))
        draft_page.submit_for_moderation()
        token = QRCode.objects.get(page=draft_page).token
        assert APIClient().get(page_url(draft_page)).status_code == 404
        assert auth(APIClient(), guest).get(page_url(draft_page)).status_code == 404
        assert auth(APIClient(), guest).get(page_url(draft_page, "media/")).status_code == 404
        assert APIClient().get(page_url(draft_page, "scan/")).status_code == 404
        assert APIClient().get(f"/api/v1/qr/{token}/").status_code == 404
        assert Client().get(guest_token_path(media["id"])).status_code == 404


@pytest.mark.django_db
class TestDataMigration:
    def test_populates_active_pages_only(self, owner, admin_user, draft_page):
        active = MemorialPage.objects.create(
            slug="mg12-ab34-cd56", owner=owner, first_name="A", last_name="B",
            biography=OLD_BIO,
        )
        TimelineEntry.objects.create(page=active, year=1950, title="Born")
        TimelineEntry.objects.create(page=active, year=1951, title="Gone", is_deleted=True)
        photo = MediaFile.objects.create(page=active, file=png_upload(), original_filename="p")
        MediaFile.objects.create(
            page=active, file=png_upload(), original_filename="d", is_deleted=True
        )
        MemorialPage.objects.filter(pk=active.pk).update(state=PageState.ACTIVE)
        draft_page.submit_for_moderation()

        migration = importlib.import_module(
            "apps.pages.migrations.0007_populate_published_snapshot"
        )
        migration.populate(django_apps, None)

        active.refresh_from_db()
        draft_page.refresh_from_db()
        snap = active.published_snapshot
        assert snap["page"]["biography"] == OLD_BIO
        assert [t["title"] for t in snap["timeline_entries"]] == ["Born"]
        assert snap["media_ids"] == [str(photo.id)]
        assert draft_page.published_snapshot is None
