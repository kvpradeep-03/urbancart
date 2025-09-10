from rest_framework import serializers
from .models import Product

# serializers to convert your model data into JSON (and vice versa)
# It also validates incoming JSON and converts it back into model objects.
class ProductSerializers(serializers.ModelSerializer):
    # serializers.ModelSerializer -> Automatically creates a serializer based on your model
    # only need to tell it which model and fields to use

    # SerializerMethodField tells DRF: "Call a method named get_<fieldname>()"
    # whenever this field is serialized like this.
    thumbnail = serializers.SerializerMethodField()
    discount_amount = serializers.SerializerMethodField()
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
            "original_price",
            "discount_price", # price after discount
            "discount_percentage",
            "discount_amount",  # how much money is discounted
        ]

    # When DRF serializes an object, it sees "discount_amount" is a
    # SerializerMethodField. By convention, it looks for:
    #   def get_discount_amount(self, obj)
    # and calls it automatically, passing in the current Product instance.
    #
    # You never call this yourself. DRF does it when you call serializer.data.

    def get_thumbnail(self, obj):
        request = self.context.get("request")  # get current request
        if obj.thumbnail:  # if an image exists
            return request.build_absolute_uri(obj.thumbnail.url)
        return None

    def get_discount_amount(self, obj):
        # "obj" here is a single Product instance.
        # Example: Product(name="Campus Sutra", price=819, original_price=1499)
        if obj.original_price and obj.discount_price:
            return obj.original_price - obj.discount_price
        return None
