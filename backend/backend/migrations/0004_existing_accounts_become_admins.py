from django.db import migrations


def make_existing_accounts_admins(apps, schema_editor):
    """Everyone who already had an account keeps full access.

    New accounts default to `student`, but the people who registered before
    roles existed were able to do everything, so locking them out on upgrade
    would be a surprise. Promote them once, here.
    """
    Profile = apps.get_model("backend", "Profile")
    Profile.objects.update(role="admin")


def back_to_student(apps, schema_editor):
    Profile = apps.get_model("backend", "Profile")
    Profile.objects.update(role="student")


class Migration(migrations.Migration):
    dependencies = [
        ("backend", "0003_profile_role"),
    ]

    operations = [
        migrations.RunPython(make_existing_accounts_admins, back_to_student),
    ]
