"""
Management command to send scheduled emails.

Run daily via cron / task scheduler:
    python manage.py send_scheduled_emails

Handles:
  - Principal same-day session confirmation (sessions happening today)
  - Session reminder for trainer + principal (sessions happening tomorrow)
"""

from datetime import date, timedelta

from django.core.management.base import BaseCommand

from apps.dashboard.models import School, TrainerAssignment
from apps.dashboard.program_config import DAY_SCHEDULE
from apps.dashboard.services.notifications import (
    notify_principal_session_today,
    notify_session_reminder,
)


class Command(BaseCommand):
    help = "Send scheduled session emails (same-day confirmations + 24h reminders)"

    def handle(self, *args, **options):
        today = date.today()
        tomorrow = today + timedelta(days=1)

        today_sent = self._send_today_confirmations(today)
        reminder_sent = self._send_tomorrow_reminders(tomorrow)

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Today confirmations: {today_sent}, Tomorrow reminders: {reminder_sent}"
            )
        )

    def _send_today_confirmations(self, today: date) -> int:
        """Send principal same-day confirmation for sessions happening today."""
        day_entry = self._get_day_entry(today)
        if not day_entry:
            return 0

        day_number, info = day_entry
        sent = 0

        # Get schools that have at least one trainer assigned and have principal email
        assignments = TrainerAssignment.objects.filter(
            role="primary",
        ).select_related("trainer", "school")

        for assignment in assignments:
            school = assignment.school
            trainer = assignment.trainer
            if not school.principal_email:
                continue
            success = notify_principal_session_today(
                principal_email=school.principal_email,
                principal_name=school.principal_name or "Principal",
                trainer_name=trainer.get_full_name() or trainer.email,
                trainer_phone=school.principal_phone,
                school_name=school.name,
                session_date=today,
                session_title=info["title"],
            )
            if success:
                sent += 1

        return sent

    def _send_tomorrow_reminders(self, tomorrow: date) -> int:
        """Send 24h reminders to trainers and principals."""
        day_entry = self._get_day_entry(tomorrow)
        if not day_entry:
            return 0

        day_number, info = day_entry
        sent = 0

        assignments = TrainerAssignment.objects.select_related(
            "trainer", "school"
        )
        notified_schools = set()

        for assignment in assignments:
            school = assignment.school
            trainer = assignment.trainer

            # Trainer reminder
            success = notify_session_reminder(
                recipient_email=trainer.email,
                recipient_name=trainer.get_full_name() or trainer.email,
                role="trainer",
                school_name=school.name,
                session_date=tomorrow,
                session_title=info["title"],
                day_number=day_number,
            )
            if success:
                sent += 1

            # Principal reminder (once per school)
            if school.principal_email and school.pk not in notified_schools:
                notified_schools.add(school.pk)
                success = notify_session_reminder(
                    recipient_email=school.principal_email,
                    recipient_name=school.principal_name or "Principal",
                    role="principal",
                    school_name=school.name,
                    session_date=tomorrow,
                    session_title=info["title"],
                    day_number=day_number,
                )
                if success:
                    sent += 1

        return sent

    def _get_day_entry(self, target_date: date):
        """Find the DAY_SCHEDULE entry matching the given date."""
        for day_number, info in DAY_SCHEDULE.items():
            if info["date"] == target_date:
                return day_number, info
        return None

