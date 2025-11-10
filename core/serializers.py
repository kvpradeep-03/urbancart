from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_str, force_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for Registration (Signup)"""

    # This ensures the password is only used for validation and is never returned in the response
    password = serializers.CharField(
        write_only=True, required=True, style={"input_type": "password"}
    )

    class Meta:
        model = CustomUser
        # Fields required for signup, including custom fields
        fields = ("id", "username", "email", "phone", "password")
        # Ensure ID is read-only
        read_only_fields = ("id",)

    # this method calls by the serializer during .is_valid(), it auromatically detects any method named validate_<fieldname> which calls by passing the field value.
    def validate_email(self, value):
        """Ensure email is unique."""
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    # Custom method to handle user creation with password hashing
    # When .save() is called on the serializer, DRF looks for a method called create() or update() It passes the validated_data dictionary into this function.
    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),  # Use .get for optional fields
            phone=validated_data["phone"],
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
    Custom serializer to allow login with email instead of username. by default, SimpleJWT uses username. Returns JWT Tokens.
    """

    email = serializers.CharField(required=True, max_length=255)
    password = serializers.CharField(write_only=True, required=True)

    # Telling the serilizer to look email for authentication lookup.
    # This overrides the default 'username' expected by TokenObtainPairSerializer.
    username_field = "email"

    # Remove the default username field from the serializer's field set
    # This prevents the 'username: This field is required' error
    def __init__(self, *args, **kwargs):
        # Call the parent's constructor first. This populates self.fields
        # with field instances for 'username', 'password', and 'email'.
        super().__init__(*args, **kwargs)
        # Remove the 'username' field from the serializer fields of the parent class
        if "username" in self.fields:
            del self.fields["username"]

    @classmethod
    def get_token(cls, user):
        # This method is executed after successful user authentication. It is responsible for generating the final $\text{JWT}$ payload.
        # it calls super().get_token(user) to get the standard $\text{JWT}$ (containing user ID, expiration, etc.).
        token = super().get_token(user)

        # Add custom claims to the token if needed (customization of the token authentication payload)
        # token['name'] = user.get_full_name()
        token["email"] = user.email

        return token

class PasswordResetRequestSerilizer(serializers.Serializer):
    """
    Serializer for requesting a password reset via email. Were the token is valid for 2hrs as per settings.py PASSWORD_RESET_TIMEOUT setting.
    """
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        try:
            #saving the user data (obj) in the current serializer instance for use in view
            self.user = CustomUser.objects.get(email__iexact=value)
        except CustomUser.DoesNotExist:
            # for security, returns non specific success message even if email not found this prevents enumuration attackes
            self.user = None
        return value

class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming the password reset with uid(encrypted), token(encrypted), and new_password, confirm_new_password."""
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(write_only=True, required=True, style={"input_type": "password"})
    confirm_new_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    def validate_new_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    # The is_valid first triggers field level validationmethods like validate_<field_names>(Checks a single field for complex requirements like email, password etc..)
    # Then it triggers the object level validators like it Checks requirements involving multiple fields (e.g., ensuring password matches confirm_password) or business logic that requires the entire validated dataset
    # Then model level validation Final checks defined on the Django Model itself.
    def validate(self, data):
        if data['new_password'] != data['confirm_new_password']:
            raise serializers.ValidationError({"Error: ": "New password and Confirm new password do not match."})

        try:
            # Decode the UID and get the user
            uid = force_str(urlsafe_base64_decode(data['uid']))
            self.user = CustomUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, CustomUser.DoesNotExist):
            raise serializers.ValidationError({"uid": "Invalid user ID or token."})

        # Check the token validity
        if not default_token_generator.check_token(self.user, data["token"]):
            raise serializers.ValidationError(
                {"token": "Invalid or expired reset token."}
            )

        return data

    def save(self):
        # The user object is attached to self.user from validate()
        self.user.set_password(self.validated_data["new_password"])
        self.user.save()

        # Invalidate all existing tokens/sessions to enforce new login
        try:
            # Blacklist all existing RefreshTokens for the user
            for token in RefreshToken.for_user(self.user).blacklist():
                pass
        except Exception:
            # Handle potential edge cases where no tokens exist
            pass

        return self.user
