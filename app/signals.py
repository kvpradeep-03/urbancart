import os
from django.db.models.signals import post_delete
from django.dispatch import receiver
from .models import Product, ProductImage

# When we delete a model object (Product, ProductImage), Django deletes only the database row.
# It does NOT delete the actual file stored in:
# media/products/thumbnails/
# media/products/images/
# in signals When we delete a product , Django fires a “post_delete” event
# The signal catches this event the signal function gets the file path
# Deletes the thumbnail file and all related ProductImage files
# Keeps your media folder clean

# Delete product thumbnail file
@receiver(post_delete, sender=Product)
def delete_product_thumbnail(sender, instance, **kwargs):
    if instance.thumbnail:
        instance.thumbnail.delete(save=False)


@receiver(post_delete, sender=ProductImage)
def delete_product_image(sender, instance, **kwargs):
    if instance.image:
        instance.image.delete(save=False)
