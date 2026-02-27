from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("dashboard", "0012_backfill_trainer_assignments"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="school",
            name="assigned_trainer",
        ),
        migrations.RemoveField(
            model_name="school",
            name="second_trainer",
        ),
    ]
