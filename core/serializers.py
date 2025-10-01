from rest_framework import serializers
from .models import CustomUser


# Serializer for Registration (Signup)
class UserRegistrationSerializer(serializers.ModelSerializer):
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

    # Custom method to handle user creation with password hashing
    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),  # Use .get for optional fields
            password=validated_data["password"],
        )
        return user


# Serializer for User Details (Protected Endpoint)
class UserSerializer(serializers.ModelSerializer):
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
