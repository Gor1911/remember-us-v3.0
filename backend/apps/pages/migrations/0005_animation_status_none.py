"""Existing pages have no premium package: Living Portrait status becomes 'none'."""
from django.db import migrations


def to_none(apps, schema_editor) -> None:
    """Reset the old default ('pending') on pages that never bought Premium."""
    MemorialPage = apps.get_model("pages", "MemorialPage")
    MemorialPage._base_manager.filter(package_type="").update(portrait_animation_status="none")


class Migration(migrations.Migration):

    dependencies = [
        ("pages", "0004_p0_2"),
    ]

    operations = [
        migrations.RunPython(to_none, migrations.RunPython.noop),
    ]
