from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class CookieJWTAuthentication(JWTAuthentication):
    """
    CookieJWTAuthentication which authenticates the user by getting the access token from the cookie which is setted by login req and validates the token and returns user, validated_token.
    """
    def authenticate(self, request):
        # gets token from Authorization header and authenticates if the token is bearer auth token
        header = self.get_header(request)
        if header is not None:
            return super().authenticate(request)

        # reads the token from cookie if setted
        access_token = request.COOKIES.get("access_token")
        if not access_token:
            return None

        validated_token = self.get_validated_token(access_token)
        user = self.get_user(validated_token)

        return (user, validated_token)
