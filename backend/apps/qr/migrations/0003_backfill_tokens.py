"""Give every existing QR a token, mark it legacy and render a NEW image for /q/<token>.

Old image files are kept (printed codes in the wild may still point at them / the web link).
"""
import secrets

from django.conf import settings
from django.core.files.base import ContentFile
from django.db import migrations


def backfill(apps, schema_editor) -> None:
    """Assign tokens and generate new token-based QR images."""
    from apps.qr.utils import generate_qr_image

    QRCode = apps.get_model("qr", "QRCode")
    base = settings.FRONTEND_URL.rstrip("/")
    for qr in QRCode.objects.all():
        token = secrets.token_urlsafe(16)
        while QRCode.objects.filter(token=token).exists():
            token = secrets.token_urlsafe(16)
        qr.token = token
        qr.legacy_link_qr = True
        png = generate_qr_image(f"{base}/q/{token}")
        # New, unguessable file name; the previous file stays on disk untouched.
        qr.image.save(f"qr-{secrets.token_hex(8)}.png", ContentFile(png), save=False)
        qr.save(update_fields=["token", "legacy_link_qr", "image"])


class Migration(migrations.Migration):

    dependencies = [
        ("qr", "0002_qrcode_two_key_fields"),
    ]

    operations = [
        migrations.RunPython(backfill, migrations.RunPython.noop),
    ]
