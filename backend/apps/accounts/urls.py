from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register),
    path("login/", views.login),
    path("request-otp/", views.request_otp),
    path("verify-otp/", views.verify_otp),
    path("reset-password/", views.reset_password),
    # Trainer self-registration
    path("trainer-register/", views.trainer_register),
    path("verify-registration/", views.verify_registration),
    path("resend-registration-otp/", views.resend_registration_otp),
    path("public-schools/", views.public_schools),
]
