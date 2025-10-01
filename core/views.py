from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import (
    Token,
)  # Used to generate and retrieve auth token

from django.contrib.auth import authenticate  # Essential for logging in
from django.shortcuts import (
    get_object_or_404,
)  # Not strictly needed for auth, but useful utility

from .serializers import UserRegistrationSerializer, UserSerializer
from .models import CustomUser


# API View for User Registration (Signup)

# The APIView class is a parent class, which you import from rest_framework.views, gives your view all the necessary boilerplate functionality to work correctly as a RESTful API endpoint
# including Handling DRF Requests and Responses,
# Authentication & Permissions: It automatically checks the permission_classes and authentication_classes (like TokenAuthentication) before running your post() method.
# Method Dispatching: It determines whether the request is a POST, GET, PUT, or DELETE and automatically calls the matching method you define (def post, def get, etc.).
# Exception Handling: It catches common errors (like validation failures) and converts them into structured, readable HTTP error responses (e.g., Status 400 Bad Request) instead of crashing the server.


class UserRegistrationAPIView(APIView):
    """
    We're using class-based views (APIView) here instead of function-based views because they provide a cleaner and more organized way to handle different HTTP methods (like GET, POST) in a single class. instead of nesated ifelse messy stmts.
    Handles POST requests for user registration (Signup).
    Uses UserRegistrationSerializer to validate all custom fields and hash the password.
    """

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

            # Create or get an authentication token immediately after successful signup
            token, created = Token.objects.get_or_create(user=user)

            return Response(
                {
                    "message": "User registered successfully.",
                    "user_id": user.id,
                    "token": token.key,  # The key the React app must save
                },
                status=status.HTTP_201_CREATED,
            )

        # If validation fails, return error messages
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# API View for User Login
# TODO: make the authentication token expire after some time.
class UserLoginAPIView(APIView):
    """
    Handles POST requests for user login (Username and Password).
    Returns an authentication token upon success.
    """

    # Allow anyone to access this endpoint
    permission_classes = []

    # If the method is POST, DRF automatically calls the post() method you defined. same as get() and put()
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        # Use Django's built-in authenticate to verify credentials
        user = authenticate(username=username, password=password)

        if user:
            # Retrieve or create the token associated with the logged-in user
            token, created = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "message": "Login successful.",
                    "token": token.key,  # The key the React app must save
                    "user_id": user.id,
                },
                status=status.HTTP_200_OK,
            )
        else:
            return Response(
                {"error": "Invalid username or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )


#vAPI View for User Logout
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
        request.auth.delete()
        return Response(
            {"message": "Logout successful. Token invalidated."},
            status=status.HTTP_200_OK,
        )


# API View for Retrieving Logged-in User Details
class UserDetailAPIView(APIView):
    """
    Retrieves the details of the currently authenticated user.
    Requires the authentication token in the request header.
    Example header:
    'Authorization': `Token ${token}`
    """

    # Only logged-in users can access this endpoint
    # permission_classes = [IsAuthenticated] -> the authenticates with auth token in the header of the request which is handled by DRF's TokenAuthentication class automatically.
    # and were the toke was created during signup.
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # request.user is automatically populated with the CustomUser instance
        # if a valid token was provided.
        serializer = UserSerializer(request.user)

        # Returns the JSON representation of the user (without the password)
        return Response(serializer.data, status=status.HTTP_200_OK)
