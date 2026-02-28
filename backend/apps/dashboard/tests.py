"""
Tests for the full submission → Swinfy verification flow.

Covers:
  1. Trainer submits a session (with photos)
  2. Swinfy admin lists & views submissions
  3. Swinfy verifies / flags / rejects submissions
  4. Photo approval pipeline
  5. ActivityLog signal creation
  6. Permission guards (role-based access)
  7. Unique constraint (one submission per school per session)
"""

import io
import json
from PIL import Image
from django.test import TestCase, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.models import User
from apps.dashboard.models import (
    District,
    School,
    Curriculum,
    Submission,
    SessionPhoto,
    ActivityLog,
    TrainerAssignment,
)


def make_test_image(name="test.jpg"):
    """Create a small in-memory JPEG for upload tests."""
    buf = io.BytesIO()
    img = Image.new("RGB", (100, 100), color="red")
    img.save(buf, format="JPEG")
    buf.seek(0)
    return SimpleUploadedFile(name, buf.read(), content_type="image/jpeg")


@override_settings(
    STORAGES={"default": {"BACKEND": "django.core.files.storage.InMemoryStorage"}},
)
class BaseTestCase(TestCase):
    """Shared setup: creates a trainer, admin, school, district, curriculum."""

    def setUp(self):
        self.client = APIClient()

        # Users
        self.trainer = User.objects.create_user(
            email="trainer@test.com",
            username="Test Trainer",
            password="pass1234",
            role="trainer",
        )
        self.admin = User.objects.create_user(
            email="admin@test.com",
            username="Swinfy Admin",
            password="pass1234",
            role="admin",
        )
        self.sponsor = User.objects.create_user(
            email="sponsor@test.com",
            username="UWH Sponsor",
            password="pass1234",
            role="sponsor",
        )

        # Data
        self.district = District.objects.create(name="Hyderabad")
        self.school = School.objects.create(
            name="TMREIS School #1",
            district=self.district,
            total_students=57,
        )
        TrainerAssignment.objects.create(
            trainer=self.trainer, school=self.school, role="primary"
        )
        self.curriculum = Curriculum.objects.create(
            day_number=1,
            title="Foundations of Computers & Introduction to AI",
        )

    # ── Helpers ──────────────────────────────────────────────────

    def auth_as(self, user):
        self.client.force_authenticate(user=user)

    def submit_session(self, day_number=1, num_photos=3, school=None):
        """Helper to submit a valid session as the trainer."""
        self.auth_as(self.trainer)
        data = {
            "school": str(school or self.school).replace("-", "") and str(
                (school or self.school).pk
            ),
            "day_number": day_number,
            "reached_at": "09:30",
            "student_count": 55,
            "topics_covered": json.dumps(["AI basics"]),
            "trainer_notes": "",
            "challenges": "",
        }
        for i in range(num_photos):
            data[f"photos"] = data.get("photos", [])
        # Build multipart properly
        payload = {
            "school": str((school or self.school).pk),
            "day_number": str(day_number),
            "reached_at": "09:30",
            "student_count": "55",
            "topics_covered": json.dumps(["AI basics"]),
            "trainer_notes": "",
            "challenges": "",
        }
        files = [("photos", make_test_image(f"photo_{i}.jpg")) for i in range(num_photos)]

        response = self.client.post(
            "/api/dashboard/trainer/submit/",
            data={**payload},
            format="multipart",
        )
        # Re-post with files attached properly
        # APIClient needs files passed via the data dict
        payload_with_photos = {**payload}
        photos = [make_test_image(f"photo_{i}.jpg") for i in range(num_photos)]
        payload_with_photos["photos"] = photos

        return self.client.post(
            "/api/dashboard/trainer/submit/",
            data=payload_with_photos,
            format="multipart",
        )


# ═══════════════════════════════════════════════════════════════════
# 1. TRAINER SUBMISSION
# ═══════════════════════════════════════════════════════════════════


@override_settings(
    STORAGES={"default": {"BACKEND": "django.core.files.storage.InMemoryStorage"}},
)
class TrainerSubmitTests(TestCase):
    """Test POST /api/dashboard/trainer/submit/"""

    def setUp(self):
        self.client = APIClient()
        self.trainer = User.objects.create_user(
            email="trainer@test.com",
            username="Trainer One",
            password="pass1234",
            role="trainer",
        )
        self.admin = User.objects.create_user(
            email="admin@test.com",
            username="Admin One",
            password="pass1234",
            role="admin",
        )
        self.district = District.objects.create(name="Hyderabad")
        self.school = School.objects.create(
            name="Test School", district=self.district, total_students=57
        )
        TrainerAssignment.objects.create(
            trainer=self.trainer, school=self.school, role="primary"
        )
        self.curriculum = Curriculum.objects.create(
            day_number=1, title="Session 1: Foundations"
        )

    def _build_payload(self, day=1, num_photos=3):
        payload = {
            "school": str(self.school.pk),
            "day_number": str(day),
            "reached_at": "09:30",
            "student_count": "55",
            "topics_covered": json.dumps([]),
            "trainer_notes": "",
            "challenges": "",
            "photos": [make_test_image(f"p{i}.jpg") for i in range(num_photos)],
        }
        return payload

    def test_successful_submission(self):
        """Trainer can submit a session with 3 photos."""
        self.client.force_authenticate(user=self.trainer)
        resp = self.client.post(
            "/api/dashboard/trainer/submit/",
            data=self._build_payload(day=1, num_photos=3),
            format="multipart",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data["status"], "submitted")
        self.assertEqual(resp.data["day_number"], 1)
        self.assertEqual(resp.data["student_count"], 55)
        # Verify DB records
        self.assertEqual(Submission.objects.count(), 1)
        self.assertEqual(SessionPhoto.objects.count(), 3)

    def test_submit_with_5_photos(self):
        """Maximum 5 photos should succeed."""
        self.client.force_authenticate(user=self.trainer)
        resp = self.client.post(
            "/api/dashboard/trainer/submit/",
            data=self._build_payload(day=1, num_photos=5),
            format="multipart",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SessionPhoto.objects.count(), 5)

    def test_reject_fewer_than_3_photos(self):
        """Submission with <3 photos must be rejected."""
        self.client.force_authenticate(user=self.trainer)
        resp = self.client.post(
            "/api/dashboard/trainer/submit/",
            data=self._build_payload(day=1, num_photos=2),
            format="multipart",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Minimum 3 photos", resp.data["detail"])
        # Submission should be rolled back
        self.assertEqual(Submission.objects.count(), 0)

    def test_reject_more_than_5_photos(self):
        """Submission with >5 photos must be rejected."""
        self.client.force_authenticate(user=self.trainer)
        resp = self.client.post(
            "/api/dashboard/trainer/submit/",
            data=self._build_payload(day=1, num_photos=6),
            format="multipart",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Maximum 5 photos", resp.data["detail"])
        self.assertEqual(Submission.objects.count(), 0)

    def test_photos_default_to_pending(self):
        """Uploaded photos should have approval_status='pending'."""
        self.client.force_authenticate(user=self.trainer)
        self.client.post(
            "/api/dashboard/trainer/submit/",
            data=self._build_payload(day=1, num_photos=3),
            format="multipart",
        )
        for photo in SessionPhoto.objects.all():
            self.assertEqual(photo.approval_status, "pending")
            self.assertFalse(photo.is_featured)

    def test_duplicate_school_day_rejected(self):
        """unique_together(school, day_number) prevents duplicate submissions."""
        self.client.force_authenticate(user=self.trainer)
        resp1 = self.client.post(
            "/api/dashboard/trainer/submit/",
            data=self._build_payload(day=1, num_photos=3),
            format="multipart",
        )
        self.assertEqual(resp1.status_code, status.HTTP_201_CREATED)
        # Second submission for same school+day should fail
        resp2 = self.client.post(
            "/api/dashboard/trainer/submit/",
            data=self._build_payload(day=1, num_photos=3),
            format="multipart",
        )
        self.assertEqual(resp2.status_code, status.HTTP_400_BAD_REQUEST)

    def test_different_days_allowed(self):
        """Same school, different days should succeed (4 sessions total)."""
        self.client.force_authenticate(user=self.trainer)
        for day in [1, 2, 3, 4]:
            Curriculum.objects.get_or_create(day_number=day, defaults={"title": f"S{day}"})
            resp = self.client.post(
                "/api/dashboard/trainer/submit/",
                data=self._build_payload(day=day, num_photos=3),
                format="multipart",
            )
            self.assertEqual(
                resp.status_code, status.HTTP_201_CREATED, f"Day {day} failed"
            )
        self.assertEqual(Submission.objects.count(), 4)

    def test_unauthenticated_rejected(self):
        """Unauthenticated request should get 401."""
        resp = self.client.post(
            "/api/dashboard/trainer/submit/",
            data=self._build_payload(),
            format="multipart",
        )
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_cannot_submit(self):
        """Admin role should not be able to submit as trainer."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.post(
            "/api/dashboard/trainer/submit/",
            data=self._build_payload(),
            format="multipart",
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


# ═══════════════════════════════════════════════════════════════════
# 2. SWINFY VERIFICATION
# ═══════════════════════════════════════════════════════════════════


@override_settings(
    STORAGES={"default": {"BACKEND": "django.core.files.storage.InMemoryStorage"}},
)
class SwinfyVerificationTests(TestCase):
    """Test Swinfy admin can list, view, verify, flag, reject submissions."""

    def setUp(self):
        self.client = APIClient()
        self.trainer = User.objects.create_user(
            email="t@test.com", username="Trainer", password="pw", role="trainer"
        )
        self.admin = User.objects.create_user(
            email="a@test.com", username="Admin", password="pw", role="admin"
        )
        self.district = District.objects.create(name="Hyderabad")
        self.school = School.objects.create(
            name="School A", district=self.district, total_students=50
        )
        TrainerAssignment.objects.create(
            trainer=self.trainer, school=self.school, role="primary"
        )

        # Create a submitted submission directly
        self.submission = Submission.objects.create(
            school=self.school,
            trainer=self.trainer,
            day_number=1,
            student_count=50,
            reached_at="09:00",
            status="submitted",
        )
        for i in range(3):
            SessionPhoto.objects.create(
                submission=self.submission, image=make_test_image(f"s{i}.jpg")
            )

    def test_list_submissions(self):
        """Admin can list all submitted sessions."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.get("/api/dashboard/swinfy/submissions/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]["status"], "submitted")

    def test_list_filter_by_status(self):
        """Filter submissions by status param."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.get("/api/dashboard/swinfy/submissions/?status=verified")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 0)  # none verified yet

    def test_view_detail(self):
        """Admin can view full submission detail with photos."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.get(
            f"/api/dashboard/swinfy/submissions/{self.submission.pk}/"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["day_number"], 1)
        self.assertEqual(len(resp.data["photos"]), 3)

    def test_verify_submission(self):
        """Admin can verify a submission."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.patch(
            f"/api/dashboard/swinfy/submissions/{self.submission.pk}/verify/",
            data={"notes": "Looks good"},
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["status"], "verified")
        # Check DB
        self.submission.refresh_from_db()
        self.assertEqual(self.submission.status, "verified")
        self.assertEqual(self.submission.verified_by, self.admin)
        self.assertIsNotNone(self.submission.verified_at)

    def test_flag_submission(self):
        """Admin can flag a submission with a reason."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.patch(
            f"/api/dashboard/swinfy/submissions/{self.submission.pk}/flag/",
            data={"reason": "Photos are blurry"},
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.submission.refresh_from_db()
        self.assertEqual(self.submission.status, "flagged")
        self.assertEqual(self.submission.flag_reason, "Photos are blurry")

    def test_flag_without_reason_rejected(self):
        """Flagging without a reason should fail."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.patch(
            f"/api/dashboard/swinfy/submissions/{self.submission.pk}/flag/",
            data={},
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reject_submission(self):
        """Admin can reject a submission with a reason."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.patch(
            f"/api/dashboard/swinfy/submissions/{self.submission.pk}/reject/",
            data={"reason": "Fake data"},
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.submission.refresh_from_db()
        self.assertEqual(self.submission.status, "rejected")
        self.assertEqual(self.submission.rejection_reason, "Fake data")

    def test_reject_without_reason_rejected(self):
        """Rejecting without a reason should fail."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.patch(
            f"/api/dashboard/swinfy/submissions/{self.submission.pk}/reject/",
            data={},
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_trainer_cannot_access_swinfy(self):
        """Trainer should get 403 on swinfy endpoints."""
        self.client.force_authenticate(user=self.trainer)
        resp = self.client.get("/api/dashboard/swinfy/submissions/")
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


# ═══════════════════════════════════════════════════════════════════
# 3. PHOTO APPROVAL
# ═══════════════════════════════════════════════════════════════════


@override_settings(
    STORAGES={"default": {"BACKEND": "django.core.files.storage.InMemoryStorage"}},
)
class PhotoApprovalTests(TestCase):
    """Test Swinfy admin photo approval/rejection/feature pipeline."""

    def setUp(self):
        self.client = APIClient()
        self.trainer = User.objects.create_user(
            email="t@test.com", username="Trainer", password="pw", role="trainer"
        )
        self.admin = User.objects.create_user(
            email="a@test.com", username="Admin", password="pw", role="admin"
        )
        self.district = District.objects.create(name="Hyderabad")
        self.school = School.objects.create(
            name="School A", district=self.district, total_students=50
        )
        self.submission = Submission.objects.create(
            school=self.school,
            trainer=self.trainer,
            day_number=1,
            student_count=50,
            status="submitted",
        )
        self.photo = SessionPhoto.objects.create(
            submission=self.submission, image=make_test_image()
        )

    def test_list_pending_photos(self):
        """Admin can list pending photos."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.get("/api/dashboard/swinfy/photos/pending/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)

    def test_approve_photo(self):
        """Admin can approve a photo."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.patch(
            f"/api/dashboard/swinfy/photos/{self.photo.pk}/approve/"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.photo.refresh_from_db()
        self.assertEqual(self.photo.approval_status, "approved")
        self.assertEqual(self.photo.approved_by, self.admin)
        self.assertIsNotNone(self.photo.approved_at)

    def test_feature_photo(self):
        """Admin can feature a photo (sets approved + featured)."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.patch(
            f"/api/dashboard/swinfy/photos/{self.photo.pk}/feature/"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.photo.refresh_from_db()
        self.assertEqual(self.photo.approval_status, "approved")
        self.assertTrue(self.photo.is_featured)

    def test_reject_photo(self):
        """Admin can reject a photo."""
        self.client.force_authenticate(user=self.admin)
        resp = self.client.patch(
            f"/api/dashboard/swinfy/photos/{self.photo.pk}/reject/",
            data={"reason": "Too blurry"},
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.photo.refresh_from_db()
        self.assertEqual(self.photo.approval_status, "rejected")

    def test_photo_approval_creates_activity_log(self):
        """Approving a photo should create an ActivityLog entry."""
        self.client.force_authenticate(user=self.admin)
        self.client.patch(f"/api/dashboard/swinfy/photos/{self.photo.pk}/approve/")
        log = ActivityLog.objects.filter(activity_type="photo_approved").first()
        self.assertIsNotNone(log)


# ═══════════════════════════════════════════════════════════════════
# 4. ACTIVITY LOG SIGNALS
# ═══════════════════════════════════════════════════════════════════


@override_settings(
    STORAGES={"default": {"BACKEND": "django.core.files.storage.InMemoryStorage"}},
)
class ActivityLogSignalTests(TestCase):
    """Test that status changes on Submission create correct ActivityLog entries."""

    def setUp(self):
        self.trainer = User.objects.create_user(
            email="t@test.com", username="Trainer", password="pw", role="trainer"
        )
        self.admin = User.objects.create_user(
            email="a@test.com", username="Admin", password="pw", role="admin"
        )
        self.district = District.objects.create(name="Hyderabad")
        self.school = School.objects.create(
            name="School A", district=self.district, total_students=50
        )
        self.submission = Submission.objects.create(
            school=self.school,
            trainer=self.trainer,
            day_number=1,
            student_count=50,
            status="submitted",
        )

    def test_verify_creates_uwh_visible_log(self):
        """Verifying a submission creates an ActivityLog visible to UWH."""
        self.submission.status = "verified"
        self.submission.save()

        log = ActivityLog.objects.filter(
            activity_type="submission_verified"
        ).first()
        self.assertIsNotNone(log)
        self.assertTrue(log.is_uwh_visible)
        self.assertIn("School A", log.title)

    def test_flag_creates_log(self):
        """Flagging a submission creates a non-UWH-visible log."""
        self.submission.status = "flagged"
        self.submission.flag_reason = "Suspicious data"
        self.submission.save()

        log = ActivityLog.objects.filter(
            activity_type="submission_flagged"
        ).first()
        self.assertIsNotNone(log)
        self.assertFalse(log.is_uwh_visible)

    def test_reject_creates_log(self):
        """Rejecting a submission creates a non-UWH-visible log."""
        self.submission.status = "rejected"
        self.submission.rejection_reason = "Duplicate"
        self.submission.save()

        log = ActivityLog.objects.filter(
            activity_type="submission_rejected"
        ).first()
        self.assertIsNotNone(log)
        self.assertFalse(log.is_uwh_visible)

    def test_no_log_when_status_unchanged(self):
        """Saving without changing status should NOT create a log."""
        initial_count = ActivityLog.objects.count()
        self.submission.student_count = 60
        self.submission.save()
        self.assertEqual(ActivityLog.objects.count(), initial_count)


# ═══════════════════════════════════════════════════════════════════
# 5. END-TO-END FLOW
# ═══════════════════════════════════════════════════════════════════


@override_settings(
    STORAGES={"default": {"BACKEND": "django.core.files.storage.InMemoryStorage"}},
)
class EndToEndFlowTests(TestCase):
    """Full flow: trainer submit → swinfy list → swinfy verify → logs created."""

    def setUp(self):
        self.client = APIClient()
        self.trainer = User.objects.create_user(
            email="t@test.com", username="Trainer", password="pw", role="trainer"
        )
        self.admin = User.objects.create_user(
            email="a@test.com", username="Admin", password="pw", role="admin"
        )
        self.district = District.objects.create(name="Hyderabad")
        self.school = School.objects.create(
            name="TMREIS School", district=self.district, total_students=57
        )
        TrainerAssignment.objects.create(
            trainer=self.trainer, school=self.school, role="primary"
        )

    def test_full_submit_verify_flow(self):
        """Trainer submits → admin sees it → admin verifies → log created."""
        # Step 1: Trainer submits session
        self.client.force_authenticate(user=self.trainer)
        resp = self.client.post(
            "/api/dashboard/trainer/submit/",
            data={
                "school": str(self.school.pk),
                "day_number": "1",
                "reached_at": "09:30",
                "student_count": "55",
                "topics_covered": json.dumps([]),
                "trainer_notes": "",
                "challenges": "",
                "photos": [make_test_image(f"p{i}.jpg") for i in range(3)],
            },
            format="multipart",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        submission_id = resp.data["id"]

        # Step 2: Admin lists submissions
        self.client.force_authenticate(user=self.admin)
        resp = self.client.get("/api/dashboard/swinfy/submissions/")
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data), 1)
        self.assertEqual(resp.data[0]["id"], submission_id)
        self.assertEqual(resp.data[0]["status"], "submitted")

        # Step 3: Admin views detail
        resp = self.client.get(
            f"/api/dashboard/swinfy/submissions/{submission_id}/"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(len(resp.data["photos"]), 3)

        # Step 4: Admin verifies
        resp = self.client.patch(
            f"/api/dashboard/swinfy/submissions/{submission_id}/verify/",
            data={"notes": "All good"},
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        # Step 5: Verify DB state
        sub = Submission.objects.get(pk=submission_id)
        self.assertEqual(sub.status, "verified")
        self.assertEqual(sub.verified_by, self.admin)
        self.assertEqual(sub.swinfy_notes, "All good")

        # Step 6: ActivityLog created and visible to UWH
        log = ActivityLog.objects.filter(
            activity_type="submission_verified"
        ).first()
        self.assertIsNotNone(log)
        self.assertTrue(log.is_uwh_visible)

    def test_full_submit_flag_flow(self):
        """Trainer submits → admin flags with reason → trainer sees flagged."""
        # Submit
        self.client.force_authenticate(user=self.trainer)
        resp = self.client.post(
            "/api/dashboard/trainer/submit/",
            data={
                "school": str(self.school.pk),
                "day_number": "2",
                "reached_at": "10:00",
                "student_count": "50",
                "topics_covered": json.dumps([]),
                "trainer_notes": "",
                "challenges": "",
                "photos": [make_test_image(f"p{i}.jpg") for i in range(4)],
            },
            format="multipart",
        )
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        submission_id = resp.data["id"]

        # Admin flags
        self.client.force_authenticate(user=self.admin)
        resp = self.client.patch(
            f"/api/dashboard/swinfy/submissions/{submission_id}/flag/",
            data={"reason": "Photos not clear enough"},
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

        # Trainer sees flagged status
        self.client.force_authenticate(user=self.trainer)
        resp = self.client.get(
            f"/api/dashboard/trainer/submissions/{submission_id}/"
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data["status"], "flagged")
        self.assertEqual(resp.data["flag_reason"], "Photos not clear enough")

    def test_four_sessions_per_school(self):
        """Trainer can submit exactly 4 sessions (one per day) for a school."""
        self.client.force_authenticate(user=self.trainer)

        for day in range(1, 5):
            resp = self.client.post(
                "/api/dashboard/trainer/submit/",
                data={
                    "school": str(self.school.pk),
                    "day_number": str(day),
                    "reached_at": "09:00",
                    "student_count": "57",
                    "topics_covered": json.dumps([]),
                    "trainer_notes": "",
                    "challenges": "",
                    "photos": [make_test_image(f"d{day}p{i}.jpg") for i in range(3)],
                },
                format="multipart",
            )
            self.assertEqual(
                resp.status_code, status.HTTP_201_CREATED, f"Session {day} failed"
            )

        # 5th submission should fail (only 4 days exist)
        resp = self.client.post(
            "/api/dashboard/trainer/submit/",
            data={
                "school": str(self.school.pk),
                "day_number": "1",  # duplicate day
                "reached_at": "09:00",
                "student_count": "57",
                "topics_covered": json.dumps([]),
                "trainer_notes": "",
                "challenges": "",
                "photos": [make_test_image(f"dup{i}.jpg") for i in range(3)],
            },
            format="multipart",
        )
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Submission.objects.count(), 4)
