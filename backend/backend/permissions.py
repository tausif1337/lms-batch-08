"""Who is allowed to see what, and who is allowed to change it.

Those are two questions, not one, so they are answered separately:

    reading  which roles may look at this kind of record at all
    writing  which roles may add, change or remove one

They came apart because the register of who is in the school — the Teacher and
Student rows, and who is enrolled on what — is staff business. Letting a
student read that list would hand them everybody's name, email address and
roll number, which is not theirs to have, even though they can change none of
it.

    admin    everything
    teacher  course content (course, lesson, assignment), enrollments, grading
    student  reads their own coursework, hands in a submission, nothing else

The role check is the first gate. On the views that say so, a second one
follows it: a teacher may only touch what hangs off a course their own Teacher
record owns, so one teacher cannot rewrite another's lessons or regrade
another's students.

The API is the thing that enforces this. The frontend hides buttons to match,
but that is a courtesy, not a control.
"""

from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import SAFE_METHODS, BasePermission

from .models import Assignment, Course, Enrollment, Lesson, Profile, Results, Student, Submission, Teacher

EVERY_ROLE = (Profile.ADMIN, Profile.TEACHER, Profile.STUDENT)
TEACHING_STAFF = (Profile.ADMIN, Profile.TEACHER)


def role_of(user):
    """The caller's role, or None when nobody is signed in.

    Two accounts have no Profile row: a superuser made with `createsuperuser`,
    and anything created outside the register endpoint. A superuser is treated
    as an admin; anyone else without a Profile gets the least privilege we
    have rather than an exception.
    """
    if not user or not user.is_authenticated:
        return None

    if user.is_superuser:
        return Profile.ADMIN

    profile = Profile.objects.filter(user=user).only("role").first()
    if profile is None:
        return Profile.STUDENT

    return profile.role


def student_record_of(user):
    """The Student row that belongs to this login, or None."""
    return Student.objects.filter(user=user).first()


def teacher_record_of(user):
    """The Teacher row that belongs to this login, or None."""
    return Teacher.objects.filter(user=user).first()


def teacher_is_active(user):
    """False when this login's Teacher record has been switched off.

    A teacher with no Teacher record at all is not deactivated, only unlinked,
    which accounts made before Teacher.user existed will be. Only an explicit
    is_active=False takes powers away.
    """
    record = teacher_record_of(user)
    return record is None or record.is_active


def course_of(obj):
    """The Course a saved record hangs off, however far down the chain it sits."""
    if isinstance(obj, Course):
        return obj

    if isinstance(obj, (Lesson, Assignment, Enrollment)):
        return obj.course

    if isinstance(obj, Submission):
        return obj.assignment.course

    if isinstance(obj, Results):
        return obj.submission.assignment.course

    return None


def course_being_written_to(data):
    """The Course a submitted record would hang off, or None if it names none.

    Reads what the serializer already turned into model instances, so a lesson
    id that does not exist has been rejected before this is asked.
    """
    for field, reach_the_course in (
        ("course", lambda value: value),
        ("lesson", lambda value: value.course),
        ("assignment", lambda value: value.course),
        ("submission", lambda value: value.assignment.course),
    ):
        if data.get(field) is not None:
            return reach_the_course(data[field])

    return None


def teacher_owns(user, course):
    """True when this login's Teacher record teaches that course."""
    if course is None:
        return False

    record = teacher_record_of(user)

    return record is not None and course.teacher_id == record.id


def refuse_if_another_teachers_course(request, data):
    """Stop a teacher creating something under a course they do not teach.

    `has_object_permission` covers editing and deleting, but a create has no
    object yet, so the course has to be read out of what was submitted.

    Admins are not held to this, and nobody else reaches here: the role check
    has already turned students away from every view that calls this.
    """
    if role_of(request.user) != Profile.TEACHER:
        return

    course = course_being_written_to(data)

    if course is not None and not teacher_owns(request.user, course):
        raise PermissionDenied("That belongs to another teacher's course.")


def refuse_if_course_given_to_another_teacher(request, data):
    """A teacher may only create courses in their own name.

    Without this, the first thing a teacher could do is make a course, put
    somebody else's name on it, and then be locked out of the thing they just
    made — or worse, hand themselves a way in later by editing it back.
    """
    if role_of(request.user) != Profile.TEACHER:
        return

    record = teacher_record_of(request.user)

    if record is None:
        raise PermissionDenied(
            "Your account is not linked to a teacher record yet, so there is "
            "nobody to put this course under. Ask an admin."
        )

    named = data.get("teacher")

    if named is not None and named.id != record.id:
        raise PermissionDenied("You can only create courses in your own name.")


class IsAdmin(BasePermission):
    """Admins only, for every method including GET.

    Used on registration: accounts are handed out by an admin, not claimed by
    whoever finds the URL.
    """

    message = "Only an admin can create accounts."

    def has_permission(self, request, view):
        return role_of(request.user) == Profile.ADMIN


class RolePermission(BasePermission):
    """Reading and writing gated separately, each by its own list of roles."""

    roles_that_may_read = EVERY_ROLE
    roles_that_may_write = ()

    #: Set on views where a teacher is confined to their own courses.
    teacher_is_held_to_own_courses = False

    cannot_read_message = "Your role does not allow you to see these records."
    cannot_write_message = "Your role does not allow this change."

    def has_permission(self, request, view):
        role = role_of(request.user)

        if role is None:
            return False

        if request.method in SAFE_METHODS:
            self.message = self.cannot_read_message
            return role in self.roles_that_may_read

        if role not in self.roles_that_may_write:
            self.message = self.cannot_write_message
            return False

        if role == Profile.TEACHER and not teacher_is_active(request.user):
            self.message = "This teacher account has been deactivated."
            return False

        return True

    def has_object_permission(self, request, view, obj):
        """The second gate: whose course is this?

        Only runs on the detail views, and only for teachers. Reading is left
        alone here — what a role may read was already settled above, and the
        views that need to narrow it further do so by filtering the queryset.
        """
        if request.method in SAFE_METHODS:
            return True

        if not self.teacher_is_held_to_own_courses:
            return True

        if role_of(request.user) != Profile.TEACHER:
            return True

        if teacher_owns(request.user, course_of(obj)):
            return True

        self.message = "That belongs to another teacher's course."
        return False


class AdminWrites(RolePermission):
    """Teacher and Student records: the register of who is in the school.

    Staff-only to read as well as to write, because these rows carry names,
    email addresses and roll numbers for everybody in the school.
    """

    roles_that_may_read = TEACHING_STAFF
    roles_that_may_write = (Profile.ADMIN,)
    cannot_read_message = "Only staff can see teacher and student records."
    cannot_write_message = "Only an admin can change teacher and student records."


class EnrollmentWrites(RolePermission):
    """Who is on which course.

    Staff-only to read: the list names every student on every course, so a
    student reading it would learn who else is in the school.
    """

    roles_that_may_read = TEACHING_STAFF
    roles_that_may_write = TEACHING_STAFF
    teacher_is_held_to_own_courses = True
    cannot_read_message = "Only staff can see the enrollment list."
    cannot_write_message = "Only a teacher or an admin can change enrollments."


class TeachingStaffWrites(RolePermission):
    """Courses, lessons, assignments and results.

    Everyone signed in may read these: a student has to be able to see the
    coursework set for them, and their own marks. Results are narrowed to the
    student's own rows by the view, not here.
    """

    roles_that_may_write = TEACHING_STAFF
    teacher_is_held_to_own_courses = True
    cannot_write_message = "Only a teacher or an admin can change course material and grades."


class SubmissionWrites(RolePermission):
    """Same as above, except a student may hand work in.

    Student.user says whose work a submission is, so the server fills the owner
    in itself and a student only ever sees their own rows.

    Editing and deleting stay closed to them anyway: work that has been handed
    in and possibly marked is not something the person who wrote it should be
    able to quietly rewrite. Handing in is the one write they get.
    """

    roles_that_may_write = TEACHING_STAFF
    teacher_is_held_to_own_courses = True
    cannot_write_message = "Students can hand work in, but cannot change or remove a submission."

    def has_permission(self, request, view):
        if request.method == "POST" and role_of(request.user) == Profile.STUDENT:
            return True

        return super().has_permission(request, view)
