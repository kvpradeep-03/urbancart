# core/urls.py (Snippet)

from django.urls import path
from .views import (
    UserRegistrationAPIView,
    UserLoginAPIView,
    UserDetailAPIView,
    UserLogoutAPIView,
)  # ... imports the view classes

urlpatterns = [
    # Maps the URL path 'register/' to the view class UserRegistrationAPIView
    path("register/", UserRegistrationAPIView.as_view(), name="api_register"),
    # Maps the URL path 'login/' to the view class UserLoginAPIView
    path("login/", UserLoginAPIView.as_view(), name="api_login"),
    # ... and so on for logout and user detail
    path("user/", UserDetailAPIView.as_view(), name="api_user_detail"),
    path("logout/", UserLogoutAPIView.as_view(), name="api_logout"),
]
