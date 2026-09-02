from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.tokens import default_token_generator

from .serializers import (AssignmentSerializer, ChangePasswordSerializer, CourseSerializer, EnrollmentSerializer, LessonSerializer, ProfileUpdateSerializer, RegisterSerializer, LoginSerializer, ResultSerializer, StudentSerializer, SubmissionSerializer, TeacherSerializer)

from .models import (Assignment, Course, Enrollment, Lesson, Profile, Results, Student, Submission, Teacher)
from .permissions import AdminWrites, IsAdmin, SubmissionWrites, TeachingStaffWrites, role_of
from .serializers import (
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,

)
from rest_framework.permissions import AllowAny
from django.core.mail import send_mail
from django.conf import settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.contrib.auth import get_user_model

User = get_user_model()


def blacklist_user_tokens(user):
    try:
        from rest_framework_simplejwt.token_blacklist.models import (
            OutstandingToken,
            BlacklistedToken,
        )

        tokens = OutstandingToken.objects.filter(user=user)

        for token in tokens:
            BlacklistedToken.objects.get_or_create(token=token)

    except Exception:
        pass

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        user = User.objects.filter(email=email, is_active=True).first()

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            reset_link = (
                f"{settings.FRONTEND_PASSWORD_RESET_URL}"
                f"?uid={uid}&token={token}"
            )

            

            send_mail(
                subject="Reset your password",
                message=f"Click the link below to reset your password:\n\n{reset_link}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

        return Response(
            {
                "detail": "If an account exists with this email, a password reset link has been sent."
            },
            status=status.HTTP_200_OK,
        )
class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        new_password = serializer.validated_data["new_password"]

        user.set_password(new_password)
        user.save()

        blacklist_user_tokens(user)

        return Response(
            {
                "detail": "Password has been reset successfully. Please login again."
            },
            status=status.HTTP_200_OK,
        )


# Create your views here.
# Create your views here.

class RegisterView(generics.CreateAPIView):
    """Create an account. Admins only.

    There is no public sign-up: a student does not make their own account, an
    admin makes it for them and picks the role. Anonymous callers get a 401,
    signed-in teachers and students a 403.

    If there is no admin left to do this, `python manage.py createsuperuser`
    still works, and a superuser counts as an admin.
    """

    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [IsAdmin]


def get_tokens_for_user(user):
    """Helper to get JWT tokens for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class LoginView(APIView):
    """Login view using phone and password."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data['phone']
        password = serializer.validated_data['password']

        try:
            profile = Profile.objects.get(phone=phone)
            user = profile.user
        except Profile.DoesNotExist:
            return Response({'error': 'Invalid phone or password'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(password):
            return Response({'error': 'Invalid phone or password'}, status=status.HTTP_400_BAD_REQUEST)

        tokens = get_tokens_for_user(user)
        return Response({
            'message': 'Login successful',
            'user_id': user.id,
            'username': user.username,
            # The frontend uses this to decide which buttons to show. It is
            # not what enforces anything: the permission classes do that.
            'role': role_of(user),
            'tokens': tokens
        })

class ProtectedView(APIView):
    """Your own account: GET to read it, PATCH to change it.

    PATCH only ever touches request.user, so there is no way to aim it at
    somebody else's account, and `role` is not a field the serializer accepts.
    """
    permission_classes = [IsAuthenticated]

    def _user_data(self, user):
        profile = Profile.objects.filter(user=user).first()
        return {
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'phone': profile.phone if profile else None,
            'role': role_of(user),
        }

    def get(self, request):
        return Response({
            'message': 'successfully fetched this user',
            'user': self._user_data(request.user)
        })

    def patch(self, request):
        serializer = ProfileUpdateSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        request.user.refresh_from_db()
        return Response({
            'message': 'Your details have been saved.',
            'user': self._user_data(request.user)
        })


class ChangePasswordView(APIView):
    """Change your own password, knowing the old one."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request},
        )
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()

        # Refresh tokens issued earlier are retired. The access token already
        # in the caller's hands cannot be revoked — JWTs are not looked up on
        # each request — so the frontend signs you out and makes you log in
        # again with the new password.
        blacklist_user_tokens(user)

        return Response(
            {'detail': 'Password changed. Please log in again.'},
            status=status.HTTP_200_OK,
        )
    
class TeacherListCreateView(generics.ListCreateAPIView):
    """Teachers, searchable by name, email or subject.

    Filtering, ordering and paging are all read off the query string by the
    backends named in REST_FRAMEWORK["DEFAULT_FILTER_BACKENDS"]. This class
    only has to say which fields take part:

        search_fields    what ?search= looks through
        filter_fields    {query parameter: ORM lookup} for ?is_active=, etc.
        ordering_fields  what ?ordering= will accept, to stop a caller
                         sorting on a column that is not on the table
        ordering         the sort used when the caller does not pick one.
                         Paging needs a stable order, otherwise a row can
                         appear on two pages or on neither.
    """

    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [AdminWrites]

    search_fields = ["name", "email", "subject"]
    filter_fields = {
        "is_active": "is_active",
        "subject": "subject__icontains",
    }
    ordering_fields = ["id", "name", "email", "subject", "is_active"]
    ordering = ["id"]

class TeacherRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [AdminWrites]

class StudentListCreateView(generics.ListCreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [AdminWrites]

    search_fields = ["name", "email", "roll_number"]
    filter_fields = {
        "is_active": "is_active",
        # A pair of parameters rather than one: "enrolled between these two
        # dates" is two lookups on the same column.
        "enrolled_from": "enrollment_date__gte",
        "enrolled_to": "enrollment_date__lte",
    }
    ordering_fields = [
        "id", "name", "email", "roll_number", "enrollment_date", "is_active",
    ]
    ordering = ["id"]

class StudentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [AdminWrites]

class CourseListCreateView(generics.ListCreateAPIView):
    # select_related keeps ?search=<teacher name> and ?ordering=teacher__name
    # to one query instead of one per row.
    queryset = Course.objects.select_related("teacher")
    serializer_class = CourseSerializer
    permission_classes = [TeachingStaffWrites]

    search_fields = ["title", "description", "teacher__name"]
    filter_fields = {"teacher": "teacher"}
    ordering_fields = ["id", "title", "teacher__name"]
    ordering = ["id"]

class CourseRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [TeachingStaffWrites]

class EnrollmentListCreateView(generics.ListCreateAPIView):
    """View to list and create enrollments."""
    queryset = Enrollment.objects.select_related("student", "course")
    serializer_class = EnrollmentSerializer
    permission_classes = [TeachingStaffWrites]

    search_fields = ["student__name", "student__roll_number", "course__title"]
    filter_fields = {
        "student": "student",
        "course": "course",
        "enrolled_from": "enrollment_date__gte",
        "enrolled_to": "enrollment_date__lte",
    }
    ordering_fields = ["id", "student__name", "course__title", "enrollment_date"]
    ordering = ["id"]

class EnrollmentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """View to retrieve, update, or delete an enrollment."""
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [TeachingStaffWrites]

class LessonListCreateView(generics.ListCreateAPIView):
    """View to list and create lessons."""
    queryset = Lesson.objects.select_related("course")
    serializer_class = LessonSerializer
    permission_classes = [TeachingStaffWrites]

    search_fields = ["title", "description", "course__title"]
    filter_fields = {"course": "course"}
    ordering_fields = ["id", "title", "course__title"]
    ordering = ["id"]

class LessonRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """View to retrieve, update, or delete a lesson."""
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [TeachingStaffWrites]

class AssignmentListCreateView(generics.ListCreateAPIView):
    """View to list and create assignments."""
    queryset = Assignment.objects.select_related("course", "lesson")
    serializer_class = AssignmentSerializer
    permission_classes = [TeachingStaffWrites]

    search_fields = ["title", "description", "course__title", "lesson__title"]
    filter_fields = {
        "course": "course",
        "lesson": "lesson",
        "due_from": "due_date__gte",
        "due_to": "due_date__lte",
    }
    ordering_fields = ["id", "title", "due_date", "course__title", "lesson__title"]
    ordering = ["id"]

class AssignmentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """View to retrieve, update, or delete an assignment."""
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [TeachingStaffWrites]

class SubmissionListCreateView(generics.ListCreateAPIView):
    """View to list and create submissions."""
    queryset = Submission.objects.select_related("assignment", "student")
    serializer_class = SubmissionSerializer
    permission_classes = [SubmissionWrites]

    search_fields = ["content", "student__name", "assignment__title"]
    filter_fields = {
        "assignment": "assignment",
        "student": "student",
        # A submission has no course of its own; it borrows the one its
        # assignment belongs to.
        "course": "assignment__course",
        "submitted_from": "submitted_at__gte",
        "submitted_to": "submitted_at__lte",
        # ?ungraded=true is the list the "new result" dropdown is built from.
        # Results.submission is one-to-one, so a submission with no result
        # attached is one nobody has marked yet. Asking the database that is
        # far cheaper than sending every submission and every result to the
        # browser for it to work out the difference.
        "ungraded": "results__isnull",
    }
    ordering_fields = ["id", "submitted_at", "student__name", "assignment__title"]
    ordering = ["id"]

class SubmissionRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """View to retrieve, update, or delete a submission."""
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [SubmissionWrites]

class ResultsListCreateView(generics.ListCreateAPIView):
    """View to list and create results."""
    queryset = Results.objects.select_related(
        "submission", "submission__student", "submission__assignment",
    )
    serializer_class = ResultSerializer
    permission_classes = [TeachingStaffWrites]

    search_fields = [
        "feedback",
        "submission__student__name",
        "submission__assignment__title",
    ]
    filter_fields = {
        "submission": "submission",
        "student": "submission__student",
        "assignment": "submission__assignment",
        "score_min": "score__gte",
        "score_max": "score__lte",
    }
    ordering_fields = ["id", "score", "submission__student__name"]
    ordering = ["id"]

class ResultsRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """View to retrieve, update, or delete a result."""
    queryset = Results.objects.all()
    serializer_class = ResultSerializer
    permission_classes = [TeachingStaffWrites]
