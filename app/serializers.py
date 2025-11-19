from rest_framework import serializers
from .models import Product, ProductImage, CartItem, Cart, OrderItem, Order


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


class CartItemSerializer(serializers.ModelSerializer):
    # When serializing an CartItem, also serialize the related Product using ProductSerializers To show full product details and it done by DRF
    product = ProductSerializers(read_only=True)
    # DRF, When serializing this field, call a method named get_total_price(self, obj).
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["id", "product", "quantity", "total_price"]
    # This calls a method inside the CartItem model.
    def get_total_price(self, obj):
        return obj.get_total_price()

class CartSerializer(serializers.ModelSerializer):
    # here DRF uses the passsed cart obj and maps its id and items to serialize a particular user's cart
    items = CartItemSerializer(many=True, read_only=True)
    class Meta:
        model = Cart
        fields = ["id", "items"]


class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializers(read_only=True)
    class Meta:
        model = OrderItem
        fields = ["id", "product", "quantity", "price"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    class Meta:
        model = Order
        fields = ["id", "order_id", "order_date", "status", "total_amount", "items"]

class CreateProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "name",
            "description",
            "category",
            "size",
            "gender",
            "thumbnail",
            "original_price",
            "discount_percentage",
            #images are get stored by views.py
            #id,slug, discount_price are auto generated fields so we dont need to pass them
        ]