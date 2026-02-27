import uuid
from django.conf import settings
from django.db import models


class District(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    state = models.CharField(max_length=100, default="Telangana")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class School(models.Model):
    class Status(models.TextChoices):
        NOT_STARTED = "not_started", "Not Started"
        IN_PROGRESS = "in_progress", "In Progress"
        COMPLETED = "completed", "Completed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    district = models.ForeignKey(
        District, on_delete=models.CASCADE, related_name="schools"
    )
    address = models.TextField(blank=True)
    map_url = models.URLField(max_length=500, blank=True)
    poc_name = models.CharField(max_length=255, blank=True)
    poc_designation = models.CharField(max_length=255, blank=True)
    poc_phone = models.CharField(max_length=50, blank=True)
    principal_name = models.CharField(max_length=255, blank=True)
    principal_phone = models.CharField(max_length=20, blank=True)
    principal_email = models.EmailField(blank=True)
    total_students = models.IntegerField(default=0)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.NOT_STARTED
    )
    trainers = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        through="TrainerAssignment",
        through_fields=("school", "trainer"),
        related_name="schools_assigned",
        blank=True,
    )
    total_days = models.IntegerField(default=4)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.district.name})"


class TrainerAssignment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="school_assignments",
        limit_choices_to={"role": "trainer"},
    )
    school = models.ForeignKey(
        "School", on_delete=models.CASCADE, related_name="trainer_assignments"
    )
    role = models.CharField(
        max_length=20,
        choices=[("primary", "Primary"), ("secondary", "Secondary")],
        default="primary",
    )
    phase = models.CharField(max_length=50, blank=True, default="")
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="+",
    )

    class Meta:
        unique_together = ["trainer", "school"]
        ordering = ["-assigned_at"]

    def __str__(self):
        return f"{self.trainer} → {self.school} ({self.role})"


class StudentGroup(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    school = models.ForeignKey(
        "School", on_delete=models.CASCADE, related_name="student_groups"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_groups",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        unique_together = ["school", "name"]

    def __str__(self):
        return f"{self.name} ({self.school.name})"


class Student(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    age = models.IntegerField(blank=True, null=True)
    grade = models.CharField(max_length=20, blank=True)
    school = models.ForeignKey(
        "School", on_delete=models.CASCADE, related_name="students"
    )
    group = models.ForeignKey(
        StudentGroup,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="members",
    )
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="added_students",
    )
    parent_name = models.CharField(max_length=255, blank=True)
    parent_phone = models.CharField(max_length=20, blank=True)
    notes = models.TextField(blank=True)
    baseline_marks = models.IntegerField(blank=True, null=True)
    endline_marks = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.school.name})"


class Curriculum(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    day_number = models.IntegerField()
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    learning_objectives = models.JSONField(default=list, blank=True)
    activities = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["day_number"]

    def __str__(self):
        return f"Day {self.day_number}: {self.title}"


class Submission(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        SUBMITTED = "submitted", "Submitted"
        VERIFIED = "verified", "Verified"
        FLAGGED = "flagged", "Flagged"
        REJECTED = "rejected", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school = models.ForeignKey(
        School, on_delete=models.CASCADE, related_name="submissions"
    )
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="submissions",
        limit_choices_to={"role": "trainer"},
    )
    day_number = models.IntegerField()
    curriculum = models.ForeignKey(
        Curriculum, on_delete=models.SET_NULL, null=True, blank=True
    )
    reached_at = models.TimeField(blank=True, null=True)
    student_count = models.IntegerField(default=0)
    topics_covered = models.JSONField(default=list, blank=True)
    trainer_notes = models.TextField(blank=True)
    challenges = models.TextField(blank=True)
    attendance_file = models.FileField(
        upload_to="attendance/", blank=True, null=True
    )

    # --- Expenses ---
    expense_amount = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True
    )
    expense_notes = models.TextField(blank=True)
    expense_receipt = models.FileField(
        upload_to="expense_receipts/", blank=True, null=True
    )

    # --- Status & Review ---
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.DRAFT
    )
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="verified_submissions",
    )
    verified_at = models.DateTimeField(blank=True, null=True)
    flag_reason = models.TextField(blank=True)
    rejection_reason = models.TextField(blank=True)
    swinfy_notes = models.TextField(blank=True)

    submitted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ["school", "day_number"]

    def __str__(self):
        return f"{self.school.name} - Day {self.day_number}"


class SessionPhoto(models.Model):
    class ApprovalStatus(models.TextChoices):
        PENDING = "pending", "Pending Review"
        APPROVED = "approved", "Approved for UWH"
        REJECTED = "rejected", "Rejected"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name="photos"
    )
    image = models.ImageField(upload_to="session_photos/")
    caption = models.CharField(max_length=500, blank=True)

    # --- Swinfy Control ---
    approval_status = models.CharField(
        max_length=20,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
    )
    is_featured = models.BooleanField(default=False)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_photos",
    )
    approved_at = models.DateTimeField(blank=True, null=True)
    rejection_reason = models.CharField(max_length=500, blank=True)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["uploaded_at"]

    def __str__(self):
        return f"Photo for {self.submission} ({self.approval_status})"


class ProjectHighlight(models.Model):
    class ApprovalStatus(models.TextChoices):
        PENDING = "pending", "Pending Review"
        APPROVED = "approved", "Approved for UWH"
        FEATURED = "featured", "Featured on UWH Showcase"
        REJECTED = "rejected", "Rejected"

    class ProjectType(models.TextChoices):
        IMAGE = "image", "Image"
        WEBSITE_LINK = "website_link", "Website Link"
        MUSIC = "music", "Music"
        VIDEO = "video", "Video"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(
        Submission, on_delete=models.CASCADE, related_name="project_highlights",
        null=True, blank=True,
    )
    # Direct FKs (since submission is now optional for final projects)
    school = models.ForeignKey(
        School, on_delete=models.CASCADE, related_name="projects",
        null=True, blank=True,
    )
    trainer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="trainer_projects",
        null=True, blank=True,
        limit_choices_to={"role": "trainer"},
    )
    group = models.ForeignKey(
        StudentGroup,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="projects",
    )
    project_type = models.CharField(
        max_length=20,
        choices=ProjectType.choices,
        default=ProjectType.IMAGE,
    )
    student_name = models.CharField(max_length=255)
    student_age = models.IntegerField(blank=True, null=True)
    student_grade = models.CharField(max_length=20, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField()
    image = models.ImageField(upload_to="project_images/", blank=True, null=True)
    media_file = models.FileField(upload_to="project_media/", blank=True, null=True)
    website_url = models.URLField(max_length=500, blank=True)

    # --- Swinfy Control ---
    approval_status = models.CharField(
        max_length=20,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_projects",
    )
    approved_at = models.DateTimeField(blank=True, null=True)
    rejection_reason = models.TextField(blank=True)
    uwh_description = models.TextField(blank=True)
    swinfy_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} by {self.student_name}"


class ActivityLog(models.Model):
    class ActivityType(models.TextChoices):
        SUBMISSION_CREATED = "submission_created", "Submission Created"
        SUBMISSION_VERIFIED = "submission_verified", "Submission Verified"
        SUBMISSION_FLAGGED = "submission_flagged", "Submission Flagged"
        SUBMISSION_REJECTED = "submission_rejected", "Submission Rejected"
        PHOTO_APPROVED = "photo_approved", "Photo Approved"
        PHOTO_REJECTED = "photo_rejected", "Photo Rejected"
        PROJECT_APPROVED = "project_approved", "Project Approved"
        PROJECT_FEATURED = "project_featured", "Project Featured"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="activity_logs",
    )
    activity_type = models.CharField(max_length=30, choices=ActivityType.choices)
    title = models.CharField(max_length=500)
    description = models.TextField(blank=True)
    is_uwh_visible = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.activity_type}: {self.title}"


class UWHControl(models.Model):
    """Singleton — Swinfy controls what UWH sees."""

    class ProgramStatus(models.TextChoices):
        ACTIVE = "active", "Active"
        PAUSED = "paused", "Paused"
        COMPLETED = "completed", "Completed"

    status = models.CharField(
        max_length=20,
        choices=ProgramStatus.choices,
        default=ProgramStatus.ACTIVE,
    )
    status_message = models.CharField(
        max_length=500, default="Program in Progress"
    )
    status_color = models.CharField(max_length=20, default="green")
    financial_summary = models.JSONField(default=dict, blank=True)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "UWH Control"
        verbose_name_plural = "UWH Control"

    def __str__(self):
        return f"UWH Control — {self.status}"

    def save(self, *args, **kwargs):
        # Enforce singleton: always use pk=1
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
