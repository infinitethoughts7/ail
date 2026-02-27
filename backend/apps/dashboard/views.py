from django.db.models import Count, Sum, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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
from .permissions import IsAdmin, IsTrainer, IsSponsor
from .serializers import (
    DistrictSerializer,
    SchoolListSerializer,
    SchoolDetailSerializer,
    CurriculumSerializer,
    SubmissionListSerializer,
    SubmissionDetailSerializer,
    SubmissionCreateSerializer,
    SessionPhotoSerializer,
    ProjectHighlightSerializer,
    ActivityLogSerializer,
    UWHControlSerializer,
    StudentSerializer,
    StudentCreateSerializer,
    StudentGroupSerializer,
    StudentGroupCreateSerializer,
    TrainerProfileSerializer,
    TrainerAssignmentSerializer,
)


# ─────────────────────────────────────────
#  SHARED: Summary (legacy endpoint)
# ─────────────────────────────────────────


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def summary(request):
    """Summary endpoint — returns real data based on role."""
    role = request.user.role

    if role == "sponsor":
        # UWH: only sees verified data
        verified = Submission.objects.filter(status="verified")
        return Response({
            "total_schools": School.objects.count(),
            "schools_completed": School.objects.filter(status="completed").count(),
            "total_students": School.objects.aggregate(
                t=Sum("total_students"))["t"] or 0,
            "students_trained": verified.aggregate(
                t=Sum("student_count"))["t"] or 0,
        })

    elif role == "admin":
        # Swinfy: sees everything
        all_subs = Submission.objects.exclude(status="draft")
        return Response({
            "total_schools": School.objects.count(),
            "schools_completed": School.objects.filter(status="completed").count(),
            "total_students": School.objects.aggregate(
                t=Sum("total_students"))["t"] or 0,
            "students_trained": all_subs.aggregate(
                t=Sum("student_count"))["t"] or 0,
            "pending_submissions": Submission.objects.filter(
                status="submitted").count(),
            "pending_photos": SessionPhoto.objects.filter(
                approval_status="pending").count(),
            "pending_projects": ProjectHighlight.objects.filter(
                approval_status="pending").count(),
        })

    elif role == "trainer":
        subs = Submission.objects.filter(trainer=request.user)
        trainer_schools = _get_trainer_schools(request.user)
        return Response({
            "assigned_schools": trainer_schools.count(),
            "submissions_count": subs.count(),
            "verified_count": subs.filter(status="verified").count(),
            "flagged_count": subs.filter(status="flagged").count(),
            "student_count": Student.objects.filter(
                school__in=trainer_schools).count(),
            "project_count": ProjectHighlight.objects.filter(
                Q(trainer=request.user) | Q(submission__trainer=request.user)
            ).distinct().count(),
        })

    return Response({
        "total_schools": 0,
        "schools_completed": 0,
        "total_students": 0,
        "students_trained": 0,
    })


# ─────────────────────────────────────────
#  SHARED: Districts, Schools, Curriculum
# ─────────────────────────────────────────


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def district_list(request):
    districts = District.objects.annotate(
        school_count=Count("schools"),
    ).order_by("-school_count", "name")
    return Response(DistrictSerializer(districts, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def school_list(request):
    qs = School.objects.select_related("district").prefetch_related(
        "trainer_assignments__trainer"
    )
    district = request.query_params.get("district")
    if district:
        qs = qs.filter(district_id=district)
    status_filter = request.query_params.get("status")
    if status_filter:
        qs = qs.filter(status=status_filter)
    trainer = request.query_params.get("trainer")
    if trainer:
        qs = qs.filter(trainer_assignments__trainer_id=trainer).distinct()
    return Response(SchoolListSerializer(qs, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def school_detail(request, pk):
    try:
        school = School.objects.select_related("district").get(pk=pk)
    except School.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    return Response(SchoolDetailSerializer(school).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def curriculum_list(request):
    return Response(
        CurriculumSerializer(Curriculum.objects.all(), many=True).data
    )


# ─────────────────────────────────────────
#  TRAINER: Submissions
# ─────────────────────────────────────────


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsTrainer])
def trainer_submissions(request):
    qs = Submission.objects.filter(trainer=request.user).annotate(
        photo_count=Count("photos"),
        project_count=Count("project_highlights"),
    )
    return Response(SubmissionListSerializer(qs, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsTrainer])
@parser_classes([MultiPartParser, FormParser])
def trainer_submit(request):
    serializer = SubmissionCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    sub = serializer.save(
        trainer=request.user,
        status="submitted",
        submitted_at=timezone.now(),
    )

    # Handle photo uploads (min 3, max 5)
    photos = request.FILES.getlist("photos")
    if len(photos) < 3:
        sub.delete()
        return Response(
            {"detail": "Minimum 3 photos required"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if len(photos) > 5:
        sub.delete()
        return Response(
            {"detail": "Maximum 5 photos allowed"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    for f in photos:
        SessionPhoto.objects.create(submission=sub, image=f)

    # Handle project highlights (optional JSON)
    # Projects are sent as separate requests, not inline

    return Response(
        SubmissionDetailSerializer(sub, context={"request": request}).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsTrainer])
def trainer_submission_detail(request, pk):
    try:
        sub = Submission.objects.select_related("school").prefetch_related(
            "photos", "project_highlights"
        ).get(pk=pk, trainer=request.user)
    except Submission.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    return Response(
        SubmissionDetailSerializer(sub, context={"request": request}).data
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsTrainer])
@parser_classes([MultiPartParser, FormParser])
def trainer_add_project(request, submission_pk):
    try:
        sub = Submission.objects.get(pk=submission_pk, trainer=request.user)
    except Submission.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    data = request.data.copy()
    serializer = ProjectHighlightSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save(submission=sub)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────
#  TRAINER: Profile
# ─────────────────────────────────────────


@api_view(["GET", "PATCH"])
@permission_classes([IsAuthenticated, IsTrainer])
@parser_classes([MultiPartParser, FormParser])
def trainer_profile(request):
    if request.method == "GET":
        serializer = TrainerProfileSerializer(
            request.user, context={"request": request}
        )
        return Response(serializer.data)

    # PATCH — update profile
    serializer = TrainerProfileSerializer(
        request.user, data=request.data, partial=True, context={"request": request}
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(serializer.data)


# ─────────────────────────────────────────
#  TRAINER: Students
# ─────────────────────────────────────────


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsTrainer])
def trainer_students(request):
    schools = _get_trainer_schools(request.user)
    school_id = request.query_params.get("school")
    if school_id:
        schools = schools.filter(pk=school_id)
    students = Student.objects.filter(school__in=schools)
    return Response(StudentSerializer(students, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsTrainer])
def trainer_add_student(request):
    school_id = request.data.get("school")
    if school_id:
        school = _get_trainer_schools(request.user).filter(pk=school_id).first()
    else:
        school = _get_trainer_school(request.user)
    if not school:
        return Response(
            {"detail": "No school assigned to this trainer"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    serializer = StudentCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save(school=school, added_by=request.user)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsTrainer])
def trainer_update_student(request, pk):
    trainer_schools = _get_trainer_schools(request.user)
    try:
        student = Student.objects.get(school__in=trainer_schools, pk=pk)
    except Student.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    serializer = StudentCreateSerializer(
        student, data=request.data, partial=True
    )
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(StudentSerializer(student).data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated, IsTrainer])
def trainer_delete_student(request, pk):
    trainer_schools = _get_trainer_schools(request.user)
    try:
        student = Student.objects.get(school__in=trainer_schools, pk=pk)
    except Student.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    student.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────
#  TRAINER: Student Groups
# ─────────────────────────────────────────


def _get_trainer_schools(user):
    return School.objects.filter(trainer_assignments__trainer=user).distinct()


def _get_trainer_school(user):
    return _get_trainer_schools(user).first()


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsTrainer])
def trainer_groups(request):
    schools = _get_trainer_schools(request.user)
    school_id = request.query_params.get("school")
    if school_id:
        schools = schools.filter(pk=school_id)
    if not schools.exists():
        return Response([])
    groups = StudentGroup.objects.filter(school__in=schools).prefetch_related("members")
    return Response(StudentGroupSerializer(groups, many=True).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsTrainer])
def trainer_create_group(request):
    school_id = request.data.get("school")
    if school_id:
        school = _get_trainer_schools(request.user).filter(pk=school_id).first()
    else:
        school = _get_trainer_school(request.user)
    if not school:
        return Response(
            {"detail": "No school assigned to this trainer"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    serializer = StudentGroupCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    group = serializer.save(school=school, created_by=request.user)
    return Response(
        StudentGroupSerializer(group).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsTrainer])
def trainer_update_group(request, pk):
    school = _get_trainer_school(request.user)
    try:
        group = StudentGroup.objects.get(pk=pk, school=school)
    except StudentGroup.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    serializer = StudentGroupCreateSerializer(group, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    return Response(StudentGroupSerializer(group).data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated, IsTrainer])
def trainer_delete_group(request, pk):
    school = _get_trainer_school(request.user)
    try:
        group = StudentGroup.objects.get(pk=pk, school=school)
    except StudentGroup.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    # Unassign students before deleting
    group.members.update(group=None)
    group.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsTrainer])
def trainer_assign_students_to_group(request, pk):
    school = _get_trainer_school(request.user)
    try:
        group = StudentGroup.objects.get(pk=pk, school=school)
    except StudentGroup.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    student_ids = request.data.get("student_ids", [])
    updated = Student.objects.filter(
        id__in=student_ids, school=school
    ).update(group=group)
    return Response({"assigned": updated})


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsTrainer])
def trainer_remove_students_from_group(request, pk):
    school = _get_trainer_school(request.user)
    try:
        group = StudentGroup.objects.get(pk=pk, school=school)
    except StudentGroup.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    student_ids = request.data.get("student_ids", [])
    updated = Student.objects.filter(
        id__in=student_ids, group=group
    ).update(group=None)
    return Response({"removed": updated})


# ─────────────────────────────────────────
#  TRAINER: Projects
# ─────────────────────────────────────────


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsTrainer])
@parser_classes([MultiPartParser, FormParser])
def trainer_create_project(request):
    """Create a project independent of any submission."""
    school_id = request.data.get("school")
    if school_id:
        school = _get_trainer_schools(request.user).filter(pk=school_id).first()
    else:
        school = _get_trainer_school(request.user)
    if not school:
        return Response(
            {"detail": "No school assigned to this trainer"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    data = request.data.copy()
    serializer = ProjectHighlightSerializer(data=data)
    serializer.is_valid(raise_exception=True)
    serializer.save(school=school, trainer=request.user)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsTrainer])
def trainer_projects(request):
    projects = ProjectHighlight.objects.filter(
        Q(trainer=request.user) | Q(submission__trainer=request.user)
    ).distinct().select_related("submission__school", "school", "group")
    return Response(
        ProjectHighlightSerializer(
            projects, many=True, context={"request": request}
        ).data
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsTrainer])
def trainer_gallery(request):
    """All photos uploaded by this trainer. Filter by ?status= (approval_status), ?day=, ?school="""
    photos = SessionPhoto.objects.filter(
        submission__trainer=request.user
    ).select_related("submission__school").order_by("-uploaded_at")
    status_filter = request.query_params.get("status")
    if status_filter:
        photos = photos.filter(approval_status=status_filter)
    day = request.query_params.get("day")
    if day:
        photos = photos.filter(submission__day_number=day)
    school = request.query_params.get("school")
    if school:
        photos = photos.filter(submission__school_id=school)

    data = []
    for p in photos:
        data.append({
            "id": str(p.id),
            "image_url": request.build_absolute_uri(p.image.url) if p.image else None,
            "caption": p.caption,
            "approval_status": p.approval_status,
            "is_featured": p.is_featured,
            "rejection_reason": p.rejection_reason,
            "uploaded_at": p.uploaded_at.isoformat(),
            "school_name": p.submission.school.name,
            "day_number": p.submission.day_number,
        })

    return Response(data)


# ─────────────────────────────────────────
#  TRAINER: Assigned Schools
# ─────────────────────────────────────────


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsTrainer])
def trainer_assigned_schools(request):
    """Returns only schools assigned to the current trainer."""
    schools = _get_trainer_schools(request.user).select_related("district").prefetch_related(
        "trainer_assignments__trainer"
    )
    return Response(SchoolListSerializer(schools, many=True).data)


# ─────────────────────────────────────────
#  SWINFY (Admin): Trainers List
# ─────────────────────────────────────────


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_trainers(request):
    """All trainers with their assigned schools and submission stats. Filter by ?district="""
    from apps.accounts.models import User

    trainers = User.objects.filter(role="trainer").prefetch_related(
        "school_assignments__school__district"
    )
    district = request.query_params.get("district")
    if district:
        trainers = trainers.filter(
            school_assignments__school__district_id=district
        ).distinct()
    trainers = trainers.annotate(
        subs_total=Count(
            "submissions", filter=~Q(submissions__status="draft")
        ),
        subs_verified=Count(
            "submissions", filter=Q(submissions__status="verified")
        ),
        subs_pending=Count(
            "submissions", filter=Q(submissions__status="submitted")
        ),
        subs_flagged=Count(
            "submissions", filter=Q(submissions__status="flagged")
        ),
    ).order_by("first_name", "last_name")

    data = []
    for t in trainers:
        assignments = t.school_assignments.all()
        data.append({
            "id": str(t.id),
            "email": t.email,
            "first_name": t.first_name,
            "last_name": t.last_name,
            "full_name": t.get_full_name() or t.username,
            "profile_photo_url": request.build_absolute_uri(t.profile_photo.url) if t.profile_photo else None,
            "schools": [
                {
                    "id": str(a.school.id),
                    "name": a.school.name,
                    "district_name": a.school.district.name,
                    "status": a.school.status,
                    "assignment_id": str(a.id),
                    "role": a.role,
                }
                for a in assignments
            ],
            "total_submissions": t.subs_total,
            "verified_submissions": t.subs_verified,
            "pending_submissions": t.subs_pending,
            "flagged_submissions": t.subs_flagged,
        })

    return Response(data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_update_school(request, pk):
    """Admin: update school details (POC, principal, status, etc.)."""
    try:
        school = School.objects.select_related("district").get(pk=pk)
    except School.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    allowed_fields = [
        "poc_name", "poc_designation", "poc_phone",
        "principal_name", "principal_phone", "principal_email",
        "map_url", "address", "total_students", "total_days", "status",
    ]
    updated = []
    for field in allowed_fields:
        if field in request.data:
            setattr(school, field, request.data[field])
            updated.append(field)

    if updated:
        school.save(update_fields=updated + ["updated_at"])

    return Response(SchoolDetailSerializer(school).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_assign_trainer(request):
    """Assign a trainer to a school."""
    trainer_id = request.data.get("trainer")
    school_id = request.data.get("school")
    role = request.data.get("role", "primary")

    if not trainer_id or not school_id:
        return Response(
            {"detail": "trainer and school are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    from apps.accounts.models import User
    try:
        trainer = User.objects.get(pk=trainer_id, role="trainer")
    except User.DoesNotExist:
        return Response(
            {"detail": "Trainer not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        school = School.objects.get(pk=school_id)
    except School.DoesNotExist:
        return Response(
            {"detail": "School not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    assignment, created = TrainerAssignment.objects.get_or_create(
        trainer=trainer,
        school=school,
        defaults={"role": role, "assigned_by": request.user},
    )
    if not created:
        return Response(
            {"detail": "Trainer is already assigned to this school"},
            status=status.HTTP_409_CONFLICT,
        )

    return Response(
        TrainerAssignmentSerializer(assignment).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_unassign_trainer(request, pk):
    """Remove a trainer assignment."""
    try:
        assignment = TrainerAssignment.objects.get(pk=pk)
    except TrainerAssignment.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    assignment.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────
#  SWINFY (Admin): Verification Queue
# ─────────────────────────────────────────


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_submissions(request):
    """All submissions for review. Filter by ?status=, ?trainer=, ?school=, ?district=, ?day="""
    qs = Submission.objects.exclude(status="draft").select_related(
        "school", "trainer"
    ).annotate(
        photo_count=Count("photos"),
        project_count=Count("project_highlights"),
    )
    status_filter = request.query_params.get("status")
    if status_filter:
        qs = qs.filter(status=status_filter)
    trainer = request.query_params.get("trainer")
    if trainer:
        qs = qs.filter(trainer_id=trainer)
    school = request.query_params.get("school")
    if school:
        qs = qs.filter(school_id=school)
    district = request.query_params.get("district")
    if district:
        qs = qs.filter(school__district_id=district)
    day = request.query_params.get("day")
    if day:
        qs = qs.filter(day_number=day)
    return Response(SubmissionListSerializer(qs, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_submission_detail(request, pk):
    try:
        sub = Submission.objects.select_related("school", "trainer").prefetch_related(
            "photos", "project_highlights"
        ).get(pk=pk)
    except Submission.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    return Response(
        SubmissionDetailSerializer(sub, context={"request": request}).data
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_verify_submission(request, pk):
    try:
        sub = Submission.objects.get(pk=pk)
    except Submission.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    sub.status = "verified"
    sub.verified_by = request.user
    sub.verified_at = timezone.now()
    sub.swinfy_notes = request.data.get("notes", "")
    sub.save()
    return Response({"status": "verified"})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_flag_submission(request, pk):
    try:
        sub = Submission.objects.get(pk=pk)
    except Submission.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    reason = request.data.get("reason", "")
    if not reason:
        return Response(
            {"error": "Reason is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    sub.status = "flagged"
    sub.flag_reason = reason
    sub.save()
    return Response({"status": "flagged"})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_reject_submission(request, pk):
    try:
        sub = Submission.objects.get(pk=pk)
    except Submission.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    reason = request.data.get("reason", "")
    if not reason:
        return Response(
            {"error": "Reason is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    sub.status = "rejected"
    sub.rejection_reason = reason
    sub.save()
    return Response({"status": "rejected"})


# ─────────────────────────────────────────
#  SWINFY (Admin): Photo Actions
# ─────────────────────────────────────────


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_pending_photos(request):
    """Photos for review. Filter by ?status= (default pending, 'all'), ?school=, ?trainer=, ?district=, ?day="""
    status_filter = request.query_params.get("status", "pending")
    qs = SessionPhoto.objects.select_related(
        "submission__school", "submission__trainer"
    )
    if status_filter != "all":
        qs = qs.filter(approval_status=status_filter)
    school = request.query_params.get("school")
    if school:
        qs = qs.filter(submission__school_id=school)
    trainer = request.query_params.get("trainer")
    if trainer:
        qs = qs.filter(submission__trainer_id=trainer)
    district = request.query_params.get("district")
    if district:
        qs = qs.filter(submission__school__district_id=district)
    day = request.query_params.get("day")
    if day:
        qs = qs.filter(submission__day_number=day)
    return Response(
        SessionPhotoSerializer(qs, many=True, context={"request": request}).data
    )


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_approve_photo(request, pk):
    try:
        photo = SessionPhoto.objects.get(pk=pk)
    except SessionPhoto.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    photo.approval_status = "approved"
    photo.approved_by = request.user
    photo.approved_at = timezone.now()
    photo.save()

    ActivityLog.objects.create(
        user=request.user,
        activity_type="photo_approved",
        title=f"Photo approved for {photo.submission.school.name}",
        is_uwh_visible=False,
    )
    return Response({"status": "approved"})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_feature_photo(request, pk):
    try:
        photo = SessionPhoto.objects.get(pk=pk)
    except SessionPhoto.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    photo.approval_status = "approved"
    photo.is_featured = True
    photo.approved_by = request.user
    photo.approved_at = timezone.now()
    photo.save()
    return Response({"status": "featured"})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_reject_photo(request, pk):
    try:
        photo = SessionPhoto.objects.get(pk=pk)
    except SessionPhoto.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    photo.approval_status = "rejected"
    photo.rejection_reason = request.data.get("reason", "")
    photo.save()

    ActivityLog.objects.create(
        user=request.user,
        activity_type="photo_rejected",
        title=f"Photo rejected for {photo.submission.school.name}",
        is_uwh_visible=False,
    )
    return Response({"status": "rejected"})


@api_view(["DELETE"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_delete_photo(request, pk):
    try:
        photo = SessionPhoto.objects.select_related("submission__school").get(pk=pk)
    except SessionPhoto.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    school_name = photo.submission.school.name
    # Delete the actual file
    if photo.image:
        photo.image.delete(save=False)
    photo.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_bulk_approve_photos(request):
    ids = request.data.get("photo_ids", [])
    now = timezone.now()
    updated = SessionPhoto.objects.filter(id__in=ids).update(
        approval_status="approved",
        approved_by=request.user,
        approved_at=now,
    )
    return Response({"approved": updated})


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_bulk_reject_photos(request):
    ids = request.data.get("photo_ids", [])
    reason = request.data.get("reason", "")
    updated = SessionPhoto.objects.filter(id__in=ids).update(
        approval_status="rejected",
        rejection_reason=reason,
    )
    return Response({"rejected": updated})


# ─────────────────────────────────────────
#  SWINFY (Admin): Project Actions
# ─────────────────────────────────────────


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_pending_projects(request):
    """Projects for review. Filter by ?status= (default pending, 'all'), ?school=, ?trainer=, ?district="""
    status_filter = request.query_params.get("status", "pending")
    qs = ProjectHighlight.objects.select_related(
        "submission__school", "submission__trainer", "school", "trainer", "group"
    )
    if status_filter != "all":
        qs = qs.filter(approval_status=status_filter)
    school = request.query_params.get("school")
    if school:
        qs = qs.filter(Q(school_id=school) | Q(submission__school_id=school))
    trainer = request.query_params.get("trainer")
    if trainer:
        qs = qs.filter(Q(trainer_id=trainer) | Q(submission__trainer_id=trainer))
    district = request.query_params.get("district")
    if district:
        qs = qs.filter(
            Q(school__district_id=district) | Q(submission__school__district_id=district)
        )
    return Response(ProjectHighlightSerializer(qs, many=True, context={"request": request}).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_approve_project(request, pk):
    try:
        project = ProjectHighlight.objects.get(pk=pk)
    except ProjectHighlight.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    project.approval_status = "approved"
    project.approved_by = request.user
    project.approved_at = timezone.now()
    project.save()

    ActivityLog.objects.create(
        user=request.user,
        activity_type="project_approved",
        title=f"Project '{project.title}' approved",
        is_uwh_visible=False,
    )
    return Response({"status": "approved"})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_feature_project(request, pk):
    try:
        project = ProjectHighlight.objects.get(pk=pk)
    except ProjectHighlight.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    project.approval_status = "featured"
    project.approved_by = request.user
    project.approved_at = timezone.now()
    project.save()

    ActivityLog.objects.create(
        user=request.user,
        activity_type="project_featured",
        title=f"Project '{project.title}' featured on UWH",
        is_uwh_visible=True,
    )
    return Response({"status": "featured"})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_reject_project(request, pk):
    try:
        project = ProjectHighlight.objects.get(pk=pk)
    except ProjectHighlight.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    project.approval_status = "rejected"
    project.rejection_reason = request.data.get("reason", "")
    project.save()
    return Response({"status": "rejected"})


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_edit_project_for_uwh(request, pk):
    try:
        project = ProjectHighlight.objects.get(pk=pk)
    except ProjectHighlight.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    project.uwh_description = request.data.get("description", project.uwh_description)
    project.swinfy_notes = request.data.get("notes", project.swinfy_notes)
    project.save()
    return Response(ProjectHighlightSerializer(project, context={"request": request}).data)


# ─────────────────────────────────────────
#  SWINFY (Admin): UWH Control Panel
# ─────────────────────────────────────────


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_uwh_control(request):
    ctrl = UWHControl.load()
    return Response(UWHControlSerializer(ctrl).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_uwh_status_banner(request):
    ctrl = UWHControl.load()
    ctrl.status = request.data.get("status", ctrl.status)
    ctrl.status_message = request.data.get("message", ctrl.status_message)
    ctrl.status_color = request.data.get("color", ctrl.status_color)
    ctrl.updated_by = request.user
    ctrl.save()
    return Response(UWHControlSerializer(ctrl).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_uwh_financial(request):
    ctrl = UWHControl.load()
    ctrl.financial_summary = request.data.get("data", ctrl.financial_summary)
    ctrl.updated_by = request.user
    ctrl.save()
    return Response(UWHControlSerializer(ctrl).data)


# ─────────────────────────────────────────
#  SWINFY (Admin): Activity Log
# ─────────────────────────────────────────


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def swinfy_activity_log(request):
    qs = ActivityLog.objects.select_related("user").all()[:50]
    return Response(ActivityLogSerializer(qs, many=True).data)


# ─────────────────────────────────────────
#  UWH (Sponsor): Dashboard
# ─────────────────────────────────────────


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsSponsor])
def uwh_summary(request):
    verified = Submission.objects.filter(status="verified")
    ctrl = UWHControl.load()
    return Response({
        "status_banner": {
            "status": ctrl.status,
            "message": ctrl.status_message,
            "color": ctrl.status_color,
        },
        "kpis": {
            "total_schools": School.objects.count(),
            "schools_completed": School.objects.filter(status="completed").count(),
            "schools_in_progress": School.objects.filter(status="in_progress").count(),
            "total_students_trained": verified.aggregate(
                t=Sum("student_count"))["t"] or 0,
            "total_sessions": verified.count(),
            "total_districts": District.objects.count(),
        },
        "financial_summary": ctrl.financial_summary,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsSponsor])
def uwh_gallery(request):
    """Only approved photos from verified submissions. Filter by ?district=, ?school="""
    photos = SessionPhoto.objects.filter(
        submission__status="verified",
        approval_status="approved",
    ).select_related("submission__school")

    district = request.query_params.get("district")
    if district:
        photos = photos.filter(submission__school__district_id=district)
    school = request.query_params.get("school")
    if school:
        photos = photos.filter(submission__school_id=school)

    featured = photos.filter(is_featured=True)
    regular = photos.filter(is_featured=False)

    return Response({
        "featured": SessionPhotoSerializer(
            featured, many=True, context={"request": request}
        ).data,
        "photos": SessionPhotoSerializer(
            regular, many=True, context={"request": request}
        ).data,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsSponsor])
def uwh_projects(request):
    """Approved/featured projects. Includes both submission-linked and standalone projects."""
    projects = ProjectHighlight.objects.filter(
        approval_status__in=["approved", "featured"],
    ).filter(
        # Either from verified submissions, or standalone (no submission)
        Q(submission__status="verified") | Q(submission__isnull=True)
    ).select_related("submission__school", "school", "group")

    district = request.query_params.get("district")
    if district:
        projects = projects.filter(
            Q(school__district_id=district) | Q(submission__school__district_id=district)
        )
    school = request.query_params.get("school")
    if school:
        projects = projects.filter(
            Q(school_id=school) | Q(submission__school_id=school)
        )

    return Response(
        ProjectHighlightSerializer(
            projects, many=True, context={"request": request}
        ).data
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsSponsor])
def uwh_activity_feed(request):
    activities = list(
        ActivityLog.objects.filter(is_uwh_visible=True)
        .select_related("user")[:30]
    )
    data = ActivityLogSerializer(activities, many=True).data

    # Attach one approved session photo per activity entry
    photos_qs = (
        SessionPhoto.objects.filter(approval_status="approved")
        .exclude(image="")
        .select_related("submission")[:50]
    )
    sub_photos = {}
    for p in photos_qs:
        sid = str(p.submission_id)
        if sid not in sub_photos:
            sub_photos[sid] = request.build_absolute_uri(p.image.url)
    photo_urls = list(sub_photos.values())

    for i, item in enumerate(data):
        sid = str((item.get("metadata") or {}).get("submission_id", ""))
        if sid in sub_photos:
            item["thumbnail_url"] = sub_photos[sid]
        elif photo_urls:
            item["thumbnail_url"] = photo_urls[i % len(photo_urls)]
        else:
            item["thumbnail_url"] = None

    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsSponsor])
def uwh_district_progress(request):
    districts = District.objects.annotate(
        total_schools=Count("schools"),
        completed=Count("schools", filter=Q(schools__status="completed")),
        in_progress=Count("schools", filter=Q(schools__status="in_progress")),
    ).order_by("-total_schools", "name")
    return Response([
        {
            "id": str(d.id),
            "name": d.name,
            "total_schools": d.total_schools,
            "completed": d.completed,
            "in_progress": d.in_progress,
        }
        for d in districts
    ])
