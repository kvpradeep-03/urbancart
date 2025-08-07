from rest_framework import serializers
from .models import Product

# serializers to convert your model data into JSON (and vice versa)
# It also validates incoming JSON and converts it back into model objects.
class ProductSerializers(serializers.ModelSerializer):
    # serializers.ModelSerializer -> Automatically creates a serializer based on your model
    # only need to tell it which model and fields to use
    class Meta:
        # Tells it which model to serialize.
        model = Product  
        # List the fields you want in your API response.
        fields = [
            "id",
            "name",
            "slug",
            "image",
            "description",
            "category",
            "price",
        ]  
