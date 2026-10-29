"""Tests for audit fixes: slugs, error envelope, throttling, media, state machine."""
from __future__ import annotations

import io

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from PIL import Image
from rest_framework.test import APIClient

from apps.media.models import MediaFile
from apps.pages.models import MemorialPage, PageState
from apps.users.models import User, UserRole


def make_user(email: str, role: str, **extra) -> User:
    return User.objects.create_user(email=email, password="secret123", role=role, **extra)


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def owner(db):
    return make_user("owner@test.com", UserRole.OWNER)


@pytest.fixture
def other_owner(db):
    return make_user("other@test.com", UserRole.OWNER)


@pytest.fixture
def admin_user(db):
    return make_user("admin@test.com", UserRole.ADMIN, is_staff=True)


@pytest.fixture
def guest(db):
    return make_user("guest@test.com", UserRole.GUEST)


@pytest.fixture
def draft_page(db, owner):
    return MemorialPage.objects.create(
        slug="zz00-yy11-xx22", owner=owner, first_name="D", last_name="P"
    )


@pytest.fixture
def active_page(db, owner, admin_user):
    page = MemorialPage.objects.create(
        slug="ab12-cd34-ef56", owner=owner, first_name="Jane", last_name="Smith"
    )
    page.submit_for_moderation()
    page.approve(admin_user)
    return page


@pytest.fixture(autouse=True)
def media_root(tmp_path, settings):
    settings.MEDIA_ROOT = tmp_path


def image_file(name: str = "p.png", fmt: str = "PNG", content_type: str = "image/png"):
    buf = io.BytesIO()
    Image.new("RGB", (8, 8), "red").save(buf, format=fmt)
    return SimpleUploadedFile(name, buf.getvalue(), content_type=content_type)


def mp4_file(name: str = "v.mp4"):
    return SimpleUploadedFile(name, b"\x00\x00\x00\x18ftypmp42" + b"\x00" * 32, "video/mp4")


# --- Slug generation ---


class TestSlugAutogeneration:
    def test_blank_slug_generated_on_save(self, owner):
        page = MemorialPage.objects.create(owner=owner, first_name="A", last_name="B")
        assert page.slug
        assert len(page.slug.replace("-", "")) >= 10

    def test_multiple_blank_slug_pages_are_unique(self, owner):
        slugs = {
            MemorialPage.objects.create(owner=owner, first_name="A", last_name=str(i)).slug
            for i in range(5)
        }
        assert len(slugs) == 5
        assert "" not in slugs

    def test_explicit_slug_preserved(self, draft_page):
        assert draft_page.slug == "zz00-yy11-xx22"


# --- Error envelope ---


class TestErrorEnvelope:
    def test_invalid_transition_returns_400_invalid_state(
        self, api_client, admin_user, active_page
    ):
        api_client.force_authenticate(user=admin_user)
        response = api_client.post(f"/api/v1/pages/{active_page.slug}/approve/")
        assert response.status_code == 400
        assert response.data["success"] is False
        assert response.data["code"] == "INVALID_STATE"
        assert response.data["error"]

    def test_submit_non_draft_is_400(self, api_client, owner, active_page):
        api_client.force_authenticate(user=owner)
        response = api_client.post(f"/api/v1/pages/{active_page.slug}/submit/")
        assert response.status_code == 400
        assert response.data["code"] == "INVALID_STATE"

    def test_unauthenticated_envelope(self, api_client):
        response = api_client.post("/api/v1/pages/", {"first_name": "X"})
        assert response.status_code == 401
        assert response.data["success"] is False
        assert response.data["code"] == "NOT_AUTHENTICATED"

    def test_forbidden_envelope(self, api_client, owner, draft_page):
        api_client.force_authenticate(user=owner)
        response = api_client.post(f"/api/v1/pages/{draft_page.slug}/approve/")
        assert response.status_code == 403
        assert response.data["success"] is False
        assert response.data["code"] == "FORBIDDEN"

    def test_validation_envelope(self, api_client, owner):
        api_client.force_authenticate(user=owner)
        response = api_client.post("/api/v1/pages/", {"page_type": "civilian"})
        assert response.status_code == 400
        assert response.data["code"] == "VALIDATION_ERROR"
        assert response.data["success"] is False


# --- Throttling ---


class TestThrottling:
    def test_scan_throttled_with_envelope(self, api_client, active_page):
        url = f"/api/v1/pages/{active_page.slug}/scan/"
        for _ in range(30):
            assert api_client.get(url).status_code == 200
        response = api_client.get(url)
        assert response.status_code == 429
        assert response.data == {
            "success": False,
            "error": response.data["error"],
            "code": "RATE_LIMITED",
        }

    def test_token_endpoint_throttled(self, api_client, owner):
        for _ in range(10):
            api_client.post(
                "/api/v1/auth/token/", {"email": "owner@test.com", "password": "bad"}
            )
        response = api_client.post(
            "/api/v1/auth/token/", {"email": "owner@test.com", "password": "bad"}
        )
        assert response.status_code == 429
        assert response.data["code"] == "RATE_LIMITED"

    def test_xff_ignored_by_default(self, api_client, active_page):
        """Spoofed X-Forwarded-For must not bypass the throttle."""
        url = f"/api/v1/pages/{active_page.slug}/scan/"
        for i in range(30):
            api_client.get(url, HTTP_X_FORWARDED_FOR=f"10.0.0.{i}")
        response = api_client.get(url, HTTP_X_FORWARDED_FOR="10.9.9.9")
        assert response.status_code == 429


# --- Media upload ---


class TestMediaUpload:
    def url(self, page) -> str:
        return f"/api/v1/pages/{page.slug}/media/"

    def test_valid_image_media_type_server_side(self, api_client, owner, draft_page):
        api_client.force_authenticate(user=owner)
        response = api_client.post(
            self.url(draft_page),
            {"file": image_file(), "media_type": "video"},
            format="multipart",
        )
        assert response.status_code == 201
        assert response.data["data"]["media_type"] == "photo"

    def test_valid_video(self, api_client, owner, draft_page):
        api_client.force_authenticate(user=owner)
        response = api_client.post(self.url(draft_page), {"file": mp4_file()}, format="multipart")
        assert response.status_code == 201
        assert response.data["data"]["media_type"] == "video"

    def test_rejects_disallowed_type(self, api_client, owner, draft_page):
        api_client.force_authenticate(user=owner)
        bad = SimpleUploadedFile("evil.html", b"<script>1</script>", "image/png")
        response = api_client.post(self.url(draft_page), {"file": bad}, format="multipart")
        assert response.status_code == 400
        assert response.data["code"] == "VALIDATION_ERROR"

    def test_rejects_fake_image_with_image_extension(self, api_client, owner, draft_page):
        api_client.force_authenticate(user=owner)
        bad = SimpleUploadedFile("evil.png", b"not really a png", "image/png")
        response = api_client.post(self.url(draft_page), {"file": bad}, format="multipart")
        assert response.status_code == 400
        assert response.data["code"] == "VALIDATION_ERROR"

    def test_rejects_oversize_image(self, api_client, owner, draft_page, settings):
        settings.MAX_IMAGE_UPLOAD_BYTES = 10
        api_client.force_authenticate(user=owner)
        response = api_client.post(self.url(draft_page), {"file": image_file()}, format="multipart")
        assert response.status_code == 400
        assert response.data["code"] == "VALIDATION_ERROR"
        assert "too large" in response.data["error"]

    def test_primary_portrait_only_for_images(self, api_client, owner, draft_page):
        api_client.force_authenticate(user=owner)
        response = api_client.post(
            self.url(draft_page),
            {"file": mp4_file(), "is_primary_portrait": "true"},
            format="multipart",
        )
        assert response.status_code == 400
        assert response.data["code"] == "VALIDATION_ERROR"

    def test_new_primary_portrait_unsets_previous(self, api_client, owner, draft_page):
        api_client.force_authenticate(user=owner)
        for name in ("a.png", "b.png"):
            response = api_client.post(
                self.url(draft_page),
                {"file": image_file(name), "is_primary_portrait": "true"},
                format="multipart",
            )
            assert response.status_code == 201
        primaries = MediaFile.objects.filter(page=draft_page, is_primary_portrait=True)
        assert primaries.count() == 1
        assert primaries.get().original_filename == "b.png"

    def test_guest_and_stranger_cannot_upload(self, api_client, guest, other_owner, draft_page):
        for user in (guest, other_owner):
            api_client.force_authenticate(user=user)
            response = api_client.post(
                self.url(draft_page), {"file": image_file()}, format="multipart"
            )
            assert response.status_code == 403

    def test_owner_upload_on_active_sends_to_moderation(self, api_client, owner, active_page):
        api_client.force_authenticate(user=owner)
        response = api_client.post(self.url(active_page), {"file": image_file()}, format="multipart")
        assert response.status_code == 201
        active_page.refresh_from_db()
        assert active_page.state == PageState.MODERATION

    def test_owner_delete_on_active_sends_to_moderation(self, api_client, owner, active_page):
        media = MediaFile.objects.create(
            page=active_page, uploaded_by=owner, file=image_file(), original_filename="p.png"
        )
        api_client.force_authenticate(user=owner)
        response = api_client.delete(f"{self.url(active_page)}{media.id}/")
        assert response.status_code == 204
        active_page.refresh_from_db()
        assert active_page.state == PageState.MODERATION

    def test_admin_media_change_keeps_active(self, api_client, admin_user, active_page):
        api_client.force_authenticate(user=admin_user)
        response = api_client.post(self.url(active_page), {"file": image_file()}, format="multipart")
        assert response.status_code == 201
        active_page.refresh_from_db()
        assert active_page.state == PageState.ACTIVE


# --- Admin edits do not unpublish ---


class TestAdminEdit:
    def test_admin_patch_keeps_active(self, api_client, admin_user, active_page):
        api_client.force_authenticate(user=admin_user)
        response = api_client.patch(
            f"/api/v1/pages/{active_page.slug}/", {"biography": "Admin fix"}
        )
        assert response.status_code == 200
        assert response.data["data"]["state"] == "active"
        active_page.refresh_from_db()
        assert active_page.state == PageState.ACTIVE
        assert active_page.biography == "Admin fix"


# --- Draft retrieval matrix ---


class TestDraftRetrievalMatrix:
    @pytest.mark.parametrize(
        ("who", "expected"),
        [("owner", 200), ("admin", 200), ("guest", 404), ("stranger", 404), ("anon", 404)],
    )
    def test_matrix(
        self, api_client, owner, admin_user, guest, other_owner, draft_page, who, expected
    ):
        users = {"owner": owner, "admin": admin_user, "guest": guest, "stranger": other_owner}
        if who in users:
            api_client.force_authenticate(user=users[who])
        response = api_client.get(f"/api/v1/pages/{draft_page.slug}/")
        assert response.status_code == expected


# --- Client IP + N+1 ---


class TestClientIp:
    def test_remote_addr_used_unless_trusted(self, rf, settings):
        from apps.api.views import _get_client_ip

        request = rf.get("/", REMOTE_ADDR="1.2.3.4", HTTP_X_FORWARDED_FOR="6.6.6.6, 5.5.5.5")
        settings.TRUST_X_FORWARDED_FOR = False
        assert _get_client_ip(request) == "1.2.3.4"
        settings.TRUST_X_FORWARDED_FOR = True
        assert _get_client_ip(request) == "5.5.5.5"


class TestListQueries:
    def test_list_query_count_constant(
        self, api_client, admin_user, owner, django_assert_max_num_queries
    ):
        for i in range(6):
            page = MemorialPage.objects.create(owner=owner, first_name="A", last_name=str(i))
            MediaFile.objects.create(
                page=page,
                file=image_file(f"{i}.png"),
                media_type="portrait",
                is_primary_portrait=True,
            )
        api_client.force_authenticate(user=admin_user)
        with django_assert_max_num_queries(6):
            response = api_client.get("/api/v1/pages/")
        assert response.status_code == 200
        assert all(row["primary_portrait"] for row in response.data["data"])


@override_settings()
def test_create_then_submit_flow(api_client, owner):
    """New pages start as draft and the owner can submit them."""
    api_client.force_authenticate(user=owner)
    created = api_client.post("/api/v1/pages/", {"first_name": "N", "last_name": "P"})
    assert created.data["data"]["state"] == "draft"
    slug = created.data["data"]["slug"]
    submitted = api_client.post(f"/api/v1/pages/{slug}/submit/")
    assert submitted.data["data"]["state"] == "moderation"


class TestModerationNoteVisibility:
    def test_list_includes_note_but_public_detail_does_not(
        self, api_client, owner, admin_user, draft_page, active_page
    ):
        draft_page.submit_for_moderation()
        draft_page.reject(admin_user, note="Need better photo")
        active_page.moderation_note = "internal"
        active_page.save()

        api_client.force_authenticate(user=owner)
        rows = api_client.get("/api/v1/pages/").data["data"]
        notes = {r["slug"]: r["moderation_note"] for r in rows}
        assert notes[draft_page.slug] == "Need better photo"

        public = APIClient().get(f"/api/v1/pages/{active_page.slug}/")
        assert "moderation_note" not in public.data["data"]
