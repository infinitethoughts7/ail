from django.contrib import admin
from .models import (
    District,
    School,
    Curriculum,
    Submission,
    SessionPhoto,
    ProjectHighlight,
    ActivityLog,
    UWHControl,
    TrainerAssignment,
)


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ["name", "state", "created_at"]
    search_fields = ["name"]


class TrainerAssignmentInline(admin.TabularInline):
    model = TrainerAssignment
    extra = 1
    raw_id_fields = ["trainer", "assigned_by"]


@admin.register(TrainerAssignment)
class TrainerAssignmentAdmin(admin.ModelAdmin):
    list_display = ["trainer", "school", "role", "phase", "assigned_at"]
    list_filter = ["role", "phase"]
    search_fields = ["trainer__email", "school__name"]
    raw_id_fields = ["trainer", "school", "assigned_by"]


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ["name", "district", "status", "total_students"]
    list_filter = ["status", "district"]
    search_fields = ["name"]
    inlines = [TrainerAssignmentInline]


@admin.register(Curriculum)
class CurriculumAdmin(admin.ModelAdmin):
    list_display = ["day_number", "title"]
    ordering = ["day_number"]


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ["school", "day_number", "trainer", "status", "submitted_at"]
    list_filter = ["status"]
    search_fields = ["school__name"]


@admin.register(SessionPhoto)
class SessionPhotoAdmin(admin.ModelAdmin):
    list_display = ["submission", "approval_status", "is_featured", "uploaded_at"]
    list_filter = ["approval_status", "is_featured"]


@admin.register(ProjectHighlight)
class ProjectHighlightAdmin(admin.ModelAdmin):
    list_display = ["title", "student_name", "approval_status", "created_at"]
    list_filter = ["approval_status"]


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ["activity_type", "title", "is_uwh_visible", "timestamp"]
    list_filter = ["activity_type", "is_uwh_visible"]


@admin.register(UWHControl)
class UWHControlAdmin(admin.ModelAdmin):
    list_display = ["status", "status_message", "updated_at"]
