from .models import  Assignment, Enrollment, Lesson, Profile, Results, Submission, Teacher, Student,Course
from django.db import transaction
from rest_framework import serializers
from django.contrib.auth.models import User


from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(required=True, write_only=True)
    first_name = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    # Only an admin can reach this endpoint, so letting the caller pick the
    # role is safe. Left out, the account is a student.
    role = serializers.ChoiceField(
        choices=Profile.ROLE_CHOICES,
        required=False,
        default=Profile.STUDENT,
    )

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'phone', 'first_name', 'last_name', 'role']
        read_only_fields = ['id']
        extra_kwargs = {'password': {'write_only': True}}

    def validate_phone(self, value):
        if Profile.objects.filter(phone=value).exists():
            raise serializers.ValidationError("This phone number is already registered.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("That username is already taken.")
        return value

    def validate_password(self, value):
        # Run Django's own password rules, the same ones the reset flow uses.
        validate_password(value)
        return value

    @transaction.atomic
    def create(self, validated_data):
        phone = validated_data.pop('phone')
        email = validated_data.pop('email')
        role = validated_data.pop('role', Profile.STUDENT)
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=email,
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
        )
        Profile.objects.create(user=user, phone=phone, role=role)
        return user

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['role'] = instance.profile.role
        return data


class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

#password 




class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        try:
            uid = force_str(urlsafe_base64_decode(attrs["uid"]))
            user = User.objects.get(pk=uid, is_active=True)
        except Exception:
            raise serializers.ValidationError({
                "uid": "Invalid reset link."
            })

        if not default_token_generator.check_token(user, attrs["token"]):
            raise serializers.ValidationError({
                "token": "Invalid or expired reset token."
            })

        validate_password(attrs["new_password"], user=user)

        attrs["user"] = user
        return attrs




class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ['id', 'name', 'email', 'subject', 'is_active']
class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'name', 'email', 'enrollment_date', 'is_active', 'roll_number']

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'teacher']

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'course', 'enrollment_date']

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'description', 'course']
class AssignmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assignment
        fields = ['id', 'title', 'description', 'lesson', 'due_date', 'course']
class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ['id', 'assignment', 'student', 'submitted_at', 'content']
class ResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = Results
        fields = ['id', 'submission', 'score', 'feedback']
