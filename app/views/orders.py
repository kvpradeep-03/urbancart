import os
import re
from django.utils import timezone
from django.db.models import Sum
import pytz
import razorpay
from ..models import Cart, Order, OrderItem
from ..serializers import OrderSerializer, OrderDetailSerializer
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from core.utils.authentication import CookieJWTAuthentication
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import (
    get_object_or_404,
)
from app.utils.cloudinary_helpers import build_cloudinary_url
from django.db.models import Q

# brevo email service api
import brevo_python
from brevo_python.rest import ApiException
from pprint import pprint

from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.db.models import F
from django.db.models import Q

# razorpay client
client = razorpay.Client(
    auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET"))
)


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
            # Delivery form validation: use DRF-parsed data (works with JSON, form, multipart)
            sd = request.data or {}
            shipping_name = (sd.get("shipping_name") or "").strip()
            shipping_phone = (sd.get("shipping_phone") or "").strip()
            shipping_street = (sd.get("shipping_street") or "").strip()
            shipping_city = (sd.get("shipping_city") or "").strip()
            shipping_state = (sd.get("shipping_state") or "").strip()
            shipping_pincode = (sd.get("shipping_pincode") or "").strip()

            if not re.match(r"^[A-Za-z\s]{3,50}$", shipping_name):
                return Response({"error": "Invalid name format"}, status=400)

            if not re.match(r"^[0-9]\d{9}$", shipping_phone):
                return Response({"error": "Phone must be 10 digits"}, status=400)

            if not re.match(r"^[A-Za-z0-9\s,.-:]{5,100}$", shipping_street):
                return Response({"error": "Invalid street address"}, status=400)

            if not re.match(r"^[A-Za-z\s]{2,50}$", shipping_city):
                return Response({"error": "Invalid city name"}, status=400)

            if not re.match(r"^[A-Za-z\s]{2,50}$", shipping_state):
                return Response({"error": "Invalid state name"}, status=400)

            if not re.match(r"^\d{6}$", shipping_pincode):
                return Response({"error": "Pincode must be 6 digits"}, status=400)

            # Order updation in DB
            order = Order.objects.create(
                user=user,
                payment_method="Cash on Delivery",
                payment_status="pending",
                shipping_name=shipping_name,
                shipping_phone=shipping_phone,
                shipping_street=shipping_street,
                shipping_city=shipping_city,
                shipping_state=shipping_state,
                shipping_pincode=shipping_pincode,
            )
            order.save()

            total_amount = 0

            for item in cart.items.all():
                price = item.product.discount_price

                OrderItem.objects.create(
                    order=order,
                    product=item.product,
                    quantity=item.quantity,
                    size=(
                        item.selected_size.size.size
                        if item.selected_size and item.selected_size.size
                        else None
                    ),
                    price=price,
                )
                total_amount += price * item.quantity

            order.total_amount = total_amount
            order.save()

            cart.items.all().delete()  # clears the cart after order placed

            template_path = os.path.join(
                os.path.dirname(__file__), "../../email_templates", "Orders.html"
            )

            with open(template_path, "r", encoding="utf-8") as f:
                html_template = f.read()

            # Build ORDER_ITEMS_LOOP HTML
            items_html = ""
            for item in order.items.all():
                img_url = build_cloudinary_url(item.product.thumbnail.url)
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

        # Delivery form validation: use DRF request.data for reliable parsing
        sd = request.data or {}
        shipping_name = (sd.get("shipping_name") or "").strip()
        shipping_phone = (sd.get("shipping_phone") or "").strip()
        shipping_street = (sd.get("shipping_street") or "").strip()
        shipping_city = (sd.get("shipping_city") or "").strip()
        shipping_state = (sd.get("shipping_state") or "").strip()
        shipping_pincode = (sd.get("shipping_pincode") or "").strip()

        if not re.match(r"^[A-Za-z\s]{3,50}$", shipping_name):
            return Response({"error": "Invalid name format"}, status=400)

        if not re.match(r"^[0-9]\d{9}$", shipping_phone):
            return Response({"error": "Phone must be 10 digits"}, status=400)

        if not re.match(r"^[A-Za-z0-9\s,.-:]{5,100}$", shipping_street):
            return Response({"error": "Invalid street address"}, status=400)

        if not re.match(r"^[A-Za-z\s]{2,50}$", shipping_city):
            return Response({"error": "Invalid city name"}, status=400)

        if not re.match(r"^[A-Za-z\s]{2,50}$", shipping_state):
            return Response({"error": "Invalid state name"}, status=400)

        if not re.match(r"^\d{6}$", shipping_pincode):
            return Response({"error": "Pincode must be 6 digits"}, status=400)

        total_amount = (
            sum(
                item.product.discount_price * item.quantity for item in cart.items.all()
            )
            + 45
        )
        amount_paisa = total_amount * 100

        razorpay_order = client.order.create(
            {"amount": amount_paisa, "currency": "INR", "payment_capture": 1}
        )

        return Response(
            {
                "razorpay_order_id": razorpay_order["id"],
                "status": razorpay_order["status"],
                "created_at": razorpay_order["created_at"],
                "amount": total_amount,
                "key": os.getenv("RAZORPAY_KEY_ID"),
                "email": user.email,
                "name": user.username,
            }
        )


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
                # Coerce to strings and strip whitespace to avoid mismatch
                r_order_id = str(razorpay_order_id).strip()
                r_payment_id = str(razorpay_payment_id).strip()
                r_signature = str(razorpay_signature).strip()

                # First tries SDK verification
                try:
                    client.utility.verify_payment_signature(
                        {
                            "razorpay_order_id": r_order_id,
                            "razorpay_payment_id": r_payment_id,
                            "razorpay_signature": r_signature,
                        }
                    )
                except Exception:
                    # Fallback manual HMAC SHA256 verification so we can debug mismatches
                    import hmac
                    import hashlib

                    secret = os.getenv("RAZORPAY_KEY_SECRET") or ""
                    msg = (r_order_id + "|" + r_payment_id).encode("utf-8")
                    generated = hmac.new(
                        secret.encode("utf-8"), msg, hashlib.sha256
                    ).hexdigest()
                    if not hmac.compare_digest(generated, r_signature):
                        raise ValueError("signature_mismatch")
            except Exception as e:
                # print("SIGNATURE ERROR:", e)
                details = {
                    "error": "Payment Verification Failed",
                    "details": str(e),
                    "razorpay_order_id": r_order_id,
                    "razorpay_payment_id": r_payment_id,
                    "razorpay_signature": r_signature,
                }
                if "generated" in locals():
                    details["generated_signature"] = generated
                return Response(details, status=400)
                # After payment verified the order is created

            # Order creation
            cart = get_object_or_404(Cart, user=user)
            # Include delivery fee to match amount used when creating Razorpay order
            total_amount = (
                sum(
                    item.product.discount_price * item.quantity
                    for item in cart.items.all()
                )
                + 45
            )

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
                    size=(
                        item.selected_size.size.size
                        if item.selected_size and item.selected_size.size
                        else None
                    ),
                    price=item.product.discount_price,
                )

            cart.items.all().delete()  # Clear cart

            template_path = os.path.join(
                os.path.dirname(__file__), "../../email_templates", "Orders.html"
            )

            with open(template_path, "r", encoding="utf-8") as f:
                html_template = f.read()

            # Build ORDER_ITEMS_LOOP HTML
            items_html = ""
            for item in order.items.all():
                img_url = build_cloudinary_url(item.product.thumbnail.url)
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
        except Exception as exc:
            print("VERIFY PAYMENT EXCEPTION:", exc)
            if "order" in locals() and hasattr(order, "payment_status"):
                try:
                    order.payment_status = "failed"
                    order.save()
                except Exception:
                    pass
            return Response(
                {"error": "Payment Failed", "details": str(exc)}, status=400
            )

        return Response(
            {
                "message": "Payment Successful",
                "order_id": order.order_id,
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature,
            },
            status=200,
        )


class OrderDetail(APIView):
    # Order Details for Success Page
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        order = get_object_or_404(
            Order,
            Q(order_id=order_id) | Q(razorpay_order_id=order_id),
            user=request.user,
        )
        serializer = OrderDetailSerializer(order)
        return Response(serializer.data)


class UserOrders(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        orders = Order.objects.filter(user=request.user).order_by("-order_date")

        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
