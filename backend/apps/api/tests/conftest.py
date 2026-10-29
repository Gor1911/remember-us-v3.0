"""Shared fixtures for the private-media, password-reset and export tests."""
from __future__ import annotations

import io

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.test import APIClient

from apps.pages.models import MemorialPage
from apps.users.models import User, UserRole


def make_user(email: str, role: str, **extra) -> User:
    """Create a user with a known password."""
    return User.objects.create_user(email=email, password="secret123", role=role, **extra)


def png_upload(name: str = "Grandpa Photo.png") -> SimpleUploadedFile:
    """Build a tiny valid PNG upload."""
    buf = io.BytesIO()
    Image.new("RGB", (8, 8), "red").save(buf, format="PNG")
    return SimpleUploadedFile(name, buf.getvalue(), content_type="image/png")


def auth(client: APIClient, user: User) -> APIClient:
    """Authenticate the client as the user."""
    client.force_authenticate(user)
    return client


@pytest.fixture(autouse=True)
def _isolated_media_root(tmp_path, settings):
    settings.MEDIA_ROOT = tmp_path


@pytest.fixture
def api_client() -> APIClient:
    return APIClient()


@pytest.fixture
def owner(db) -> User:
    return make_user("owner@test.com", UserRole.OWNER)


@pytest.fixture
def other_owner(db) -> User:
    return make_user("other@test.com", UserRole.OWNER)


@pytest.fixture
def admin_user(db) -> User:
    return make_user("admin@test.com", UserRole.ADMIN, is_staff=True)


@pytest.fixture
def draft_page(db, owner) -> MemorialPage:
    return MemorialPage.objects.create(
        slug="zz00-yy11-xx22", owner=owner, first_name="D", last_name="P"
    )


@pytest.fixture
def active_page(db, owner, admin_user) -> MemorialPage:
    page = MemorialPage.objects.create(
        slug="ab12-cd34-ef56", owner=owner, first_name="Jane", last_name="Smith"
    )
    page.submit_for_moderation()
    page.approve(admin_user)
    return page
