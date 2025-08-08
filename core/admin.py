from django.contrib import admin
# importing UserAdmin so you can customize how user forms behave in the admin.
from django.contrib.auth.admin import UserAdmin
# importing your CustomUser model to register it.
from .models import CustomUser


# creating a new admin class that extends Django's built-in UserAdmin
class CustomUserAdmin(UserAdmin):
    # we customize our default userModel as CustomUser model, Django shows a form with default fields like: Username, Password, Email, etc.
    # But since you added new fields like: city, state, address, phone so we're telling django that these are the added extra fields in usermodel.
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "username",
                    "email",
                    "first_name",
                    "last_name",
                    "password1",
                    "password2",
                    "city",
                    "state",
                    "address",
                    "phone",
                    "is_staff",
                    "is_active",
                ),
            },
        ),
    )

    # Editing those custom user fields
    fieldsets = UserAdmin.fieldsets + (
        (
            "Additional Info",
            {
                "fields": ("city", "state", "address", "phone"),
            },
        ),
    )


admin.site.register(CustomUser, CustomUserAdmin)
