"""Fill the database with a realistic amount of realistic-looking data.

    python manage.py seed_data                 # top the database up
    python manage.py seed_data --fresh         # wipe seeded rows first
    python manage.py seed_data --students 400  # ask for a bigger cohort

Running it twice adds nothing the second time. That is worth more than it
sounds: every "does this row exist yet" decision is derived from the ids
involved rather than drawn from a random stream, so a lesson that was skipped
on the first run is skipped on every run, and a student who handed in four of
six assignments still has four of six afterwards. Rows are found by a stable
key first — a person by email, a course by title, a lesson by title within its
course — so nothing is duplicated either.

The three accounts the login page offers in dev mode are guaranteed by this
command, phone and password included, so the buttons on that page always work.
"""

import random
from datetime import timedelta
from zlib import crc32

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from backend.models import (
    Assignment,
    Course,
    Enrollment,
    Lesson,
    Profile,
    Results,
    Student,
    Submission,
    Teacher,
)
from backend.seed_catalog import (
    ASSIGNMENT_BRIEFS,
    COURSE_CATALOG,
    FEEDBACK_BY_BAND,
    FIRST_NAMES,
    LAST_NAMES,
    SUBMISSION_NOTES,
)

# What the dev-only panel on the login page promises. Kept in sync by hand with
# DEMO_ACCOUNTS in frontend/src/pages/Login.jsx.
DEMO_ACCOUNTS = [
    ("demo_admin", "01700000000", "admin1234", Profile.ADMIN, "Demo", "Admin"),
    ("demo_teacher", "01700000001", "teacher1234", Profile.TEACHER, "Demo", "Teacher"),
    ("demo_student", "01700000002", "student1234", Profile.STUDENT, "Demo", "Student"),
]

STAFF_EMAIL_DOMAIN = "ostad.example.com"
STUDENT_EMAIL_DOMAIN = "student.example.com"


def dice(*parts):
    """A stable 0-99 for a set of ids.

    Same inputs, same answer, in this process and the next one — which is what
    makes a second run of this command a no-op. Python's own hash() is salted
    per process and would not do.
    """
    return crc32(":".join(str(p) for p in parts).encode()) % 100


class Command(BaseCommand):
    help = "Populate the LMS with a large, plausible dataset for development."

    def add_arguments(self, parser):
        parser.add_argument(
            "--teachers", type=int, default=26,
            help="How many teacher records to end up with (default 26).",
        )
        parser.add_argument(
            "--students", type=int, default=180,
            help="How many student records to end up with (default 180).",
        )
        parser.add_argument(
            "--fresh", action="store_true",
            help=(
                "Delete every seeded row first. Removes all course data and all "
                "accounts on the example.com domains. Superusers are kept."
            ),
        )
        parser.add_argument(
            "--seed", type=int, default=20260902,
            help="Random seed for the parts that are only cosmetic.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        self.rng = random.Random(options["seed"])
        self.now = timezone.now()

        if options["fresh"]:
            self._wipe()

        self._used_phones = set(Profile.objects.values_list("phone", flat=True))
        self._used_usernames = set(User.objects.values_list("username", flat=True))

        self._seed_demo_accounts()
        self._seed_admins()
        teachers = self._seed_teachers(options["teachers"])
        students = self._seed_students(options["students"])
        courses = self._seed_courses(teachers)
        self._seed_course_content(courses)
        enrollments = self._seed_enrollments(students, courses)
        self._seed_submissions(enrollments)
        self._seed_results()

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("Seeding finished. Totals now:"))
        for label, model in [
            ("users", User), ("profiles", Profile), ("teachers", Teacher),
            ("students", Student), ("courses", Course), ("lessons", Lesson),
            ("assignments", Assignment), ("enrollments", Enrollment),
            ("submissions", Submission), ("results", Results),
        ]:
            self.stdout.write(f"  {label:<12} {model.objects.count():>6}")
        self.stdout.write("")
        self.stdout.write("Log in as 01700000000 / admin1234 for the full picture.")

    # ------------------------------------------------------------------ wipe

    def _wipe(self):
        self.stdout.write(self.style.WARNING("--fresh: deleting seeded rows"))
        Results.objects.all().delete()
        Submission.objects.all().delete()
        Enrollment.objects.all().delete()
        Assignment.objects.all().delete()
        Lesson.objects.all().delete()
        Course.objects.all().delete()
        Student.objects.all().delete()
        Teacher.objects.all().delete()
        User.objects.filter(
            is_superuser=False,
            email__regex=r"@(ostad|student)\.example\.com$",
        ).delete()

    # --------------------------------------------------------------- helpers

    def _unique_username(self, base):
        candidate = base
        suffix = 2
        while candidate in self._used_usernames:
            candidate = f"{base}{suffix}"
            suffix += 1
        self._used_usernames.add(candidate)
        return candidate

    def _next_phone(self, prefix):
        """First free number on a prefix, e.g. 0192 for staff, 0181 for students."""
        n = 1
        while True:
            phone = f"{prefix}{n:07d}"
            if phone not in self._used_phones:
                self._used_phones.add(phone)
                return phone
            n += 1

    def _account(self, first, last, email, role, phone_prefix, password):
        """An account plus its Profile, found by email or created."""
        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            user = User.objects.create_user(
                username=self._unique_username(f"{first}.{last}".lower()),
                email=email,
                password=password,
                first_name=first,
                last_name=last,
            )
        profile = Profile.objects.filter(user=user).first()
        if profile is None:
            Profile.objects.create(
                user=user, phone=self._next_phone(phone_prefix), role=role,
            )
        elif profile.role != role:
            profile.role = role
            profile.save(update_fields=["role"])
        return user

    def _people(self, count):
        """`count` distinct (first, last) pairs, the same ones on every run."""
        pairs = [(f, l) for f in FIRST_NAMES for l in LAST_NAMES]
        random.Random(4242).shuffle(pairs)
        return pairs[:count]

    # ------------------------------------------------------------- accounts

    def _seed_demo_accounts(self):
        """The three logins the dev login panel hands out.

        These are repaired rather than skipped: if an earlier seed left
        demo_admin on a different phone number, the button on the login page
        would silently fail, so the phone and password are set every run.
        """
        for username, phone, password, role, first, last in DEMO_ACCOUNTS:
            user, _ = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": f"{username.replace('_', '.')}@{STAFF_EMAIL_DOMAIN}",
                    "first_name": first,
                    "last_name": last,
                },
            )
            user.first_name, user.last_name = first, last
            user.set_password(password)
            user.save()

            # Free the number up if some other account is squatting on it.
            squatters = list(Profile.objects.filter(phone=phone).exclude(user=user))
            for squatter in squatters:
                squatter.phone = self._next_phone("0179")
                squatter.save(update_fields=["phone"])

            Profile.objects.update_or_create(
                user=user, defaults={"phone": phone, "role": role},
            )
            self._used_phones.add(phone)
        self.stdout.write(f"demo accounts   {len(DEMO_ACCOUNTS)} ready")

    def _seed_admins(self):
        wanted = [("Ayesha", "Siddika"), ("Naimur", "Rahman"), ("Farzana", "Haque")]
        for first, last in wanted:
            email = f"{first}.{last}".lower() + f"@{STAFF_EMAIL_DOMAIN}"
            self._account(first, last, email, Profile.ADMIN, "0170", "admin1234")
        self.stdout.write(f"admins          {Profile.objects.filter(role=Profile.ADMIN).count()}")

    def _seed_teachers(self, target):
        """Teacher records, each with a matching login account.

        Nothing in the schema links a Teacher row to a User, so the two are
        tied together by email instead. Every subject in the catalogue is
        covered before any subject is doubled up.
        """
        subjects = [c["subject"] for c in COURSE_CATALOG]
        existing = Teacher.objects.count()
        to_make = max(0, target - existing)
        teachers = list(Teacher.objects.all())

        for i, (first, last) in enumerate(self._people(to_make)):
            email = f"{first}.{last}".lower() + f".t@{STAFF_EMAIL_DOMAIN}"
            teacher, _ = Teacher.objects.get_or_create(
                email=email,
                defaults={
                    "name": f"{first} {last}",
                    "subject": subjects[(existing + i) % len(subjects)],
                    # A few have moved on. The list is more useful with an
                    # inactive row or two in it than without.
                    "is_active": dice("teacher-active", email) > 8,
                },
            )
            teachers.append(teacher)
            self._account(first, last, email, Profile.TEACHER, "0192", "teacher1234")

        self.stdout.write(f"teachers        {len(teachers)} ({to_make} new)")
        return teachers

    def _seed_students(self, target):
        existing_qs = Student.objects.all()
        existing = existing_qs.count()
        to_make = max(0, target - existing)
        students = list(existing_qs)

        # Continue the roll number series rather than restarting it.
        used_rolls = set(existing_qs.values_list("roll_number", flat=True))
        counter = len(used_rolls) + 1

        for first, last in self._people(existing + to_make)[existing:]:
            email = f"{first}.{last}".lower() + f".s@{STUDENT_EMAIL_DOMAIN}"
            while f"OSD-2026-{counter:04d}" in used_rolls:
                counter += 1
            roll = f"OSD-2026-{counter:04d}"
            used_rolls.add(roll)
            counter += 1

            student, _ = Student.objects.get_or_create(
                email=email,
                defaults={
                    "name": f"{first} {last}",
                    "roll_number": roll,
                    "enrollment_date": (
                        self.now - timedelta(days=10 + dice("joined", email) * 7)
                    ).date(),
                    "is_active": dice("student-active", email) > 12,
                },
            )
            students.append(student)
            self._account(first, last, email, Profile.STUDENT, "0181", "student1234")

        self.stdout.write(f"students        {len(students)} ({to_make} new)")
        return students

    # --------------------------------------------------------------- content

    def _seed_courses(self, teachers):
        """One course per catalogue entry, taught by someone who teaches it."""
        by_subject = {}
        for t in teachers:
            by_subject.setdefault(t.subject, []).append(t)

        courses = []
        for entry in COURSE_CATALOG:
            pool = sorted(by_subject.get(entry["subject"]) or teachers, key=lambda t: t.id)
            course, _ = Course.objects.get_or_create(
                title=entry["title"],
                defaults={
                    "description": entry["description"],
                    "teacher": pool[dice("owner", entry["title"]) % len(pool)],
                },
            )
            courses.append((course, entry))

        self.stdout.write(f"courses         {Course.objects.count()}")
        return courses

    def _seed_course_content(self, courses):
        for course, entry in courses:
            for i, (title, description) in enumerate(entry["lessons"]):
                lesson, _ = Lesson.objects.get_or_create(
                    course=course, title=title,
                    defaults={"description": description},
                )

                # Roughly three lessons in four carry an assignment, decided
                # from the lesson's own identity so the same lessons are always
                # the ones that do.
                if dice("has-assignment", course.id, lesson.id) >= 75:
                    continue

                # Due dates walk forward one week per lesson, so every course
                # has a mix of overdue and upcoming work at any moment.
                offset_days = (i - len(entry["lessons"]) // 2) * 7
                Assignment.objects.get_or_create(
                    course=course, lesson=lesson,
                    title=f"Lab {i + 1}: {title}",
                    defaults={
                        "description": ASSIGNMENT_BRIEFS[i % len(ASSIGNMENT_BRIEFS)],
                        "due_date": self.now + timedelta(
                            days=offset_days, hours=dice("due", lesson.id) % 20
                        ),
                    },
                )

        self.stdout.write(f"lessons         {Lesson.objects.count()}")
        self.stdout.write(f"assignments     {Assignment.objects.count()}")

    # ------------------------------------------------------------ enrolments

    def _seed_enrollments(self, students, courses):
        course_objs = sorted((c for c, _ in courses), key=lambda c: c.id)
        held = {}
        for student_id, course_id in Enrollment.objects.values_list("student_id", "course_id"):
            held.setdefault(student_id, set()).add(course_id)

        new_rows = []
        for student in students:
            mine = held.setdefault(student.id, set())
            # An inactive student keeps their history but takes nothing new.
            ceiling = 4 if student.is_active else 2
            target = 1 + dice("course-load", student.id) % ceiling
            if len(mine) >= target:
                continue

            # Rank every course for this student, then take from the top. The
            # ranking is fixed, so topping up later extends the same list
            # rather than starting a different one.
            ranked = sorted(course_objs, key=lambda c: dice("enrol", student.id, c.id))
            for course in ranked:
                if len(mine) >= target:
                    break
                if course.id in mine:
                    continue
                mine.add(course.id)
                new_rows.append(Enrollment(student=student, course=course))

        Enrollment.objects.bulk_create(new_rows, batch_size=500)

        # enrollment_date is auto_now_add, so every new row landed on today.
        # Spread them back over the last two years to make the list readable.
        fresh = list(Enrollment.objects.filter(id__in=[r.id for r in new_rows]))
        for row in fresh:
            row.enrollment_date = (
                self.now - timedelta(days=5 + dice("when", row.student_id, row.course_id) * 7)
            ).date()
        Enrollment.objects.bulk_update(fresh, ["enrollment_date"], batch_size=500)

        self.stdout.write(f"enrollments     {Enrollment.objects.count()} ({len(new_rows)} new)")
        return list(Enrollment.objects.select_related("student"))

    def _seed_submissions(self, enrollments):
        # Read assignments back from the database rather than trusting the
        # catalogue: courses seeded by an earlier run have assignments too, and
        # their students should be handing work in as well.
        by_course = {}
        for assignment in Assignment.objects.all():
            by_course.setdefault(assignment.course_id, []).append(assignment)

        existing = {
            (a, s) for a, s in Submission.objects.values_list("assignment_id", "student_id")
        }
        new_rows = []

        for enrollment in enrollments:
            student_id = enrollment.student_id
            # A conscientious student hands in nearly everything, a struggling
            # one much less. Same spread you would see in a real cohort.
            diligence = 45 + dice("diligence", student_id) % 55

            for assignment in by_course.get(enrollment.course_id, []):
                if dice("handed-in", student_id, assignment.id) >= diligence:
                    continue
                key = (assignment.id, student_id)
                if key in existing:
                    continue
                existing.add(key)

                topic = assignment.title.split(": ", 1)[-1]
                note = SUBMISSION_NOTES[
                    dice("note", student_id, assignment.id) % len(SUBMISSION_NOTES)
                ]
                new_rows.append(Submission(
                    assignment=assignment,
                    student=enrollment.student,
                    content=note.format(topic=topic),
                ))

        Submission.objects.bulk_create(new_rows, batch_size=500)

        # submitted_at is auto_now_add too. Place each one near its own due
        # date instead — usually a few days before it, sometimes just after.
        fresh = list(
            Submission.objects.filter(id__in=[r.id for r in new_rows])
            .select_related("assignment")
        )
        for row in fresh:
            drift = dice("drift", row.student_id, row.assignment_id) / 10.0 - 7.0
            row.submitted_at = row.assignment.due_date + timedelta(days=drift)
        Submission.objects.bulk_update(fresh, ["submitted_at"], batch_size=500)

        self.stdout.write(f"submissions     {Submission.objects.count()} ({len(new_rows)} new)")

    def _seed_results(self):
        """Grade most of what has been handed in, but not all of it.

        Work submitted in the last few days is left ungraded on purpose, and a
        few older ones are missed as well, so the results page shows a
        realistic marking backlog rather than being complete.
        """
        graded = set(Results.objects.values_list("submission_id", flat=True))
        cutoff = self.now - timedelta(days=5)
        pending = (
            Submission.objects
            .exclude(id__in=graded)
            .filter(submitted_at__lt=cutoff)
            .order_by("id")
        )

        new_rows = []
        for submission in pending.iterator(chunk_size=500):
            if dice("graded", submission.id) >= 85:
                continue  # still sitting in the marking queue

            # A normal-ish spread centred just above a pass, drawn from the
            # submission's own id so a mark never changes on a later run.
            score = max(0.0, min(100.0, random.Random(submission.id).gauss(72, 15)))
            if score >= 85:
                band = "high"
            elif score >= 70:
                band = "good"
            elif score >= 50:
                band = "pass"
            else:
                band = "low"

            options = FEEDBACK_BY_BAND[band]
            new_rows.append(Results(
                submission=submission,
                score=round(score, 1),
                feedback=options[dice("feedback", submission.id) % len(options)],
            ))

        Results.objects.bulk_create(new_rows, batch_size=500)
        self.stdout.write(f"results         {Results.objects.count()} ({len(new_rows)} new)")
