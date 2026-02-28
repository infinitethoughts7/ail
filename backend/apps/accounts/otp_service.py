"""
OTP Service Layer — Single Responsibility
Each function does exactly one thing. No side effects beyond its stated purpose.
"""

import secrets
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone
from django.utils.html import strip_tags

from .models import OTP

OTP_LENGTH = 6
OTP_EXPIRY_MINUTES = 5
OTP_RATE_LIMIT_SECONDS = 60  # min gap between OTP requests per user


def generate_otp_code():
    """Generate a cryptographically secure 6-digit OTP."""
    return "".join(secrets.choice("0123456789") for _ in range(OTP_LENGTH))


def check_rate_limit(user):
    """
    Return True if user can request a new OTP, False if rate-limited.
    Enforces a minimum gap between OTP requests.
    """
    cutoff = timezone.now() - timedelta(seconds=OTP_RATE_LIMIT_SECONDS)
    recent = OTP.objects.filter(
        user=user,
        created_at__gte=cutoff,
        is_used=False,
    ).exists()
    return not recent


def create_otp(user):
    """
    Invalidate any existing unused OTPs for this user, then create a new one.
    Returns the OTP instance.
    """
    # Invalidate old unused OTPs
    OTP.objects.filter(user=user, is_used=False).update(is_used=True)

    code = generate_otp_code()
    expires_at = timezone.now() + timedelta(minutes=OTP_EXPIRY_MINUTES)

    return OTP.objects.create(
        user=user,
        code=code,
        expires_at=expires_at,
    )


def validate_otp(user, code):
    """
    Validate an OTP code for a user.
    Returns (is_valid: bool, error_message: str | None).
    Does NOT mark the OTP as used — that happens on password reset.
    """
    try:
        otp = OTP.objects.get(
            user=user,
            code=code,
            is_used=False,
        )
    except OTP.DoesNotExist:
        return False, "Invalid OTP code."

    if otp.is_expired:
        return False, "OTP has expired. Please request a new one."

    return True, None


def consume_otp(user, code):
    """
    Mark the OTP as used. Call this after successful password reset.
    Returns True if consumed, False if not found.
    """
    updated = OTP.objects.filter(
        user=user,
        code=code,
        is_used=False,
    ).update(is_used=True)
    return updated > 0


def send_otp_email(user, code, purpose="reset"):
    """Send the OTP code to the user's email. purpose: 'reset' or 'registration'."""
    subject = f"Your AI Literacy verification code: {code}"
    html_message = render_to_string(
        "accounts/otp_email.html",
        {
            "user": user,
            "code": code,
            "expiry_minutes": OTP_EXPIRY_MINUTES,
            "purpose": purpose,
        },
    )
    plain_message = strip_tags(html_message)

    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False,
    )


def cleanup_expired_otps():
    """Delete all expired or used OTPs. Run periodically via management command."""
    OTP.objects.filter(
        expires_at__lt=timezone.now(),
    ).delete()
    OTP.objects.filter(is_used=True).delete()
