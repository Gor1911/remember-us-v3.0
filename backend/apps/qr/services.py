"""QR operations shared by API views: create, regenerate image, rotate token, render SVG."""
from __future__ import annotations

import io
import secrets

from django.core.files.base import ContentFile

from apps.pages.models import MemorialPage

from .models import QRCode, generate_qr_token
from .utils import generate_qr_image


def get_qr(page: MemorialPage) -> QRCode | None:
    """Return the page's QR (or None)."""
    return QRCode.objects.filter(page=page).first()


def render_image(qr: QRCode) -> None:
    """Render a NEW PNG file encoding the token URL (old file is kept on disk)."""
    png = generate_qr_image(qr.target_url)
    qr.image.save(f"qr-{secrets.token_hex(8)}.png", ContentFile(png), save=False)


def create_or_get_qr(page: MemorialPage) -> tuple[QRCode, bool]:
    """Create the QR if missing (with image); otherwise make sure the image exists."""
    qr = get_qr(page)
    created = qr is None
    if qr is None:
        qr = QRCode(page=page)
    if created or not qr.image:
        render_image(qr)
        qr.save()
    return qr, created


def rotate_token(qr: QRCode) -> QRCode:
    """Issue a new token and image. Printed/engraved codes with the old token stop working."""
    qr.token = generate_qr_token()
    qr.legacy_link_qr = False
    qr.is_active = True
    render_image(qr)
    qr.save()
    return qr


def render_svg(url: str) -> bytes:
    """Render the QR as SVG (qrcode's path-based SVG factory)."""
    import qrcode
    from qrcode.image.svg import SvgPathImage

    code = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, border=4)
    code.add_data(url)
    code.make(fit=True)
    buffer = io.BytesIO()
    code.make_image(image_factory=SvgPathImage).save(buffer)
    return buffer.getvalue()
