from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "username", "role", "is_active", "is_staff"]
    list_filter = ["role", "is_active"]
    search_fields = ["email", "username"]
    ordering = ["email"]
