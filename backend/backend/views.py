from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.tokens import default_token_generator

from .serializers import (AssignmentSerializer, CourseSerializer, EnrollmentSerializer, LessonSerializer, RegisterSerializer, LoginSerializer, ResultSerializer, StudentSerializer, SubmissionSerializer, TeacherSerializer)

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
    """Protected view that requires authentication."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_data = {
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': role_of(user),
        }
        return Response({
            'message': 'successfully fetched this user',
            'user': user_data
        })
    
class TeacherListCreateView(generics.ListCreateAPIView):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [AdminWrites]

class TeacherRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Teacher.objects.all()
    serializer_class = TeacherSerializer
    permission_classes = [AdminWrites]

class StudentListCreateView(generics.ListCreateAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [AdminWrites]

class StudentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [AdminWrites]

class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [TeachingStaffWrites]

class CourseRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [TeachingStaffWrites]

class EnrollmentListCreateView(generics.ListCreateAPIView):
    """View to list and create enrollments."""
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [TeachingStaffWrites]

class EnrollmentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """View to retrieve, update, or delete an enrollment."""
    queryset = Enrollment.objects.all()
    serializer_class = EnrollmentSerializer
    permission_classes = [TeachingStaffWrites]

class LessonListCreateView(generics.ListCreateAPIView):
    """View to list and create lessons."""
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [TeachingStaffWrites]

class LessonRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """View to retrieve, update, or delete a lesson."""
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [TeachingStaffWrites]

class AssignmentListCreateView(generics.ListCreateAPIView):
    """View to list and create assignments."""
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [TeachingStaffWrites]

class AssignmentRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """View to retrieve, update, or delete an assignment."""
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [TeachingStaffWrites]

class SubmissionListCreateView(generics.ListCreateAPIView):
    """View to list and create submissions."""
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [SubmissionWrites]

class SubmissionRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """View to retrieve, update, or delete a submission."""
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [SubmissionWrites]

class ResultsListCreateView(generics.ListCreateAPIView):
    """View to list and create results."""
    queryset = Results.objects.all()
    serializer_class = ResultSerializer
    permission_classes = [TeachingStaffWrites]

class ResultsRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    """View to retrieve, update, or delete a result."""
    queryset = Results.objects.all()
    serializer_class = ResultSerializer
    permission_classes = [TeachingStaffWrites]