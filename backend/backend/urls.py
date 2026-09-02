from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from backend.views import(ChangePasswordView, LogoutView, PasswordResetConfirmView, PasswordResetRequestView, RegisterView,
                          LoginView,ProtectedView,TeacherListCreateView,StudentListCreateView,TeacherRetrieveUpdateDestroyAPIView,
                          StudentRetrieveUpdateDestroyAPIView,CourseListCreateView,
                          CourseRetrieveUpdateDestroyAPIView,EnrollmentListCreateView,
                          EnrollmentRetrieveUpdateDestroyAPIView,LessonListCreateView,
                          LessonRetrieveUpdateDestroyAPIView,AssignmentListCreateView,
                          AssignmentRetrieveUpdateDestroyAPIView,SubmissionListCreateView,
                          SubmissionRetrieveUpdateDestroyAPIView,ResultsListCreateView,
                          ResultsRetrieveUpdateDestroyAPIView)

urlpatterns = [
    path('login/',LoginView.as_view(),name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('register/',RegisterView.as_view(),name='register'),
    path('profile/',ProtectedView.as_view(),name='protected'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path("password-reset/", PasswordResetRequestView.as_view()),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view()),

    #lms main project
    path('teacher/', TeacherListCreateView.as_view(), name='teacher-list'),
    path('teacher/<int:pk>/', TeacherRetrieveUpdateDestroyAPIView.as_view(), name='teacher-detail'),

    path('student/', StudentListCreateView.as_view(), name='student-list'),
    path('student/<int:pk>/', StudentRetrieveUpdateDestroyAPIView.as_view(), name='student-detail'),

    path('course/', CourseListCreateView.as_view(), name='course-list'),
    path('course/<int:pk>/', CourseRetrieveUpdateDestroyAPIView.as_view(), name='course-detail'),

    path('enrollment/', EnrollmentListCreateView.as_view(), name='enrollment-list'),
    path('enrollment/<int:pk>/', EnrollmentRetrieveUpdateDestroyAPIView.as_view(), name='enrollment-detail'),

    path('lesson/', LessonListCreateView.as_view(), name='lesson-list'),
    path('lesson/<int:pk>/', LessonRetrieveUpdateDestroyAPIView.as_view(), name='lesson-detail'),

    path('assignment/', AssignmentListCreateView.as_view(), name='assignment-list'),
    path('assignment/<int:pk>/', AssignmentRetrieveUpdateDestroyAPIView.as_view(), name='assignment-detail'),

    path('submission/', SubmissionListCreateView.as_view(), name='submission-list'),
    path('submission/<int:pk>/', SubmissionRetrieveUpdateDestroyAPIView.as_view(), name='submission-detail'),

    path('results/', ResultsListCreateView.as_view(), name='result-list'),
    path('results/<int:pk>/', ResultsRetrieveUpdateDestroyAPIView.as_view(), name='result-detail'),
]