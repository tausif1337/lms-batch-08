from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return f"{self.user.username} - {self.phone}"
    

class Teacher(models.Model):
    
    name = models.CharField(max_length=100,blank=True, null=True)
    email=models.EmailField(blank=True, null=True)
    subject = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.subject}"
    
class Student(models.Model):
    name = models.CharField(max_length=100,blank=True, null=True)
    email=models.EmailField(blank=True, null=True)
    enrollment_date = models.DateField()
    is_active = models.BooleanField(default=True)
    roll_number = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f"{self.name} - {self.email}"

class Course(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    

    def __str__(self):
        return self.title


class Enrollment(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    enrollment_date = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.name} enrolled in {self.course.title}"

class Lesson(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    course = models.ForeignKey(Course, on_delete=models.CASCADE)

    def __str__(self):
        return self.title

class Assignment(models.Model):
    title = models.CharField(max_length=100)
    description = models.TextField()
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    due_date = models.DateTimeField()


    def __str__(self):
        return self.title

class Submission(models.Model):
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
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