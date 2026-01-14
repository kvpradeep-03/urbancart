from rest_framework.views import APIView
from ..models import Product, Cart, CartItem, ProductSize
from ..serializers import CartSerializer
from rest_framework.response import Response
from core.utils.authentication import CookieJWTAuthentication
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import (
    get_object_or_404,
)

class AddToCart(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        Product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))
        selected_size = request.data.get("selected_size", None)
        # get_or_create returns two values one is the object and another one is a boolen if a new obj is created or not.
        product = get_object_or_404(Product, id=Product_id)

        # Check if product has sizes
        # here we are writing product=product becasue we have foreignkey relation in ProductSize model (product = models.ForeignKey(Product, on_delete=models.CASCADE))
        # while Django expands it internally expands to product_id=product.id (This is automatic behavior of ForeignKey fields.)
        product_has_sizes = ProductSize.objects.filter(product=product).exists()

        if product_has_sizes:
            if not selected_size:
                return Response(
                    {"error": "Size is required"}, status=400
                )

            selected_size_obj = get_object_or_404(
                ProductSize, size_id=selected_size, product=product
            )
        else:
            # if product has no sizes selected_size should be None
            selected_size_obj = None

        # In Python, _ is used as a throwaway variable. In our case we only need a cart obj we dont need the created boolen so we use throwaway variable
        cart, _ = Cart.objects.get_or_create(user=request.user)

        # if same product exist in cart the qty eill be incremeted else inserted as a new product.
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            selected_size=selected_size_obj,
            quantity=quantity,
        )

        if not created:
            cart_item.quantity += 1

        cart_item.save()

        return Response({"message": "Added to cart"}, status=200)


class ViewCart(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        # passing the cart instance to CartSerializer so DRF knows which cart to serialize.
        # DRF automatically reads fields from this object (id, items) using serializer.instance.
        # Even though we don't manually use `cart` inside the serializer, DRF uses it internally
        # to load cart.id and cart.items and serialize them into JSON.

        serializer = CartSerializer(cart, context={"request": request})
        return Response(serializer.data)


class UpdateCartQuantity(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, item_id):
        quantity = request.data.get("quantity")
        # cart__user -> checks that make sure the cart of this CartItem belongs to the current user,
        # the double underscore is checks that the cart model has the user field thats equal to request.user, so items can be deleted only by the owner

        cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
        cart_item.quantity = quantity
        cart_item.save()

        return Response({"message": "quantity updated"})


class RemoveCartItem(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, item_id):
        cart_item = get_object_or_404(CartItem, id=item_id, cart__user=request.user)
        cart_item.delete()
        return Response({"message": "Product removed"})


class ClearCart(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        cart.items.all().delete()  # deletes every cart item for that user
        return Response({"message": "Cart cleared"}, status=200)
