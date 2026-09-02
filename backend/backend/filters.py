"""Exact-value and range filtering from the query string.

DRF ships a search filter and an ordering filter but not a field filter, and
`django-filter` is a dependency this project does not have. This is the small
piece that is missing: a view names the filters it accepts, and anything not
on that list is ignored.

    class LessonListCreateView(generics.ListCreateAPIView):
        filter_fields = {
            "course": "course",              # ?course=3
            "title": "title__icontains",     # ?title=intro
        }

The key is the query parameter the caller types; the value is the ORM lookup
it turns into. Ranges are spelled out the same way, with `__gte` / `__lte`,
so `?due_from=2026-01-01` becomes `due_date__gte`.

Values arrive as strings and are coerced to match the model field, so
`?is_active=false` filters on False and not on the non-empty string "false",
which would have matched every row. A value that cannot be coerced is a 400
naming the parameter, rather than a 500 out of the database driver.
"""

from django.core.exceptions import FieldDoesNotExist, ValidationError as DjangoValidationError
from django.db import models
from rest_framework.exceptions import ValidationError
from rest_framework.filters import BaseFilterBackend

TRUE_WORDS = {"true", "1", "yes", "on"}
FALSE_WORDS = {"false", "0", "no", "off"}


def field_behind(model, lookup):
    """The model field a lookup path points at, or None.

    "due_date__lte" walks to Assignment.due_date and stops, because "lte" is
    a lookup and not a field. "submission__student" hops the relation first.
    """
    field = None

    parts = lookup.split("__")
    for index, part in enumerate(parts):
        try:
            field = model._meta.get_field(part)
        except FieldDoesNotExist:
            # The rest of the path is a lookup (gte, icontains, in), so the
            # field found on the previous pass is the one that matters.
            break

        if field.is_relation and index < len(parts) - 1:
            model = field.related_model

    return field


def coerce(field, raw, param):
    """Turn one query-string value into something the ORM can compare."""
    text = raw.strip()

    try:
        if isinstance(field, models.BooleanField):
            low = text.lower()
            if low in TRUE_WORDS:
                return True
            if low in FALSE_WORDS:
                return False
            raise ValueError("not a true/false value")

        # A foreign key is filtered by the id on the other end.
        if field is not None and field.is_relation:
            return int(text)

        if isinstance(field, models.IntegerField):
            return int(text)

        if isinstance(field, (models.FloatField, models.DecimalField)):
            return float(text)

        if isinstance(field, (models.DateTimeField, models.DateField)):
            # Django parses ISO dates itself and complains if it cannot, so
            # the string is passed through and the complaint is caught below.
            return text

    except (TypeError, ValueError):
        raise ValidationError({param: f"'{raw}' is not a valid value for this filter."})

    return text


class FieldFilterBackend(BaseFilterBackend):
    """Applies the `filter_fields` a view declares. No declaration, no filter."""

    def filter_queryset(self, request, queryset, view):
        allowed = getattr(view, "filter_fields", None) or {}

        conditions = {}
        for param, lookup in allowed.items():
            raw = request.query_params.get(param)

            # A missing parameter and an empty one mean the same thing: the
            # dropdown is on "Any". Filtering on "" would match nothing.
            if raw is None or not raw.strip():
                continue

            field = field_behind(queryset.model, lookup)
            conditions[lookup] = coerce(field, raw, param)

        if not conditions:
            return queryset

        try:
            return queryset.filter(**conditions)
        except (DjangoValidationError, ValueError, TypeError):
            # An unparseable date lands here rather than in coerce().
            raise ValidationError("One of the filters was given a value it cannot use.")

    def get_schema_operation_parameters(self, view):
        return [
            {
                "name": param,
                "required": False,
                "in": "query",
                "description": f"Filter on {lookup}.",
                "schema": {"type": "string"},
            }
            for param, lookup in (getattr(view, "filter_fields", None) or {}).items()
        ]
