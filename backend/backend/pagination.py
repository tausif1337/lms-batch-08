"""How long list responses are cut up.

Every list endpoint used to return a plain array, which meant the browser
downloaded every row in the table on every page load. They now come back as

    {"count": 214, "page": 2, "page_size": 10, "total_pages": 22,
     "next": "...?page=3", "previous": "...?page=1", "results": [...]}

`count` is the number of rows *after* filtering, which is what the table
footer counts and what the dashboard tiles read.
"""

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class StandardPagination(PageNumberPagination):
    # Ten rows fits on a laptop screen without scrolling the page.
    page_size = 10

    # ?page_size=25. Capped so that one request cannot ask for the whole
    # table and undo the point of paginating it.
    page_size_query_param = "page_size"
    max_page_size = 200

    def get_paginated_response(self, data):
        # `page` and `total_pages` are not in DRF's default envelope. Without
        # them the frontend would have to parse the `next` URL to work out
        # where it is, which is worse.
        return Response({
            "count": self.page.paginator.count,
            "page": self.page.number,
            "page_size": self.get_page_size(self.request),
            "total_pages": self.page.paginator.num_pages,
            "next": self.get_next_link(),
            "previous": self.get_previous_link(),
            "results": data,
        })
