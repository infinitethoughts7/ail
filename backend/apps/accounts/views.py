import logging

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, get_user_model

from .serializers import (
    RegisterSerializer,
    RequestOTPSerializer,
    ResendRegistrationOTPSerializer,
    ResetPasswordSerializer,
    TrainerRegisterSerializer,
    UserSerializer,
    VerifyOTPSerializer,
    VerifyRegistrationSerializer,
)
from . import otp_service

logger = logging.getLogger(__name__)
User = get_user_model()


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "user": UserSerializer(user, context={"request": request}).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get("email")
    password = request.data.get("password")

    # Check for unverified user before authenticate() (which returns None for both)
    try:
        user_obj = User.objects.get(email=email)
        if user_obj.check_password(password) and not user_obj.is_email_verified:
            return Response(
                {"detail": "Please verify your email first.", "code": "email_not_verified"},
                status=status.HTTP_403_FORBIDDEN,
            )
    except User.DoesNotExist:
        pass

    user = authenticate(request, username=email, password=password)
    if not user:
        return Response(
            {"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
        )
    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "user": UserSerializer(user, context={"request": request}).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
    )


# ── OTP Endpoints ────────────────────────────────────────────────


@api_view(["POST"])
@permission_classes([AllowAny])
def request_otp(request):
    """Step 1: Send a 6-digit OTP to the user's email."""
    serializer = RequestOTPSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = User.objects.get(email=serializer.validated_data["email"])

    if not otp_service.check_rate_limit(user):
        return Response(
            {"detail": "Please wait before requesting another code."},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    otp = otp_service.create_otp(user)

    try:
        otp_service.send_otp_email(user, otp.code)
    except Exception:
        logger.exception("Failed to send OTP email to %s", user.email)
        return Response(
            {"detail": "Failed to send email. Please try again later."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return Response({"detail": "Verification code sent to your email."})


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_otp(request):
    """Step 2: Verify the OTP code is valid (without consuming it)."""
    serializer = VerifyOTPSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    try:
        user = User.objects.get(email=serializer.validated_data["email"])
    except User.DoesNotExist:
        return Response(
            {"detail": "Invalid email."}, status=status.HTTP_400_BAD_REQUEST
        )

    is_valid, error = otp_service.validate_otp(
        user, serializer.validated_data["code"]
    )

    if not is_valid:
        return Response({"detail": error}, status=status.HTTP_400_BAD_REQUEST)

    return Response({"detail": "OTP verified successfully."})


@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request):
    """Step 3: Reset password using a valid OTP."""
    serializer = ResetPasswordSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data

    try:
        user = User.objects.get(email=data["email"])
    except User.DoesNotExist:
        return Response(
            {"detail": "Invalid email."}, status=status.HTTP_400_BAD_REQUEST
        )

    is_valid, error = otp_service.validate_otp(user, data["code"])
    if not is_valid:
        return Response({"detail": error}, status=status.HTTP_400_BAD_REQUEST)

    # Set new password and consume the OTP
    user.set_password(data["new_password"])
    user.save(update_fields=["password"])
    otp_service.consume_otp(user, data["code"])

    return Response({"detail": "Password reset successfully."})


# ── Trainer Self-Registration ────────────────────────────────────


@api_view(["POST"])
@permission_classes([AllowAny])
def trainer_register(request):
    """Create an unverified trainer account, assign to school, send OTP."""
    serializer = TrainerRegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data
    email = data["email"]

    from apps.dashboard.models import School, TrainerAssignment

    # Delete any previous unverified account with the same email
    User.objects.filter(email=email, is_email_verified=False).delete()

    # Create user
    username = email.split("@")[0]
    if User.objects.filter(username=username).exists():
        username = f"{username}_{User.objects.count()}"

    user = User.objects.create_user(
        email=email,
        username=username,
        password=data["password"],
        role="trainer",
        first_name=data["first_name"],
        last_name=data.get("last_name", ""),
        is_email_verified=False,
    )

    # Create TrainerAssignment (auto-detect primary/secondary)
    school = School.objects.get(pk=data["school"])
    existing_count = TrainerAssignment.objects.filter(school=school).count()
    role = "primary" if existing_count == 0 else "secondary"

    TrainerAssignment.objects.create(
        trainer=user,
        school=school,
        role=role,
    )

    # Generate & send OTP
    otp = otp_service.create_otp(user)
    try:
        otp_service.send_otp_email(user, otp.code, purpose="registration")
    except Exception:
        logger.exception("Failed to send registration OTP to %s", email)
        # Rollback: delete the user (cascades to assignment + OTPs)
        user.delete()
        return Response(
            {"detail": "Failed to send verification email. Please try again."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return Response(
        {"detail": "Registration successful. Please check your email for the verification code."},
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_registration(request):
    """Verify OTP for registration → set is_email_verified=True → return JWT tokens."""
    serializer = VerifyRegistrationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    data = serializer.validated_data

    try:
        user = User.objects.get(email=data["email"])
    except User.DoesNotExist:
        return Response(
            {"detail": "No pending registration found."}, status=status.HTTP_400_BAD_REQUEST
        )

    if user.is_email_verified:
        return Response(
            {"detail": "Email is already verified."}, status=status.HTTP_400_BAD_REQUEST
        )

    is_valid, error = otp_service.validate_otp(user, data["code"])
    if not is_valid:
        return Response({"detail": error}, status=status.HTTP_400_BAD_REQUEST)

    # Verify user and consume OTP
    user.is_email_verified = True
    user.save(update_fields=["is_email_verified"])
    otp_service.consume_otp(user, data["code"])

    # Return JWT tokens for auto-login
    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "user": UserSerializer(user, context={"request": request}).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def resend_registration_otp(request):
    """Resend OTP for a pending (unverified) registration."""
    serializer = ResendRegistrationOTPSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    user = User.objects.get(email=serializer.validated_data["email"])

    if not otp_service.check_rate_limit(user):
        return Response(
            {"detail": "Please wait before requesting another code."},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    otp = otp_service.create_otp(user)

    try:
        otp_service.send_otp_email(user, otp.code, purpose="registration")
    except Exception:
        logger.exception("Failed to resend registration OTP to %s", user.email)
        return Response(
            {"detail": "Failed to send email. Please try again later."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    return Response({"detail": "Verification code sent to your email."})


@api_view(["GET"])
@permission_classes([AllowAny])
def public_schools(request):
    """Minimal school list for the registration form — no auth required."""
    from apps.dashboard.models import School

    schools = School.objects.select_related("district").values(
        "id", "name", "district__name"
    ).order_by("name")

    data = [
        {
            "id": str(s["id"]),
            "name": s["name"],
            "district_name": s["district__name"],
        }
        for s in schools
    ]
    return Response(data)
