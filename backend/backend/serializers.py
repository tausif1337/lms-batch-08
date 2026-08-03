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


class ProfileUpdateSerializer(serializers.Serializer):
    """What you are allowed to change about yourself.

    Not on this list, on purpose:
      role      - changing your own would be a promotion. Admins only, in
                  Django admin.
      username  - it is how an admin finds you; the phone is what you log in
                  with, so there is nothing to gain by renaming yourself.
      password  - has its own endpoint, because it needs the old one first.
    """

    first_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False, max_length=20)

    def validate_phone(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError(
                "Your phone number is how you sign in, so it cannot be blank."
            )

        me = self.context["request"].user
        if Profile.objects.filter(phone=value).exclude(user=me).exists():
            raise serializers.ValidationError(
                "Another account already uses that phone number."
            )
        return value

    def validate_email(self, value):
        # Password reset looks an account up by email, so two accounts sharing
        # one would make that ambiguous.
        me = self.context["request"].user
        if User.objects.filter(email__iexact=value).exclude(pk=me.pk).exists():
            raise serializers.ValidationError(
                "Another account already uses that email address."
            )
        return value

    @transaction.atomic
    def save(self, **kwargs):
        me = self.context["request"].user
        data = self.validated_data

        for field in ("first_name", "last_name", "email"):
            if field in data:
                setattr(me, field, data[field])
        me.save()

        if "phone" in data:
            profile = Profile.objects.filter(user=me).first()
            if profile:
                profile.phone = data["phone"]
                profile.save()

        return me


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_current_password(self, value):
        # Knowing the old password is what makes this yours to change. Without
        # it, a borrowed browser tab would be enough to take the account.
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("That is not your current password.")
        return value

    def validate(self, attrs):
        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "The two new passwords do not match."
            })

        if attrs["new_password"] == attrs["current_password"]:
            raise serializers.ValidationError({
                "new_password": "The new password has to be different from the old one."
            })

        validate_password(attrs["new_password"], user=self.context["request"].user)
        return attrs

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
