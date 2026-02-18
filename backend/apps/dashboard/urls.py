from django.urls import path
from . import views

urlpatterns = [
    # Shared
    path("summary/", views.summary),
    path("districts/", views.district_list),
    path("schools/", views.school_list),
    path("schools/<uuid:pk>/", views.school_detail),
    path("curriculum/", views.curriculum_list),

    # Trainer
    path("trainer/profile/", views.trainer_profile),
    path("trainer/submissions/", views.trainer_submissions),
    path("trainer/submit/", views.trainer_submit),
    path("trainer/submissions/<uuid:pk>/", views.trainer_submission_detail),
    path("trainer/submissions/<uuid:submission_pk>/projects/", views.trainer_add_project),
    path("trainer/students/", views.trainer_students),
    path("trainer/students/add/", views.trainer_add_student),
    path("trainer/students/<uuid:pk>/", views.trainer_update_student),
    path("trainer/students/<uuid:pk>/delete/", views.trainer_delete_student),
    path("trainer/projects/", views.trainer_projects),
    path("trainer/gallery/", views.trainer_gallery),

    # Swinfy — Trainers
    path("swinfy/trainers/", views.swinfy_trainers),

    # Swinfy — Verification Queue
    path("swinfy/submissions/", views.swinfy_submissions),
    path("swinfy/submissions/<uuid:pk>/", views.swinfy_submission_detail),
    path("swinfy/submissions/<uuid:pk>/verify/", views.swinfy_verify_submission),
    path("swinfy/submissions/<uuid:pk>/flag/", views.swinfy_flag_submission),
    path("swinfy/submissions/<uuid:pk>/reject/", views.swinfy_reject_submission),

    # Swinfy — Photos
    path("swinfy/photos/pending/", views.swinfy_pending_photos),
    path("swinfy/photos/<uuid:pk>/approve/", views.swinfy_approve_photo),
    path("swinfy/photos/<uuid:pk>/feature/", views.swinfy_feature_photo),
    path("swinfy/photos/<uuid:pk>/reject/", views.swinfy_reject_photo),
    path("swinfy/photos/<uuid:pk>/delete/", views.swinfy_delete_photo),
    path("swinfy/photos/bulk-approve/", views.swinfy_bulk_approve_photos),
    path("swinfy/photos/bulk-reject/", views.swinfy_bulk_reject_photos),

    # Swinfy — Projects
    path("swinfy/projects/pending/", views.swinfy_pending_projects),
    path("swinfy/projects/<uuid:pk>/approve/", views.swinfy_approve_project),
    path("swinfy/projects/<uuid:pk>/feature/", views.swinfy_feature_project),
    path("swinfy/projects/<uuid:pk>/reject/", views.swinfy_reject_project),
    path("swinfy/projects/<uuid:pk>/edit-for-uwh/", views.swinfy_edit_project_for_uwh),

    # Swinfy — UWH Control
    path("swinfy/uwh-control/", views.swinfy_uwh_control),
    path("swinfy/uwh-control/status-banner/", views.swinfy_uwh_status_banner),
    path("swinfy/uwh-control/financial-summary/", views.swinfy_uwh_financial),

    # Swinfy — Activity Log
    path("swinfy/activity-log/", views.swinfy_activity_log),

    # UWH (Sponsor)
    path("uwh/summary/", views.uwh_summary),
    path("uwh/gallery/", views.uwh_gallery),
    path("uwh/projects/", views.uwh_projects),
    path("uwh/activity-feed/", views.uwh_activity_feed),
    path("uwh/district-progress/", views.uwh_district_progress),
]
