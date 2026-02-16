from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import Submission, ActivityLog


@receiver(pre_save, sender=Submission)
def on_submission_status_change(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        old = Submission.objects.get(pk=instance.pk)
    except Submission.DoesNotExist:
        return

    if old.status == instance.status:
        return

    school_name = instance.school.name
    day = instance.day_number

    if instance.status == "submitted":
        ActivityLog.objects.create(
            user=instance.trainer,
            activity_type="submission_created",
            title=f"{instance.trainer.username} submitted Day {day} for {school_name}",
            description=f"{instance.student_count} students",
            is_uwh_visible=False,
            metadata={
                "school_id": str(instance.school_id),
                "submission_id": str(instance.pk),
                "day_number": day,
            },
        )

    elif instance.status == "verified":
        ActivityLog.objects.create(
            user=instance.trainer,
            activity_type="submission_verified",
            title=f"Day {day} completed at {school_name}",
            description=f"{instance.student_count} students trained",
            is_uwh_visible=True,
            metadata={
                "school_id": str(instance.school_id),
                "submission_id": str(instance.pk),
                "day_number": day,
            },
        )

    elif instance.status == "flagged":
        ActivityLog.objects.create(
            user=instance.trainer,
            activity_type="submission_flagged",
            title=f"Submission flagged: {school_name} Day {day}",
            description=instance.flag_reason,
            is_uwh_visible=False,
            metadata={
                "school_id": str(instance.school_id),
                "submission_id": str(instance.pk),
            },
        )

    elif instance.status == "rejected":
        ActivityLog.objects.create(
            user=instance.trainer,
            activity_type="submission_rejected",
            title=f"Submission rejected: {school_name} Day {day}",
            description=instance.rejection_reason,
            is_uwh_visible=False,
            metadata={
                "school_id": str(instance.school_id),
                "submission_id": str(instance.pk),
            },
        )
