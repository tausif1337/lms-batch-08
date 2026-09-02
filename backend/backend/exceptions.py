"""Turn database-level refusals into answers the frontend can show.

Without this a ProtectedError escapes as a 500 and the page says nothing
useful. The models deliberately refuse to delete a row other rows depend on
(see the PROTECT foreign keys), so that refusal needs a real reply.
"""

from django.db.models import ProtectedError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler


def _describe(protected_objects):
    """"3 lessons, 1 assignment" — what is standing in the way."""
    counts = {}
    for obj in protected_objects:
        name = obj._meta.verbose_name
        counts[name] = counts.get(name, 0) + 1

    parts = [
        f"{count} {name}" if count == 1 else f"{count} {name}s"
        for name, count in sorted(counts.items())
    ]

    if len(parts) == 1:
        return parts[0]
    return f"{', '.join(parts[:-1])} and {parts[-1]}"


def exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    if response is not None:
        return response

    if isinstance(exc, ProtectedError):
        blockers = list(exc.protected_objects)
        verb = "depends" if len(blockers) == 1 else "depend"
        return Response(
            {
                "detail": (
                    f"This cannot be deleted while {_describe(blockers)} "
                    f"still {verb} on it. Remove those first."
                )
            },
            status=status.HTTP_409_CONFLICT,
        )

    return None
