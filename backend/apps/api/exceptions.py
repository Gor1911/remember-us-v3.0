"""Custom exception handler — wraps all errors in standard response format."""
from __future__ import annotations

from rest_framework.response import Response
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context) -> Response | None:
    """Return { success: false, error: "...", code: "ERROR_CODE" } on errors."""
    response = exception_handler(exc, context)

    if response is not None:
        code = "ERROR"
        detail = response.data

        # Flatten DRF error dicts to a readable string
        if isinstance(detail, dict):
            # DRF validation errors
            if "detail" in detail:
                message = str(detail["detail"])
                code = getattr(detail["detail"], "code", "ERROR").upper()
            else:
                message = "; ".join(
                    f"{field}: {', '.join(str(e) for e in errors) if isinstance(errors, list) else errors}"
                    for field, errors in detail.items()
                )
        elif isinstance(detail, list):
            message = " ".join(str(e) for e in detail)
        else:
            message = str(detail)

        response.data = {
            "success": False,
            "error": message,
            "code": code,
        }

    return response
