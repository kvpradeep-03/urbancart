import os
from ..models import Cart, Order, OrderItem
from ..serializers import Product,ProductImage,CreateProductSerializer
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from core.authentication import CookieJWTAuthentication
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import (
    get_object_or_404,
)
from core.permissions import IsAdmin
from django.db.models import Sum
import pytz

# brevo email service api
import brevo_python
from brevo_python.rest import ApiException
from pprint import pprint

from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.db.models import F
from django.db.models import Q

class OrderDetailsList(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAdmin]

    def get(self, request):
        orders = Order.objects.all().order_by("-order_date")
        result = []
        # Convert order date to IST
        ist = pytz.timezone("Asia/Kolkata")
        for order in orders:
            order_date_ist = order.order_date.astimezone(ist)
            items_list = []
            for item in order.items.all():
                items_list.append(
                    {
                        "product_name": item.product.name,
                        "thumbnail": request.build_absolute_uri(
                            item.product.thumbnail.url
                        ),
                        "quantity": item.quantity,
                        "price": item.price,
                        "line_total": item.quantity * item.price,
                    }
                )
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
                os.path.dirname(__file__), "../../email_templates", "OrderStatus.html"
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

            return Response(
                {"message": "Product created successfully", "product_id": product.id},
                status=201,
            )
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

        return Response({"message": stats}, status=200)


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
                "ratings",
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
