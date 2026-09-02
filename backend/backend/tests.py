"""What the roles are and are not allowed to do.

These started as an audit: every case here was a hole that was open at some
point, so each one is written as the thing that used to work and now must not.
"""

from django.contrib.auth.models import User
from django.test import TestCase
from django.utils import timezone

from .models import (
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

PASSWORD = "Zq7!vbn45pQ"


def make_account(username, phone, role):
    user = User.objects.create_user(
        username=username, email=f"{username}@example.com", password=PASSWORD
    )
    Profile.objects.create(user=user, phone=phone, role=role)
    return user


class RolePermissionTests(TestCase):
    """One school, two teachers, two students, and one of each kind of row."""

    def setUp(self):
        self.admin_user = make_account("admin1", "01900000000", Profile.ADMIN)

        self.teacher_user = make_account("teach1", "01900000001", Profile.TEACHER)
        self.teacher = Teacher.objects.create(
            user=self.teacher_user, name="Teach One", email="teach1@example.com", subject="Maths"
        )

        self.other_teacher_user = make_account("teach2", "01900000002", Profile.TEACHER)
        self.other_teacher = Teacher.objects.create(
            user=self.other_teacher_user, name="Teach Two", email="teach2@example.com"
        )

        self.student_user = make_account("stud1", "01900000003", Profile.STUDENT)
        self.student = Student.objects.create(
            user=self.student_user,
            name="Stud One",
            email="stud1@example.com",
            enrollment_date=timezone.localdate(),
        )

        self.other_student = Student.objects.create(
            name="Stud Two",
            email="stud2@example.com",
            enrollment_date=timezone.localdate(),
            roll_number="R-999",
        )

        # Mine: taught by self.teacher, and the student is enrolled on it.
        self.course = Course.objects.create(
            title="Mine", description="d", teacher=self.teacher
        )
        self.lesson = Lesson.objects.create(title="L1", description="d", course=self.course)
        self.assignment = Assignment.objects.create(
            title="A1", description="d", lesson=self.lesson,
            course=self.course, due_date=timezone.now(),
        )
        Enrollment.objects.create(student=self.student, course=self.course)

        # Theirs: taught by the other teacher, and nobody here is enrolled.
        self.other_course = Course.objects.create(
            title="Theirs", description="d", teacher=self.other_teacher
        )
        self.other_lesson = Lesson.objects.create(
            title="L2", description="d", course=self.other_course
        )
        self.other_assignment = Assignment.objects.create(
            title="A2", description="d", lesson=self.other_lesson,
            course=self.other_course, due_date=timezone.now(),
        )

        self.submission = Submission.objects.create(
            assignment=self.assignment, student=self.student, content="mine"
        )
        self.other_submission = Submission.objects.create(
            assignment=self.other_assignment, student=self.other_student, content="theirs"
        )
        self.result = Results.objects.create(
            submission=self.submission, score=5, feedback="ok"
        )
        self.other_result = Results.objects.create(
            submission=self.other_submission, score=9, feedback="secret"
        )

    def sign_in(self, phone):
        answer = self.client.post(
            "/api/login/", {"phone": phone, "password": PASSWORD},
            content_type="application/json",
        )
        self.assertEqual(answer.status_code, 200, answer.content)
        return {"HTTP_AUTHORIZATION": f"Bearer {answer.json()['tokens']['access']}"}

    # -- reading -----------------------------------------------------------

    def test_student_cannot_read_the_school_register(self):
        """These rows carry everybody's name, email and roll number."""
        headers = self.sign_in("01900000003")

        for address in ("/api/student/", "/api/teacher/", "/api/enrollment/"):
            self.assertEqual(self.client.get(address, **headers).status_code, 403, address)

        detail = f"/api/student/{self.other_student.id}/"
        self.assertEqual(self.client.get(detail, **headers).status_code, 403)

    def test_student_can_still_read_their_coursework(self):
        headers = self.sign_in("01900000003")

        for address in ("/api/course/", "/api/lesson/", "/api/assignment/"):
            self.assertEqual(self.client.get(address, **headers).status_code, 200, address)

    def test_course_carries_the_teacher_name_a_student_may_not_look_up(self):
        headers = self.sign_in("01900000003")

        courses = self.client.get("/api/course/", **headers).json()

        self.assertEqual(
            {course["title"]: course["teacher_name"] for course in courses},
            {"Mine": "Teach One", "Theirs": "Teach Two"},
        )

    def test_staff_can_read_the_register(self):
        for phone in ("01900000000", "01900000001"):
            headers = self.sign_in(phone)
            self.assertEqual(self.client.get("/api/student/", **headers).status_code, 200, phone)

    def test_student_sees_only_their_own_work_and_marks(self):
        headers = self.sign_in("01900000003")

        self.assertEqual(
            [row["content"] for row in self.client.get("/api/submission/", **headers).json()],
            ["mine"],
        )
        self.assertEqual(
            [row["feedback"] for row in self.client.get("/api/results/", **headers).json()],
            ["ok"],
        )
        self.assertEqual(
            self.client.get(f"/api/submission/{self.other_submission.id}/", **headers).status_code,
            404,
        )
        self.assertEqual(
            self.client.get(f"/api/results/{self.other_result.id}/", **headers).status_code, 404
        )

    # -- writing -----------------------------------------------------------

    def test_student_cannot_change_anything_but_handing_work_in(self):
        headers = self.sign_in("01900000003")
        refused = [
            ("patch", f"/api/submission/{self.submission.id}/", {"content": "edited"}),
            ("delete", f"/api/submission/{self.submission.id}/", None),
            ("post", "/api/results/", {"submission": self.submission.id, "score": 100, "feedback": "A+"}),
            ("patch", f"/api/results/{self.result.id}/", {"score": 100}),
            ("post", "/api/course/", {"title": "x", "description": "d", "teacher": self.teacher.id}),
            ("post", "/api/student/", {"name": "x", "enrollment_date": "2026-01-01"}),
            ("post", "/api/register/", {"username": "sneak", "email": "s@example.com",
                                        "password": PASSWORD, "phone": "0190999",
                                        "first_name": "S", "role": "admin"}),
        ]

        for method, address, body in refused:
            send = getattr(self.client, method)
            answer = (
                send(address, body, content_type="application/json", **headers)
                if body is not None
                else send(address, **headers)
            )
            self.assertEqual(answer.status_code, 403, f"{method} {address}")

    def test_student_hands_work_in_under_their_own_name(self):
        headers = self.sign_in("01900000003")

        answer = self.client.post(
            "/api/submission/",
            {"assignment": self.assignment.id, "content": "hi", "student": self.other_student.id},
            content_type="application/json", **headers,
        )

        self.assertEqual(answer.status_code, 201)
        self.assertEqual(answer.json()["student"], self.student.id)

    def test_student_cannot_hand_in_on_a_course_they_are_not_on(self):
        headers = self.sign_in("01900000003")

        answer = self.client.post(
            "/api/submission/",
            {"assignment": self.other_assignment.id, "content": "hi"},
            content_type="application/json", **headers,
        )

        self.assertEqual(answer.status_code, 400)
        self.assertIn("not enrolled", str(answer.json()))

    def test_deactivated_student_cannot_hand_work_in(self):
        self.student.is_active = False
        self.student.save()
        headers = self.sign_in("01900000003")

        answer = self.client.post(
            "/api/submission/", {"assignment": self.assignment.id, "content": "hi"},
            content_type="application/json", **headers,
        )

        self.assertEqual(answer.status_code, 400)
        self.assertIn("deactivated", str(answer.json()))

    def test_deactivated_student_cannot_be_enrolled(self):
        self.other_student.is_active = False
        self.other_student.save()
        headers = self.sign_in("01900000001")

        answer = self.client.post(
            "/api/enrollment/", {"student": self.other_student.id, "course": self.course.id},
            content_type="application/json", **headers,
        )

        self.assertEqual(answer.status_code, 400)
        self.assertIn("deactivated", str(answer.json()))

    # -- one teacher, one set of courses -----------------------------------

    def test_teacher_cannot_touch_another_teachers_course(self):
        headers = self.sign_in("01900000001")
        refused = [
            ("patch", f"/api/course/{self.other_course.id}/", {"title": "hijacked"}),
            ("delete", f"/api/course/{self.other_course.id}/", None),
            ("patch", f"/api/lesson/{self.other_lesson.id}/", {"title": "hijacked"}),
            ("patch", f"/api/assignment/{self.other_assignment.id}/", {"title": "hijacked"}),
            ("patch", f"/api/results/{self.other_result.id}/", {"score": 0}),
            ("patch", f"/api/submission/{self.other_submission.id}/", {"content": "x"}),
        ]

        for method, address, body in refused:
            send = getattr(self.client, method)
            answer = (
                send(address, body, content_type="application/json", **headers)
                if body is not None
                else send(address, **headers)
            )
            self.assertEqual(answer.status_code, 403, f"{method} {address}")

    def test_teacher_cannot_create_under_another_teachers_course(self):
        headers = self.sign_in("01900000001")

        # Unmarked, so the refusal is the ownership check rather than the
        # one-result-per-submission rule getting there first.
        ungraded = Submission.objects.create(
            assignment=self.other_assignment, student=self.other_student, content="ungraded"
        )

        refused = [
            ("/api/lesson/", {"title": "x", "description": "d", "course": self.other_course.id}),
            ("/api/assignment/", {"title": "x", "description": "d",
                                  "lesson": self.other_lesson.id,
                                  "course": self.other_course.id,
                                  "due_date": "2030-01-01T00:00:00Z"}),
            ("/api/enrollment/", {"student": self.student.id, "course": self.other_course.id}),
            ("/api/results/", {"submission": ungraded.id, "score": 1, "feedback": "f"}),
        ]

        for address, body in refused:
            answer = self.client.post(address, body, content_type="application/json", **headers)
            self.assertEqual(answer.status_code, 403, address)

    def test_teacher_can_run_their_own_course(self):
        headers = self.sign_in("01900000001")

        self.assertEqual(
            self.client.patch(f"/api/course/{self.course.id}/", {"title": "Renamed"},
                              content_type="application/json", **headers).status_code, 200
        )
        self.assertEqual(
            self.client.post("/api/lesson/",
                             {"title": "L3", "description": "d", "course": self.course.id},
                             content_type="application/json", **headers).status_code, 201
        )
        self.assertEqual(
            self.client.patch(f"/api/results/{self.result.id}/", {"score": 8},
                              content_type="application/json", **headers).status_code, 200
        )

    def test_teacher_creates_courses_only_in_their_own_name(self):
        headers = self.sign_in("01900000001")

        answer = self.client.post(
            "/api/course/",
            {"title": "x", "description": "d", "teacher": self.other_teacher.id},
            content_type="application/json", **headers,
        )

        self.assertEqual(answer.status_code, 403)

    def test_admin_is_not_held_to_one_teachers_courses(self):
        headers = self.sign_in("01900000000")

        self.assertEqual(
            self.client.patch(f"/api/course/{self.other_course.id}/", {"title": "Fine"},
                              content_type="application/json", **headers).status_code, 200
        )

    def test_deactivated_teacher_keeps_reading_but_stops_writing(self):
        self.teacher.is_active = False
        self.teacher.save()
        headers = self.sign_in("01900000001")

        self.assertEqual(self.client.get("/api/course/", **headers).status_code, 200)
        self.assertEqual(
            self.client.patch(f"/api/course/{self.course.id}/", {"title": "nope"},
                              content_type="application/json", **headers).status_code, 403
        )

    # -- accounts ----------------------------------------------------------

    def test_deactivated_account_is_turned_away_at_login(self):
        self.student_user.is_active = False
        self.student_user.save()

        answer = self.client.post(
            "/api/login/", {"phone": "01900000003", "password": PASSWORD},
            content_type="application/json",
        )

        self.assertEqual(answer.status_code, 403)
        self.assertIn("deactivated", answer.json()["error"])

    def test_registering_a_teacher_creates_the_record_that_owns_courses(self):
        headers = self.sign_in("01900000000")

        answer = self.client.post(
            "/api/register/",
            {"username": "teach3", "email": "teach3@example.com", "password": PASSWORD,
             "phone": "01900000009", "first_name": "Teach", "last_name": "Three",
             "role": "teacher"},
            content_type="application/json", **headers,
        )

        self.assertEqual(answer.status_code, 201, answer.content)
        record = Teacher.objects.get(user__username="teach3")
        self.assertEqual(record.name, "Teach Three")

        # And the record works: the new teacher owns what they create.
        new_headers = self.sign_in("01900000009")
        made = self.client.post(
            "/api/course/", {"title": "Theirs now", "description": "d", "teacher": record.id},
            content_type="application/json", **new_headers,
        )
        self.assertEqual(made.status_code, 201, made.content)


class SeedDemoTests(TestCase):
    """The demo logins have to be usable, not just present."""

    def test_demo_teacher_is_linked_and_can_own_a_course(self):
        from io import StringIO

        from django.core.management import call_command

        call_command("seed_demo", stdout=StringIO())

        record = Teacher.objects.get(user__username="demo_teacher")

        # Run twice: it is meant to be safe to re-run, and the second pass must
        # adopt the same row rather than leaving a second one beside it.
        call_command("seed_demo", stdout=StringIO())

        self.assertEqual(Teacher.objects.filter(email=record.email).count(), 1)

        phone = Profile.objects.get(user__username="demo_teacher").phone
        answer = self.client.post(
            "/api/login/", {"phone": phone, "password": "Demo@12345"},
            content_type="application/json",
        )
        self.assertEqual(answer.status_code, 200, answer.content)
        headers = {"HTTP_AUTHORIZATION": f"Bearer {answer.json()['tokens']['access']}"}

        made = self.client.post(
            "/api/course/",
            {"title": "Demo course", "description": "d", "teacher": record.id},
            content_type="application/json", **headers,
        )
        self.assertEqual(made.status_code, 201, made.content)
