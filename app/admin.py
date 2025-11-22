from django.contrib import admin
from .models import Product, ProductImage, Order, OrderItem, ProductSize, Size


# Inline for multiple images
class ProductImageInline(admin.TabularInline):  # or use StackedInline
    model = ProductImage
    extra = 4  # show 4 empty file inputs by default
    fields = ("image",)
    show_change_link = True


class ProductSizeInline(admin.TabularInline):
    model = ProductSize
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "category",
        "gender",
        "ratings",
        "original_price",
        "discount_price",
    )
    list_editable = (
        "name",
        "category",
        "gender",
        "ratings",
        "original_price",
        "discount_price",
    )
    inlines = [
        ProductImageInline,
        ProductSizeInline,
    ]  # adds multiple image upload in admin

    def sizes_list(self, obj):
        return ", ".join([ps.size.size for ps in obj.sizes.all()])

    sizes_list.short_description = "Sizes"

    sizes_list.short_description = "Sizes"


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "image")
    list_editable = ("product", "image")


admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Size)
