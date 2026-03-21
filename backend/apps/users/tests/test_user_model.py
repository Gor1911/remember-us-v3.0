"""User model and role tests."""
from __future__ import annotations

import pytest

from apps.users.models import User, UserRole


@pytest.fixture
def owner(db):
    return User.objects.create_user(
        email="owner@test.com", password="p", role=UserRole.OWNER
    )


@pytest.fixture
def admin(db):
    return User.objects.create_user(
        email="admin@test.com", password="p", role=UserRole.ADMIN
    )


@pytest.fixture
def guest(db):
    return User.objects.create_user(
        email="guest@test.com", password="p", role=UserRole.GUEST
    )


class TestUserRoles:
    def test_owner_properties(self, owner):
        assert owner.is_owner
        assert owner.can_edit
        assert not owner.can_approve
        assert not owner.is_admin

    def test_admin_properties(self, admin):
        assert admin.is_admin
        assert admin.can_edit
        assert admin.can_approve

    def test_guest_properties(self, guest):
        assert guest.is_guest
        assert not guest.can_edit
        assert not guest.can_approve

    def test_user_str(self, owner):
        assert "owner@test.com" in str(owner)
        assert "owner" in str(owner)

    def test_uuid_pk(self, owner):
        import uuid
        assert isinstance(owner.id, uuid.UUID)

    def test_digital_heir_transfer(self, owner, guest):
        owner.transfer_heir_rights(guest)
        owner.refresh_from_db()
        assert owner.digital_heir == guest
