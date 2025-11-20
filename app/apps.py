from django.apps import AppConfig


class ShopAppConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "app"

    # Load signals when Django starts
    def ready(self):
        import app.signals
