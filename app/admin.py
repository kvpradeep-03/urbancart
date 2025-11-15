from django.contrib import admin
from .models import Product, ProductImage, Order, OrderItem


# Inline for multiple images
class ProductImageInline(admin.TabularInline):  # or use StackedInline
    model = ProductImage
    extra = 4  # show 4 empty file inputs by default
    fields = ("image",)
    show_change_link = True


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "category",
        "size",
        "gender",
        "ratings",
        "original_price",
        "discount_price",
    )
    list_editable = (
        "name",
        "category",
        "size",
        "gender",
        "ratings",
        "original_price",
        "discount_price",
    )
    inlines = [ProductImageInline] #adds multiple image upload in admin


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "image")
    list_editable = ("product", "image")


admin.site.register(Order)
admin.site.register(OrderItem)

