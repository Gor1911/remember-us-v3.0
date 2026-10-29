"""Assign a fresh unique slug to every page whose slug is blank."""
from __future__ import annotations

from django.db import migrations


def fill_empty_slugs(apps, schema_editor) -> None:
    """Generate unique hashed slugs for pages created without one (admin path)."""
    from apps.qr.utils import generate_slug

    MemorialPage = apps.get_model("pages", "MemorialPage")
    for page in MemorialPage.objects.filter(slug=""):
        slug = generate_slug()
        while MemorialPage.objects.filter(slug=slug).exists():
            slug = generate_slug()
        page.slug = slug
        page.save(update_fields=["slug"])


class Migration(migrations.Migration):

    dependencies = [
        ("pages", "0002_initial"),
    ]

    operations = [
        migrations.RunPython(fill_empty_slugs, migrations.RunPython.noop),
    ]
