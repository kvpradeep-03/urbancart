from django.db import models
from django.conf import settings
from django.utils.text import slugify

# Create your models here.
class Product(models.Model):
    CATEGORY = (
        # First value = machine-friendly (slug format, lowercase).
        # Second value = human-friendly (uppercase, for admin panel).
        
        # Men
        ("t-shirts", "T-SHIRTS"),
        ("casual shirts", "CASUAL SHIRTS"),
        ("formal shirts", "FORMAL SHIRTS"),
        ("jeans", "JEANS"),
        ("formal trousers", "FORMAL TROUSERS"),
        ("casual trousers", "CASUAL TROUSERS"),
        ("shorts", "SHORTS"),
        ("jackets", "JACKETS"),
        ("sweatshirts", "SWEATSHIRTS"),
        ("blazers", "BLAZERS"),
        ("suits", "SUITS"),

        # Women
        ("tops", "TOPS"),
        ("skirts", "SKIRTS"),
        ("jeans-women", "JEANS"),
        ("leggings", "LEGGINGS"),
        ("kurtis", "KURTIS"),
        ("sarees", "SAREES"),
        ("salwar suits", "SALWAR SUITS"),
        ("jackets-women", "JACKETS"),
        ("sweaters", "SWEATERS"),

        # Kids
        ("t-shirts-kids", "KIDS T-SHIRTS"),
        ("shirts-kids", "KIDS SHIRTS"),
        ("shorts-kids", "KIDS SHORTS"),
        ("frocks", "FROCKS"),
        ("skirts-kids", "KIDS SKIRTS"),
        ("ethnic-wear-kids", "ETHNIC WEAR"),

        # Shoes
        ("sports-shoes", "SPORTS SHOES"),
        ("casual-shoes", "CASUAL SHOES"),
        ("formal-shoes", "FORMAL SHOES"),
        ("boots", "BOOTS"),
        ("heels", "HEELS"),
        ("flats", "FLATS"),

        # Slippers & Sandals
        ("slippers", "SLIPPERS"),
        ("sandals", "SANDALS"),
        ("flip-flops", "FLIP-FLOPS"),
        ("crocs", "CROCS"),

        # Fashion Accessories
        ("watches", "WATCHES"),
        ("belts", "BELTS"),
        ("wallets", "WALLETS"),
        ("handbags", "HANDBAGS"),
        ("backpacks", "BACKPACKS"),
        ("sunglasses", "SUNGLASSES"),
        ("jewellery", "JEWELLERY"),
        ("caps", "CAPS"),

        # Beauty
        ("makeup", "MAKEUP"),
        ("skincare", "SKINCARE"),
        ("haircare", "HAIRCARE"),

        # Perfumes
        ("perfumes-men", "PERFUMES (MEN)"),
        ("perfumes-women", "PERFUMES (WOMEN)"),
        ("unisex-perfumes", "UNISEX PERFUMES"),
    )

    GENDER = (
        ("male", "Male"),
        ("female", "Female"),
        ("unisex", "Unisex"),
    )

    name = models.CharField(max_length=100)
    slug = models.SlugField(blank=True, null=True)
    thumbnail = models.ImageField(
        upload_to="products/thumbnails/", null=True, blank=True
    )
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=50, choices=CATEGORY)
    gender = models.CharField(max_length=20, choices=GENDER, default="unisex")
    ratings = models.FloatField(default=0.0)
    original_price = models.IntegerField(default=0)
    discount_percentage = models.IntegerField(default=0)
    discount_price = models.IntegerField(default=0)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # If the object has no slug yet, then generate one
        if not self.slug:
            # Converts the product name into url friendly, "iPhone 15 Pro" → "iphone-15-pro"
            base_slug = slugify(self.name)
            unique_slug = base_slug
            # Prepare a counter to create a unique slug
            counter = 1

            while Product.objects.filter(slug=unique_slug).exists():
                # Make it unique by adding a number, So instead of iphone-15-pro, it becomes iphone-15-pro-1
                unique_slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = unique_slug

        # Calculates discount & price
        if self.discount_percentage and self.original_price:
            discount_amount = (self.discount_percentage / 100) * self.original_price
            self.discount_price = self.original_price - discount_amount
        else:
            # No discount → keep price same as original
            self.discount_price = self.original_price

        super().save(*args, **kwargs)


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="images"
    )
    image = models.ImageField(upload_to="products/images/")


class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("shipped", "Shipped"),
            ("delivered", "Delivered"),
        ],
        default="pending",
    )


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)


class Review(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="reviews"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE
    )  # who gave the review
    rating = models.PositiveIntegerField(default=1)  # e.g., 1 to 5 stars
    review = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} - {self.rating} Stars"
