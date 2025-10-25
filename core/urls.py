# core/urls.py (Snippet)

from django.urls import path
from .views import (
    UserRegistrationAPIView,
    EmailLoginAPIView,
    UserDetailAPIView,
    UserLogoutAPIView,
    DeleteAccountAPIView
)  # ... imports the view classes
from rest_framework_simplejwt.views import (
    TokenRefreshView,  # Handles POST to /refresh/
    TokenVerifyView,  # Optional: To check if a token is valid
)

urlpatterns = [
    # Maps the URL path 'register/' to the view class UserRegistrationAPIView
    path("register/", UserRegistrationAPIView.as_view(), name="api_register"),
    # JWT Login (customized email/ authentication)
    path("login/", EmailLoginAPIView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # # Maps the URL path 'login/' to the view class UserLoginAPIView
    # path("login/", UserLoginAPIView.as_view(), name="api_login"),
    # ... and so on for logout and user detail
    path("user/", UserDetailAPIView.as_view(), name="api_user_detail"),
    path("logout/", UserLogoutAPIView.as_view(), name="api_logout"),
    path("delete-account/", DeleteAccountAPIView.as_view(), name="api_delete_account"),
]
