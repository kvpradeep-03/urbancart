from rest_framework.permissions import BasePermission

class IsAdmin(BasePermission):
    """
    Allows access only to Django superuser(admin)
    """
    def has_permission(self, request, view):
        return(
            request.user and request.user.is_authenticated and request.user.is_superuser
        )