from cloudinary.utils import cloudinary_url


def build_cloudinary_url(field):
    """
    Convert ImageFieldFile or CloudinaryField to Cloudinary URL
    Returns a browser-loadable Cloudinary URL
    """
    if not field:
        return None

    # ImageFieldFile (Cloudinary storage)
    if hasattr(field, "name"):
        public_id = field.name
    else:
        return None

    url, _ = cloudinary_url(
        public_id,
        secure=True,
        fetch_format="auto",
        quality="auto",
        resource_type="image",  # IMPORTANT for email proxies
        type="upload",  # Avoid auto-detection
    )
    return url
