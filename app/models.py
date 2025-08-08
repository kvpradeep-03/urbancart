from django.db import models
from django.utils.text import slugify

# Create your models here.
class Product(models.Model):
    CATEGORY = (("Electronics", "ELECTRONICS"),
                ("Groceries", "GROCERIES"),
                ("Clothings", "CLOTHINGS")
                )

    name = models.CharField(max_length=100)
    slug = models.SlugField(blank=True, null=True)
    image = models.FileField(upload_to="img")
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=50, choices=CATEGORY)
    price = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # If the object has no slug yet, then generate one
        if not self.slug:
            # Converts the product name into url friendly, "iPhone 15 Pro" → "iphone-15-pro"
            base_slug = slugify(self.name)
            unique_slug = base_slug
            # Prepare a counter to create a unique slug
            counter = 1

            if Product.objects.filter(slug=unique_slug).exists():
                # Make it unique by adding a number, So instead of iphone-15-pro, it becomes iphone-15-pro-1
                unique_slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = unique_slug

        super().save(*args, **kwargs)
