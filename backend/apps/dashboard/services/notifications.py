"""
Business-level notification functions.

Each function maps to a real-world email flow. Views/commands call these —
they never call send_email() directly.

Future: Add WhatsApp channel by extending these functions.
"""

from datetime import date

from django.conf import settings

from apps.dashboard.services.email import send_email


# ---------------------------------------------------------------------------
# 1. Trainer Form Reminder
# ---------------------------------------------------------------------------
def notify_trainer_form_reminder(
    trainer_email: str,
    trainer_name: str,
    form_url: str,
    deadline: date,
) -> bool:
    """Sent when trainer logs in but hasn't completed the onboarding form."""
    return send_email(
        to=trainer_email,
        subject="Action Required: Complete Your Onboarding Form",
        template_name="trainer_form_reminder",
        context={
            "trainer_name": trainer_name,
            "form_url": form_url,
            "deadline": deadline,
            "support_email": settings.EMAIL_REPLY_TO,
        },
    )


# ---------------------------------------------------------------------------
# 2. Principal Same-Day Session Confirmation
# ---------------------------------------------------------------------------
def notify_principal_session_today(
    principal_email: str,
    principal_name: str,
    trainer_name: str,
    trainer_phone: str,
    school_name: str,
    session_date: date,
    session_title: str,
) -> bool:
    """Sent to principal on the morning of a session day."""
    return send_email(
        to=principal_email,
        subject=f"Today's AI Literacy Session at {school_name}",
        template_name="principal_session_confirmation",
        context={
            "principal_name": principal_name,
            "trainer_name": trainer_name,
            "trainer_phone": trainer_phone,
            "school_name": school_name,
            "session_date": session_date,
            "session_title": session_title,
            "support_email": settings.EMAIL_REPLY_TO,
        },
    )


# ---------------------------------------------------------------------------
# 3. Session Reminder (24 hours before)
# ---------------------------------------------------------------------------
def notify_session_reminder(
    recipient_email: str,
    recipient_name: str,
    role: str,
    school_name: str,
    session_date: date,
    session_title: str,
    day_number: int,
) -> bool:
    """Sent to trainer and principal 24 hours before a session."""
    return send_email(
        to=recipient_email,
        subject=f"Reminder: Day {day_number} Session Tomorrow at {school_name}",
        template_name="session_reminder",
        context={
            "recipient_name": recipient_name,
            "role": role,
            "school_name": school_name,
            "session_date": session_date,
            "session_title": session_title,
            "day_number": day_number,
            "support_email": settings.EMAIL_REPLY_TO,
        },
    )
