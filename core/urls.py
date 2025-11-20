# core/urls.py (Snippet)

from django.urls import path
from .views import (
    UserRegistrationAPIView,
    EmailLoginAPIView,
    UserDetailAPIView,
    RefreshAPIView,
    LogoutAPIView,
    DeleteAccountAPIView,
    PasswordResetRequestAPIView,
    PasswordResetConfirmAPIView,
    EditUserProfile,
)

urlpatterns = [
    # Maps the URL path 'register/' to the view class UserRegistrationAPIView
    path("register/", UserRegistrationAPIView.as_view(), name="api_register"),
    # JWT Login (customized email/ authentication)
    path("login/", EmailLoginAPIView.as_view(), name="token_obtain_pair"),
    path("refresh/", RefreshAPIView.as_view(), name="token_refresh"),
    # # Maps the URL path 'login/' to the view class UserLoginAPIView
    # path("login/", UserLoginAPIView.as_view(), name="api_login"),
    # ... and so on for logout and user detail
    path("user/", UserDetailAPIView.as_view(), name="api_user_detail"),
    path("logout/", LogoutAPIView.as_view(), name="api_logout"),
    path(
        "reset-password/", PasswordResetRequestAPIView.as_view(), name="password_reset"
    ),
    path(
        "reset-password/confirm/",
        PasswordResetConfirmAPIView.as_view(),
        name="password_reset_confirm",
    ),
    path("delete-account/", DeleteAccountAPIView.as_view(), name="api_delete_account"),
    path("editUserProfile/", EditUserProfile.as_view()),
]
