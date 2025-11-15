from django.urls import path, include
from . import views
from .views import (
    Products,
    ViewProducts,
    AddToCart,
    ViewCart,
    UpdateCartQuantity,
    RemoveCartItem,
    PlaceOrder,
    UserOrders,
)


urlpatterns = [
    path("api/products/", Products.as_view(), name="products"),
    path(
        "api/products/<slug:slug>/", ViewProducts.as_view(), name="view-product"
    ),  # We written ViewProducts as just as a class, not a function. So we need to call .as_view() to convert it into a view function. (as each view it expects to return a response).
    # auth endpoints eg -> /api/auth/register/, /api/auth/login/, etc.
    path("api/auth/", include("core.urls")),
    path("api/cart/add/", AddToCart.as_view()),
    path("api/cart/", ViewCart.as_view()),
    path("api/cart/update/<int:item_id>/", UpdateCartQuantity.as_view()),
    path("api/cart/remove/<int:item_id>/", RemoveCartItem.as_view()),
    path("api/orders/", UserOrders.as_view(), name="user-orders"),
    path("api/order/place/", PlaceOrder.as_view()),
]
