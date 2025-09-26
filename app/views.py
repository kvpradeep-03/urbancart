from django.shortcuts import render
from rest_framework.decorators import api_view
from .models import Product
from .serializers import ProductSerializers
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView


@api_view(["GET"])
def products(request):
    # gets multipe category from query params as a list like, /api/products/?category=t-shirts&category=jeanscategory=shoes&category=clothes to --> categories = ["t-shirts", "jeans"]
    categories = request.query_params.getlist("category")
    categories = [c.lower() for c in categories]  # normalize to match DB
    products = Product.objects.all()
    if categories:
        # category__in is a special Django ORM filter that checks if the category field of the Product model matches any value in the provided list.
        products = Product.objects.filter(category__in=categories)
    serializer = ProductSerializers(products, many=True, context={"request": request})
    return Response(serializer.data)


class ViewProducts(RetrieveAPIView):
    # here were like serializer_class, queryset, and lookup_field are fixed “keys” that DRF looks for.
    # RetrieveAPIView is a built-in generic view from Django REST Framework (DRF).
    # Its job: Show one single object when we visit a URL. If we type /api/products/dennison/, it should show details of only the Dennison product.
    # It automatically provides get() method & 404 handling if the product doesn’t exist.

    queryset = Product.objects.all()
    serializer_class = ProductSerializers
    lookup_field = "slug" # tells DRF to use the slug field to look up products
