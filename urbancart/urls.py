"""
URL configuration for urbancart project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView

# Django only receives requests whose domain is already routed to the app, and then ALLOWED_HOSTS ensures the domain is trusted. 
# After that, Django matches only the request path to decide which view to call.
urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/",include("app.urls"))
    
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Catches all react routes and serves index.html
urlpatterns += [
    re_path(r"^.*$", TemplateView.as_view(template_name="index.html")),
]
