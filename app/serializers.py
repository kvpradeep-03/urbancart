from rest_framework import serializers
from .models import Product, ProductImage


# serializers to convert your model data into JSON (and vice versa)
# It also validates incoming JSON and converts it back into model objects.
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image")  # DRF will return the image URL


class ProductSerializers(serializers.ModelSerializer):
    # serializers.ModelSerializer -> Automatically creates a serializer based on your model
    # only need to tell it which model and fields to use

    # SerializerMethodField tells DRF: "Call a method named get_<fieldname>()"
    # whenever this field is serialized like this.
    discount_amount = serializers.SerializerMethodField()
    # many=True because a product can have multiple images
    # read_only=True means this nested field is included in responses but not expected/used for creating/updating via the same serializer (to support writes you’d need custom create/update logic).
    images = ProductImageSerializer(many=True, read_only=True)  # related_name="images"

    class Meta:
        # Tells it which model to serialize.
        model = Product
        # List the fields you want in your API response.
        fields = [
            "id",
            "name",
            "slug",
            "thumbnail",
            "description",
            "category",
            "size",
            "ratings",
            "original_price",
            "discount_price",  # price after discount
            "discount_percentage",
            "discount_amount",  # how much money is discounted
            "images",
        ]

    # When DRF serializes an object, it sees "discount_amount" is a
    # SerializerMethodField. By convention, it looks for:
    #   def get_discount_amount(self, obj)
    # and calls it automatically, passing in the current Product instance.
    #
    # You never call this yourself. DRF does it when you call serializer.data.

    def get_discount_amount(self, obj):
        # "obj" here is a single Product instance.
        # Example: Product(name="Campus Sutra", price=819, original_price=1499)
        if obj.original_price and obj.discount_price:
            return obj.original_price - obj.discount_price
        return None
