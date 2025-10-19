from django.db import models
from django.contrib.auth.models import AbstractUser

# Creating a new model CustomUser that inherits from AbstractUser.
# This means it already has all the default fields (like username, email, first_name, last_name, password, etc.) and we adding custom fields
class CustomUser(AbstractUser):
    # overriding the default AbstractUser email field to enfource uniqness
    email = models.EmailField(unique=True,blank=False,null=False)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    is_seller = models.BooleanField(default=False)

    # Telling Django to use email for auth instead of deffault usename auth.
    USERNAME_FIELD = "email"

    # REQUIRED_FIELDS are for when running 'createsuperuser' command.
    # Since email is the USERNAME_FIELD, we just need to list any other required fields (here we need to set the username for superuser).
    # re ensuring that the command line will prompt for the Email, the Username, and the Password when creating an administrator.
    REQUIRED_FIELDS = [
        "username"
    ]  # We require 'username' to be set when creating a superuser

    def __str__(self):
        return self.username
