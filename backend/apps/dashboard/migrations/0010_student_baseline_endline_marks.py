from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("dashboard", "0009_backfill_project_school_trainer"),
    ]

    operations = [
        migrations.AddField(
            model_name="student",
            name="baseline_marks",
            field=models.IntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="student",
            name="endline_marks",
            field=models.IntegerField(blank=True, null=True),
        ),
    ]
