from .base import *

DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1", "*"]

CSRF_TRUSTED_ORIGINS = [
    "https://verbose-space-train-6vvx47v5rg7xhrp7x-8000.app.github.dev",
    "https://localhost:8000",
]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", ""),
        "USER": os.getenv("POSTGRES_USER", ""),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", ""),
        "HOST": os.getenv("POSTGRES_HOST", "localhost"),
        "PORT": os.getenv("POSTGRES_PORT", "5432"),
    }
}
