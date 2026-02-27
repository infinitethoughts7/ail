from django.db import migrations


def backfill_school_trainer(apps, schema_editor):
    ProjectHighlight = apps.get_model("dashboard", "ProjectHighlight")
    for project in ProjectHighlight.objects.filter(
        submission__isnull=False
    ).select_related("submission"):
        project.school = project.submission.school
        project.trainer = project.submission.trainer
        project.save(update_fields=["school", "trainer"])


def reverse_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("dashboard", "0008_studentgroup_project_redesign"),
    ]

    operations = [
        migrations.RunPython(backfill_school_trainer, reverse_noop),
    ]
