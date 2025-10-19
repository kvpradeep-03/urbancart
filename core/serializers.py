from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for Registration (Signup)"""
    # This ensures the password is only used for validation and is never returned in the response
    password = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )

    class Meta:
        model = CustomUser
        # Fields required for signup, including custom fields
        fields = ("id", "username", "email", "password")
        # Ensure ID is read-only
        read_only_fields = ("id",)

    def validate_email(self, value):
        """Ensure email is unique."""
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    # Custom method to handle user creation with password hashing
    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),  # Use .get for optional fields
            password=validated_data["password"],
        )
        return user

class UserSerializer(serializers.ModelSerializer):
    """Serializer for User Details(Protected Endpoint)"""
    class Meta:
        model = CustomUser
        # Fields to expose to the logged-in user
        fields = (
            "id",
            "username",
            "email",
            "city",
            "state",
            "address",
            "phone",
            "is_seller",
            "first_name",
            "last_name",
        )
        read_only_fields = fields

# Note: The EmailTokenObtainPairSerializer expects the client to send:
# {
#   "email": "user@example.com",
#   "password": "yourpassword"
# }
class CustomEmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom serializer to allow login with email instead of username. by default, SimpleJWT uses username.
    """
    email = serializers.CharField(required=True, max_length=255)
    password = serializers.CharField(write_only=True, required=True)

    # Telling the serilizer to look email for authentication lookup.
    # This overrides the default 'username' expected by TokenObtainPairSerializer.
    username_field = "email"

    # Remove the default username field from the serializer's field set
    # This prevents the 'username: This field is required' error & must redefine fields if you want to alter the required set.
    def __init__(self, *args, **kwargs):
        # Call the parent's constructor first. This populates self.fields
        # with field instances for 'username', 'password', and 'email'.
        super().__init__(*args, **kwargs)
        # Remove the 'username' field from the serializer fields
        if "username" in self.fields:
            del self.fields["username"]


    @classmethod
    def get_token(cls, user):
        # This method is executed after successful user authentication. It is responsible for generating the final $\text{JWT}$ payload.
        # it calls super().get_token(user) to get the standard $\text{JWT}$ (containing user ID, expiration, etc.).
        token = super().get_token(user)

        # Add custom claims to the token if needed (customization of the token authentication payload)
        # token['name'] = user.get_full_name()
        token['email'] = user.email

        return token
