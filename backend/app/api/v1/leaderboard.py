"""
Leaderboard API endpoint.

Shows users ranked by their contribution counts.
Counts dictionary annotations, translation annotations, and reports;
voice annotations will be added later.
"""

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.core.limiter import limiter
from app.db.database import get_db
from app.deps.keycloak import get_current_user, KeycloakUser
from app.schemas.leaderboard import LeaderboardEntry
from app.services.leaderboard import LeaderboardService

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


@router.get(
    "",
    response_model=list[LeaderboardEntry],
    summary="Get the global contribution leaderboard",
)
@limiter.limit("30/minute")
async def get_leaderboard(
    request: Request,
    limit: int = Query(
        50, ge=1, le=100, description="Maximum number of leaderboard entries to return"
    ),
    db: Session = Depends(get_db),
    user: KeycloakUser | None = Depends(get_current_user),
) -> list[LeaderboardEntry]:
    """
    Get the global contribution leaderboard.

    **Authentication is optional.**

    Users are ranked by their total number of contributions, which includes:
    - **Dictionary annotations**: entries confirmed or corrected by the user
    - **Translation annotations**: entries validated or corrected by the user
    - **Dictionary reports**: entries flagged as problematic by the user

    If the request is authenticated, the current user's entry will have
    `is_current_user` set to `true` so the frontend can highlight it.

    Args:
    - **limit**: Maximum number of entries (1-100, default 50)

    Returns:
    - Ranked list of contributors with user info and counts

    Status codes:
    - 200: Leaderboard returned successfully
    """
    return LeaderboardService.get_leaderboard(
        db, limit=limit, current_sub=user.sub if user else None
    )
