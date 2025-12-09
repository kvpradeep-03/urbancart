import os
import re
from django.utils import timezone
from django.db.models import Sum
import pytz
import razorpay
from rest_framework import status
from django.shortcuts import render
from rest_framework.views import APIView
from .models import Product, ProductImage, Cart, CartItem, Order, OrderItem, ProductSize
from .serializers import (
    ProductSerializers,
    CartSerializer,
    OrderSerializer,
    CreateProductSerializer,
    OrderDetailSerializer,
)
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny
from core.authentication import CookieJWTAuthentication
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import (
    get_object_or_404,
) 
from core.permissions import IsAdmin

# brevo email service api
import brevo_python
from brevo_python.rest import ApiException
from pprint import pprint

from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.db.models import F
from django.db.models import Q

client = razorpay.Client(auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET")))

class Products(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        # gets multipe category from query params as a list like, /api/products/?category=t-shirts&category=jeanscategory=shoes&category=clothes to --> categories = ["t-shirts", "jeans"]

        categories = request.query_params.getlist("category")
        categories = [c.lower() for c in categories]  # normalize to match DB
        price = request.query_params.get("price")
        discount = request.query_params.get("discount")
        products = Product.objects.all()

        # search filter
        search = request.query_params.get("search")
        if search:
            products = products.filter(
                Q(name__icontains=search)
                | Q(description__icontains=search)
                | Q(category__icontains=search)
            )

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
        selected_size = request.data.get("selected_size")

        if not selected_size:
            return Response({"error": "Size is required"}, status=400)

        product = get_object_or_404(Product, id=Product_id)
        # getting users cart if not creating
        # get_or_create returns two values one is the object and another one is a boolen if a new obj is created or not.
        # In Python, _ is used as a throwaway variable. In our case we only need a cart obj we dont need the created boolen so we use throwaway variable

        # Validate ProductSize belongs to the product
        selected_size_obj = get_object_or_404(
            ProductSize, size_id=selected_size, product=product
        )
        cart, _ = Cart.objects.get_or_create(user=request.user)

        # if same product exist in cart the qty eill be incremeted else inserted as a new product.
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, product=product, selected_size=selected_size_obj, quantity=quantity
        )

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

        serializer = CartSerializer(cart, context={"request": request})
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


class ClearCart(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        cart.items.all().delete()  # deletes every cart item for that user
        return Response({"message": "Cart cleared"}, status=200)


class PlaceOrder(APIView):
    # place order for COD's
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            cart = get_object_or_404(Cart, user=user)

            if not cart.items.exists():
                return Response({"error": "Cart is empty"}, status=400)
            
            # Delivery form validation
            shipping_data = request.POST.dict()
            if not re.match(r"^[A-Za-z\s]{3,50}$", shipping_data["shipping_name"]):
                return Response({"error": "Invalid name format"}, status=400)

            if not re.match(r"^[0-9]\d{9}$", shipping_data["shipping_phone"]):
                return Response({"error": "Phone must be 10 digits"}, status=400)

            if not re.match(r"^[A-Za-z0-9\s,.-:]{5,100}$", shipping_data["shipping_street"]):
                return Response({"error": "Invalid street address"}, status=400)

            if not re.match(r"^[A-Za-z\s]{2,50}$", shipping_data["shipping_city"]):
                return Response({"error": "Invalid city name"}, status=400)

            if not re.match(r"^[A-Za-z\s]{2,50}$", shipping_data["shipping_state"]):
                return Response({"error": "Invalid state name"}, status=400)

            if not re.match(r"^\d{6}$", shipping_data["shipping_pincode"]):
                return Response({"error": "Pincode must be 6 digits"}, status=400)


           # Order updation in DB
            order = Order.objects.create(
                user=user,
                payment_method="Cash on Delivery",
                payment_status="pending",
                shipping_name=shipping_data["shipping_name"],
                shipping_phone=shipping_data["shipping_phone"],
                shipping_street=shipping_data["shipping_street"],
                shipping_city=shipping_data["shipping_city"],
                shipping_state=shipping_data["shipping_state"],
                shipping_pincode=shipping_data["shipping_pincode"],
            )
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

class CreateRazorpayOrder(APIView):
    # For razorpay paymentents, order creation, conformation and payment verification are done in backend and only the payment popup is handled in frontend
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        cart = get_object_or_404(Cart, user=user)

        if not cart.items.exists():
            return Response({"error": "Cart is empty"}, status=400)
        
        # Delivery form validation
        shipping_data = request.POST.dict()
        if not re.match(r"^[A-Za-z\s]{3,50}$", shipping_data["shipping_name"]):
            return Response({"error": "Invalid name format"}, status=400)

        if not re.match(r"^[0-9]\d{9}$", shipping_data["shipping_phone"]):
            return Response({"error": "Phone must be 10 digits"}, status=400)

        if not re.match(
            r"^[A-Za-z0-9\s,.-:]{5,100}$", shipping_data["shipping_street"]
        ):
            return Response({"error": "Invalid street address"}, status=400)

        if not re.match(r"^[A-Za-z\s]{2,50}$", shipping_data["shipping_city"]):
            return Response({"error": "Invalid city name"}, status=400)

        if not re.match(r"^[A-Za-z\s]{2,50}$", shipping_data["shipping_state"]):
            return Response({"error": "Invalid state name"}, status=400)

        if not re.match(r"^\d{6}$", shipping_data["shipping_pincode"]):
            return Response({"error": "Pincode must be 6 digits"}, status=400)

        total_amount = sum(item.product.discount_price * item.quantity for item in cart.items.all()) + 45
        amount_paisa = total_amount * 100

        razorpay_order = client.order.create({
            "amount": amount_paisa,
            "currency": "INR",
            "payment_capture": 1
        })

        return Response({
            "razorpay_order_id": razorpay_order["id"],
            "amount": total_amount,
            "key": os.getenv("RAZORPAY_KEY_ID"),
            "email": user.email,
            "name": user.username,
        })

class VerifyRazorpayPayment(APIView):
    # Verifys Razorpay Payment after success popup
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user

            # Validation
            required_fields = [
                "shipping_name",
                "shipping_phone",
                "shipping_street",
                "shipping_city",
                "shipping_state",
                "shipping_pincode",
            ]

            for field in required_fields:
                if not request.data.get(field):
                    return Response(
                        {
                            "error": f"{field.replace('shipping_', '').capitalize()} is required"
                        },
                        status=400,
                    )

            # razorpay_order_id is created while CreateRazorpayOrder
            # razorpay_payment_id, razorpay_signature are proof of successful transaction and security signature for payment verification while it generated at razorpay popup
            razorpay_order_id = request.data.get("razorpay_order_id")
            razorpay_payment_id = request.data.get("razorpay_payment_id")
            razorpay_signature = request.data.get("razorpay_signature")

            # Verify signature with Razorpay
            try:
                client.utility.verify_payment_signature({
                    "razorpay_order_id": razorpay_order_id,
                    "razorpay_payment_id": razorpay_payment_id,
                    "razorpay_signature": razorpay_signature,
                })
            except:
                return Response({"error": "Payment Verification Failed"}, status=400)
                # After payment verified the order is created
            
            #Order creation
            cart = get_object_or_404(Cart, user=user)
            total_amount = sum(item.product.discount_price * item.quantity for item in cart.items.all())

            order = Order.objects.create(
                user=user,
                total_amount=total_amount,
                payment_method="Razorpay",
                payment_status="paid",
                razorpay_order_id=razorpay_order_id,
                razorpay_payment_id=razorpay_payment_id,
                razorpay_signature=razorpay_signature,
                shipping_name=request.data.get("shipping_name"),
                shipping_phone=request.data.get("shipping_phone"),
                shipping_street=request.data.get("shipping_street"),
                shipping_city=request.data.get("shipping_city"),
                shipping_state=request.data.get("shipping_state"),
                shipping_pincode=request.data.get("shipping_pincode"),
            )

            # Adding Order Items
            for item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    price=item.product.discount_price,
                )

            cart.items.all().delete()  # Clear cart
            
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
                "[[PAYMENT_METHOD]]": "Razorpay",
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
        except:
            order.payment_status = "failed"
            order.save()
            return Response({"error": "Payment Failed"}, status=400)

        return Response(
            {
                "message": "Payment Successful",
                "order_id": order.order_id,
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature,
            },
            status=200
        )


class OrderDetail(APIView):
    # Order Details for Success Page
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        order = get_object_or_404(Order, order_id=order_id, user=request.user)
        serializer = OrderDetailSerializer(order)
        return Response(serializer.data)


class UserOrders(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by("-order_date")

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)


class OrderDetailsList(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAdmin]

    def get(self,request):
        orders = Order.objects.all().order_by("-order_date") 
        result = []
        # Convert order date to IST
        ist = pytz.timezone("Asia/Kolkata")
        for order in orders:
            order_date_ist = order.order_date.astimezone(ist)
            items_list = []
            for item in order.items.all():
                items_list.append({
                    "product_name": item.product.name,
                    "thumbnail": request.build_absolute_uri(item.product.thumbnail.url),
                    "quantity": item.quantity,
                    "price": item.price,
                    "line_total": item.quantity * item.price,
                })
            result.append(
                {
                    "order_id": order.order_id,
                    "username": order.user.username,
                    "email": order.user.email,
                    "status": order.status,
                    "items": items_list,
                    "total_amount": order.total_amount,
                    "date": order_date_ist.strftime("%d-%m-%Y %I:%M %p"),
                }
            )

        return Response({"orders": result}, status=200)

class UpdateOrderStatus(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAdmin]

    def post(self, request):
        try:
            order_id = request.data.get("order_id")
            status = request.data.get("status")
            order = Order.objects.get(order_id=order_id)
            allowed = ["pending", "shipped", "delivered", "cancelled"]

            if status not in allowed:
                return Response({"error": "Invalid status"}, status=400)
            old_status = order.status
            order.status = status
            order.save()
            new_status = order.status

            template_path = os.path.join(
                os.path.dirname(__file__), "../email_templates", "OrderStatus.html"
            )
            with open(template_path, "r", encoding="utf-8") as f:
                html_template = f.read()
            replacements = {
                "[[USER_NAME]]": order.user.username,
                "[[ORDER_ID]]": order.order_id,
                "[[OLD_STATUS]]": old_status,
                "[[NEW_STATUS]]": new_status,
                "[[ORDER_DATE]]": order.order_date.strftime("%d-%m-%Y %I:%M %p"),
                "[[TRACKING_URL]]": f"https://urbancart.com/track/{order.order_id}",
            }

            for placeholder, value in replacements.items():
                # Ensure the value is a string before replacement
                if value is not None:
                    html_template = html_template.replace(placeholder, str(value))

            configuration = brevo_python.Configuration()
            api_key = os.getenv("BREVO_API_KEY")
            configuration.api_key["api-key"] = (
                api_key  # Uses the API key from the .env file
            )
            api_instance = brevo_python.TransactionalEmailsApi(
                brevo_python.ApiClient(configuration)
            )

            email_content = brevo_python.SendSmtpEmail(
                to=[{"email": order.user.email, "name": order.user.username}],
                sender={"email": "kvpradeep60@gmail.com", "name": "Urbancart"},
                subject="Order Status",
                html_content=html_template,
            )
            email_response = api_instance.send_transac_email(email_content)

            # Extract a simple serializable piece of data, like the message ID, OR a simple success message.
            email_status_message = f"Welcome email sent successfully. Message ID: {getattr(email_response, 'message_id', 'N/A')}"
        except FileNotFoundError:
            return Response(
                {f"Error: Email Templates file not found at {template_path}"}
            )
        except ApiException as e:
            return Response(
                {f"error: Error While Sending Email \n {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )    
        except Order.DoesNotExist:
            return Response({"error": "order not found"}, status=404)

        return Response({"message": "Order status updated sucessfully"}, status=200)


class CreateProduct(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAdmin]

    def post(self, request):
        try:
            serializer = CreateProductSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=400)

            # saves main details + thumbnail
            product = serializer.save()  

            # Save multiple images
            product_images = request.FILES.getlist("images")    

            for img in product_images:
                ProductImage.objects.create(product=product, image=img)

            return Response({
                "message": "Product created successfully",
                "product_id": product.id
            }, status=201)    
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class DeleteProduct(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAdmin]

    def delete(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        product.delete()
        return Response({"message": "Product deleted"}, status=200)


class AdminDashboardStats(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAdmin]

    def get(self, request):
        total_orders = Order.objects.count()
        # aggregate(Sum) returns {"total": value}. If no orders exist, it returns None,
        # so we use ["total"] or 0 to avoid TypeError and ensure total_sales is always a number.
        total_sales = (
            Order.objects.aggregate(Sum("total_amount"))["total_amount__sum"] or 0
        )

        stats = {
            "total_orders": total_orders,
            "total_sales": total_sales,
            "pending": Order.objects.filter(status="pending").count(),
            "shipped": Order.objects.filter(status="shipped").count(),
            "delivered": Order.objects.filter(status="delivered").count(),
            "cancelled": Order.objects.filter(status="cancelled").count(),
        }

        return Response({"message":stats}, status=200)
class EditProduct(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAdmin]

    def patch(self, request, product_id):
        try:
            product = get_object_or_404(Product, id=product_id)

            editable_fields = [
                "name",
                "description",
                "category",
                "size",
                "gender",
                "original_price",
                "discount_percentage",
                "ratings"
            ]

            for field in editable_fields:
                if field in request.data:
                    setattr(product, field, request.data[field])
            
            if "thumbnail" in request.FILES:
                product.thumbnail = request.FILES["thumbnail"]
            
            product.save()

            if "images" in request.FILES:
                new_images = request.FILES.getlist("images")
                ProductImage.objects.filter(product=product).delete()
                
                for img in new_images:
                    ProductImage.objects.create(product=product, image=img)
            
            return Response({"message": "Product updated successfully"}, status=200)
        
        except Exception as e:
            return Response({"error": str(e)}, status=500)
