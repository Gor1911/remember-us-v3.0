"""Make token required + unique with a generated default."""
import apps.qr.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("qr", "0003_backfill_tokens"),
    ]

    operations = [
        migrations.AlterField(
            model_name="qrcode",
            name="token",
            field=models.CharField(
                default=apps.qr.models.generate_qr_token,
                editable=False,
                help_text="Secret key engraved in the QR (/q/<token>); independent from the page slug.",
                max_length=64,
                unique=True,
            ),
        ),
    ]
