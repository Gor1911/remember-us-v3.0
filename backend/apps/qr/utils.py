"""QR code generation and hashed slug utilities."""
from __future__ import annotations

import io
import secrets
import string

from django.conf import settings


_ALPHABET = string.ascii_lowercase + string.digits  # no uppercase, no symbols


def generate_slug(length: int | None = None) -> str:
    """Generate a cryptographically random slug (e.g. 'sh2-98xz-k1m4').

    Format: xxxx-xxxx-xxxx (groups of 4 separated by dashes).
    Total chars = length (default from settings, min 10).
    """
    length = length or getattr(settings, "QR_HASH_LENGTH", 12)
    raw = "".join(secrets.choice(_ALPHABET) for _ in range(length))
    # Split into groups of 4 with dashes
    groups = [raw[i : i + 4] for i in range(0, length, 4)]
    return "-".join(groups)


def is_slug_unique(slug: str) -> bool:
    """Check that the slug doesn't already exist in MemorialPage."""
    from apps.pages.models import MemorialPage

    return not MemorialPage.all_objects.filter(slug=slug).exists()


def generate_unique_slug(max_attempts: int = 10) -> str:
    """Generate a guaranteed-unique slug with collision detection."""
    for _ in range(max_attempts):
        slug = generate_slug()
        if is_slug_unique(slug):
            return slug
    raise RuntimeError("Could not generate unique slug after max attempts.")


def generate_qr_image(url: str) -> bytes:
    """Generate a QR code PNG for the given URL.

    Returns raw PNG bytes suitable for saving to a FileField or S3.
    """
    import qrcode
    from qrcode.image.styledpil import StyledPilImage
    from qrcode.image.styles.moduledrawers import RoundedModuleDrawer

    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(
        image_factory=StyledPilImage,
        module_drawer=RoundedModuleDrawer(),
        back_color=(13, 17, 23),   # #0D1117 — project background
        fill_color=(255, 255, 255),
    )

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()
