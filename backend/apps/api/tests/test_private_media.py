"""Signed, expiring media URLs and private upload paths."""
from __future__ import annotations

import time
from urllib.parse import urlparse

from django.test import Client
from rest_framework.test import APIClient

from apps.media.models import MediaFile
from apps.qr.models import QRCode

from .conftest import auth, png_upload


def upload(client: APIClient, page, name: str = "Grandpa Photo.png") -> dict:
    resp = client.post(
        f"/api/v1/pages/{page.slug}/media/", {"file": png_upload(name)}, format="multipart"
    )
    assert resp.status_code == 201, resp.content
    return resp.json()["data"]


def path_of(url: str) -> str:
    return urlparse(url).path


def test_signed_url_serves_file(api_client, owner, active_page):
    data = upload(auth(api_client, owner), active_page)
    url = data["file_url"]
    assert "/media/s/" in url and url.startswith("http")
    resp = Client().get(path_of(url))
    assert resp.status_code == 200
    body = b"".join(resp.streaming_content)
    assert body.startswith(b"\x89PNG")
    assert resp["Content-Type"] == "image/png"
    assert resp["Content-Disposition"] == "inline"
    assert resp["X-Content-Type-Options"] == "nosniff"
    assert resp["Cache-Control"].startswith("private, max-age=")


def test_tampered_token_404(api_client, owner, active_page):
    url = upload(auth(api_client, owner), active_page)["file_url"]
    head, token, name = path_of(url).rsplit("/", 2)
    bad = token[:-1] + ("A" if token[-1] != "A" else "B")
    assert Client().get(f"{head}/{bad}/{name}").status_code == 404
    assert Client().get(f"{head}/garbage/{name}").status_code == 404


def test_expired_token_404(api_client, owner, active_page, monkeypatch, settings):
    settings.MEDIA_URL_MAX_AGE = 60
    url = upload(auth(api_client, owner), active_page)["file_url"]
    assert Client().get(path_of(url)).status_code == 200
    real = time.time()
    monkeypatch.setattr(time, "time", lambda: real + 120)
    assert Client().get(path_of(url)).status_code == 404


def test_soft_deleted_media_404(api_client, owner, active_page):
    data = upload(auth(api_client, owner), active_page)
    MediaFile.objects.get(pk=data["id"]).soft_delete()
    assert Client().get(path_of(data["file_url"])).status_code == 404


def test_soft_deleted_page_404(api_client, owner, active_page):
    url = upload(auth(api_client, owner), active_page)["file_url"]
    active_page.soft_delete()
    assert Client().get(path_of(url)).status_code == 404


def test_guest_cannot_get_urls_of_draft_page(api_client, owner, draft_page):
    upload(auth(api_client, owner), draft_page)
    guest = APIClient()
    resp = guest.get(f"/api/v1/pages/{draft_page.slug}/")
    assert resp.status_code == 404
    assert "file_url" not in resp.content.decode()
    resp = guest.get(f"/api/v1/pages/{draft_page.slug}/media/")
    assert resp.status_code in (401, 404)
    assert "file_url" not in resp.content.decode()


def test_new_upload_path_is_opaque(api_client, owner, active_page):
    data = upload(auth(api_client, owner), active_page, "Secret Name.PNG")
    media = MediaFile.objects.get(pk=data["id"])
    assert media.file.name.startswith(f"media/{active_page.id}/")
    assert media.file.name.endswith(".png")
    assert active_page.slug not in media.file.name
    assert "Secret" not in media.file.name
    assert media.original_filename == "Secret Name.PNG"
    assert "Secret" not in data["file_url"]


def test_public_detail_hides_original_filename(api_client, owner, admin_user, other_owner, active_page):
    upload(auth(api_client, owner), active_page)
    active_page.refresh_from_db()
    active_page.approve(admin_user)
    url = f"/api/v1/pages/{active_page.slug}/"

    def first_media(client: APIClient) -> dict:
        return client.get(url).json()["data"]["media_files"][0]

    assert "original_filename" not in first_media(APIClient())
    assert "original_filename" not in first_media(auth(APIClient(), other_owner))
    assert first_media(auth(APIClient(), owner))["original_filename"] == "Grandpa Photo.png"
    assert "original_filename" in first_media(auth(APIClient(), admin_user))


def test_direct_media_path_not_served(api_client, owner, active_page):
    data = upload(auth(api_client, owner), active_page)
    name = MediaFile.objects.get(pk=data["id"]).file.name
    assert Client().get(f"/media/{name}").status_code == 404


def test_qr_url_signed(api_client, owner, active_page):
    resp = auth(api_client, owner).post(f"/api/v1/pages/{active_page.slug}/qr/generate/")
    url = resp.json()["data"]["qr"]["image_url"]
    assert "/media/s/" in url
    r = Client().get(path_of(url))
    assert r.status_code == 200
    assert r["Content-Type"] == "image/png"
    assert QRCode.objects.filter(page=active_page).exists()


def test_x_accel_mode(api_client, owner, active_page, settings):
    settings.MEDIA_USE_X_ACCEL = True
    data = upload(auth(api_client, owner), active_page)
    name = MediaFile.objects.get(pk=data["id"]).file.name
    resp = Client().get(path_of(data["file_url"]))
    assert resp.status_code == 200
    assert resp.content == b""
    assert resp["X-Accel-Redirect"] == f"/protected-media/{name}"


def test_404_body_has_no_internals(db):
    resp = Client().get("/media/s/bogus/x.png")
    assert resp.status_code == 404
    assert b"Traceback" not in resp.content


def test_name_segment_never_used_as_path(api_client, owner, active_page):
    url = upload(auth(api_client, owner), active_page)["file_url"]
    head = path_of(url).rsplit("/", 1)[0]
    # Valid token, arbitrary name segment: still serves only the object's own file.
    resp = Client().get(f"{head}/..%2F..%2Fsecret")
    assert resp.status_code in (200, 404)
    if resp.status_code == 200:
        assert b"".join(resp.streaming_content).startswith(b"\x89PNG")
