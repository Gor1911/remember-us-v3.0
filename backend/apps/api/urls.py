"""API URL routing — all under /api/v1/."""
from __future__ import annotations

from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import AuthViewSet, MediaFileViewSet, MemorialPageViewSet, QRCodeViewSet

# Auth
auth_register = AuthViewSet.as_view({"post": "register"})
auth_me = AuthViewSet.as_view({"get": "me"})

# Memorial Pages
page_list_create = MemorialPageViewSet.as_view({"get": "list", "post": "create"})
page_detail = MemorialPageViewSet.as_view(
    {"get": "retrieve", "patch": "update", "delete": "destroy"}
)
page_submit = MemorialPageViewSet.as_view({"post": "submit"})
page_approve = MemorialPageViewSet.as_view({"post": "approve"})
page_reject = MemorialPageViewSet.as_view({"post": "reject"})
page_scan = MemorialPageViewSet.as_view({"get": "scan"})
page_moderation = MemorialPageViewSet.as_view({"get": "list_moderation"})

# Media
media_list_create = MediaFileViewSet.as_view({"get": "list", "post": "create"})
media_delete = MediaFileViewSet.as_view({"delete": "destroy"})

# QR
qr_generate = QRCodeViewSet.as_view({"post": "generate"})

urlpatterns = [
    # --- Auth ---
    path("auth/register/", auth_register, name="auth-register"),
    path("auth/me/", auth_me, name="auth-me"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token-obtain"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),

    # --- Memorial Pages ---
    path("pages/", page_list_create, name="page-list"),
    path("pages/moderation/", page_moderation, name="page-moderation"),
    path("pages/<str:slug>/", page_detail, name="page-detail"),
    path("pages/<str:slug>/submit/", page_submit, name="page-submit"),
    path("pages/<str:slug>/approve/", page_approve, name="page-approve"),
    path("pages/<str:slug>/reject/", page_reject, name="page-reject"),
    path("pages/<str:slug>/scan/", page_scan, name="page-scan"),

    # --- Media ---
    path("pages/<str:page_slug>/media/", media_list_create, name="media-list"),
    path("pages/<str:page_slug>/media/<uuid:pk>/", media_delete, name="media-delete"),

    # --- QR ---
    path("pages/<str:page_slug>/qr/generate/", qr_generate, name="qr-generate"),
]
