from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "username", "password", "role"]

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    profile_photo_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "username", "role", "profile_photo", "profile_photo_url"]
        read_only_fields = ["id", "email", "role"]

    def get_profile_photo_url(self, obj):
        if obj.profile_photo:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.profile_photo.url)
            return obj.profile_photo.url
        return None


# ── OTP Serializers ──────────────────────────────────────────────


class RequestOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        try:
            User.objects.get(email=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("No account found with this email.")
        return value


class VerifyOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(min_length=6, max_length=6)

    def validate_code(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("OTP must be 6 digits.")
        return value


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(min_length=6, max_length=6)
    new_password = serializers.CharField(min_length=6, write_only=True)

    def validate_code(self, value):
        if not value.isdigit():
            raise serializers.ValidationError("OTP must be 6 digits.")
        return value
