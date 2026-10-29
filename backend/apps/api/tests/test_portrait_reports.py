"""Living Portrait workflow, reports, takedown, owner/admin-only fields, audit entries."""
from __future__ import annotations

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client
from rest_framework.test import APIClient

from apps.audit.models import AuditLog
from apps.media.models import MediaFile, MediaType
from apps.reports.models import Report

from .conftest import auth, make_user, png_upload

MP4 = b"\x00\x00\x00\x18ftypmp42" + b"\x00" * 64
WEBM = b"\x1a\x45\xdf\xa3" + b"\x00" * 64
PRIVATE_FIELDS = ("is_paid", "package_type", "paid_at", "hidden", "hidden_reason", "qr_code")


def video(name="clip.mp4", data=MP4) -> SimpleUploadedFile:
    return SimpleUploadedFile(name, data, content_type="video/mp4")


def lp_url(page, suffix="") -> str:
    return f"/api/v1/pages/{page.slug}/living-portrait/{suffix}"


def upload_lp(client, page, **kw):
    return client.post(lp_url(page), {"file": kw.get("file") or video()}, format="multipart")


class TestLivingPortrait:
    def test_roles(self, owner, other_owner, admin_user, active_page):
        assert APIClient().post(lp_url(active_page)).status_code == 401
        for user in (owner, other_owner):
            client = auth(APIClient(), user)
            assert upload_lp(client, active_page).status_code == 403
            assert client.delete(lp_url(active_page)).status_code == 403
            assert client.post(lp_url(active_page, "status/"), {"status": "failed"}).status_code == 403
        assert upload_lp(auth(APIClient(), admin_user), active_page).status_code == 200

    def test_upload_then_public_url_then_delete(self, owner, admin_user, active_page, tmp_path):
        admin = auth(APIClient(), admin_user)
        # before upload: nothing public
        public = APIClient().get(f"/api/v1/pages/{active_page.slug}/").json()["data"]
        assert public["portrait_animated_url"] is None
        resp = upload_lp(admin, active_page)
        assert resp.status_code == 200
        assert resp.json()["data"]["portrait_animation_status"] == "done"
        media = MediaFile.objects.get(page=active_page, media_type=MediaType.LIVING_PORTRAIT)
        assert media.mime_type == "video/mp4" and media.uploaded_by == admin_user

        public = APIClient().get(f"/api/v1/pages/{active_page.slug}/").json()["data"]
        assert public["portrait_animation_status"] == "done"
        url = public["portrait_animated_url"]
        assert "/media/s/" in url
        served = Client().get(url.replace("http://testserver", ""))
        assert served.status_code == 200 and served["Content-Type"] == "video/mp4"
        # not part of the gallery
        assert all(m["media_type"] != "living_portrait" for m in public["media_files"])
        listing = auth(APIClient(), owner).get(
            f"/api/v1/pages/{active_page.slug}/media/").json()["data"]
        assert listing == []

        # status other than done hides the URL
        admin.post(lp_url(active_page, "status/"), {"status": "processing"}, format="json")
        public = APIClient().get(f"/api/v1/pages/{active_page.slug}/").json()["data"]
        assert public["portrait_animated_url"] is None
        assert public["portrait_animation_status"] == "processing"

        upload_lp(admin, active_page, file=video("c.webm", WEBM))
        assert MediaFile.objects.filter(page=active_page, media_type="living_portrait").count() == 1

        resp = admin.delete(lp_url(active_page))
        assert resp.status_code == 200 and resp.json()["data"]["portrait_animation_status"] == "pending"
        assert not MediaFile.objects.filter(page=active_page, media_type="living_portrait").exists()
        assert MediaFile.all_objects.filter(page=active_page, media_type="living_portrait",
                                            is_deleted=True).count() == 2
        actions = set(AuditLog.objects.values_list("action", flat=True))
        assert {"living_portrait.upload", "living_portrait.delete", "living_portrait.status"} <= actions

    def test_validation(self, admin_user, active_page, settings):
        admin = auth(APIClient(), admin_user)
        assert admin.post(lp_url(active_page), {}, format="multipart").status_code == 400
        assert upload_lp(admin, active_page, file=png_upload()).status_code == 400
        fake = video("x.mp4", b"not a video at all, really")
        assert upload_lp(admin, active_page, file=fake).status_code == 400
        settings.MAX_LIVING_PORTRAIT_BYTES = 10
        big = upload_lp(admin, active_page)
        assert big.status_code == 400 and big.json()["code"] == "VALIDATION_ERROR"

    def test_status_endpoint(self, admin_user, active_page):
        admin = auth(APIClient(), admin_user)
        for value in ("processing", "failed", "pending"):
            resp = admin.post(lp_url(active_page, "status/"), {"status": value}, format="json")
            assert resp.status_code == 200
            assert resp.json()["data"]["portrait_animation_status"] == value
        assert admin.post(lp_url(active_page, "status/"), {"status": "done"}, format="json").status_code == 400
        assert admin.post(lp_url(active_page, "status/"), {}, format="json").status_code == 400


class TestHide:
    def test_roles(self, owner, other_owner, admin_user, active_page):
        path = f"/api/v1/pages/{active_page.slug}/hide/"
        assert APIClient().post(path, {"reason": "x"}, format="json").status_code == 401
        for user in (owner, other_owner):
            assert auth(APIClient(), user).post(path, {"reason": "x"}, format="json").status_code == 403
            assert auth(APIClient(), user).post(
                f"/api/v1/pages/{active_page.slug}/unhide/").status_code == 403
        admin = auth(APIClient(), admin_user)
        assert admin.post(path, {}, format="json").status_code == 400
        resp = admin.post(path, {"reason": "Court order"}, format="json")
        assert resp.status_code == 200 and resp.json()["data"] == {"hidden": True}

    def test_visibility_when_hidden(self, owner, other_owner, admin_user, active_page):
        auth(APIClient(), admin_user).post(
            f"/api/v1/pages/{active_page.slug}/hide/", {"reason": "Court order"}, format="json")
        detail = f"/api/v1/pages/{active_page.slug}/"
        assert APIClient().get(detail).status_code == 404
        assert auth(APIClient(), other_owner).get(detail).status_code == 404
        assert APIClient().get(f"{detail}scan/").status_code == 404
        assert auth(APIClient(), other_owner).get(f"{detail}media/").status_code == 404
        for user in (owner, admin_user):
            data = auth(APIClient(), user).get(detail).json()["data"]
            assert data["hidden"] is True and data["hidden_reason"] == "Court order"
        rows = auth(APIClient(), owner).get("/api/v1/pages/").json()["data"]
        assert rows[0]["hidden"] is True and rows[0]["hidden_reason"] == "Court order"

        resp = auth(APIClient(), admin_user).post(f"{detail}unhide/")
        assert resp.json()["data"] == {"hidden": False}
        assert APIClient().get(detail).status_code == 200
        data = auth(APIClient(), owner).get(detail).json()["data"]
        assert data["hidden"] is False and data["hidden_reason"] == ""
        assert {"page.hide", "page.unhide"} <= set(AuditLog.objects.values_list("action", flat=True))


class TestReports:
    def body(self, **kw):
        return {"category": "privacy", "message": "This page shows private data.", **kw}

    def test_public_create(self, active_page):
        resp = APIClient().post(
            f"/api/v1/pages/{active_page.slug}/reports/",
            self.body(contact_email="me@example.com"), format="json")
        assert resp.status_code == 201
        report = Report.objects.get()
        assert resp.json()["data"] == {"id": str(report.id)}
        assert report.status == "open" and report.contact_email == "me@example.com"

    def test_validation(self, active_page):
        path = f"/api/v1/pages/{active_page.slug}/reports/"
        client = APIClient()
        assert client.post(path, self.body(category="spam"), format="json").status_code == 400
        assert client.post(path, self.body(message="short"), format="json").status_code == 400
        assert client.post(path, self.body(message="x" * 2001), format="json").status_code == 400
        assert client.post(path, self.body(contact_email="nope"), format="json").status_code == 400
        assert client.post(path, self.body(), format="json").status_code == 201  # email optional

    def test_only_active_visible_pages(self, draft_page, active_page):
        assert APIClient().post(
            f"/api/v1/pages/{draft_page.slug}/reports/", self.body(), format="json"
        ).status_code == 404
        assert APIClient().post("/api/v1/pages/nope/reports/", self.body(), format="json").status_code == 404
        active_page.hide("x")
        assert APIClient().post(
            f"/api/v1/pages/{active_page.slug}/reports/", self.body(), format="json"
        ).status_code == 404

    def test_throttle(self, active_page):
        path = f"/api/v1/pages/{active_page.slug}/reports/"
        codes = [APIClient().post(path, self.body(), format="json").status_code for _ in range(6)]
        assert codes == [201] * 5 + [429]
        assert APIClient().post(path, self.body(), format="json").json()["code"] == "RATE_LIMITED"

    def test_list_roles_and_filter(self, owner, other_owner, admin_user, active_page):
        r1 = Report.objects.create(page=active_page, category="other", message="m" * 12)
        r2 = Report.objects.create(page=active_page, category="privacy", message="n" * 12,
                                   status="dismissed", contact_email="a@b.co")
        assert APIClient().get("/api/v1/reports/").status_code == 401
        assert auth(APIClient(), owner).get("/api/v1/reports/").status_code == 403
        admin = auth(APIClient(), admin_user)
        rows = admin.get("/api/v1/reports/").json()["data"]
        assert [r["id"] for r in rows] == [str(r1.id)]
        assert set(rows[0]) == {"id", "category", "message", "contact_email", "status",
                                "created_at", "resolution_note", "page"}
        assert rows[0]["page"] == {"slug": active_page.slug, "first_name": "Jane",
                                   "last_name": "Smith", "state": "active", "hidden": False}
        assert [r["id"] for r in admin.get("/api/v1/reports/?status=dismissed").json()["data"]] == [str(r2.id)]
        assert len(admin.get("/api/v1/reports/?status=all").json()["data"]) == 2
        assert admin.get("/api/v1/reports/?status=bogus").status_code == 400

    def test_resolve(self, owner, admin_user, active_page):
        def make():
            return Report.objects.create(page=active_page, category="other", message="m" * 12)

        report = make()
        path = f"/api/v1/reports/{report.id}/resolve/"
        assert auth(APIClient(), owner).post(path, {"action": "resolve"}, format="json").status_code == 403
        admin = auth(APIClient(), admin_user)
        assert admin.post(path, {"action": "explode"}, format="json").status_code == 400
        resp = admin.post(path, {"action": "dismiss", "note": "fine"}, format="json")
        data = resp.json()["data"]
        assert data["status"] == "dismissed" and data["resolution_note"] == "fine"
        assert admin.post(path, {"action": "resolve"}, format="json").status_code == 400  # closed

        report = make()
        resp = admin.post(f"/api/v1/reports/{report.id}/resolve/", {"action": "resolve"}, format="json")
        assert resp.json()["data"]["status"] == "resolved"

        report = make()
        resp = admin.post(f"/api/v1/reports/{report.id}/resolve/",
                          {"action": "hide_page", "note": "Privacy breach"}, format="json")
        assert resp.json()["data"]["status"] == "resolved"
        assert resp.json()["data"]["page"]["hidden"] is True
        active_page.refresh_from_db()
        assert active_page.hidden_reason == "Privacy breach"
        assert admin.post("/api/v1/reports/00000000-0000-0000-0000-000000000000/resolve/",
                          {"action": "resolve"}, format="json").status_code == 404
        actions = list(AuditLog.objects.values_list("action", flat=True))
        assert actions.count("report.resolve") == 3 and "page.hide" in actions


class TestOwnerAdminFields:
    def test_list_fields(self, owner, active_page):
        row = auth(APIClient(), owner).get("/api/v1/pages/").json()["data"][0]
        assert row["is_paid"] is False and row["package_type"] == ""
        assert row["paid_at"] is None and row["portrait_animation_status"] == "none"
        assert row["hidden"] is False and row["hidden_reason"] == ""

    def test_detail_by_requester(self, owner, other_owner, admin_user, active_page):
        detail = f"/api/v1/pages/{active_page.slug}/"
        for user in (owner, admin_user):
            data = auth(APIClient(), user).get(detail).json()["data"]
            assert all(f in data for f in PRIVATE_FIELDS)
        for client in (APIClient(), auth(APIClient(), other_owner)):
            data = client.get(detail).json()["data"]
            assert not any(f in data for f in PRIVATE_FIELDS)
            assert "portrait_animated_url" in data and "portrait_animation_status" in data
            assert "moderation_note" not in data

    def test_qr_not_leaked_to_guests(self, owner, active_page):
        auth(APIClient(), owner).post(f"/api/v1/pages/{active_page.slug}/qr/generate/")
        assert "qr_code" not in APIClient().get(f"/api/v1/pages/{active_page.slug}/").json()["data"]


class TestAuditEntries:
    def test_approve_reject_export_delete(self, owner, admin_user, draft_page):
        draft_page.is_paid = True
        draft_page.save()
        admin = auth(APIClient(), admin_user)
        auth(APIClient(), owner).post(f"/api/v1/pages/{draft_page.slug}/submit/")
        admin.post(f"/api/v1/pages/{draft_page.slug}/reject/", {"note": "secret note"}, format="json")
        auth(APIClient(), owner).post(f"/api/v1/pages/{draft_page.slug}/submit/")
        admin.post(f"/api/v1/pages/{draft_page.slug}/approve/")
        assert auth(APIClient(), owner).get(f"/api/v1/pages/{draft_page.slug}/export/").status_code == 200

        victim = make_user("victim@test.com", "owner")
        resp = auth(APIClient(), victim).post("/api/v1/auth/me/delete/", {"password": "secret123"},
                                              format="json")
        assert resp.status_code == 200
        entries = {a.action: a for a in AuditLog.objects.all()}
        assert {"page.reject", "page.approve", "page.export", "account.delete"} <= set(entries)
        assert entries["page.approve"].actor == admin_user
        assert entries["page.approve"].target_id == str(draft_page.pk)
        assert "secret note" not in str(entries["page.reject"].metadata)
        assert entries["account.delete"].target_type == "user"

    def test_log_action_strips_secrets(self, owner):
        from apps.audit.utils import log_action

        entry = log_action(owner, "x.test", owner, token="abc", signed_url="http://x", ok=1,
                           password="p", when=object)
        assert set(entry.metadata) == {"ok", "when"}

    def test_admin_is_read_only(self, admin_user):
        from django.contrib import admin as dj_admin

        from apps.audit.models import AuditLog as Model

        model_admin = dj_admin.site._registry[Model]
        request = type("R", (), {"user": admin_user})()
        assert not model_admin.has_add_permission(request)
        assert not model_admin.has_change_permission(request)
        assert not model_admin.has_delete_permission(request)


@pytest.mark.parametrize("path", ["/api/v1/payments/plans/"])
def test_noindex_on_new_endpoints(db, path):
    assert "noindex" in APIClient().get(path)["X-Robots-Tag"]
