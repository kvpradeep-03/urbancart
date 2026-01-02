from django.http import JsonResponse
from django.db import connections
from django.db.utils import OperationalError


def health_check(request):
    """Health check endpoint to monitor the status of the application and its dependencies."""
    try:
        # makes a database connection request to test if the database is reachable using .cursor() bcoz It’s the lightest possible DB operation
        connections["default"].cursor()
        db_status = "ok"
    except OperationalError:
        # If the connection is unsuccessful, an OperationalError( this error occurs when DB is unreachable, network down, invalid credentials) will be raised
        db_status = "error"

    status_code = 200 if db_status == "ok" else 503

    return JsonResponse(
        {
            "status": "ok" if db_status == "ok" else "degraded",
            "database": db_status,
            "service": "urbancart-backend",
        },
        status=status_code,
    )

# TEST: curl http://localhost:8000/health/ | jq
