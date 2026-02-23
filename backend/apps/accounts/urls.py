from django.urls import path
from . import views

urlpatterns = [
    path("register/", views.register),
    path("login/", views.login),
    path("request-otp/", views.request_otp),
    path("verify-otp/", views.verify_otp),
    path("reset-password/", views.reset_password),
]
