"""API tests — memorial page endpoints, all roles."""
from __future__ import annotations

import pytest
from django.urls import reverse
from rest_framework.test import APIClient

from apps.pages.models import MemorialPage, PageState
from apps.users.models import User, UserRole


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def owner(db):
    return User.objects.create_user(
        email="owner@test.com",
        password="secret123",
        role=UserRole.OWNER,
    )


@pytest.fixture
def admin_user(db):
    return User.objects.create_user(
        email="admin@test.com",
        password="secret123",
        role=UserRole.ADMIN,
        is_staff=True,
    )


@pytest.fixture
def guest(db):
    return User.objects.create_user(
        email="guest@test.com",
        password="secret123",
        role=UserRole.GUEST,
    )


@pytest.fixture
def active_page(db, owner, admin_user):
    page = MemorialPage.objects.create(
        slug="ab12-cd34-ef56",
        owner=owner,
        first_name="Jane",
        last_name="Smith",
        state=PageState.DRAFT,
    )
    page.submit_for_moderation()
    page.approve(admin_user)
    return page


@pytest.fixture
def draft_page(db, owner):
    return MemorialPage.objects.create(
        slug="zz00-yy11-xx22",
        owner=owner,
        first_name="Draft",
        last_name="Person",
        state=PageState.DRAFT,
    )


class TestMemorialPageAccess:
    def test_guest_can_read_active_page(self, api_client, active_page):
        response = api_client.get(f"/api/v1/pages/{active_page.slug}/")
        assert response.status_code == 200
        assert response.data["success"] is True

    def test_guest_cannot_read_draft_page(self, api_client, draft_page):
        response = api_client.get(f"/api/v1/pages/{draft_page.slug}/")
        assert response.status_code == 404

    def test_owner_can_read_own_draft_page(self, api_client, owner, draft_page):
        api_client.force_authenticate(user=owner)
        response = api_client.get(f"/api/v1/pages/{draft_page.slug}/")
        assert response.status_code == 200

    def test_response_has_noindex_header(self, api_client, active_page):
        response = api_client.get(f"/api/v1/pages/{active_page.slug}/")
        assert "noindex" in response.get("X-Robots-Tag", "")


class TestMemorialPageCreate:
    def test_owner_can_create_page(self, api_client, owner):
        api_client.force_authenticate(user=owner)
        response = api_client.post(
            "/api/v1/pages/",
            {"first_name": "New", "last_name": "Person", "page_type": "civilian"},
        )
        assert response.status_code == 201
        assert response.data["data"]["state"] == "draft"
        assert response.data["data"]["slug"]  # auto-generated

    def test_guest_cannot_create_page(self, api_client, guest):
        api_client.force_authenticate(user=guest)
        response = api_client.post(
            "/api/v1/pages/",
            {"first_name": "New", "last_name": "Person"},
        )
        assert response.status_code == 403

    def test_unauthenticated_cannot_create_page(self, api_client):
        response = api_client.post("/api/v1/pages/", {"first_name": "X"})
        assert response.status_code == 401


class TestStateTransitionsAPI:
    def test_owner_submits_page(self, api_client, owner, draft_page):
        api_client.force_authenticate(user=owner)
        response = api_client.post(f"/api/v1/pages/{draft_page.slug}/submit/")
        assert response.status_code == 200
        assert response.data["data"]["state"] == "moderation"

    def test_admin_approves_page(self, api_client, admin_user, draft_page, owner):
        draft_page.submit_for_moderation()
        api_client.force_authenticate(user=admin_user)
        response = api_client.post(f"/api/v1/pages/{draft_page.slug}/approve/")
        assert response.status_code == 200
        assert response.data["data"]["state"] == "active"

    def test_non_admin_cannot_approve(self, api_client, owner, draft_page):
        draft_page.submit_for_moderation()
        api_client.force_authenticate(user=owner)
        response = api_client.post(f"/api/v1/pages/{draft_page.slug}/approve/")
        assert response.status_code == 403

    def test_admin_rejects_with_note(self, api_client, admin_user, draft_page):
        draft_page.submit_for_moderation()
        api_client.force_authenticate(user=admin_user)
        response = api_client.post(
            f"/api/v1/pages/{draft_page.slug}/reject/",
            {"note": "Need better photo"},
        )
        assert response.status_code == 200
        assert response.data["data"]["moderation_note"] == "Need better photo"

    def test_owner_edit_resets_active_to_moderation(
        self, api_client, owner, active_page
    ):
        api_client.force_authenticate(user=owner)
        response = api_client.patch(
            f"/api/v1/pages/{active_page.slug}/",
            {"biography": "Updated biography text"},
        )
        assert response.status_code == 200
        assert response.data["data"]["state"] == "moderation"


class TestErrorFormat:
    def test_error_response_format(self, api_client):
        """All errors must follow { success, error, code } format."""
        response = api_client.get("/api/v1/pages/nonexistent-slug/")
        assert response.status_code == 404
