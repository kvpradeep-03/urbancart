from rest_framework import serializers
from .models import Product,ProductImage, CartItem, Cart, OrderItem, Order, ProductSize
from app.utils.cloudinary_helpers import build_cloudinary_url

# serializers to convert your model data into JSON (and vice versa)
# It also validates incoming JSON and converts it back into model objects.
class ProductSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSize
        fields = ["size"]
        depth = 1  # So size.name is visible


class ProductSerializers(serializers.ModelSerializer):
    # serializers.ModelSerializer -> Automatically creates a serializer based on your model
    # only need to tell it which model and fields to use

    # SerializerMethodField tells DRF: "Call a method named get_<fieldname>()"
    # whenever this field is serialized like this.
    discount_amount = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()
    thumbnail = serializers.SerializerMethodField()
    sizes = ProductSizeSerializer(many=True)

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
            "sizes",
            "ratings",
            "original_price",
            "discount_price",  # price after discount
            "discount_percentage",
            "discount_amount",  # how much money is discounted
            "images",
        ]

    def get_thumbnail(self, obj):
        """
        obj.thumbnail is a CloudinaryField and this pass a field instance to _cloudinary_url
        """
        return build_cloudinary_url(obj.thumbnail)

    def get_images(self, obj):
        """
        obj.images is a RelatedManager and this pass a field instance to _cloudinary_url
        We must call .all() to get ProductImage objects
        """
        return [build_cloudinary_url(image_obj.image) for image_obj in obj.images.all()]

    def get_discount_amount(self, obj):
        # "obj" here is a single Product instance.
        # Example: Product(name="Campus Sutra", price=819, original_price=1499)
        if obj.original_price and obj.discount_price:
            return obj.original_price - obj.discount_price
        return None


class CartItemSerializer(serializers.ModelSerializer):
    # DRF, When serializing this field, call a method named get_<fiels_name>(self, obj).
    product = serializers.SerializerMethodField()
    selected_size = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["id", "product","selected_size", "quantity", "total_price"]

    def get_product(self, obj):
        product_obj = obj.product

        thumbnail_url = build_cloudinary_url(product_obj.thumbnail)
            
        return {
            "id": obj.product.id,
            "name": obj.product.name,
            "description": obj.product.description,
            "thumbnail": thumbnail_url,
            "discount_percentage": obj.product.discount_percentage,
            "discount_price": obj.product.discount_price,
            "original_price": obj.product.original_price,
        }

    def get_selected_size(self, obj):
        if not obj.selected_size:
            return None
        
        return obj.selected_size.size.size  # "S", "M", "L", or "10", "11"

    # In cartItem model defined a method get_total_price that calculates total price based on quantity and product's discount price
    def get_total_price(self, obj):
        return obj.get_total_price()


class CartSerializer(serializers.ModelSerializer):
    # here DRF uses the passsed cart obj and maps its id and items to serialize a particular user's cart
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()
    total_mrp = serializers.SerializerMethodField()
    total_discount = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            "id",
            "items",
            "total_items",
            "total_mrp",
            "total_discount",
            "total_price",
        ]

    def get_total_items(self, obj):
        return sum(item.quantity for item in obj.items.all())

    def get_total_mrp(self, obj):
        return sum(item.get_total_mrp_price() for item in obj.items.all())

    def get_total_discount(self, obj):
        return sum(item.get_total_discount_price() for item in obj.items.all())

    def get_total_price(self, obj):
        return sum(item.get_total_price() for item in obj.items.all())


class OrderItemSerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField()
    
    def get_product(self, obj):
        if obj.product.thumbnail:
            thumbnail_url = build_cloudinary_url(obj.product.thumbnail)
        
        return {
            "id": obj.product.id,
            "name": obj.product.name,
            "description": obj.product.description,
            "thumbnail": thumbnail_url,
            "discount_percentage": obj.product.discount_percentage,
            "discount_price": obj.product.discount_price,
            "original_price": obj.product.original_price,
        }

    class Meta:
        model = OrderItem
        fields = ["id", "product", "quantity", "size", "price"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ["id", "order_id", "order_date", "status", "total_amount", "items"]


class ProductInOrderSerializer(serializers.ModelSerializer):
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ["product", "quantity", "price", "size", "thumbnail"]

    def get_thumbnail(self, obj):
        return build_cloudinary_url(obj.product.thumbnail)


class OrderDetailSerializer(serializers.ModelSerializer):
    items = ProductInOrderSerializer(many=True, read_only=True)
    address = serializers.SerializerMethodField()
    payment_id = serializers.SerializerMethodField()
    order_date = serializers.DateTimeField(format="%d-%m-%Y %I:%M %p", read_only=True)

    class Meta:
        model = Order
        fields = [
            "order_id",
            "order_date",
            "payment_method",
            "payment_status",
            "payment_id",
            "total_amount",
            "address",
            "items",
        ]

    def get_address(self, obj):
        return {
            "name": obj.shipping_name,
            "phone": obj.shipping_phone,
            "street": obj.shipping_street,
            "city": obj.shipping_city,
            "state": obj.shipping_state,
            "pincode": obj.shipping_pincode,
        }

    def get_payment_id(self, obj):
        return obj.razorpay_payment_id or "-"


class CreateProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            "name",
            "description",
            "category",
            "sizes",
            "stock",
            "ratings",
            "gender",
            "thumbnail",
            "original_price",
            "discount_percentage",
            # images are get stored by views.py
            # id,slug, discount_price are auto generated fields so we dont need to pass them
        ]
