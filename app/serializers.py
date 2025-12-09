from rest_framework import serializers
from .models import Product, ProductImage, CartItem, Cart, OrderItem, Order, ProductSize


# serializers to convert your model data into JSON (and vice versa)
# It also validates incoming JSON and converts it back into model objects.
class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image")  # DRF will return the image URL


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
    # many=True because a product can have multiple images
    # read_only=True means this nested field is included in responses but not expected/used for creating/updating via the same serializer (to support writes you’d need custom create/update logic).
    images = ProductImageSerializer(many=True, read_only=True)  # related_name="images"
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
    # DRF, When serializing this field, call a method named get_<fiels_name>(self, obj).
    product = serializers.SerializerMethodField()
    selected_size = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["id", "product","selected_size", "quantity", "total_price"]
    # class CartItemSerializer(serializers.ModelSerializer):
    # DRF, When serializing this field, call a method named get_<fiels_name>(self, obj).
    product = serializers.SerializerMethodField()
    selected_size = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["id", "product", "selected_size", "quantity", "total_price"]
    # get_product method looks up the related Product instance using the ForeignKey relationship.
    # The ForeignKey relationship allows us to access the related Product object directly from the CartItem instance.
    def get_product(self, obj):
        request = self.context.get("request")
        #to preven race condition when building absolute uri at login time
        if request:
            thumbnail_url = request.build_absolute_uri(obj.product.thumbnail.url)
        else:
            thumbnail_url = obj.product.thumbnail.url  # fallback relative path
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
    product = ProductSerializers(read_only=True)
    class Meta:
        model = OrderItem
        fields = ["id", "product", "quantity", "price"]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    class Meta:
        model = Order
        fields = ["id", "order_id", "order_date", "status", "total_amount", "items"]


class ProductInOrderSerializer(serializers.ModelSerializer):
    thumbnail = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ["product", "quantity", "price", "thumbnail"]

    def get_thumbnail(self, obj):
        return obj.product.thumbnail.url


class OrderDetailSerializer(serializers.ModelSerializer):
    items = ProductInOrderSerializer(source="orderitem_set", many=True)
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
            "items",
        ]


    def get_address(self, obj):
        return {
            "name": obj.shipping_name,
            "phone": obj.shipping_phone,
            "street": obj.shipping_address,
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
            #images are get stored by views.py
            #id,slug, discount_price are auto generated fields so we dont need to pass them
        ]
