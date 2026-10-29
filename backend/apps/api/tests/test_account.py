"""Tests for terms consent at registration and account deletion."""
from __future__ import annotations

import pytest
from rest_framework.test import APIClient

from apps.pages.models import MemorialPage
from apps.users.models import User, UserRole

REGISTER = "/api/v1/auth/register/"
DELETE = "/api/v1/auth/me/delete/"
TERMS_ERROR = "You must accept the Terms of Service and Privacy Policy."


def make_user(email: str, role: str) -> User:
    return User.objects.create_user(email=email, password="secret123", role=role)


def login(client: APIClient, email: str, password: str = "secret123"):
    return client.post("/api/v1/auth/token/", {"email": email, "password": password})


@pytest.fixture
def api_client():
    return APIClient()


class TestTermsConsent:
    @pytest.mark.django_db
    @pytest.mark.parametrize("extra", [{}, {"accept_terms": False}])
    def test_register_requires_acceptance(self, api_client, extra):
        resp = api_client.post(
            REGISTER,
            {"email": "n@test.com", "password": "secret123", "display_name": "N", **extra},
            format="json",
        )
        assert resp.status_code == 400
        assert resp.json() == {"success": False, "error": TERMS_ERROR, "code": "VALIDATION_ERROR"}
        assert not User.objects.filter(email="n@test.com").exists()

    @pytest.mark.django_db
    def test_register_with_acceptance_stores_terms(self, api_client, settings):
        settings.LEGAL_TERMS_VERSION = "test-v1"
        resp = api_client.post(
            REGISTER,
            {"email": "n@test.com", "password": "secret123", "display_name": "N",
             "accept_terms": True},
            format="json",
        )
        assert resp.status_code == 201
        user = User.objects.get(email="n@test.com")
        assert user.terms_accepted_at is not None
        assert user.terms_version == "test-v1"
        token = login(api_client, "n@test.com").json()["access"]
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        data = api_client.get("/api/v1/auth/me/").json()["data"]
        assert data["terms_version"] == "test-v1"
        assert data["terms_accepted_at"]


class TestDeleteAccount:
    @pytest.mark.django_db
    def test_unauthenticated(self, api_client):
        assert api_client.post(DELETE, {"password": "x"}, format="json").status_code == 401

    @pytest.mark.django_db
    @pytest.mark.parametrize("body", [{"password": "wrong"}, {}])
    def test_wrong_or_missing_password(self, api_client, body):
        user = make_user("o@test.com", UserRole.OWNER)
        api_client.force_authenticate(user)
        resp = api_client.post(DELETE, body, format="json")
        assert resp.status_code == 400
        assert resp.json()["code"] == "INVALID_PASSWORD"
        user.refresh_from_db()
        assert user.is_active and not user.is_deleted

    @pytest.mark.django_db
    def test_sole_admin_blocked(self, api_client):
        admin = make_user("a@test.com", UserRole.ADMIN)
        api_client.force_authenticate(admin)
        resp = api_client.post(DELETE, {"password": "secret123"}, format="json")
        assert resp.status_code == 400
        assert resp.json()["code"] == "LAST_ADMIN"

    @pytest.mark.django_db
    def test_admin_with_other_admin_succeeds(self, api_client):
        admin = make_user("a@test.com", UserRole.ADMIN)
        make_user("b@test.com", UserRole.ADMIN)
        api_client.force_authenticate(admin)
        resp = api_client.post(DELETE, {"password": "secret123"}, format="json")
        assert resp.status_code == 200
        assert resp.json() == {"success": True, "data": None}

    @pytest.mark.django_db
    def test_owner_deletion_end_to_end(self, api_client):
        owner = make_user("o@test.com", UserRole.OWNER)
        admin = make_user("a@test.com", UserRole.ADMIN)
        page = MemorialPage.objects.create(owner=owner, first_name="J", last_name="S")
        page.submit_for_moderation()
        slug = page.slug
        token = login(api_client, "o@test.com").json()["access"]
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        resp = api_client.post(DELETE, {"password": "secret123"}, format="json")
        assert resp.status_code == 200

        owner = User.objects.get(pk=owner.pk)
        assert owner.email == f"deleted-{owner.pk}@deleted.invalid"
        assert owner.display_name == ""
        assert not owner.has_usable_password()
        assert not owner.is_active and owner.is_deleted and owner.deleted_at
        assert MemorialPage.all_objects.get(pk=page.pk).is_deleted

        # Old token rejected
        assert api_client.get("/api/v1/auth/me/").status_code == 401
        # Old credentials cannot log in
        assert login(APIClient(), "o@test.com").status_code == 401

        guest = APIClient()
        assert guest.get(f"/api/v1/pages/{slug}/").status_code == 404
        assert guest.get(f"/api/v1/pages/{slug}/scan/").status_code == 404
        admin_client = APIClient()
        admin_client.force_authenticate(admin)
        assert admin_client.get("/api/v1/pages/").json()["data"] == []
        assert admin_client.get("/api/v1/pages/moderation/").json()["data"] == []
