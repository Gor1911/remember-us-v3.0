"""API URL routing — all under /api/v1/."""
from __future__ import annotations

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import AuthViewSet, MediaFileViewSet, MemorialPageViewSet, QRCodeViewSet


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

# QR
qr_generate = QRCodeViewSet.as_view({"post": "generate"})

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

    # --- QR ---
    path("pages/<str:page_slug>/qr/generate/", qr_generate, name="qr-generate"),
]
