"""Two-key access: web link (slug) + QR token, QR management, public resolve."""
from __future__ import annotations

import pytest
from django.test import Client
from rest_framework.test import APIClient

from apps.audit.models import AuditLog
from apps.qr.models import QRCode, generate_qr_token

from .conftest import auth, make_user


def url(page, suffix: str) -> str:
    return f"/api/v1/pages/{page.slug}/{suffix}"


@pytest.fixture
def stranger(db):
    return make_user("stranger@test.com", "guest")


class TestAccessPermissions:
    @pytest.mark.parametrize(
        ("method", "suffix"),
        [
            ("get", "access/"), ("post", "rotate-link/"), ("post", "qr/generate/"),
            ("post", "qr/disable/"), ("post", "qr/enable/"), ("post", "qr/rotate/"),
            ("get", "qr/download/"),
        ],
    )
    def test_roles(self, owner, other_owner, admin_user, stranger, active_page, method, suffix):
        target = url(active_page, suffix)
        assert getattr(APIClient(), method)(target).status_code == 401
        for user in (stranger, other_owner):
            resp = getattr(auth(APIClient(), user), method)(target)
            assert resp.status_code == 404 and resp.json()["code"] == "NOT_FOUND"
        # QR exists so the QR actions have a target
        auth(APIClient(), admin_user).post(url(active_page, "qr/generate/"))
        ok = getattr(auth(APIClient(), owner), method)(target)
        assert ok.status_code in (200, 201), ok.content
        if suffix == "rotate-link/":
            active_page.refresh_from_db()
            target = url(active_page, suffix)
        assert getattr(auth(APIClient(), admin_user), method)(target).status_code in (200, 201)


class TestAccessEndpoint:
    def test_no_qr_yet(self, owner, active_page, settings):
        data = auth(APIClient(), owner).get(url(active_page, "access/")).json()["data"]
        assert data["memorial_url"] == f"{settings.FRONTEND_URL}/{active_page.slug}"
        assert data["qr"] == {
            "exists": False, "is_active": False, "qr_target_url": None, "image_url": None,
            "scan_count": 0, "last_scanned_at": None, "legacy_link_qr": False,
        }

    def test_generate_encodes_token_url(self, owner, active_page, settings):
        resp = auth(APIClient(), owner).post(url(active_page, "qr/generate/"))
        assert resp.status_code == 201
        qr_data = resp.json()["data"]["qr"]
        qr = QRCode.objects.get(page=active_page)
        assert qr_data["exists"] and qr_data["is_active"] and not qr_data["legacy_link_qr"]
        assert qr_data["qr_target_url"] == f"{settings.FRONTEND_URL}/q/{qr.token}"
        assert len(qr.token) >= 20 and active_page.slug not in qr.token
        assert "/media/s/" in qr_data["image_url"]
        served = Client().get(qr_data["image_url"].replace("http://testserver", ""))
        assert served.status_code == 200
        assert auth(APIClient(), owner).post(url(active_page, "qr/generate/")).status_code == 200
        assert AuditLog.objects.filter(action="qr.generate", actor=owner).exists()

    def test_tokens_unique(self):
        assert len({generate_qr_token() for _ in range(200)}) == 200


class TestRotateLink:
    def test_old_slug_404_new_works_qr_still_resolves(self, owner, active_page):
        client = auth(APIClient(), owner)
        client.post(url(active_page, "qr/generate/"))
        token = QRCode.objects.get(page=active_page).token
        old = active_page.slug
        resp = client.post(url(active_page, "rotate-link/"))
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["slug"] != old and data["memorial_url"].endswith(data["slug"])
        assert APIClient().get(f"/api/v1/pages/{old}/").status_code == 404
        assert APIClient().get(f"/api/v1/pages/{data['slug']}/").status_code == 200
        resolved = APIClient().get(f"/api/v1/qr/{token}/")
        assert resolved.status_code == 200 and resolved.json()["data"] == {"slug": data["slug"]}
        entry = AuditLog.objects.get(action="page.rotate_link")
        assert old not in str(entry.metadata) and data["slug"] not in str(entry.metadata)

    def test_rate_limited_by_auth_scope(self, owner, active_page):
        client = auth(APIClient(), owner)
        codes = []
        for _ in range(11):
            codes.append(client.post(url(active_page, "rotate-link/")).status_code)
            active_page.refresh_from_db()
        assert codes[:10] == [200] * 10 and codes[10] == 429


class TestQrManagement:
    def test_disable_enable_rotate(self, owner, active_page):
        client = auth(APIClient(), owner)
        assert client.post(url(active_page, "qr/disable/")).status_code == 404  # none yet
        client.post(url(active_page, "qr/generate/"))
        old = QRCode.objects.get(page=active_page).token

        resp = client.post(url(active_page, "qr/disable/"))
        assert resp.json()["data"]["qr"]["is_active"] is False
        assert APIClient().get(f"/api/v1/qr/{old}/").status_code == 404
        assert client.post(url(active_page, "qr/enable/")).json()["data"]["qr"]["is_active"]
        assert APIClient().get(f"/api/v1/qr/{old}/").status_code == 200

        client.post(url(active_page, "qr/rotate/"))
        new = QRCode.objects.get(page=active_page).token
        assert new != old
        assert APIClient().get(f"/api/v1/qr/{old}/").status_code == 404
        assert APIClient().get(f"/api/v1/qr/{new}/").status_code == 200
        actions = set(AuditLog.objects.values_list("action", flat=True))
        assert {"qr.generate", "qr.disable", "qr.enable", "qr.rotate"} <= actions
        assert old not in str(list(AuditLog.objects.values_list("metadata", flat=True)))

    def test_download_png_svg(self, owner, active_page):
        client = auth(APIClient(), owner)
        client.post(url(active_page, "qr/generate/"))
        png = client.get(url(active_page, "qr/download/?format=png"))
        assert png.status_code == 200 and png["Content-Type"] == "image/png"
        assert png.content.startswith(b"\x89PNG")
        assert f"remember-us-qr-{active_page.slug}.png" in png["Content-Disposition"]
        svg = client.get(url(active_page, "qr/download/?format=svg"))
        assert svg["Content-Type"] == "image/svg+xml" and b"<svg" in svg.content
        assert svg["Content-Disposition"].startswith("attachment")
        assert client.get(url(active_page, "qr/download/?format=gif")).status_code == 400
        assert client.get(url(active_page, "qr/download/")).status_code == 200


class TestResolve:
    def test_resolve_logs_scan(self, owner, active_page):
        auth(APIClient(), owner).post(url(active_page, "qr/generate/"))
        qr = QRCode.objects.get(page=active_page)
        resp = APIClient().get(f"/api/v1/qr/{qr.token}/")
        assert resp.status_code == 200 and resp.json() == {
            "success": True, "data": {"slug": active_page.slug},
        }
        qr.refresh_from_db()
        assert qr.scan_count == 1 and qr.last_scanned_at and qr.scan_logs.count() == 1
        access = auth(APIClient(), owner).get(url(active_page, "access/")).json()["data"]["qr"]
        assert access["scan_count"] == 1

    def test_unknown_token_404(self, db):
        resp = APIClient().get("/api/v1/qr/nope/")
        assert resp.status_code == 404 and resp.json()["code"] == "NOT_FOUND"

    def test_non_active_pages_404(self, owner, draft_page):
        auth(APIClient(), owner).post(url(draft_page, "qr/generate/"))
        token = QRCode.objects.get(page=draft_page).token
        assert APIClient().get(f"/api/v1/qr/{token}/").status_code == 404

    def test_hidden_and_deleted_404(self, owner, active_page):
        auth(APIClient(), owner).post(url(active_page, "qr/generate/"))
        token = QRCode.objects.get(page=active_page).token
        active_page.hide("takedown")
        assert APIClient().get(f"/api/v1/qr/{token}/").status_code == 404
        active_page.unhide()
        assert APIClient().get(f"/api/v1/qr/{token}/").status_code == 200
        active_page.soft_delete()
        assert APIClient().get(f"/api/v1/qr/{token}/").status_code == 404

    def test_scan_throttle(self, owner, active_page):
        auth(APIClient(), owner).post(url(active_page, "qr/generate/"))
        token = QRCode.objects.get(page=active_page).token
        codes = [APIClient().get(f"/api/v1/qr/{token}/").status_code for _ in range(31)]
        assert codes[:30] == [200] * 30 and codes[30] == 429
