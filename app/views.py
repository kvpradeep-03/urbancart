import os
from django.utils import timezone
import pytz
from rest_framework import status
from django.shortcuts import render
from rest_framework.views import APIView
from .models import Product, Cart, CartItem, Order, OrderItem
from .serializers import ProductSerializers, CartSerializer, OrderSerializer
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny
from core.authentication import CookieJWTAuthentication
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import (
    get_object_or_404,
) 

# brevo email service api
import brevo_python
from brevo_python.rest import ApiException
from pprint import pprint

from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

class Products(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        # gets multipe category from query params as a list like, /api/products/?category=t-shirts&category=jeanscategory=shoes&category=clothes to --> categories = ["t-shirts", "jeans"]
        
        categories = request.query_params.getlist("category")
        categories = [c.lower() for c in categories]  # normalize to match DB
        price = request.query_params.get("price")
        discount = request.query_params.get("discount")
        products = Product.objects.all()

        # Apply category filter
        if categories:
            # category__in is a special Django ORM filter that checks if the category field of the Product model matches any value in the provided list.
            products = products.filter(category__in=categories)

        # Apply price filter
        if price:
            try:
                price_range = int(price)
                products = products.filter(discount_price__lte=price_range)
            except (ValueError, TypeError):
                pass  # Ignore invalid price values

        # Apply discount filter
        if discount:
            try:
                discount_range = int(discount)
                products = products.filter(discount_percentage__gte=discount_range)
            except (ValueError, TypeError):
                pass  # Ignore invalid discount values

        serializer = ProductSerializers(
            products, many=True, context={"request": request}
        )
        return Response(serializer.data)


class ViewProducts(RetrieveAPIView):
    # here were like serializer_class, queryset, and lookup_field are fixed “keys” that DRF looks for.
    # RetrieveAPIView is a built-in generic view from Django REST Framework (DRF).
    # Its job: Show one single object when we visit a URL. If we type /api/products/dennison/, it should show details of only the Dennison product.
    # It automatically provides get() method & 404 handling if the product doesn’t exist.
    permission_classes = [AllowAny]
    queryset = Product.objects.all()
    serializer_class = ProductSerializers
    lookup_field = "slug"  # tells DRF to use the slug field to look up products

class AddToCart(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes=[IsAuthenticated]

    def post(self, request):
        Product_id = request.data.get("product_id")
        quantity = int(request.data.get("quantity", 1))

        product = get_object_or_404(Product, id=Product_id)
        # getting users cart if not creating
        # get_or_create returns two values one is the object and another one is a boolen if a new obj is created or not.
        # In Python, _ is used as a throwaway variable. In our case we only need a cart obj we dont need the created boolen so we use throwaway variable
        cart, _ = Cart.objects.get_or_create(user=request.user)

        # if same product exist in cart the qty eill be incremeted else inserted as a new product.
        cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)

        if not created:
            cart_item.quantity +=1
        
        cart_item.save()

        return Response({"message": "Added to cart"}, status=200)

class ViewCart(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes=[IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        # passing the cart instance to CartSerializer so DRF knows which cart to serialize.
        # DRF automatically reads fields from this object (id, items) using serializer.instance.
        # Even though we don't manually use `cart` inside the serializer, DRF uses it internally
        # to load cart.id and cart.items and serialize them into JSON.
        
        serializer = CartSerializer(cart)
        return Response(serializer.data)

class UpdateCartQuantity(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request, item_id):
        quantity = request.data.get("quantity")
        # cart__user -> checks that make sure the cart of this CartItem belongs to the current user, 
        # the double underscore is checks that the cart model has the user field thats equal to request.user, so items can be deleted only by the owner
       
        cart_item = get_object_or_404(CartItem, id=item_id, cart__user = request.user)
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


class PlaceOrder(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            cart = get_object_or_404(Cart, user=user)

            if not cart.items.exists():
                return Response({"error": "Cart is empty"}, status=400)

            order = Order.objects.create(user=user)
            order.save()

            total_amount = 0

            for item in cart.items.all():
                price = item.product.discount_price

                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price=price,
                )
                total_amount += price * item.quantity

            order.total_amount = total_amount
            order.save()

            cart.items.all().delete() #clears the cart after order placed

            template_path = os.path.join(
                os.path.dirname(__file__), "../email_templates", "Orders.html"
            )

            with open(template_path, "r", encoding="utf-8") as f:
                html_template = f.read()

            # Build ORDER_ITEMS_LOOP HTML
            items_html = ""
            for item in order.items.all():
                img_url = request.build_absolute_uri(item.product.thumbnail.url)
                item_block = f"""
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:15px;">
                    <tr>
                        <td width="90" valign="top" style="padding:0 10px 10px 0;">
                            <img src="{img_url}" width="80" height="80"
                                style="border-radius:8px; object-fit:cover; display:block;">
                        </td>

                        <td valign="top" style="padding-bottom:10px;">
                            <p style="margin:0; font-size:15px; font-weight:600; color:#222; font-family:'Poppins', Arial;">
                                {item.product.name}
                            </p>
                            <p style="margin:4px 0 0; font-size:14px; color:#555; font-family:'Poppins', Arial;">
                                Qty: {item.quantity}<br>
                                Price: ₹{item.product.discount_price}<br>
                                <strong>Line Total:</strong> ₹{item.quantity * item.product.discount_price}
                            </p>
                        </td>
                    </tr>
                    <tr><td colspan="2" style="border-bottom:1px solid #eee; padding-top:8px;"></td></tr>
                </table>
                """

                items_html += item_block

            # Convert order date to IST
            ist = pytz.timezone("Asia/Kolkata")
            order_date_ist = order.order_date.astimezone(ist)

            replacements = {
                "[[USER_NAME]]": user.username,
                "[[ORDER_ID]]": order.order_id,
                "[[ORDER_DATE]]": order_date_ist.strftime("%d-%m-%Y %I:%M %p"),
                "[[PAYMENT_METHOD]]": "Cash on Delivery",
                "[[TOTAL_AMOUNT]]": total_amount,
                "[[ORDER_ITEMS_LOOP]]": items_html,
            }

            for placeholder, value in replacements.items():
                html_template = html_template.replace(placeholder, str(value))

            configuration = brevo_python.Configuration()
            api_key = os.getenv("BREVO_API_KEY")
            configuration.api_key["api-key"] = api_key

            api_instance = brevo_python.TransactionalEmailsApi(
                brevo_python.ApiClient(configuration)
            )

            email_content = brevo_python.SendSmtpEmail(
                to=[{"email": user.email, "name": user.username}],
                sender={"email": "kvpradeep60@gmail.com", "name": "Urbancart"},
                subject="Order placed successfully, Thank you.",
                html_content=html_template,
            )
            api_instance.send_transac_email(email_content)

        except FileNotFoundError:
            return Response({"error": f"Email template not found at {template_path}"})
        except ApiException as e:
            return Response(
                {"error": f"Error While Sending Email\n{e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except Exception as e:
            return Response(
                {"error": f"Error while Placing Order\n{e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({"message": "Order placed", "order_id": order.order_id})


class UserOrders(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by("-order_date")

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
