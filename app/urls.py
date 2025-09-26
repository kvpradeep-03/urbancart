from django.urls import path
from . import views
from .views import ViewProducts

urlpatterns = [
    path("api/products/", views.products, name="products"),
    path(
        "api/products/<slug:slug>/", ViewProducts.as_view(), name="view-product"
    ),  # We written ViewProducts as just as a class, not a function. So we need to call .as_view() to convert it into a view function. (as each view it expects to return a response).
]
