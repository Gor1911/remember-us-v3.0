"""API URL routing — all under /api/v1/."""
from __future__ import annotations

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.payments.views import PaymentViewSet, webhook_view
from apps.reports.views import ReportViewSet

from .page_actions import PageAccessViewSet, PageAdminViewSet, QRResolveViewSet
from .views import AuthViewSet, MediaFileViewSet, MemorialPageViewSet


class ThrottledTokenObtainPairView(TokenObtainPairView):
    """Token obtain endpoint limited by the `auth` throttle scope."""

    throttle_scope = "auth"


class ThrottledTokenRefreshView(TokenRefreshView):
    """Token refresh endpoint limited by the `auth` throttle scope."""

    throttle_scope = "auth"


# Auth
auth_register = AuthViewSet.as_view({"post": "register"}, throttle_scope="auth")
auth_password_reset = AuthViewSet.as_view({"post": "password_reset"}, throttle_scope="auth")
auth_password_reset_confirm = AuthViewSet.as_view(
    {"post": "password_reset_confirm"}, throttle_scope="auth"
)
auth_me = AuthViewSet.as_view({"get": "me"})
auth_me_delete = AuthViewSet.as_view({"post": "delete_account"}, throttle_scope="auth")

# Memorial Pages
page_list_create = MemorialPageViewSet.as_view({"get": "list", "post": "create"})
page_detail = MemorialPageViewSet.as_view(
    {"get": "retrieve", "patch": "update", "delete": "destroy"}
)
page_submit = MemorialPageViewSet.as_view({"post": "submit"})
page_approve = MemorialPageViewSet.as_view({"post": "approve"})
page_reject = MemorialPageViewSet.as_view({"post": "reject"})
page_export = MemorialPageViewSet.as_view({"get": "export"})
page_scan = MemorialPageViewSet.as_view({"get": "scan"}, throttle_scope="scan")
page_moderation = MemorialPageViewSet.as_view({"get": "list_moderation"})

# Media
media_list_create = MediaFileViewSet.as_view({"get": "list", "post": "create"})
media_delete = MediaFileViewSet.as_view({"delete": "destroy"})

# Access (link + QR)
page_access = PageAccessViewSet.as_view({"get": "access"})
page_rotate_link = PageAccessViewSet.as_view({"post": "rotate_link"}, throttle_scope="auth")
qr_generate = PageAccessViewSet.as_view({"post": "qr_generate"})
qr_disable = PageAccessViewSet.as_view({"post": "qr_disable"})
qr_enable = PageAccessViewSet.as_view({"post": "qr_enable"})
qr_rotate = PageAccessViewSet.as_view({"post": "qr_rotate"})
qr_download = PageAccessViewSet.as_view({"get": "qr_download"})
qr_resolve = QRResolveViewSet.as_view({"get": "resolve"}, throttle_scope="scan")

# Admin page actions
page_hide = PageAdminViewSet.as_view({"post": "hide"})
page_unhide = PageAdminViewSet.as_view({"post": "unhide"})
living_portrait = PageAdminViewSet.as_view(
    {"post": "living_portrait_upload", "delete": "living_portrait_delete"}
)
living_portrait_status = PageAdminViewSet.as_view({"post": "living_portrait_status"})

# Payments
payment_plans = PaymentViewSet.as_view({"get": "plans"})
page_checkout = PaymentViewSet.as_view({"post": "checkout"})
payment_session = PaymentViewSet.as_view({"get": "session_status"})

# Reports
report_create = ReportViewSet.as_view({"post": "create"}, throttle_scope="report")
report_list = ReportViewSet.as_view({"get": "list"})
report_resolve = ReportViewSet.as_view({"post": "resolve"})

urlpatterns = [
    # --- Auth ---
    path("auth/register/", auth_register, name="auth-register"),
    path("auth/password-reset/", auth_password_reset, name="auth-password-reset"),
    path(
        "auth/password-reset/confirm/",
        auth_password_reset_confirm,
        name="auth-password-reset-confirm",
    ),
    path("auth/me/", auth_me, name="auth-me"),
    path("auth/me/delete/", auth_me_delete, name="auth-me-delete"),
    path("auth/token/", ThrottledTokenObtainPairView.as_view(), name="token-obtain"),
    path("auth/token/refresh/", ThrottledTokenRefreshView.as_view(), name="token-refresh"),

    # --- Memorial Pages ---
    path("pages/", page_list_create, name="page-list"),
    path("pages/moderation/", page_moderation, name="page-moderation"),
    path("pages/<str:slug>/", page_detail, name="page-detail"),
    path("pages/<str:slug>/submit/", page_submit, name="page-submit"),
    path("pages/<str:slug>/approve/", page_approve, name="page-approve"),
    path("pages/<str:slug>/reject/", page_reject, name="page-reject"),
    path("pages/<str:slug>/export/", page_export, name="page-export"),
    path("pages/<str:slug>/scan/", page_scan, name="page-scan"),

    # --- Media ---
    path("pages/<str:page_slug>/media/", media_list_create, name="media-list"),
    path("pages/<str:page_slug>/media/<uuid:pk>/", media_delete, name="media-delete"),

    path("pages/<str:slug>/access/", page_access, name="page-access"),
    path("pages/<str:slug>/rotate-link/", page_rotate_link, name="page-rotate-link"),
    path("pages/<str:slug>/hide/", page_hide, name="page-hide"),
    path("pages/<str:slug>/unhide/", page_unhide, name="page-unhide"),
    path("pages/<str:slug>/living-portrait/", living_portrait, name="living-portrait"),
    path(
        "pages/<str:slug>/living-portrait/status/",
        living_portrait_status,
        name="living-portrait-status",
    ),
    path("pages/<str:slug>/checkout/", page_checkout, name="page-checkout"),
    path("pages/<str:slug>/reports/", report_create, name="report-create"),

    # --- QR ---
    path("pages/<str:slug>/qr/generate/", qr_generate, name="qr-generate"),
    path("pages/<str:slug>/qr/disable/", qr_disable, name="qr-disable"),
    path("pages/<str:slug>/qr/enable/", qr_enable, name="qr-enable"),
    path("pages/<str:slug>/qr/rotate/", qr_rotate, name="qr-rotate"),
    path("pages/<str:slug>/qr/download/", qr_download, name="qr-download"),
    path("qr/<str:token>/", qr_resolve, name="qr-resolve"),

    # --- Payments ---
    path("payments/plans/", payment_plans, name="payment-plans"),
    path("payments/webhook/", webhook_view, name="payment-webhook"),
    path("payments/session/<str:session_id>/", payment_session, name="payment-session"),

    # --- Reports ---
    path("reports/", report_list, name="report-list"),
    path("reports/<uuid:pk>/resolve/", report_resolve, name="report-resolve"),
]
