import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("dashboard", "0007_school_map_url_school_poc_designation_and_more"),
    ]

    operations = [
        # 1. Create StudentGroup model
        migrations.CreateModel(
            name="StudentGroup",
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
                ("name", models.CharField(max_length=255)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "school",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="student_groups",
                        to="dashboard.school",
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="created_groups",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "ordering": ["name"],
                "unique_together": {("school", "name")},
            },
        ),
        # 2. Add group FK to Student
        migrations.AddField(
            model_name="student",
            name="group",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="members",
                to="dashboard.studentgroup",
            ),
        ),
        # 3. Make ProjectHighlight.submission nullable
        migrations.AlterField(
            model_name="projecthighlight",
            name="submission",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="project_highlights",
                to="dashboard.submission",
            ),
        ),
        # 4. Add new fields to ProjectHighlight
        migrations.AddField(
            model_name="projecthighlight",
            name="project_type",
            field=models.CharField(
                choices=[
                    ("image", "Image"),
                    ("website_link", "Website Link"),
                    ("music", "Music"),
                    ("video", "Video"),
                ],
                default="image",
                max_length=20,
            ),
        ),
        migrations.AddField(
            model_name="projecthighlight",
            name="school",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="projects",
                to="dashboard.school",
            ),
        ),
        migrations.AddField(
            model_name="projecthighlight",
            name="trainer",
            field=models.ForeignKey(
                blank=True,
                null=True,
                limit_choices_to={"role": "trainer"},
                on_delete=django.db.models.deletion.CASCADE,
                related_name="trainer_projects",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="projecthighlight",
            name="group",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="projects",
                to="dashboard.studentgroup",
            ),
        ),
        migrations.AddField(
            model_name="projecthighlight",
            name="media_file",
            field=models.FileField(
                blank=True, null=True, upload_to="project_media/"
            ),
        ),
        migrations.AddField(
            model_name="projecthighlight",
            name="website_url",
            field=models.URLField(blank=True, max_length=500),
        ),
    ]
