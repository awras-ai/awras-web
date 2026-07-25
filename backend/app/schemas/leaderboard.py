"""
Pydantic schemas for Leaderboard API.
"""

from pydantic import BaseModel, Field


class LeaderboardUser(BaseModel):
    """User info from Keycloak for the leaderboard."""

    name: str = Field(..., description="User's display name")
    username: str = Field(..., description="Keycloak username")
    picture: str | None = Field(
        None, description="Profile picture URL (from Keycloak attributes)"
    )


class LeaderboardEntry(BaseModel):
    """Single entry in the leaderboard."""

    rank: int = Field(..., description="Leaderboard position (1-indexed)")
    user: LeaderboardUser = Field(..., description="User information")
    annotation_count: int = Field(
        ..., description="Number of dictionary annotations submitted"
    )
    report_count: int = Field(
        ..., description="Number of dictionary reports submitted"
    )
    total_count: int = Field(..., description="Total contributions (annotations + reports)")
    is_current_user: bool = Field(
        ..., description="Whether this entry belongs to the authenticated user"
    )



