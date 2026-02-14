from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def summary(request):
    return Response(
        {
            "total_schools": 40,
            "schools_completed": 0,
            "total_students": 2266,
            "students_trained": 0,
        }
    )
