from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from django.shortcuts import (
    get_object_or_404,
)  # Not strictly needed for auth, but useful utility
from .serializers import UserRegistrationSerializer, UserSerializer
from .models import CustomUser
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomEmailTokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import TokenError


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
            # These tokens to be used for the immediate subsequent actions like sending a verification email or logging in the user right after signup. 
            # we'll send a verification mail.
            return Response(
                {
                    "message": "User registered successfully.",
                    "user_id": user.id,
                    "access_token": str(tokens.access_token),
                    "refresh_token": str(tokens)
                },
                status=status.HTTP_201_CREATED,
            )

        # If validation fails, return error messages
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmailLoginAPIView(TokenObtainPairView):
    """
    Custom login view that uses the CustomEmailTokenObtainPairSerializer
    to authenticate users via email and password, returning JWT tokens.
    """

    # Set the custom serializer for this view
    serializer_class = CustomEmailTokenObtainPairSerializer
    # This view will now handle POST requests to generate tokens using 'email' and 'password'.


# API View for User Logout
class UserLogoutAPIView(APIView):
    """
    Handles POST requests for user logout.
    Deletes the current authentication token, invalidating it for future requests.
    Requires the user to be authenticated (IsAuthenticated).
    """

    # protected endpoint (like fetching sensitive user data), we use permission_classes = [IsAuthenticated].
    # This tells DRF: "Only allow access if the request header contains a valid authentication token."
    permission_classes = [IsAuthenticated]  
    def post(self, request):
        # request.auth automatically contains the Token instance thanks to TokenAuthentication
        refresh_token = request.data.get("refresh_token")
        if not refresh_token:
            return Response(
                {"message": "Refresh token is required for logout."},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()  # Blacklist the refresh token and access token will expire as well within its lifetime
            response = Response(
                {"message": "Logout successful. Resfresh token invalidated."},
                status=status.HTTP_200_OK
            )
            # delete header cookie if used
            return response
        except TokenError:
            return Response(
                {"error": "Invalid or expired refresh"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e: 
            return Response(
                {"error": f"An unexpected error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# API View for Retrieving Logged-in User Details
class UserDetailAPIView(APIView):
    """
    Retrieves the details of the currently authenticated user.
    Uses JWTAuthentication, which checks the 'Authorization: Bearer <token>' header.
    """

    # Only logged-in users can access this endpoint
    # permission_classes = [IsAuthenticated] -> the authenticates with auth token in the header of the request which is handled by DRF's TokenAuthentication class automatically.
    # and were the token was created during signup.
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # request.user is automatically populated with the CustomUser instance
        # if a valid token was provided.
        serializer = UserSerializer(request.user)
        # Returns the JSON representation of the user (without the password)
        return Response(serializer.data, status=status.HTTP_200_OK)
