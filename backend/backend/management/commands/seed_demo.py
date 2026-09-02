"""Create the demo logins used for manual testing of the LMS.

Development only. The accounts share one well-known password, so running this
against anything but a local database would hand out three working logins to
whoever has read this file.

Re-running is safe: accounts are matched on phone (the login handle) and their
password, role and profile fields are brought back to the values below, so a
demo account that someone has since edited returns to a known state.
"""

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from backend.models import Profile, Student, Teacher

DEFAULT_PASSWORD = "Demo@12345"

DEMO_ACCOUNTS = [
    {
        "username": "demo_admin",
        "phone": "01700000010",
        "role": Profile.ADMIN,
        "email": "demo.admin@example.com",
        "first_name": "Demo",
        "last_name": "Admin",
        "is_staff": True,
        "is_superuser": True,
    },
    {
        "username": "demo_teacher",
        "phone": "01700000011",
        "role": Profile.TEACHER,
        "email": "demo.teacher@example.com",
        "first_name": "Demo",
        "last_name": "Teacher",
        "subject": "Mathematics",
    },
    {
        "username": "demo_student",
        "phone": "01700000012",
        "role": Profile.STUDENT,
        "email": "demo.student@example.com",
        "first_name": "Demo",
        "last_name": "Student",
    },
]


class Command(BaseCommand):
    help = "Create or reset the demo admin/teacher/student logins."

    def add_arguments(self, parser):
        parser.add_argument(
            "--password",
            default=DEFAULT_PASSWORD,
            help=f"Password to set on every demo account (default: {DEFAULT_PASSWORD}).",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        password = options["password"]

        for spec in DEMO_ACCOUNTS:
            user = self._upsert_user(spec, password)
            self._upsert_profile(user, spec)
            self._upsert_role_record(user, spec)

            self.stdout.write(
                self.style.SUCCESS(
                    f"{spec['role']:<7} {spec['phone']}  {password}  ({user.username})"
                )
            )

        self.stdout.write("")
        self.stdout.write("Sign in with the phone number, not the username.")

    def _upsert_user(self, spec, password):
        # The phone is the login handle, so an existing profile on that number
        # decides which account we are refreshing. Falling back to the username
        # covers the first run, before any profile exists.
        profile = Profile.objects.filter(phone=spec["phone"]).select_related("user").first()
        if profile:
            user = profile.user
            if user.username != spec["username"] and User.objects.filter(
                username=spec["username"]
            ).exclude(pk=user.pk).exists():
                raise CommandError(
                    f"Phone {spec['phone']} belongs to '{user.username}', but "
                    f"'{spec['username']}' is a different existing account. "
                    "Sort this out by hand before seeding."
                )
        else:
            user, _ = User.objects.get_or_create(username=spec["username"])

        user.username = spec["username"]
        user.email = spec["email"]
        user.first_name = spec["first_name"]
        user.last_name = spec["last_name"]
        user.is_active = True
        user.is_staff = spec.get("is_staff", False)
        user.is_superuser = spec.get("is_superuser", False)
        user.set_password(password)
        user.save()
        return user

    def _upsert_profile(self, user, spec):
        profile, _ = Profile.objects.get_or_create(
            user=user, defaults={"phone": spec["phone"], "role": spec["role"]}
        )
        profile.phone = spec["phone"]
        profile.role = spec["role"]
        profile.save(update_fields=["phone", "role"])

    def _upsert_role_record(self, user, spec):
        full_name = f"{spec['first_name']} {spec['last_name']}".strip()

        if spec["role"] == Profile.STUDENT:
            # A student login without a Student row cannot hand work in, the
            # same reason registration creates one.
            record, _ = Student.objects.get_or_create(
                user=user,
                defaults={
                    "name": full_name,
                    "email": spec["email"],
                    "enrollment_date": timezone.localdate(),
                },
            )
            record.name = full_name
            record.email = spec["email"]
            record.is_active = True
            record.save(update_fields=["name", "email", "is_active"])

        elif spec["role"] == Profile.TEACHER:
            # A teacher login without a Teacher row owns no courses, so it
            # cannot create or change any. Matched on the account first, then
            # on email, so a run against a database seeded before Teacher.user
            # existed adopts the row already there instead of stacking up a
            # second one beside it.
            record = (
                Teacher.objects.filter(user=user).first()
                or Teacher.objects.filter(email=spec["email"]).first()
            )

            if record is None:
                record = Teacher(email=spec["email"])

            record.user = user
            record.name = full_name
            record.subject = spec["subject"]
            record.is_active = True
            record.save()
