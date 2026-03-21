"""Standard pagination with consistent response envelope."""
from __future__ import annotations

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardPagination(PageNumberPagination):
    """{ success: true, data: { results, count, next, previous } }."""

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_paginated_response(self, data) -> Response:
        """Wrap paginated data in standard envelope."""
        return Response(
            {
                "success": True,
                "data": {
                    "results": data,
                    "count": self.page.paginator.count,
                    "next": self.get_next_link(),
                    "previous": self.get_previous_link(),
                },
            }
        )
