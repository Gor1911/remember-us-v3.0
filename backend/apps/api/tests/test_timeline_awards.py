"""Writable timeline entries and military awards on page create/update."""
from __future__ import annotations

from datetime import timedelta

import pytest
from django.utils import timezone

from apps.pages.models import MilitaryAward, PageState, TimelineEntry

from .conftest import auth

BIO = "He loved the sea and his family."
PAGES = "/api/v1/pages/"


def create_payload(**extra) -> dict:
    """Minimal valid create body."""
    return {"first_name": "John", "last_name": "Doe", "biography": BIO, **extra}


@pytest.mark.django_db
class TestCreate:
    def test_create_with_timeline_and_awards(self, api_client, owner):
        resp = auth(api_client, owner).post(PAGES, create_payload(
            page_type="military",
            timeline_entries=[
                {"year": 1970, "title": "  Enlisted  ", "description": "Navy"},
                {"year": 1950, "title": "Born"},
            ],
            military_awards=[
                {"name": "Purple Heart", "awarded_date": "1971-03-02"},
                {"name": "Bronze Star", "description": "Valor", "awarded_date": None},
            ],
        ), format="json")
        assert resp.status_code == 201, resp.content
        data = resp.json()["data"]
        # Model ordering (year, order) is kept for the timeline.
        assert [(t["year"], t["title"], t["description"], t["order"])
                for t in data["timeline_entries"]] == [
            (1950, "Born", "", 1), (1970, "Enlisted", "Navy", 0),
        ]
        assert [(a["name"], a["description"], a["awarded_date"], a["order"])
                for a in data["military_awards"]] == [
            ("Purple Heart", "", "1971-03-02", 0), ("Bronze Star", "Valor", None, 1),
        ]
        assert set(data["military_awards"][0]) == {
            "id", "name", "description", "awarded_date", "model_3d_url", "order",
        }

    def test_create_without_lists(self, api_client, owner):
        resp = auth(api_client, owner).post(PAGES, create_payload(), format="json")
        assert resp.status_code == 201
        assert resp.json()["data"]["timeline_entries"] == []
        assert resp.json()["data"]["military_awards"] == []

    def test_years_outside_lifetime_allowed(self, api_client, owner):
        resp = auth(api_client, owner).post(PAGES, create_payload(
            birth_date="1950-01-01", death_date="1990-01-01",
            timeline_entries=[{"year": 2005, "title": "Posthumous honour"}],
        ), format="json")
        assert resp.status_code == 201, resp.content


@pytest.mark.django_db
class TestValidation:
    @pytest.mark.parametrize("year", [1799, timezone.now().year + 1])
    def test_year_out_of_range(self, api_client, owner, year):
        resp = auth(api_client, owner).post(PAGES, create_payload(
            timeline_entries=[{"year": year, "title": "X"}],
        ), format="json")
        assert resp.status_code == 400
        body = resp.json()
        assert body["success"] is False and body["code"] == "VALIDATION_ERROR"
        assert body["error"].startswith("timeline_entries: 0: year:")

    def test_too_many_items(self, api_client, owner):
        resp = auth(api_client, owner).post(PAGES, create_payload(
            timeline_entries=[{"year": 2000, "title": f"T{i}"} for i in range(31)],
        ), format="json")
        assert resp.status_code == 400
        assert "timeline_entries" in resp.json()["error"]
        resp = auth(api_client, owner).post(PAGES, create_payload(
            military_awards=[{"name": f"A{i}"} for i in range(31)],
        ), format="json")
        assert resp.status_code == 400
        assert "military_awards" in resp.json()["error"]

    def test_blank_title_and_name(self, api_client, owner):
        resp = auth(api_client, owner).post(PAGES, create_payload(
            timeline_entries=[{"year": 2000, "title": "ok"}, {"year": 2000, "title": "   "}],
        ), format="json")
        assert resp.status_code == 400
        assert resp.json()["error"].startswith("timeline_entries: 1: title:")
        resp = auth(api_client, owner).post(PAGES, create_payload(
            military_awards=[{"name": ""}],
        ), format="json")
        assert resp.status_code == 400
        assert "military_awards: 0: name:" in resp.json()["error"]

    def test_length_limits(self, api_client, owner):
        resp = auth(api_client, owner).post(PAGES, create_payload(
            timeline_entries=[{"year": 2000, "title": "x" * 201}],
        ), format="json")
        assert resp.status_code == 400
        resp = auth(api_client, owner).post(PAGES, create_payload(
            timeline_entries=[{"year": 2000, "title": "x", "description": "d" * 1001}],
        ), format="json")
        assert resp.status_code == 400

    def test_future_award_date(self, api_client, owner):
        tomorrow = (timezone.localdate() + timedelta(days=1)).isoformat()
        resp = auth(api_client, owner).post(PAGES, create_payload(
            military_awards=[{"name": "Medal", "awarded_date": tomorrow}],
        ), format="json")
        assert resp.status_code == 400
        assert "awarded_date: Award date cannot be in the future." in resp.json()["error"]

    def test_invalid_update_changes_nothing(self, api_client, owner, draft_page):
        TimelineEntry.objects.create(page=draft_page, year=1990, title="Kept")
        resp = auth(api_client, owner).patch(f"{PAGES}{draft_page.slug}/", {
            "first_name": "Changed",
            "timeline_entries": [{"year": 1500, "title": "Bad"}],
        }, format="json")
        assert resp.status_code == 400
        draft_page.refresh_from_db()
        assert draft_page.first_name == "D"
        assert list(draft_page.timeline_entries.values_list("title", flat=True)) == ["Kept"]


@pytest.mark.django_db
class TestUpdate:
    def test_update_replaces_lists(self, api_client, owner, draft_page):
        old_entry = TimelineEntry.objects.create(page=draft_page, year=1990, title="Old")
        old_award = MilitaryAward.objects.create(page=draft_page, name="Old medal")
        resp = auth(api_client, owner).patch(f"{PAGES}{draft_page.slug}/", {
            "timeline_entries": [{"year": 2001, "title": "New A"}, {"year": 2001, "title": "New B"}],
            "military_awards": [],
        }, format="json")
        assert resp.status_code == 200, resp.content
        data = resp.json()["data"]
        assert [(t["title"], t["order"]) for t in data["timeline_entries"]] == [
            ("New A", 0), ("New B", 1),
        ]
        assert data["military_awards"] == []
        # Old rows are soft-deleted, never removed, and never returned.
        old_entry.refresh_from_db()
        old_award.refresh_from_db()
        assert old_entry.is_deleted and old_award.is_deleted
        assert TimelineEntry.all_objects.filter(page=draft_page).count() == 3

    def test_absent_keys_leave_lists_untouched(self, api_client, owner, draft_page):
        TimelineEntry.objects.create(page=draft_page, year=1990, title="Kept")
        MilitaryAward.objects.create(page=draft_page, name="Kept medal")
        resp = auth(api_client, owner).patch(
            f"{PAGES}{draft_page.slug}/", {"first_name": "Renamed"}, format="json"
        )
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert [t["title"] for t in data["timeline_entries"]] == ["Kept"]
        assert [a["name"] for a in data["military_awards"]] == ["Kept medal"]

    def test_owner_list_edit_on_active_page_goes_to_moderation(
        self, api_client, owner, active_page
    ):
        resp = auth(api_client, owner).patch(f"{PAGES}{active_page.slug}/", {
            "timeline_entries": [{"year": 2000, "title": "Added"}],
        }, format="json")
        assert resp.status_code == 200
        active_page.refresh_from_db()
        assert active_page.state == PageState.MODERATION

    def test_stranger_cannot_write_lists(self, api_client, other_owner, draft_page):
        resp = auth(api_client, other_owner).patch(f"{PAGES}{draft_page.slug}/", {
            "timeline_entries": [{"year": 2000, "title": "Hack"}],
        }, format="json")
        assert resp.status_code == 403
        assert not draft_page.timeline_entries.exists()
