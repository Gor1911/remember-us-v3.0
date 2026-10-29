"""Custom exception handler — wraps all errors in standard response format."""
from __future__ import annotations

from typing import Any

from django.core.exceptions import ValidationError as DjangoValidationError
from django.http import Http404
from rest_framework import exceptions, status
from rest_framework.response import Response
from rest_framework.views import exception_handler

_CODES: dict[type[Exception], str] = {
    exceptions.ValidationError: "VALIDATION_ERROR",
    exceptions.Throttled: "RATE_LIMITED",
    exceptions.NotAuthenticated: "NOT_AUTHENTICATED",
    exceptions.AuthenticationFailed: "AUTHENTICATION_FAILED",
    exceptions.PermissionDenied: "FORBIDDEN",
    exceptions.NotFound: "NOT_FOUND",
    exceptions.MethodNotAllowed: "METHOD_NOT_ALLOWED",
    exceptions.ParseError: "PARSE_ERROR",
}


def _flatten(detail: Any) -> str:
    """Flatten DRF error payloads (dict/list/str) to one readable string."""
    if isinstance(detail, dict):
        if "detail" in detail:
            return str(detail["detail"])
        return "; ".join(f"{field}: {_flatten(errors)}" for field, errors in detail.items())
    if isinstance(detail, list | tuple):
        return ", ".join(_flatten(e) for e in detail)
    return str(detail)


def custom_exception_handler(exc: Exception, context: dict) -> Response | None:
    """Return { success: false, error: "...", code: "ERROR_CODE" } on errors.

    Django ValidationError (raised by model state transitions) maps to
    400 INVALID_STATE.
    """
    if isinstance(exc, DjangoValidationError):
        return Response(
            {"success": False, "error": " ".join(exc.messages), "code": "INVALID_STATE"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    response = exception_handler(exc, context)
    if response is None:
        return None

    code = "NOT_FOUND" if isinstance(exc, Http404) else None
    if code is None:
        code = next((c for cls, c in _CODES.items() if isinstance(exc, cls)), None)
    if code is None:
        code = (getattr(exc, "default_code", None) or "error").upper()

    response.data = {"success": False, "error": _flatten(response.data), "code": code}
    return response
