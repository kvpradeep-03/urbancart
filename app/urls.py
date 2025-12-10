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
    path("api/cart/clear/", ClearCart.as_view(), name="clear-cart"),
    path("api/orders/", UserOrders.as_view(), name="user-orders"),
    path("api/order/place/", PlaceOrder.as_view()),
    path("api/admin/orderDetailsList/", OrderDetailsList.as_view()),
    path("api/admin/updateOrderStatus/", UpdateOrderStatus.as_view()),
    path("api/admin/createProduct/", CreateProduct.as_view()),
    path("api/admin/deleteProduct/<int:product_id>/", DeleteProduct.as_view()),
    path("api/admin/adminDashboardStats/", AdminDashboardStats.as_view()),
    path("api/admin/editProduct/<int:product_id>/", EditProduct.as_view()),
    path("api/payment/create-order/", CreateRazorpayOrder.as_view()),
    path("api/payment/verify/", VerifyRazorpayPayment.as_view()),
    path("api/order/place/", PlaceOrder.as_view()),
    path("api/order/details/<str:order_id>/", OrderDetail.as_view()),
]
