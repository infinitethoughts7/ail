from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    District,
    School,
    Curriculum,
    Submission,
    SessionPhoto,
    ProjectHighlight,
    ActivityLog,
    UWHControl,
    Student,
)

User = get_user_model()


class DistrictSerializer(serializers.ModelSerializer):
    school_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = District
        fields = ["id", "name", "state", "school_count", "created_at"]


class SchoolListSerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source="district.name", read_only=True)
    trainer_name = serializers.CharField(
        source="assigned_trainer.username", read_only=True, default=None
    )

    class Meta:
        model = School
        fields = [
            "id", "name", "district", "district_name", "status",
            "total_students", "assigned_trainer", "trainer_name",
            "total_days", "created_at",
        ]


class SchoolDetailSerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source="district.name", read_only=True)
    trainer_name = serializers.CharField(
        source="assigned_trainer.username", read_only=True, default=None
    )
    submissions = serializers.SerializerMethodField()

    class Meta:
        model = School
        fields = "__all__"

    def get_submissions(self, obj):
        return SubmissionListSerializer(obj.submissions.all(), many=True).data


class CurriculumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Curriculum
        fields = "__all__"


class SessionPhotoSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = SessionPhoto
        fields = [
            "id", "image", "image_url", "caption", "approval_status",
            "is_featured", "rejection_reason", "uploaded_at",
        ]
        read_only_fields = [
            "id", "approval_status", "is_featured", "rejection_reason",
            "uploaded_at",
        ]

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class ProjectHighlightSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    display_description = serializers.SerializerMethodField()

    class Meta:
        model = ProjectHighlight
        fields = [
            "id", "student_name", "student_age", "student_grade",
            "title", "description", "image", "image_url",
            "approval_status", "rejection_reason", "uwh_description",
            "swinfy_notes", "display_description", "created_at",
        ]
        read_only_fields = [
            "id", "approval_status", "rejection_reason",
            "uwh_description", "swinfy_notes", "created_at",
        ]

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_display_description(self, obj):
        # UWH sees the curated description if available
        return obj.uwh_description or obj.description


class SubmissionListSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source="school.name", read_only=True)
    trainer_name = serializers.CharField(
        source="trainer.username", read_only=True
    )
    photo_count = serializers.IntegerField(read_only=True, default=0)
    project_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Submission
        fields = [
            "id", "school", "school_name", "trainer", "trainer_name",
            "day_number", "student_count", "status", "submitted_at",
            "photo_count", "project_count", "created_at",
        ]


class SubmissionDetailSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source="school.name", read_only=True)
    trainer_name = serializers.CharField(
        source="trainer.username", read_only=True
    )
    photos = SessionPhotoSerializer(many=True, read_only=True)
    project_highlights = ProjectHighlightSerializer(many=True, read_only=True)

    class Meta:
        model = Submission
        fields = "__all__"
        read_only_fields = [
            "id", "verified_by", "verified_at", "created_at", "updated_at",
        ]


class SubmissionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = [
            "school", "day_number", "curriculum", "student_count",
            "reached_at", "topics_covered", "trainer_notes", "challenges",
            "attendance_file", "expense_amount", "expense_notes",
            "expense_receipt",
        ]


class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True, default=None)

    class Meta:
        model = ActivityLog
        fields = [
            "id", "user", "user_name", "activity_type", "title",
            "description", "is_uwh_visible", "metadata", "timestamp",
        ]


class UWHControlSerializer(serializers.ModelSerializer):
    class Meta:
        model = UWHControl
        fields = [
            "status", "status_message", "status_color",
            "financial_summary", "updated_at",
        ]


class StudentSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source="school.name", read_only=True)

    class Meta:
        model = Student
        fields = [
            "id", "name", "age", "grade", "school", "school_name",
            "parent_name", "parent_phone", "notes", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class StudentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            "name", "age", "grade", "parent_name", "parent_phone", "notes",
        ]


class TrainerProfileSerializer(serializers.ModelSerializer):
    profile_photo_url = serializers.SerializerMethodField()
    assigned_school = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "email", "username", "profile_photo",
            "profile_photo_url", "assigned_school",
        ]
        read_only_fields = ["id", "email"]

    def get_profile_photo_url(self, obj):
        if obj.profile_photo:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.profile_photo.url)
            return obj.profile_photo.url
        return None

    def get_assigned_school(self, obj):
        school = School.objects.filter(assigned_trainer=obj).first()
        if school:
            return {
                "id": str(school.id),
                "name": school.name,
                "district_name": school.district.name,
                "status": school.status,
                "total_students": school.total_students,
                "total_days": school.total_days,
            }
        return None
