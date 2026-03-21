"""DRF permission classes for role-based access control."""
from __future__ import annotations

from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.request import Request
from rest_framework.views import View

from apps.users.models import UserRole


class IsOwner(BasePermission):
    """Allow access only to users with Owner role."""

    def has_permission(self, request: Request, view: View) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.OWNER
        )


class IsAdmin(BasePermission):
    """Allow access only to users with Admin role."""

    def has_permission(self, request: Request, view: View) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == UserRole.ADMIN
        )


class IsAdminOrCurator(BasePermission):
    """Allow access to Admin and Curator roles."""

    def has_permission(self, request: Request, view: View) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in [UserRole.ADMIN, UserRole.CURATOR]
        )


class IsOwnerOrAdmin(BasePermission):
    """Allow access to Owner or Admin roles."""

    def has_permission(self, request: Request, view: View) -> bool:
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in [UserRole.OWNER, UserRole.ADMIN]
        )


class IsPageOwner(BasePermission):
    """Object-level: allow only the page's owner to modify it."""

    def has_object_permission(self, request: Request, view: View, obj) -> bool:
        if request.user.role == UserRole.ADMIN:
            return True
        return obj.owner == request.user


class CanAccessMemorialPage(BasePermission):
    """Allow authenticated users to read ACTIVE pages; owners see all states."""

    message = "This memorial page is not publicly available."

    def has_object_permission(self, request: Request, view: View, obj) -> bool:
        from apps.pages.models import PageState

        # Admins see everything
        if request.user.is_authenticated and request.user.role == UserRole.ADMIN:
            return True

        # Owners see their own pages in any state
        if request.user.is_authenticated and obj.owner == request.user:
            return True

        # Everyone else (including unauthenticated guests) sees only ACTIVE pages
        return obj.state == PageState.ACTIVE
