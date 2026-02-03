import os
import re
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from django.shortcuts import (
    get_object_or_404,
)  # Not strictly needed for auth, but useful utility
from .serializers import (
    UserRegistrationSerializer,
    UserSerializer,
    PasswordResetRequestSerilizer,
    PasswordResetConfirmSerializer,
)
from django.core.validators import validate_email
from django.contrib.auth.validators import UnicodeUsernameValidator
from django.core.exceptions import ValidationError

from .models import CustomUser
from app.serializers import CartSerializer, OrderSerializer
from app.models import Cart, Order
from django.conf import settings
from core.utils.authentication import CookieJWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.serializers import TokenRefreshSerializer
from .serializers import CustomEmailTokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import TokenError
from datetime import timedelta
from rest_framework.response import Response
from rest_framework import status

# brevo email service api
import brevo_python
from brevo_python.rest import ApiException
from pprint import pprint

from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

# API View for User Registration (Signup)

# The APIView class is a parent class, which you import from rest_framework.views, gives your view all the necessary boilerplate functionality to work correctly as a RESTful API endpoint
# including Handling DRF Requests and Responses,
# Authentication & Permissions: It automatically checks the permission_classes and authentication_classes (like TokenAuthentication) before running your post() method.
# Method Dispatching: It determines whether the request is a POST, GET, PUT, or DELETE and automatically calls the matching method you define (def post, def get, etc.).
# Exception Handling: It catches common errors (like validation failures) and converts them into structured, readable HTTP error responses (e.g., Status 400 Bad Request) instead of crashing the server.


class UserRegistrationAPIView(APIView):
    # We're using class-based views (APIView) here instead of function-based views because they provide a cleaner and more organized way to handle different HTTP methods (like GET, POST) in a single class. instead of nesated ifelse messy stmts.
    # Handles POST requests for user registration (Signup).
    # Uses UserRegistrationSerializer to validate all custom fields and hash the password.

    # The permission_classes attribute is a list (or tuple) that defines who is allowed to access this API view.
    # This is part of DRF's comprehensive system for managing authorization (what a user can do) and access control.
    # The empty list is essentially treated as AllowAny. Since this is the Signup view, we want anyone (authenticated or not) to be able to access it and create a new account.
    permission_classes = []

    def post(self, request):
        # Pass the incoming JSON data to the registration serializer
        serializer = UserRegistrationSerializer(data=request.data)

        if serializer.is_valid():
            # serializer.save() calls the custom create() method to hash the password
            user = serializer.save()
            tokens = RefreshToken.for_user(user)
            try:
                # sends a email to the user on successful registration

                # loads email template file
                template_path = os.path.join(
                    os.path.dirname(__file__), "../email_templates", "welcome.html"
                )
                with open(template_path, "r", encoding="utf-8") as f:
                    html_template = f.read()
                replacements = {
                    # [[params]] using double square brackets to avoid conflicts with other templating syntaxes
                    "[[USER_NAME]]": user.username,
                    "[[SITE_URL]]": settings.SITE_URL
                }

                for placeholder, value in replacements.items():
                    # Ensure the value is a string before replacement
                    if value is not None:
                        html_template = html_template.replace(placeholder, str(value))

                configuration = brevo_python.Configuration()
                api_key = os.getenv("BREVO_API_KEY")
                configuration.api_key["api-key"] = (
                    api_key  # Uses the API key from the .env file
                )
                api_instance = brevo_python.TransactionalEmailsApi(
                    brevo_python.ApiClient(configuration)
                )

                email_content = brevo_python.SendSmtpEmail(
                    to=[{"email": user.email, "name": user.username}],
                    sender={"email": "kvpradeep60@gmail.com", "name": "Urbancart"},
                    subject="Welcome to UrbanCart!",
                    html_content=html_template,
                )
                email_response = api_instance.send_transac_email(email_content)

                # Extract a simple serializable piece of data, like the message ID, OR a simple success message.
                email_status_message = f"Welcome email sent successfully. Message ID: {getattr(email_response, 'message_id', 'N/A')}"
            except FileNotFoundError:
                return Response(
                    {f"Error: Email Templates file not found at {template_path}"}
                )
            except ApiException as e:
                return Response(
                    {f"error: Error While Sending Email \n {e}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
            except Exception as e:
                return Response(
                    {f"error: Error while Account Creation \n {e}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            # These tokens to be used for the immediate subsequent actions like sending a verification email or logging in the user right after signup.
            # we'll send a verification mail.
            return Response(
                {
                    "message": "User registered successfully.",
                    "email_response": email_status_message,
                    "user_id": user.id,
                    # "access_token": str(tokens.access_token),
                    # "refresh_token": str(tokens),
                },
                status=status.HTTP_201_CREATED,
            )

        # If validation fails, return error messages
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmailLoginAPIView(TokenObtainPairView):
    """
    Custom login view that uses the CustomEmailTokenObtainPairSerializer
    to authenticate users via email and password, and sets cookie in the header
    """

    # Set the custom serializer for this view
    serializer_class = CustomEmailTokenObtainPairSerializer
    # This view will now handle POST requests to generate tokens using 'email' and 'password'.

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response(
                {"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )

        user = serializer.user
        refresh = serializer.validated_data["refresh"]
        access = serializer.validated_data["access"]

        # Prepare response
        response = Response({"message": "Login successful"}, status=status.HTTP_200_OK)

        # Set cookies (secure & HttpOnly)
        # Once the cookie is setted in the header of the request
        # Then in frontend just calls the API with axios.get('/profile/', { withCredentials: true })
        # The browser automatically sends the access_token cookie along with the request
        # On the Django side, the authentication class CookieJWTAuthentication reads that cookie, access_token = request.COOKIES.get("access_token")

        response.set_cookie(
            key="access_token",
            value=str(access),
            httponly=True,
            # cookie is only sent over HTTPS when in production and HTTP in local dev
            secure=not settings.DEBUG,
            # samesite attribute to control cross-site request behavior, Setted as None in prod and Lax in dev
            samesite="None" if not settings.DEBUG else "Lax",
            max_age=int(timedelta(minutes=15).total_seconds()),
        )

        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=not settings.DEBUG,
            samesite="None" if not settings.DEBUG else "Lax",
            max_age=int(timedelta(days=1).total_seconds()),
        )

        # Optionally return limited user info (safe to share)
        response.data["user"] = {
            "id": user.id,
            "email": user.email,
            "username": user.username,
        }

        return response


class RefreshAPIView(TokenRefreshView):
    """
    Custom TokenRefreshView that reads the refresh token from HttpOnly cookies.
    """

    serializer_class = TokenRefreshSerializer

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response(
                {"detail": "Refresh token not provided in cookies."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        # providing refresh token to jwt TokenRefreshSerializer
        serializer = self.get_serializer(data={"refresh": refresh_token})

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return Response(
                {"detail": "Invalid or expired refresh token."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        access_token = serializer.validated_data.get("access")
        refresh_token = serializer.validated_data.get("refresh")

        response = Response(
            {
                "message": "Refresh succesfull",
            },
            status=status.HTTP_200_OK,
        )

        response.set_cookie(
            key="access_token",
            value=str(access_token),
            httponly=True,
            secure=not settings.DEBUG,
            samesite="None" if not settings.DEBUG else "Lax",
            max_age=int(timedelta(minutes=15).total_seconds()),
        )

        response.set_cookie(
            key="refresh_token",
            value=str(refresh_token),
            httponly=True,
            secure=not settings.DEBUG,
            samesite="None" if not settings.DEBUG else "Lax",
            max_age=int(timedelta(days=1).total_seconds()),
        )

        return response


# API View for User Logout
class LogoutAPIView(APIView):
    """
    Handles POST requests for user logout.
    Deletes the cookies(access, refresh tokens) from the req header
    Requires the user to be authenticated (IsAuthenticated).
    """

    # protected endpoint (like fetching sensitive user data), we use permission_classes = [IsAuthenticated].
    # This tells DRF: "Only allow access if the request header contains a valid authentication token."
    permission_classes = [IsAuthenticated]

    def post(self, request):
        response = Response({"message": "Logged out"}, status=200)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response


# API View for Retrieving Logged-in User Details
class UserDetailAPIView(APIView):
    """
    Retrieves the details of the currently authenticated user.
    requires cookies in the headers
    """

    # authentication_classes defines how the API identifies who the user is.
    # Extract credentials (token, cookie, session ID, etc.) from the request. Validate them.
    # If valid returns (user, auth) tuple else sets none
    # here we mannualy extrated tokens from header (which is setted as cookie) and authenticated them so in frontend we dont need to set any headers like (Bearer auth)
    authentication_classes = [CookieJWTAuthentication]

    # Only logged-in users can access this endpoint
    # permission_classes = [IsAuthenticated] -> the authenticates with auth token in the header of the request which is handled by DRF's TokenAuthentication class automatically.
    # and were the token was created during signup.
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # request.user is automatically populated with the CustomUser instance
        # if a valid token was provided.
        serializer = UserSerializer(request.user)

        cart, _ = Cart.objects.get_or_create(user=request.user)
        cartDetails = CartSerializer(cart)

        orders = Order.objects.filter(user=request.user).order_by("-order_date")
        orderDetails = OrderSerializer(orders, many=True)
        # Returns the JSON representation of the user (without the password)
        return Response(
            {"user": serializer.data, "cart": cartDetails.data, "orders": orderDetails.data},
            status=status.HTTP_200_OK,
        )


class EditUserProfile(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        editable_fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "city",
            "state",
            "address",
            "phone",
        ]

        new_email = request.data.get("email")
        if new_email:
            try:
                validate_email(new_email)
            except ValidationError:
                return Response({"error": "Invalid email format"}, status=400)

            # Check uniqueness (except current user)
            if CustomUser.objects.filter(email=new_email).exclude(id=user.id).exists():
                return Response({"error": "Email already in use"}, status=400)

            user.email = new_email

        new_username = request.data.get("username")
        if new_username:
            new_username = new_username.strip()
            if not 8 <= len(new_username) <= 16:
                return Response(
                    {"error": "Username must be between 8 and 16 characters long"},
                    status=400
                )

            if not re.fullmatch(r"[A-Za-z0-9@#$%^&*!._+\-\s]+", new_username):
                return Response(
                    {"error": "Username contains invalid characters"},
                    status=400
                )

            
            letters_count = len(re.findall(r"[A-Za-z]", new_username))
            if letters_count < 4:
                return Response(
                    {"error": "Username must contain at least 4 letters"},
                    status=400
                )

            # Check uniqueness (excluding current user)
            if CustomUser.objects.filter(username=new_username).exclude(id=user.id).exists():
                return Response(
                    {"error": "Username already in use"},
                    status=400
                )

            user.username = new_username


        phone = request.data.get("phone")
        if phone:
            if not phone.isdigit() or len(phone) not in [10]:
                return Response({"error": "Invalid phone number"}, status=400)
            user.phone = phone

        for field in editable_fields:
            if field in request.data and request.data[field] not in ["", None]:
                setattr(user, field, request.data[field])

        user.save()
        return Response({"message": "Profile updated successfully"}, status=200)


class DeleteAccountAPIView(APIView):
    """
    API endpoint for an authenticated user to delete their own account.
    Requires a valid JWT Access Token in the Authorization header.
    """

    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        try:
            user.delete()
            template_path = os.path.join(
                os.path.dirname(__file__), "../email_templates", "AccountClosure.html"
            )
            with open(template_path, "r", encoding="utf-8") as f:
                html_template = f.read()
            replacements = {
                # [[params]] using double square brackets to avoid conflicts with other templating syntaxes
                "[[USER_NAME]]": user.username
            }

            for placeholder, value in replacements.items():
                # Ensure the value is a string before replacement
                if value is not None:
                    html_template = html_template.replace(placeholder, str(value))

            configuration = brevo_python.Configuration()
            api_key = os.getenv("BREVO_API_KEY")
            configuration.api_key["api-key"] = (
                api_key  # Uses the API key from the .env file
            )
            api_instance = brevo_python.TransactionalEmailsApi(
                brevo_python.ApiClient(configuration)
            )

            email_content = brevo_python.SendSmtpEmail(
                to=[{"email": user.email, "name": user.username}],
                sender={"email": "kvpradeep60@gmail.com", "name": "Urbancart"},
                subject="Your Urbancart account closure is confirmed",
                html_content=html_template,
            )
            email_response = api_instance.send_transac_email(email_content)

            # Extract a simple serializable piece of data, like the message ID, OR a simple success message.
            email_status_message = f"Account closure email sent successfully. Message ID: {getattr(email_response, 'message_id', 'N/A')}"
        except FileNotFoundError:
            return Response(
                {f"Error: Email Templates file not found at {template_path}"}
            )
        except ApiException as e:
            return Response(
                {f"error: Error While Sending Email \n {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception as e:
            return Response(
                {f"error: Error while deleting Account \n {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"message": "User account deleted successfully."},
            status=status.HTTP_204_NO_CONTENT,
        )


class PasswordResetRequestAPIView(APIView):
    """
    Takes an email address and sends a password reset link containing a uid and token to the mail.
    """

    permission_classes = []

    def post(self, request):
        serializer = PasswordResetRequestSerilizer(data=request.data)
        if serializer.is_valid():
            user = serializer.user
        else:
            # If validation fails 'email' is missing or empty, return the 400 Bad Request error.
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        if user:
            # generating uid and token
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            try:
                template_path = os.path.join(
                    os.path.dirname(__file__),
                    "../email_templates",
                    "password_reset.html",
                )
                with open(template_path, "r", encoding="utf-8") as f:
                    html_template = f.read()

                replacements = {
                    "[[USER_NAME]]": user.username,
                    "[[RESET_LINK]]": f"{settings.SITE_URL}/reset-password/{uid}/{token}/",
                }
                for placeholder, value in replacements.items():
                    if value is not None:
                        html_template = html_template.replace(placeholder, str(value))

                configuration = brevo_python.Configuration()
                configuration.api_key["api-key"] = os.getenv("BREVO_API_KEY")
                api_instance = brevo_python.TransactionalEmailsApi(
                    brevo_python.ApiClient(configuration)
                )

                email_content = brevo_python.SendSmtpEmail(
                    to=[{"email": user.email, "name": user.username}],
                    sender={"email": "kvpradeep60@gmail.com", "name": "Urbancart"},
                    subject="Password Reset Request",
                    html_content=html_template,
                )
                email_response = api_instance.send_transac_email(email_content)

            except FileNotFoundError:
                return Response(
                    {f"Error: Email Templates file not found at {template_path}"}
                )
            except ApiException as e:
                return Response(
                    {
                        "error": "Failed to send reset email. Please try again."
                        f" Error details: {str(e)}"
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
            except Exception as e:
                return Response(
                    "An unexpected error occurred during email sending."
                    f" Error details: {str(e)}",
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
        # return a non specific message to prevent email enumeration attacks
        return Response(
            {
                "message": "If a matching account was found, a password reset email has been sent.",
            },
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmAPIView(APIView):
    """
    Confirms the password reset using uid and token, and sets the new password. expects: {uid, token, new_password}
    """

    permission_classes = []

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        # The serializer validates uid, token, new_password, and password match
        serializer.is_valid(raise_exception=True)

        # The save method sets the new password and invalidates old tokens
        user = serializer.save()

        return Response(
            {
                "message": "Password has been successfully reset. Please log in with your new password."
            },
            status=status.HTTP_200_OK,
        )
