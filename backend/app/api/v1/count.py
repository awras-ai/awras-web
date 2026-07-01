from fastapi import (
    APIRouter,
    Depends,
    Request,
)
from app.core.limiter import limiter
from app.deps.keycloak import require_auth, require_admin_auth, KeycloakUser
from app.schemas.count import CountResponse

router = APIRouter(prefix="/count", tags=["Count"])


@router.get(
    "/",
    summary="count how many users there are in the platform",
    response_model=CountResponse,
)
@limiter.limit("60/minute")
async def list_datasets(
    request: Request,
    user: KeycloakUser = Depends(require_auth),
) -> CountResponse:

    return user
