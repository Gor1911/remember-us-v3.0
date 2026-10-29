"""Reports: public create, admin list/resolve."""
from __future__ import annotations

from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone
from rest_framework import serializers, status, viewsets
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response

from apps.api.permissions import IsAdmin
from apps.api.views import success
from apps.audit.utils import log_action
from apps.pages.models import MemorialPage

from .models import Report, ReportCategory, ReportStatus


class ReportCreateSerializer(serializers.Serializer):
    """Public complaint body."""

    category = serializers.ChoiceField(choices=ReportCategory.choices)
    message = serializers.CharField(min_length=10, max_length=2000)
    contact_email = serializers.EmailField(required=False, allow_blank=True, default="")


class ReportResolveSerializer(serializers.Serializer):
    """Admin decision on a report."""

    action = serializers.ChoiceField(choices=["dismiss", "resolve", "hide_page"])
    note = serializers.CharField(required=False, allow_blank=True, max_length=2000, default="")


def serialize_report(report: Report) -> dict:
    """Report representation for admins."""
    page = report.page
    return {
        "id": str(report.id),
        "category": report.category,
        "message": report.message,
        "contact_email": report.contact_email,
        "status": report.status,
        "created_at": report.created_at,
        "resolution_note": report.resolution_note,
        "page": {
            "slug": page.slug,
            "first_name": page.first_name,
            "last_name": page.last_name,
            "state": page.state,
            "hidden": page.is_hidden,
        },
    }


class ReportViewSet(viewsets.ViewSet):
    """Complaints about memorial pages."""

    throttle_scope: str | None = None  # `report` on create, set in urls.py

    def get_permissions(self) -> list:
        """Anyone may file a report; reading/resolving is admin-only."""
        return [AllowAny()] if self.action == "create" else [IsAdmin()]

    def create(self, request: Request, slug: str | None = None) -> Response:
        """File a report against an ACTIVE, visible page."""
        page = MemorialPage.objects.filter(slug=slug).first()
        if page is None or not page.is_publicly_visible:
            raise NotFound("Page not found.")
        serializer = ReportCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        report = Report.objects.create(page=page, **serializer.validated_data)
        return success({"id": str(report.id)}, status_code=status.HTTP_201_CREATED)

    def list(self, request: Request) -> Response:
        """Reports filtered by `?status=open|resolved|dismissed|all` (default open)."""
        wanted = request.query_params.get("status", "open")
        if wanted not in {*ReportStatus.values, "all"}:
            raise ValidationError({"status": "Use open, resolved, dismissed or all."})
        qs = Report.objects.select_related("page")
        if wanted != "all":
            qs = qs.filter(status=wanted)
        return success([serialize_report(r) for r in qs])

    def resolve(self, request: Request, pk: str | None = None) -> Response:
        """Dismiss, resolve, or resolve by hiding the page."""
        report = Report.objects.select_related("page").filter(pk=pk).first()
        if report is None:
            raise NotFound("Report not found.")
        serializer = ReportResolveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        action = serializer.validated_data["action"]
        note = serializer.validated_data["note"]
        if report.status != ReportStatus.OPEN:
            raise DjangoValidationError("This report is already closed.")

        if action == "hide_page":
            report.page.hide(note or f"Reported: {report.category}")
            log_action(request.user, "page.hide", report.page, reason=report.page.hidden_reason,
                       report_id=str(report.pk))
        report.status = ReportStatus.DISMISSED if action == "dismiss" else ReportStatus.RESOLVED
        report.resolution_note = note
        report.resolved_by = request.user
        report.resolved_at = timezone.now()
        report.save()
        log_action(request.user, "report.resolve", report, decision=action)
        return success(serialize_report(report))
