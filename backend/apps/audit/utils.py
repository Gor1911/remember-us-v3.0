"""Helper to write audit entries."""
from __future__ import annotations

import json
import logging
from typing import Any

from django.db import models

from .models import AuditLog

logger = logging.getLogger(__name__)

# Metadata keys containing any of these fragments are dropped (no secrets in the log).
_FORBIDDEN_FRAGMENTS = ("token", "password", "secret", "signature", "url", "slug")


def _clean(metadata: dict[str, Any]) -> dict[str, Any]:
    """Drop secret-looking keys and make the rest JSON-safe."""
    kept = {
        k: v
        for k, v in metadata.items()
        if not any(f in k.lower() for f in _FORBIDDEN_FRAGMENTS)
    }
    return json.loads(json.dumps(kept, default=str))


def log_action(actor: Any, action: str, target: models.Model, **metadata: Any) -> AuditLog | None:
    """Record `action` by `actor` (None = system) on `target`.

    Never raises: a logging failure must not undo or break the audited action.
    """
    try:
        return AuditLog.objects.create(
            actor=actor if getattr(actor, "pk", None) else None,
            action=action,
            target_type=target._meta.model_name,
            target_id=str(target.pk),
            metadata=_clean(metadata),
        )
    except Exception:  # noqa: BLE001
        logger.exception("Audit log write failed for action %s", action)
        return None
