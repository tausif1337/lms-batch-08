"""Give the Student rows that predate Student.user an account where we can.

Matching is by email, and only when exactly one student account has that
address and exactly one Student row does — anything ambiguous is left alone
for an admin to sort out by hand in /admin/, because guessing wrong here would
hand one student another's marks.
"""

from django.db import migrations


def link_by_email(apps, schema_editor):
    User = apps.get_model("auth", "User")
    Profile = apps.get_model("backend", "Profile")
    Student = apps.get_model("backend", "Student")

    student_user_ids = Profile.objects.filter(role="student").values_list("user_id", flat=True)

    for user in User.objects.filter(id__in=list(student_user_ids)).exclude(email=""):
        if Student.objects.filter(user=user).exists():
            continue

        candidates = Student.objects.filter(email__iexact=user.email, user__isnull=True)
        if candidates.count() != 1:
            continue

        # Two accounts sharing an email would each claim the same row.
        if User.objects.filter(id__in=list(student_user_ids), email__iexact=user.email).count() != 1:
            continue

        record = candidates.first()
        record.user = user
        record.save(update_fields=["user"])


def unlink(apps, schema_editor):
    Student = apps.get_model("backend", "Student")
    Student.objects.update(user=None)


class Migration(migrations.Migration):

    dependencies = [
        ("backend", "0005_student_user"),
    ]

    operations = [
        migrations.RunPython(link_by_email, unlink),
    ]
