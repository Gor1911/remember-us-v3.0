"""Add token / is_active / legacy flag (token is nullable until backfilled)."""
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("qr", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="qrcode",
            name="token",
            field=models.CharField(max_length=64, null=True, editable=False),
        ),
        migrations.AddField(
            model_name="qrcode",
            name="is_active",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="qrcode",
            name="legacy_link_qr",
            field=models.BooleanField(
                default=False,
                help_text="Created before two-key access: a printed code may encode the web link.",
            ),
        ),
    ]
