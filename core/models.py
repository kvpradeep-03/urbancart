from django.db import models
from django.contrib.auth.models import AbstractUser

# Creating a new model CustomUser that inherits from AbstractUser.
# This means it already has all the default fields (like username, email, first_name, last_name, password, etc.) and we adding custom fields
class CustomUser(AbstractUser):
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    is_seller = models.BooleanField(default=False)

    def __str__(self):
        return self.username
