"""State machine tests — DRAFT → MODERATION → ACTIVE transitions."""
from __future__ import annotations

import pytest
from django.core.exceptions import ValidationError

from apps.pages.models import MemorialPage, PageState
from apps.users.models import User, UserRole


@pytest.fixture
def owner(db):
    return User.objects.create_user(
        email="owner@test.com",
        password="testpass123",
        role=UserRole.OWNER,
    )


@pytest.fixture
def admin(db):
    return User.objects.create_user(
        email="admin@test.com",
        password="testpass123",
        role=UserRole.ADMIN,
        is_staff=True,
    )


@pytest.fixture
def guest(db):
    return User.objects.create_user(
        email="guest@test.com",
        password="testpass123",
        role=UserRole.GUEST,
    )


@pytest.fixture
def draft_page(db, owner):
    return MemorialPage.objects.create(
        slug="test-slug-001",
        owner=owner,
        first_name="John",
        last_name="Doe",
        state=PageState.DRAFT,
    )


class TestStateMachine:
    def test_initial_state_is_draft(self, draft_page):
        assert draft_page.state == PageState.DRAFT

    def test_owner_submits_draft_to_moderation(self, draft_page):
        draft_page.submit_for_moderation()
        assert draft_page.state == PageState.MODERATION

    def test_cannot_submit_already_in_moderation(self, draft_page):
        draft_page.submit_for_moderation()
        with pytest.raises(ValidationError):
            draft_page.submit_for_moderation()

    def test_admin_approves_moderation(self, draft_page, admin):
        draft_page.submit_for_moderation()
        draft_page.approve(admin)
        assert draft_page.state == PageState.ACTIVE
        assert draft_page.approved_by == admin
        assert draft_page.approved_at is not None

    def test_guest_cannot_approve(self, draft_page, guest):
        draft_page.submit_for_moderation()
        with pytest.raises(ValidationError):
            draft_page.approve(guest)

    def test_admin_rejects_to_draft_with_note(self, draft_page, admin):
        draft_page.submit_for_moderation()
        draft_page.reject(admin, note="Photo quality too low")
        assert draft_page.state == PageState.DRAFT
        assert draft_page.moderation_note == "Photo quality too low"

    def test_owner_edit_on_active_resets_to_moderation(self, draft_page, admin):
        draft_page.submit_for_moderation()
        draft_page.approve(admin)
        assert draft_page.state == PageState.ACTIVE

        draft_page.mark_edited_by_owner()
        assert draft_page.state == PageState.MODERATION

    def test_edit_on_draft_does_not_change_state(self, draft_page):
        draft_page.mark_edited_by_owner()
        assert draft_page.state == PageState.DRAFT

    def test_is_active_property(self, draft_page, admin):
        assert not draft_page.is_active
        draft_page.submit_for_moderation()
        draft_page.approve(admin)
        assert draft_page.is_active
