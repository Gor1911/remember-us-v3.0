"""Password reset flow."""
from __future__ import annotations

import re
from urllib.parse import parse_qs, urlparse

from django.core import mail
from rest_framework.test import APIClient

RESET = "/api/v1/auth/password-reset/"
CONFIRM = "/api/v1/auth/password-reset/confirm/"
NEW_PASSWORD = "NewStrong#Pass9"


def login(email: str, password: str):
    return APIClient().post("/api/v1/auth/token/", {"email": email, "password": password})


def request_link(client: APIClient, email: str) -> tuple[str, str]:
    assert client.post(RESET, {"email": email}).status_code == 200
    assert len(mail.outbox) == 1
    link = re.search(r"https?://\S+", mail.outbox[0].body).group(0)
    assert urlparse(link).path == "/reset-password"
    qs = parse_qs(urlparse(link).query)
    return qs["uid"][0], qs["token"][0]


def test_unknown_email_200_no_mail(api_client, db):
    resp = api_client.post(RESET, {"email": "nobody@test.com"})
    assert resp.status_code == 200
    assert resp.json() == {"success": True, "data": None}
    assert mail.outbox == []


def test_malformed_email_400(api_client, db):
    for body in ({"email": "nope"}, {}, {"email": 5}):
        resp = api_client.post(RESET, body, format="json")
        assert resp.status_code == 400
        assert resp.json()["code"] == "VALIDATION_ERROR"


def test_known_email_sends_working_link(api_client, owner):
    uid, token = request_link(api_client, "owner@test.com")
    assert mail.outbox[0].to == ["owner@test.com"]
    resp = api_client.post(CONFIRM, {"uid": uid, "token": token, "password": NEW_PASSWORD})
    assert resp.status_code == 200
    assert resp.json() == {"success": True, "data": None}
    assert login("owner@test.com", NEW_PASSWORD).status_code == 200
    assert login("owner@test.com", "secret123").status_code == 401


def test_token_cannot_be_reused(api_client, owner):
    uid, token = request_link(api_client, "owner@test.com")
    body = {"uid": uid, "token": token, "password": NEW_PASSWORD}
    assert api_client.post(CONFIRM, body).status_code == 200
    resp = api_client.post(CONFIRM, {**body, "password": "Another#Pass88"})
    assert resp.status_code == 400
    assert resp.json()["code"] == "INVALID_TOKEN"


def test_invalid_token_and_uid(api_client, owner):
    uid, _ = request_link(api_client, "owner@test.com")
    for body in (
        {"uid": uid, "token": "bad-token", "password": NEW_PASSWORD},
        {"uid": "!!!", "token": "x", "password": NEW_PASSWORD},
        {"uid": "", "token": "", "password": NEW_PASSWORD},
    ):
        resp = api_client.post(CONFIRM, body, format="json")
        assert resp.status_code == 400
        assert resp.json()["code"] == "INVALID_TOKEN"


def test_weak_password_validation_error(api_client, owner):
    uid, token = request_link(api_client, "owner@test.com")
    resp = api_client.post(CONFIRM, {"uid": uid, "token": token, "password": "123"})
    assert resp.status_code == 400
    assert resp.json()["code"] == "VALIDATION_ERROR"
    assert "short" in resp.json()["error"].lower()
    # Token is still usable after a rejected password
    resp = api_client.post(CONFIRM, {"uid": uid, "token": token, "password": NEW_PASSWORD})
    assert resp.status_code == 200


def test_inactive_user_no_mail(api_client, owner):
    owner.is_active = False
    owner.save()
    assert api_client.post(RESET, {"email": "owner@test.com"}).status_code == 200
    assert mail.outbox == []


def test_deleted_user_no_mail_and_token_rejected(api_client, owner):
    uid, token = request_link(api_client, "owner@test.com")
    mail.outbox.clear()
    owner.is_deleted = True
    owner.save()
    assert api_client.post(RESET, {"email": "owner@test.com"}).status_code == 200
    assert mail.outbox == []
    resp = api_client.post(CONFIRM, {"uid": uid, "token": token, "password": NEW_PASSWORD})
    assert resp.json()["code"] == "INVALID_TOKEN"
