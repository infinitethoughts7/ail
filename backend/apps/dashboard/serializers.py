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
    StudentGroup,
    TrainerAssignment,
)

User = get_user_model()


class DistrictSerializer(serializers.ModelSerializer):
    school_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = District
        fields = ["id", "name", "state", "school_count", "created_at"]


class SchoolListSerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source="district.name", read_only=True)
    trainers_list = serializers.SerializerMethodField()

    class Meta:
        model = School
        fields = [
            "id", "name", "district", "district_name", "status",
            "total_students", "trainers_list",
            "total_days", "created_at",
        ]

    def get_trainers_list(self, obj):
        assignments = getattr(obj, "_prefetched_trainer_assignments", None)
        if assignments is None:
            assignments = obj.trainer_assignments.select_related("trainer").all()
        return [
            {
                "id": str(a.trainer_id),
                "name": a.trainer.get_full_name() or a.trainer.username,
                "role": a.role,
            }
            for a in assignments
        ]


class SchoolDetailSerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source="district.name", read_only=True)
    trainers_list = serializers.SerializerMethodField()
    submissions = serializers.SerializerMethodField()

    class Meta:
        model = School
        fields = "__all__"

    def get_trainers_list(self, obj):
        return [
            {
                "id": str(a.trainer_id),
                "name": a.trainer.get_full_name() or a.trainer.username,
                "role": a.role,
            }
            for a in obj.trainer_assignments.select_related("trainer").all()
        ]

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
    media_file_url = serializers.SerializerMethodField()
    display_description = serializers.SerializerMethodField()
    group_name = serializers.CharField(source="group.name", read_only=True, default=None)
    group_members = serializers.SerializerMethodField()
    school_name = serializers.SerializerMethodField()

    class Meta:
        model = ProjectHighlight
        fields = [
            "id", "student_name", "student_age", "student_grade",
            "title", "description", "image", "image_url",
            "project_type", "group", "group_name", "group_members",
            "media_file", "media_file_url", "website_url", "school_name",
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

    def get_media_file_url(self, obj):
        if obj.media_file:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.media_file.url)
            return obj.media_file.url
        return None

    def get_display_description(self, obj):
        # UWH sees the curated description if available
        return obj.uwh_description or obj.description

    def get_group_members(self, obj):
        if obj.group:
            return list(obj.group.members.values_list("name", flat=True))
        return []

    def get_school_name(self, obj):
        if obj.school:
            return obj.school.name
        if obj.submission:
            return obj.submission.school.name
        return None


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
            "attendance_file",
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
    group_name = serializers.CharField(source="group.name", read_only=True, default=None)

    class Meta:
        model = Student
        fields = [
            "id", "name", "age", "grade", "school", "school_name",
            "group", "group_name",
            "parent_name", "parent_phone", "notes",
            "baseline_marks", "endline_marks",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class StudentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = [
            "name", "age", "grade", "group", "parent_name", "parent_phone", "notes",
            "baseline_marks", "endline_marks",
        ]
        extra_kwargs = {
            "group": {"required": False, "allow_null": True},
            "baseline_marks": {"required": False, "allow_null": True},
            "endline_marks": {"required": False, "allow_null": True},
        }


class StudentGroupSerializer(serializers.ModelSerializer):
    members = StudentSerializer(many=True, read_only=True)
    member_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = StudentGroup
        fields = [
            "id", "name", "school", "members", "member_count",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "school", "created_at", "updated_at"]


class StudentGroupCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentGroup
        fields = ["name"]


class TrainerAssignmentSerializer(serializers.ModelSerializer):
    trainer_name = serializers.CharField(source="trainer.username", read_only=True)
    trainer_email = serializers.CharField(source="trainer.email", read_only=True)
    school_name = serializers.CharField(source="school.name", read_only=True)
    district_name = serializers.CharField(source="school.district.name", read_only=True)

    class Meta:
        model = TrainerAssignment
        fields = [
            "id", "trainer", "trainer_name", "trainer_email",
            "school", "school_name", "district_name",
            "role", "phase", "assigned_at",
        ]
        read_only_fields = ["id", "assigned_at"]


class TrainerProfileSerializer(serializers.ModelSerializer):
    profile_photo_url = serializers.SerializerMethodField()
    assigned_school = serializers.SerializerMethodField()
    assigned_schools = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "email", "username", "profile_photo",
            "profile_photo_url", "assigned_school", "assigned_schools",
        ]
        read_only_fields = ["id", "email"]

    def get_profile_photo_url(self, obj):
        if obj.profile_photo:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.profile_photo.url)
            return obj.profile_photo.url
        return None

    def _get_school_entries(self, obj):
        assignments = TrainerAssignment.objects.filter(
            trainer=obj
        ).select_related("school__district").order_by("-assigned_at")

        entries = []
        for a in assignments:
            school = a.school
            # Get co-trainers for this school (other trainers assigned)
            co_trainers = [
                ca.trainer.get_full_name() or ca.trainer.username
                for ca in TrainerAssignment.objects.filter(
                    school=school
                ).exclude(trainer=obj).select_related("trainer")
            ]
            entries.append({
                "id": str(school.id),
                "name": school.name,
                "district_name": school.district.name,
                "status": school.status,
                "total_students": school.total_students,
                "total_days": school.total_days,
                "map_url": school.map_url,
                "poc_name": school.poc_name,
                "poc_designation": school.poc_designation,
                "poc_phone": school.poc_phone,
                "principal_phone": school.principal_phone,
                "co_trainers": co_trainers,
                "role": a.role,
            })
        return entries

    def get_assigned_schools(self, obj):
        return self._get_school_entries(obj)

    def get_assigned_school(self, obj):
        entries = self._get_school_entries(obj)
        if entries:
            entry = entries[0]
            # Backward compat: flatten co_trainers to co_trainer
            entry["co_trainer"] = entry["co_trainers"][0] if entry["co_trainers"] else None
            return entry
        return None
