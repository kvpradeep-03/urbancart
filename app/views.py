from django.shortcuts import render
from rest_framework.views import APIView
from .models import Product
from .serializers import ProductSerializers
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny


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
