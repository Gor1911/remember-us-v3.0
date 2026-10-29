"""Stripe Checkout: plans, checkout, webhook (signed), session status, submit gating."""
from __future__ import annotations

import hashlib
import hmac
import json
import time

import pytest
import stripe
from django.core import mail
from rest_framework.test import APIClient

from apps.audit.models import AuditLog
from apps.payments.models import Payment

from .conftest import auth

SECRET = "whsec_test_secret"
WEBHOOK = "/api/v1/payments/webhook/"


@pytest.fixture(autouse=True)
def stripe_settings(settings):
    settings.STRIPE_SECRET_KEY = "sk_test_dummy"
    settings.STRIPE_WEBHOOK_SECRET = SECRET
    settings.STRIPE_PRICE_STANDARD = "price_std"
    settings.STRIPE_PRICE_PREMIUM = "price_prem"
    settings.FRONTEND_URL = "https://app.example.com"


@pytest.fixture
def fake_stripe(monkeypatch):
    calls: list[dict] = []

    def create(**kwargs):
        calls.append(kwargs)
        return {"id": f"cs_test_{len(calls)}", "url": f"https://checkout.stripe.test/{len(calls)}"}

    monkeypatch.setattr(stripe.checkout.Session, "create", create)
    return calls


def sign(payload: bytes, secret: str = SECRET) -> str:
    ts = int(time.time())
    mac = hmac.new(secret.encode(), f"{ts}.".encode() + payload, hashlib.sha256).hexdigest()
    return f"t={ts},v1={mac}"


def send_event(event_type: str, obj: dict, secret: str = SECRET, header: str | None = None):
    payload = json.dumps(
        {"id": "evt_1", "object": "event", "type": event_type, "data": {"object": obj}}
    ).encode()
    return APIClient().post(
        WEBHOOK, data=payload, content_type="application/json",
        HTTP_STRIPE_SIGNATURE=header if header is not None else sign(payload, secret),
    )


def checkout(client, page, **body):
    return client.post(f"/api/v1/pages/{page.slug}/checkout/", body, format="json")


def paid_session(session_id="cs_test_1", intent="pi_1") -> dict:
    return {"id": session_id, "payment_status": "paid", "payment_intent": intent,
            "amount_total": 9900}


class TestPlans:
    def test_public_plans(self):
        data = APIClient().get("/api/v1/payments/plans/").json()["data"]
        assert data == [
            {"id": "standard", "name": "Standard", "amount_cents": 9900, "currency": "usd",
             "available": True},
            {"id": "premium", "name": "Premium", "amount_cents": 14900, "currency": "usd",
             "available": True},
        ]

    def test_unavailable_without_keys(self, settings):
        settings.STRIPE_SECRET_KEY = ""
        data = APIClient().get("/api/v1/payments/plans/").json()["data"]
        assert [p["available"] for p in data] == [False, False]
        settings.STRIPE_SECRET_KEY = "sk"
        settings.STRIPE_PRICE_PREMIUM = ""
        assert [p["available"] for p in APIClient().get("/api/v1/payments/plans/").json()["data"]] == [True, False]


class TestCheckout:
    def test_roles(self, owner, other_owner, admin_user, draft_page, fake_stripe):
        assert checkout(APIClient(), draft_page, package="standard").status_code == 401
        resp = checkout(auth(APIClient(), other_owner), draft_page, package="standard")
        assert resp.status_code == 404
        # owner-only: even admins cannot pay for someone else's page
        assert checkout(auth(APIClient(), admin_user), draft_page, package="standard").status_code == 404
        resp = checkout(auth(APIClient(), owner), draft_page, package="standard")
        assert resp.status_code == 200
        assert resp.json()["data"] == {"checkout_url": "https://checkout.stripe.test/1"}

    def test_session_params_and_payment_row(self, owner, draft_page, fake_stripe):
        checkout(auth(APIClient(), owner), draft_page, package="standard")
        kw = fake_stripe[0]
        assert kw["mode"] == "payment"
        assert kw["line_items"] == [{"price": "price_std", "quantity": 1}]
        assert kw["success_url"] == "https://app.example.com/success?session_id={CHECKOUT_SESSION_ID}"
        assert kw["cancel_url"] == (
            f"https://app.example.com/dashboard?checkout=canceled&page={draft_page.slug}"
        )
        pay = Payment.objects.get()
        assert (pay.status, pay.package, pay.amount_cents, pay.stripe_session_id) == (
            "pending", "standard", 9900, "cs_test_1")
        assert pay.user == owner and pay.page == draft_page and pay.consent_ai is False

    def test_premium_requires_consent(self, owner, draft_page, fake_stripe):
        client = auth(APIClient(), owner)
        for body in ({"package": "premium"}, {"package": "premium", "consent_ai": False},
                     {"package": "premium", "consent_ai": "yes"}):
            resp = checkout(client, draft_page, **body)
            assert resp.status_code == 400 and resp.json()["code"] == "VALIDATION_ERROR"
        assert not fake_stripe
        ok = checkout(client, draft_page, package="premium", consent_ai=True)
        assert ok.status_code == 200
        assert Payment.objects.get().consent_ai is True
        assert fake_stripe[0]["line_items"][0]["price"] == "price_prem"

    def test_bad_package(self, owner, draft_page, fake_stripe):
        resp = checkout(auth(APIClient(), owner), draft_page, package="gold")
        assert resp.status_code == 400 and resp.json()["code"] == "VALIDATION_ERROR"

    def test_state_rules(self, owner, draft_page, active_page, fake_stripe):
        client = auth(APIClient(), owner)
        resp = checkout(client, active_page, package="standard")
        assert resp.status_code == 400 and resp.json()["code"] == "INVALID_STATE"
        draft_page.is_paid = True
        draft_page.save()
        resp = checkout(client, draft_page, package="standard")
        assert resp.status_code == 409 and resp.json()["code"] == "ALREADY_PAID"

    def test_unconfigured_503(self, owner, draft_page, settings):
        settings.STRIPE_SECRET_KEY = ""
        resp = checkout(auth(APIClient(), owner), draft_page, package="standard")
        assert resp.status_code == 503 and resp.json() == {
            "success": False, "error": "Payments are temporarily unavailable.",
            "code": "PAYMENTS_UNAVAILABLE",
        }

    def test_stripe_error_503(self, owner, draft_page, monkeypatch):
        def boom(**kwargs):
            raise stripe.APIConnectionError("down")

        monkeypatch.setattr(stripe.checkout.Session, "create", boom)
        resp = checkout(auth(APIClient(), owner), draft_page, package="standard")
        assert resp.status_code == 503 and resp.json()["code"] == "PAYMENTS_UNAVAILABLE"
        assert not Payment.objects.exists()


class TestWebhook:
    @pytest.fixture
    def session(self, owner, draft_page, fake_stripe):
        checkout(auth(APIClient(), owner), draft_page, package="standard")
        return draft_page

    def test_bad_signature_400(self, session):
        assert send_event("checkout.session.completed", paid_session(), secret="other").status_code == 400
        resp = send_event("checkout.session.completed", paid_session(), header="t=1,v1=bad")
        assert resp.status_code == 400 and resp.json()["code"] == "INVALID_SIGNATURE"
        assert send_event("checkout.session.completed", paid_session(), header="").status_code == 400
        assert Payment.objects.get().status == "pending"

    def test_no_secret_configured(self, session, settings):
        settings.STRIPE_WEBHOOK_SECRET = ""
        assert send_event("checkout.session.completed", paid_session()).status_code == 503

    def test_no_auth_or_csrf_needed(self, session):
        client = APIClient(enforce_csrf_checks=True)
        payload = b"{}"
        resp = client.post(WEBHOOK, data=payload, content_type="application/json",
                           HTTP_STRIPE_SIGNATURE=sign(payload))
        assert resp.status_code == 200

    def test_paid_standard(self, session):
        resp = send_event("checkout.session.completed", paid_session())
        assert resp.status_code == 200 and resp.json() == {"success": True, "data": None}
        session.refresh_from_db()
        pay = Payment.objects.get()
        assert pay.status == "paid" and pay.stripe_payment_intent_id == "pi_1"
        assert session.is_paid and session.package_type == "standard" and session.paid_at
        assert session.state == "moderation"
        assert session.portrait_animation_status == "none"
        assert len(mail.outbox) == 1 and "payment" in mail.outbox[0].subject.lower()
        assert mail.outbox[0].to == ["owner@test.com"]
        assert AuditLog.objects.filter(action="payment.paid", target_id=str(pay.pk)).count() == 1

    def test_paid_premium_sets_pending_portrait(self, owner, draft_page, fake_stripe):
        checkout(auth(APIClient(), owner), draft_page, package="premium", consent_ai=True)
        send_event("checkout.session.completed", paid_session())
        draft_page.refresh_from_db()
        assert draft_page.package_type == "premium"
        assert draft_page.portrait_animation_status == "pending"

    def test_idempotent(self, session):
        for _ in range(3):
            assert send_event("checkout.session.completed", paid_session()).status_code == 200
        assert len(mail.outbox) == 1
        assert AuditLog.objects.filter(action="payment.paid").count() == 1
        assert Payment.objects.count() == 1

    def test_unpaid_completed_ignored_then_async_succeeded(self, session):
        send_event("checkout.session.completed", {"id": "cs_test_1", "payment_status": "unpaid"})
        session.refresh_from_db()
        assert not session.is_paid and Payment.objects.get().status == "pending"
        send_event("checkout.session.async_payment_succeeded", paid_session())
        session.refresh_from_db()
        assert session.is_paid and session.state == "moderation"

    def test_async_failed_and_expired(self, session):
        send_event("checkout.session.async_payment_failed", {"id": "cs_test_1"})
        pay = Payment.objects.get()
        assert pay.status == "failed"
        pay.status = "pending"
        pay.save()
        send_event("checkout.session.expired", {"id": "cs_test_1"})
        pay.refresh_from_db()
        assert pay.status == "expired"
        session.refresh_from_db()
        assert not session.is_paid and session.state == "draft"
        assert AuditLog.objects.filter(action="payment.expired").exists()

    def test_expired_does_not_undo_paid(self, session):
        send_event("checkout.session.completed", paid_session())
        send_event("checkout.session.expired", {"id": "cs_test_1"})
        assert Payment.objects.get().status == "paid"

    def test_refund_keeps_page(self, session):
        send_event("checkout.session.completed", paid_session())
        resp = send_event("charge.refunded", {"id": "ch_1", "payment_intent": "pi_1", "refunded": True})
        assert resp.status_code == 200
        assert Payment.objects.get().status == "refunded"
        session.refresh_from_db()
        assert session.is_paid and session.state == "moderation"
        assert AuditLog.objects.filter(action="payment.refunded").count() == 1
        send_event("charge.refunded", {"id": "ch_1", "payment_intent": "pi_1", "refunded": True})
        assert AuditLog.objects.filter(action="payment.refunded").count() == 1

    def test_unknown_session_and_event_ignored(self, db):
        assert send_event("checkout.session.completed", paid_session("cs_unknown")).status_code == 200
        assert send_event("customer.created", {"id": "x"}).status_code == 200

    def test_email_failure_does_not_break(self, session, monkeypatch):
        def boom(*args, **kwargs):
            raise OSError("smtp down")

        monkeypatch.setattr("apps.payments.services.send_mail", boom)
        assert send_event("checkout.session.completed", paid_session()).status_code == 200
        session.refresh_from_db()
        assert session.is_paid


class TestSessionStatus:
    @pytest.fixture
    def session(self, owner, draft_page, fake_stripe):
        checkout(auth(APIClient(), owner), draft_page, package="standard")

    def test_roles(self, session, owner, other_owner, admin_user, draft_page):
        path = "/api/v1/payments/session/cs_test_1/"
        assert APIClient().get(path).status_code == 401
        assert auth(APIClient(), other_owner).get(path).status_code == 404
        for user in (owner, admin_user):
            data = auth(APIClient(), user).get(path).json()["data"]
            assert data == {
                "status": "pending", "package": "standard",
                "page": {"slug": draft_page.slug, "state": "draft", "first_name": "D",
                         "last_name": "P"},
            }
        assert auth(APIClient(), owner).get("/api/v1/payments/session/nope/").status_code == 404

    def test_status_follows_webhook(self, session, owner):
        path = "/api/v1/payments/session/cs_test_1/"
        client = auth(APIClient(), owner)
        assert client.get(path).json()["data"]["status"] == "pending"
        send_event("checkout.session.completed", paid_session())
        data = client.get(path).json()["data"]
        assert data["status"] == "paid" and data["page"]["state"] == "moderation"
        send_event("charge.refunded", {"payment_intent": "pi_1", "refunded": True})
        assert client.get(path).json()["data"]["status"] == "refunded"


class TestSubmitGate:
    def test_unpaid_owner_402(self, owner, draft_page):
        resp = auth(APIClient(), owner).post(f"/api/v1/pages/{draft_page.slug}/submit/")
        assert resp.status_code == 402 and resp.json()["code"] == "PAYMENT_REQUIRED"
        draft_page.refresh_from_db()
        assert draft_page.state == "draft"

    def test_admin_exempt(self, admin_user):
        from apps.pages.models import MemorialPage

        page = MemorialPage.objects.create(owner=admin_user, first_name="A", last_name="B")
        resp = auth(APIClient(), admin_user).post(f"/api/v1/pages/{page.slug}/submit/")
        assert resp.status_code == 200

    def test_rejected_paid_page_resubmits_free(self, owner, admin_user, draft_page):
        draft_page.is_paid = True
        draft_page.save()
        draft_page.submit_for_moderation()
        draft_page.reject(admin_user, note="more")
        resp = auth(APIClient(), owner).post(f"/api/v1/pages/{draft_page.slug}/submit/")
        assert resp.status_code == 200 and resp.json()["data"]["state"] == "moderation"

    def test_other_owner_404(self, other_owner, draft_page):
        resp = auth(APIClient(), other_owner).post(f"/api/v1/pages/{draft_page.slug}/submit/")
        assert resp.status_code == 404


class TestModerationQueue:
    def test_lists_every_page_in_moderation(self, owner, admin_user, draft_page, other_owner):
        """Payment gates submit, not review: pre-payment pages edited by their owner
        land in MODERATION unpaid and must still reach an admin."""
        from apps.pages.models import MemorialPage

        legacy = MemorialPage.objects.create(owner=other_owner, first_name="U", last_name="P")
        legacy.submit_for_moderation()  # created before payments existed
        draft_page.is_paid = True
        draft_page.save()
        draft_page.submit_for_moderation()
        admin_page = MemorialPage.objects.create(owner=admin_user, first_name="A", last_name="D")
        admin_page.submit_for_moderation()
        rows = auth(APIClient(), admin_user).get("/api/v1/pages/moderation/").json()["data"]
        slugs = {r["slug"] for r in rows}
        assert slugs == {legacy.slug, draft_page.slug, admin_page.slug}
        assert auth(APIClient(), owner).get("/api/v1/pages/moderation/").status_code == 403
