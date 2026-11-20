"""Server-side rules of the memorial form: biography, date order, portrait vs gallery."""
from __future__ import annotations

import io

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image

from apps.media.models import MediaFile, MediaType
from apps.pages.models import MemorialPage

from .conftest import auth, png_upload

BIO = "He loved the sea and his family."
PAGES = "/api/v1/pages/"


def media_url(page: MemorialPage) -> str:
    """Upload endpoint for the page."""
    return f"/api/v1/pages/{page.slug}/media/"


def gif_upload(name: str = "anim.gif") -> SimpleUploadedFile:
    """A valid GIF — a format the gallery does not accept."""
    buf = io.BytesIO()
    Image.new("RGB", (8, 8), "blue").save(buf, format="GIF")
    return SimpleUploadedFile(name, buf.getvalue(), content_type="image/gif")


@pytest.mark.django_db
class TestCreateValidation:
    def test_biography_required(self, api_client, owner):
        response = auth(api_client, owner).post(PAGES, {"first_name": "A", "last_name": "B"})
        assert response.status_code == 400
        assert "biography" in response.data["error"]

    def test_biography_too_short_after_trim(self, api_client, owner):
        response = auth(api_client, owner).post(
            PAGES, {"first_name": "A", "last_name": "B", "biography": "   short story   "}
        )
        assert response.status_code == 400
        assert "at least 20" in response.data["error"]

    def test_biography_is_trimmed(self, api_client, owner):
        response = auth(api_client, owner).post(
            PAGES, {"first_name": "A", "last_name": "B", "biography": f"  {BIO}  "}
        )
        assert response.status_code == 201
        assert response.data["data"]["biography"] == BIO

    def test_death_before_birth_rejected(self, api_client, owner):
        response = auth(api_client, owner).post(PAGES, {
            "first_name": "A", "last_name": "B", "biography": BIO,
            "birth_date": "1950-05-01", "death_date": "1949-01-01",
        })
        assert response.status_code == 400
        assert "death_date" in response.data["error"]

    def test_same_day_allowed(self, api_client, owner):
        response = auth(api_client, owner).post(PAGES, {
            "first_name": "A", "last_name": "B", "biography": BIO,
            "birth_date": "1950-05-01", "death_date": "1950-05-01",
        })
        assert response.status_code == 201

    def test_service_end_before_start_rejected(self, api_client, owner):
        response = auth(api_client, owner).post(PAGES, {
            "page_type": "military", "first_name": "A", "last_name": "B", "biography": BIO,
            "service_start": "1970-01-01", "service_end": "1965-01-01",
        })
        assert response.status_code == 400
        assert "service_end" in response.data["error"]


@pytest.mark.django_db
class TestUpdateValidation:
    def test_short_biography_rejected(self, api_client, owner, draft_page):
        response = auth(api_client, owner).patch(f"{PAGES}{draft_page.slug}/", {"biography": "x"})
        assert response.status_code == 400

    def test_partial_date_checked_against_stored_value(self, api_client, owner, draft_page):
        draft_page.birth_date = "1950-05-01"
        draft_page.save()
        response = auth(api_client, owner).patch(
            f"{PAGES}{draft_page.slug}/", {"death_date": "1940-01-01"}
        )
        assert response.status_code == 400
        assert "death_date" in response.data["error"]


@pytest.mark.django_db
class TestPortraitAndGallery:
    def test_portrait_upload_sets_page_cover(self, api_client, owner, draft_page):
        client = auth(api_client, owner)
        response = client.post(
            media_url(draft_page),
            {"file": png_upload("main.png"), "is_primary_portrait": "true"},
            format="multipart",
        )
        assert response.status_code == 201
        assert response.data["data"]["media_type"] == "portrait"
        listing = client.get(PAGES).data["data"]
        assert listing[0]["primary_portrait"]

    def test_new_portrait_replaces_old_one(self, api_client, owner, draft_page):
        client = auth(api_client, owner)
        for name in ("old.png", "new.png"):
            client.post(
                media_url(draft_page),
                {"file": png_upload(name), "is_primary_portrait": "true"},
                format="multipart",
            )
        live = MediaFile.objects.filter(page=draft_page, media_type=MediaType.PORTRAIT)
        assert [m.original_filename for m in live] == ["new.png"]
        assert MediaFile.all_objects.get(original_filename="old.png").is_deleted

    def test_gallery_limit(self, api_client, owner, draft_page, settings):
        settings.MAX_GALLERY_PHOTOS = 2
        client = auth(api_client, owner)
        codes = [
            client.post(media_url(draft_page), {"file": png_upload(f"{i}.png")},
                        format="multipart").status_code
            for i in range(3)
        ]
        assert codes == [201, 201, 400]

    def test_portrait_not_counted_in_gallery_limit(self, api_client, owner, draft_page, settings):
        settings.MAX_GALLERY_PHOTOS = 1
        client = auth(api_client, owner)
        client.post(media_url(draft_page), {"file": png_upload("g.png")}, format="multipart")
        response = client.post(
            media_url(draft_page),
            {"file": png_upload("main.png"), "is_primary_portrait": "true"},
            format="multipart",
        )
        assert response.status_code == 201

    def test_gif_rejected(self, api_client, owner, draft_page):
        response = auth(api_client, owner).post(
            media_url(draft_page), {"file": gif_upload()}, format="multipart"
        )
        assert response.status_code == 400
        assert "JPEG, PNG, WebP" in response.data["error"]
