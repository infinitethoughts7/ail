from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        SPONSOR = "sponsor", "Sponsor"
        TRAINER = "trainer", "Trainer"
        PRINCIPAL = "principal", "Principal"
        ADMIN = "admin", "Admin"

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.SPONSOR)
    profile_photo = models.ImageField(
        upload_to="profile_photos/", blank=True, null=True
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email
