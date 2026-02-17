"""
Centralized email dispatcher.

All emails go through send_email(). This is the single point for:
- Template rendering (HTML + plain text fallback)
- Reply-To configuration
- Logging and error handling
- Future: swap to async task queue by changing only this file
"""

import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string

logger = logging.getLogger("emails")


def send_email(
    to: str | list[str],
    subject: str,
    template_name: str,
    context: dict | None = None,
    reply_to: str | None = None,
) -> bool:
    """
    Send an HTML email with plain text fallback.

    Args:
        to: Recipient email(s)
        subject: Email subject line
        template_name: Template base name (e.g. "trainer_form_reminder")
                       Looks for emails/{template_name}.html and .txt
        context: Template context dict
        reply_to: Override reply-to address (defaults to EMAIL_REPLY_TO setting)

    Returns:
        True if sent successfully, False otherwise
    """
    if isinstance(to, str):
        to = [to]

    context = context or {}
    reply_to = reply_to or getattr(settings, "EMAIL_REPLY_TO", settings.DEFAULT_FROM_EMAIL)

    try:
        text_body = render_to_string(f"emails/{template_name}.txt", context)
        html_body = render_to_string(f"emails/{template_name}.html", context)

        msg = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=to,
            reply_to=[reply_to],
        )
        msg.attach_alternative(html_body, "text/html")
        msg.send(fail_silently=False)

        logger.info("Email sent: subject='%s' to=%s", subject, to)
        return True

    except Exception:
        logger.exception("Email failed: subject='%s' to=%s", subject, to)
        return False
