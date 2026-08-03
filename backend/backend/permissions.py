"""Who is allowed to change what.

Reading is open to any signed-in account. Writing depends on the role stored
on the caller's Profile:

    admin    everything
    teacher  course content (course, lesson, assignment), enrollments, grading
    student  may hand in a submission, and nothing else

The API is the thing that enforces this. The frontend hides buttons to match,
but that is a courtesy, not a control.
"""

from rest_framework.permissions import SAFE_METHODS, BasePermission

from .models import Profile


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


class IsAdmin(BasePermission):
    """Admins only, for every method including GET.

    Used on registration: accounts are handed out by an admin, not claimed by
    whoever finds the URL.
    """

    message = "Only an admin can create accounts."

    def has_permission(self, request, view):
        return role_of(request.user) == Profile.ADMIN


class RoleWritePermission(BasePermission):
    """Signed-in accounts can read. Only `roles_that_may_write` can write."""

    roles_that_may_write = ()
    message = "Your role does not allow this change."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.method in SAFE_METHODS:
            return True

        return role_of(request.user) in self.roles_that_may_write


class AdminWrites(RoleWritePermission):
    """Teacher and Student records: the register of who is in the school."""

    roles_that_may_write = (Profile.ADMIN,)
    message = "Only an admin can change teacher and student records."


class TeachingStaffWrites(RoleWritePermission):
    """Courses, lessons, assignments, enrollments and results."""

    roles_that_may_write = (Profile.ADMIN, Profile.TEACHER)
    message = "Only a teacher or an admin can change course material and grades."


class SubmissionWrites(RoleWritePermission):
    """Same as above, except a student may hand work in.

    A student cannot edit or delete a submission, because nothing links a
    Student row to a login account — so the server has no way to tell whose
    work it is. Handing in is the one write that is safe without that link.
    """

    roles_that_may_write = (Profile.ADMIN, Profile.TEACHER)
    message = "Students can hand work in, but cannot change or remove a submission."

    def has_permission(self, request, view):
        if (
            request.method == "POST"
            and request.user
            and request.user.is_authenticated
            and role_of(request.user) == Profile.STUDENT
        ):
            return True

        return super().has_permission(request, view)
