from django.contrib import admin

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


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'phone']
    search_fields = ['user__username', 'phone']


@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'subject', 'is_active']
    list_filter = ['is_active', 'subject']
    search_fields = ['name', 'email']


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'email', 'roll_number', 'enrollment_date', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name', 'email', 'roll_number']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'teacher']
    list_filter = ['teacher']
    search_fields = ['title']


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'student', 'course', 'enrollment_date']
    list_filter = ['course']


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'course']
    list_filter = ['course']
    search_fields = ['title']


@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'course', 'lesson', 'due_date']
    list_filter = ['course']
    search_fields = ['title']


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ['id', 'assignment', 'student', 'submitted_at']
    list_filter = ['assignment']


@admin.register(Results)
class ResultsAdmin(admin.ModelAdmin):
    list_display = ['id', 'submission', 'score']
