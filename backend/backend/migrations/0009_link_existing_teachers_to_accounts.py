"""Give the Teacher rows that predate Teacher.user an account where we can.

The same rule as 0006 did for students: match by email, and only when exactly
one teacher account has that address and exactly one Teacher row does.
Anything ambiguous is left for an admin to sort out by hand in /admin/,
because guessing wrong here would hand one teacher control of another's
courses and the marks on them.

A teacher left unlinked keeps their role and can still read everything; they
just cannot change course material until an admin joins the two up.
"""

from django.db import migrations


def link_by_email(apps, schema_editor):
    User = apps.get_model("auth", "User")
    Profile = apps.get_model("backend", "Profile")
    Teacher = apps.get_model("backend", "Teacher")

    teacher_user_ids = list(
        Profile.objects.filter(role="teacher").values_list("user_id", flat=True)
    )

    for user in User.objects.filter(id__in=teacher_user_ids).exclude(email=""):
        if Teacher.objects.filter(user=user).exists():
            continue

        candidates = Teacher.objects.filter(email__iexact=user.email, user__isnull=True)
        if candidates.count() != 1:
            continue

        # Two accounts sharing an email would each claim the same row.
        if User.objects.filter(id__in=teacher_user_ids, email__iexact=user.email).count() != 1:
            continue

        record = candidates.first()
        record.user = user
        record.save(update_fields=["user"])


def unlink(apps, schema_editor):
    Teacher = apps.get_model("backend", "Teacher")
    Teacher.objects.update(user=None)


class Migration(migrations.Migration):

    dependencies = [
        ("backend", "0008_teacher_user_alter_teacher_subject"),
    ]

    operations = [
        migrations.RunPython(link_by_email, unlink),
    ]
