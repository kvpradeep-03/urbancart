from django.db import models
from django.conf import settings
from django.utils.text import slugify
import uuid


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
        ("jeans", "JEANS"),
        ("leggings", "LEGGINGS"),
        ("kurtis", "KURTIS"),
        ("sarees", "SAREES"),
        ("suits", "SUITS"),
        ("jackets", "JACKETS"),
        ("sweaters", "SWEATERS"),
        ("ethnic wear", "ETHNIC WEAR"),
        # Kids
        ("kids t-shirts", "KIDS T-SHIRTS"),
        ("kids shirts", "KIDS SHIRTS"),
        ("kids shorts", "KIDS SHORTS"),
        ("frocks", "FROCKS"),
        # Shoes
        ("sports shoes", "SPORTS SHOES"),
        ("casual shoes", "CASUAL SHOES"),
        ("formal shoes", "FORMAL SHOES"),
        ("boots", "BOOTS"),
        ("heels", "HEELS"),
        ("flats", "FLATS"),
        # Slippers & Sandals
        ("slippers", "SLIPPERS"),
        ("sandals", "SANDALS"),
        ("flip flops", "FLIP FLOPS"),
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
        ("perfumes", "PERFUMES"),
    )

    GENDER = (
        ("male", "Male"),
        ("female", "Female"),
        ("unisex", "Unisex"),
    )

    SIZE_CHOICES = [
        ("S M L XL XXL", "S M L XL XXL"),
        ("26 28 30 32 34 36", "26 28 30 32 34 36"),
        ("6 7 8 9 10 11 12", "6 7 8 9 10 11 12"),
        ("OneSize", "One Size"),
        ("","")
    ]

    name = models.CharField(max_length=100)
    slug = models.SlugField(blank=True, null=True)
    thumbnail = models.ImageField(
        upload_to="products/thumbnails/", null=True, blank=True
    )
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=50, choices=CATEGORY)
    size = models.CharField(max_length=20, choices=SIZE_CHOICES, blank=True, default="")
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

class Cart(models.Model):
    # OneToOneField is like a foreignkey, it creates a 1 to 1 relationship between the Cart model and the User, in our code the user model is setted in setttings.AUTH_USER_MODEL
    # related_name="cart" this gives a reverse reference name from user -> cart
    # Cart.user  → points to User and User.cart  → points to Cart
    # example cart = get_object_or_404(Cart, user=user) now when we called Cart.items.all() it maps the cartItem model and its field thats the reverse_name's utility its literally like a pointer
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cart")
    created_at = models.DateTimeField(auto_now_add=True)   

class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def get_total_price(self):
        return self.quantity * self.product.discount_price

class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    order_id = models.CharField(max_length=20, blank=True,unique=True, null=True)

    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("shipped", "Shipped"),
            ("delivered", "Delivered"),
            ("cancelled", "Cancelled"),
        ],
        default="pending",
    )
    total_amount = models.IntegerField(default=0)

    def save(self, *args, **kwargs):
        # generates unique order_id beacuse we the order_id is circulated in urls
        # so if possible anyone can itertate over the orders like api/orders/13... 33.. to prevent this we using UUID
        # UUID (Universally Unique Identifier) is a 128-bit value used to uniquely identify an object or entity on the internet.
        if not self.order_id:
            random_code = uuid.uuid4().hex[:6].upper()
            self.order_id = f"UC-{random_code}"

        super().save(*args, **kwargs)


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
