from django.db import migrations


def forwards(apps, schema_editor):
    School = apps.get_model("dashboard", "School")
    TrainerAssignment = apps.get_model("dashboard", "TrainerAssignment")

    for school in School.objects.all():
        if school.assigned_trainer_id:
            TrainerAssignment.objects.get_or_create(
                trainer_id=school.assigned_trainer_id,
                school=school,
                defaults={"role": "primary"},
            )
        if school.second_trainer_id:
            TrainerAssignment.objects.get_or_create(
                trainer_id=school.second_trainer_id,
                school=school,
                defaults={"role": "secondary"},
            )


def backwards(apps, schema_editor):
    School = apps.get_model("dashboard", "School")
    TrainerAssignment = apps.get_model("dashboard", "TrainerAssignment")

    for assignment in TrainerAssignment.objects.select_related("school"):
        school = assignment.school
        if assignment.role == "primary" and not school.assigned_trainer_id:
            school.assigned_trainer_id = assignment.trainer_id
            school.save(update_fields=["assigned_trainer_id"])
        elif assignment.role == "secondary" and not school.second_trainer_id:
            school.second_trainer_id = assignment.trainer_id
            school.save(update_fields=["second_trainer_id"])


class Migration(migrations.Migration):

    dependencies = [
        ("dashboard", "0011_trainerassignment"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
