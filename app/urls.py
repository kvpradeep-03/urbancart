from django.urls import path, include
from . import views
from .views import Products, ViewProducts


urlpatterns = [
    path("api/products/", Products.as_view(), name="products"),
    path(
        "api/products/<slug:slug>/", ViewProducts.as_view(), name="view-product"
    ),  # We written ViewProducts as just as a class, not a function. So we need to call .as_view() to convert it into a view function. (as each view it expects to return a response).
    # auth endpoints eg -> /api/auth/register/, /api/auth/login/, etc.
    path("api/auth/", include("core.urls")),
]
