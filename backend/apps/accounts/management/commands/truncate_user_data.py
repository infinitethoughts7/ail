"""
Truncate user-generated data while keeping reference data (Districts, Schools, Curriculum).

Keeps: Districts, Schools (resets status to not_started), Curriculum
Deletes: Users, OTPs, TrainerAssignments, Submissions, Photos, Projects,
         Students, StudentGroups, ActivityLogs, UWHControl

Then re-creates admin/sponsor accounts from seed_real_data constants.

Usage:
  python manage.py truncate_user_data
"""

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.accounts.models import OTP, User
from apps.dashboard.models import (
    ActivityLog,
    ProjectHighlight,
    School,
    SessionPhoto,
    Student,
    StudentGroup,
    Submission,
    TrainerAssignment,
    UWHControl,
)


# Admin + sponsor accounts to re-create
SEED_USERS = [
    {
        "email": "rakesh.ganji@swinfy.com",
        "username": "rakesh_swinfy",
        "password": "1234",
        "role": "admin",
        "first_name": "Rakesh",
        "last_name": "Ganji",
        "is_staff": True,
    },
    {
        "email": "sponsor@uwh.org",
        "username": "uwh_sponsor",
        "password": "1234",
        "role": "sponsor",
        "first_name": "UWH",
        "last_name": "Sponsor",
    },
    {
        "email": "programs@uwh.org",
        "username": "uwh_programs",
        "password": "1234",
        "role": "sponsor",
        "first_name": "UWH",
        "last_name": "Programs",
    },
]


class Command(BaseCommand):
    help = "Truncate user-generated data, keep reference data, re-create admin/sponsor accounts"

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write("Truncating user-generated data...")

        # Delete in dependency order
        counts = {}
        counts["ActivityLog"] = ActivityLog.objects.all().delete()[0]
        counts["SessionPhoto"] = SessionPhoto.objects.all().delete()[0]
        counts["ProjectHighlight"] = ProjectHighlight.objects.all().delete()[0]
        counts["Submission"] = Submission.objects.all().delete()[0]
        counts["Student"] = Student.objects.all().delete()[0]
        counts["StudentGroup"] = StudentGroup.objects.all().delete()[0]
        counts["TrainerAssignment"] = TrainerAssignment.objects.all().delete()[0]
        counts["OTP"] = OTP.objects.all().delete()[0]
        counts["User"] = User.objects.all().delete()[0]
        counts["UWHControl"] = UWHControl.objects.all().delete()[0]

        for model, count in counts.items():
            self.stdout.write(f"  Deleted {count} {model} records")

        # Reset school status
        updated = School.objects.exclude(status="not_started").update(
            status="not_started", total_students=0
        )
        self.stdout.write(f"  Reset {updated} schools to not_started")

        # Re-create admin/sponsor accounts
        self.stdout.write("Re-creating admin & sponsor accounts...")
        for u in SEED_USERS:
            user = User.objects.create_user(
                email=u["email"],
                username=u["username"],
                password=u["password"],
                role=u["role"],
                first_name=u.get("first_name", ""),
                last_name=u.get("last_name", ""),
                is_staff=u.get("is_staff", False),
                is_email_verified=True,
            )
            self.stdout.write(f"  Created {user.email} [{user.role}]")

        # Re-create UWH Control singleton
        UWHControl.objects.get_or_create(
            pk=1,
            defaults={
                "status": "active",
                "status_message": "AI Literacy Program — TMREIS 2026 is live",
                "status_color": "green",
                "financial_summary": {},
            },
        )
        self.stdout.write("  UWH control initialized.")

        self.stdout.write(self.style.SUCCESS("\nTruncation complete!"))
        self.stdout.write(f"  Users: {User.objects.count()}")
        self.stdout.write(f"  Schools: {School.objects.count()} (all reset to not_started)")
