from django.shortcuts import render
from rest_framework.decorators import api_view
from .models import Product
from .serializers import ProductSerializers
from rest_framework.response import Response

@api_view(["GET"])
def products(request):
    products = Product.objects.all()
    serializer = ProductSerializers(products, many=True, context={"request": request})
    return Response(serializer.data)