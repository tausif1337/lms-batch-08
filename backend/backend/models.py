from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Profile(models.Model):
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"

    ROLE_CHOICES = [
        (ADMIN, "Admin"),
        (TEACHER, "Teacher"),
        (STUDENT, "Student"),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, unique=True)
    # Anyone can register, so a new account gets the least privileged role.
    # Promote people from /admin/ once you know who they are.
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default=STUDENT)

    def __str__(self):
        return f"{self.user.username} - {self.phone} ({self.role})"
    

class Teacher(models.Model):
    # The login this teacher record belongs to. Without it nothing ties a
    # teacher account to the courses it owns, so every teacher could rewrite
    # every course and regrade every student.
    #
    # Nullable for the same reasons as Student.user: a record can outlive the
    # account, and rows that predate this field may never have had one.
    user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="teacher_record",
    )
    name = models.CharField(max_length=100,blank=True, null=True)
    email=models.EmailField(blank=True, null=True)
    # Blank because registering a teacher creates this row before anybody has
    # said what they teach; an admin fills it in afterwards.
    subject = models.CharField(max_length=100, blank=True)
    # Switched off, this account keeps its login but loses every teacher
    # power: it can still read, but not change course material or marks.
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.subject}"
    
class Student(models.Model):
    # The login this student record belongs to. Without it the server has no
    # way to tell whose work a submission is, so it has to take the client's
    # word for it — which is not something a student should be trusted with.
    #
    # Nullable because a record can outlive the account, and because rows that
    # predate this field may never have had one.
    user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="student_record",
    )
    name = models.CharField(max_length=100,blank=True, null=True)
    email=models.EmailField(blank=True, null=True)
    enrollment_date = models.DateField()
    # Switched off, this student can no longer hand work in and cannot be
    # enrolled on anything new. Their existing rows stay where they are.
    is_active = models.BooleanField(default=True)
    roll_number = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.name} - {self.email}"

class Course(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    teacher = models.ForeignKey(Teacher, on_delete=models.PROTECT)
    

    def __str__(self):
        return self.title


class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.PROTECT)
    course = models.ForeignKey(Course, on_delete=models.PROTECT)
    enrollment_date = models.DateField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["student", "course"],
                name="unique_student_per_course",
            )
        ]

    def __str__(self):
        return f"{self.student.name} enrolled in {self.course.title}"

class Lesson(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    course = models.ForeignKey(Course, on_delete=models.PROTECT)

    def __str__(self):
        return self.title

class Assignment(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    lesson = models.ForeignKey(Lesson, on_delete=models.PROTECT)
    course = models.ForeignKey(Course, on_delete=models.PROTECT)
    due_date = models.DateTimeField()


    def __str__(self):
        return self.title

class Submission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.PROTECT)
    student = models.ForeignKey(Student, on_delete=models.PROTECT)
    submitted_at = models.DateTimeField(auto_now_add=True)
    content = models.TextField()

    def __str__(self):
        return f"Submission by {self.student.name} for {self.assignment.title}"

class Results(models.Model):
    submission = models.OneToOneField(Submission, on_delete=models.CASCADE)
    score = models.FloatField()
    feedback = models.TextField()

    def __str__(self):
        return f"Results for {self.submission.student.name} - {self.score}"