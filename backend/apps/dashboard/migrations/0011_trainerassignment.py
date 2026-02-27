import uuid
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("dashboard", "0010_student_baseline_endline_marks"),
    ]

    operations = [
        migrations.CreateModel(
            name="TrainerAssignment",
            fields=[
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "role",
                    models.CharField(
                        choices=[("primary", "Primary"), ("secondary", "Secondary")],
                        default="primary",
                        max_length=20,
                    ),
                ),
                ("phase", models.CharField(blank=True, default="", max_length=50)),
                ("assigned_at", models.DateTimeField(auto_now_add=True)),
                (
                    "assigned_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="+",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "school",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="trainer_assignments",
                        to="dashboard.school",
                    ),
                ),
                (
                    "trainer",
                    models.ForeignKey(
                        limit_choices_to={"role": "trainer"},
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="school_assignments",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["-assigned_at"],
                "unique_together": {("trainer", "school")},
            },
        ),
        migrations.AddField(
            model_name="school",
            name="trainers",
            field=models.ManyToManyField(
                blank=True,
                related_name="schools_assigned",
                through="dashboard.TrainerAssignment",
                through_fields=("school", "trainer"),
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
