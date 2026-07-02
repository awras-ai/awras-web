from fastapi import (
    APIRouter,
    Depends,
    Request,
)
from app.core.limiter import limiter
from app.deps.keycloak import require_auth, KeycloakUser

router = APIRouter(prefix="/me", tags=["User"])


@router.get(
    "",
    summary="return the user object",
)
@limiter.limit("60/minute")
async def list_datasets(
    request: Request,
    user: KeycloakUser = Depends(require_auth),
):

    return user
