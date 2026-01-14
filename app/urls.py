from django.urls import path, include

from .views.products import (
    Products,
    ViewProducts,
)
from .views.cart import (
    AddToCart,
    ViewCart,
    UpdateCartQuantity,
    RemoveCartItem,
    ClearCart,
)
from .views.orders import (
    PlaceOrder,
    CreateRazorpayOrder,
    VerifyRazorpayPayment,
    OrderDetail,
    UserOrders,
)
from .views.admin import (
    CreateProduct,
    DeleteProduct,
    AdminDashboardStats,
    EditProduct,
    OrderDetailsList,
    UpdateOrderStatus,
)

from app.health import health_check

urlpatterns = [
    path("health/", health_check),
    path("products/", Products.as_view(), name="products"),
    path(
        "products/<slug:slug>/", ViewProducts.as_view(), name="view-product"
    ),  # We written ViewProducts as just as a class, not a function. So we need to call .as_view() to convert it into a view function. (as each view it expects to return a response).
    # auth endpoints eg -> /api/auth/register/, /api/auth/login/, etc.
    path("auth/", include("core.urls")),
    path("cart/add/", AddToCart.as_view()),
    path("cart/", ViewCart.as_view()),
    path("cart/update/<int:item_id>/", UpdateCartQuantity.as_view()),
    path("cart/remove/<int:item_id>/", RemoveCartItem.as_view()),
    path("cart/clear/", ClearCart.as_view(), name="clear-cart"),
    path("orders/", UserOrders.as_view(), name="user-orders"),
    path("order/place/", PlaceOrder.as_view()),
    path("admin/orderDetailsList/", OrderDetailsList.as_view()),
    path("admin/updateOrderStatus/", UpdateOrderStatus.as_view()),
    path("admin/createProduct/", CreateProduct.as_view()),
    path("admin/deleteProduct/<int:product_id>/", DeleteProduct.as_view()),
    path("admin/adminDashboardStats/", AdminDashboardStats.as_view()),
    path("admin/editProduct/<int:product_id>/", EditProduct.as_view()),
    path("payment/create-order/", CreateRazorpayOrder.as_view()),
    path("payment/verify/", VerifyRazorpayPayment.as_view()),
    path("order/place/", PlaceOrder.as_view()),
    path("order/details/<str:order_id>/", OrderDetail.as_view()),
]
