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
    ResetPasswordSerializer,
    UserSerializer,
    VerifyOTPSerializer,
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
