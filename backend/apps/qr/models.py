"""QR code model — links to memorial pages, tracks scans."""
from __future__ import annotations

from django.db import models

from apps.core.models import BaseModel


class QRCode(BaseModel):
    """QR code generated for a memorial page."""

    page = models.OneToOneField(
        "pages.MemorialPage",
        on_delete=models.CASCADE,
        related_name="qr_code",
    )
    image = models.FileField(
        upload_to="qr/",
        blank=True,
        help_text="Generated QR code PNG",
    )
    scan_count = models.PositiveIntegerField(default=0)
    last_scanned_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "QR Code"
        verbose_name_plural = "QR Codes"

    def __str__(self) -> str:
        return f"QR for /{self.page.slug}"

    def record_scan(self) -> None:
        """Increment scan counter and update last_scanned_at."""
        from django.utils import timezone

        self.scan_count = models.F("scan_count") + 1
        self.last_scanned_at = timezone.now()
        self.save(update_fields=["scan_count", "last_scanned_at"])
        self.refresh_from_db(fields=["scan_count"])


class QRScanLog(models.Model):
    """Audit log for individual QR scans (for analytics)."""

    qr_code = models.ForeignKey(QRCode, on_delete=models.CASCADE, related_name="scan_logs")
    scanned_at = models.DateTimeField(auto_now_add=True, db_index=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, blank=True)
    referrer = models.URLField(blank=True)

    class Meta:
        verbose_name = "QR Scan Log"
        verbose_name_plural = "QR Scan Logs"
        ordering = ["-scanned_at"]
