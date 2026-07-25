"""
Leaderboard service.

Aggregates contribution counts from dictionary_annotations and
dictionary_reports grouped by keycloak_sub, then enriches each sub
with user info from the Keycloak Admin API.

Designed so adding translation/voice annotation counts later is
just one more query merged into the aggregation step.
"""

import logging
from typing import Any

from sqlalchemy import func
from sqlalchemy.orm import Session as DBSession

from app.models import DictionaryAnnotation, DictionaryReport
from app.services.keycloak import KeycloakService

logger = logging.getLogger(__name__)


class LeaderboardService:
    """Service for building the global user leaderboard."""

    @staticmethod
    def get_leaderboard(
        db: DBSession, limit: int = 50, current_sub: str | None = None
    ) -> list[dict[str, Any]]:
        """
        Build the top contributors leaderboard.

        Counts annotations + reports per user, sorts by total descending,
        and enriches each keycloak_sub with user info from Keycloak.

        Args:
            db: Database session
            limit: Maximum number of entries to return (1-100)
            current_sub: Keycloak sub of the authenticated user (optional).
                         If provided, the matching entry will have is_current_user=True.

        Returns:
            List of dicts with rank, user info, and contribution counts,
            sorted by total_count descending.
        """
        # ------------------------------------------------------------------
        # 1. Aggregate annotation counts per user
        # ------------------------------------------------------------------
        annotation_rows = (
            db.query(
                DictionaryAnnotation.keycloak_sub,
                func.count(DictionaryAnnotation.id).label("annotation_count"),
            )
            .filter(DictionaryAnnotation.keycloak_sub.isnot(None))
            .group_by(DictionaryAnnotation.keycloak_sub)
            .all()
        )

        # ------------------------------------------------------------------
        # 2. Aggregate report counts per user
        # ------------------------------------------------------------------
        report_rows = (
            db.query(
                DictionaryReport.keycloak_sub,
                func.count(DictionaryReport.id).label("report_count"),
            )
            .group_by(DictionaryReport.keycloak_sub)
            .all()
        )

        # ------------------------------------------------------------------
        # 3. Merge counts per sub
        # ------------------------------------------------------------------
        counts: dict[str, dict[str, int]] = {}

        for row in annotation_rows:
            sub = row.keycloak_sub
            counts.setdefault(sub, {"annotation_count": 0, "report_count": 0})
            counts[sub]["annotation_count"] = row.annotation_count

        for row in report_rows:
            sub = row.keycloak_sub
            counts.setdefault(sub, {"annotation_count": 0, "report_count": 0})
            counts[sub]["report_count"] = row.report_count

        # Sort by total descending, then by sub for stability
        ranked = sorted(
            counts.items(),
            key=lambda item: (
                item[1]["annotation_count"] + item[1]["report_count"],
                item[0],
            ),
            reverse=True,
        )[:limit]

        if not ranked:
            return []

        # ------------------------------------------------------------------
        # 4. Enrich with Keycloak user info
        # ------------------------------------------------------------------
        subs = [sub for sub, _ in ranked]
        try:
            user_info_map = KeycloakService.get_users_by_subs(subs)
        except Exception:
            logger.warning("Keycloak enrichment failed, returning raw subs", exc_info=True)
            user_info_map = {
                sub: {"name": "Unknown user", "username": "", "picture": None}
                for sub in subs
            }

        # ------------------------------------------------------------------
        # 5. Build final list with rank
        # ------------------------------------------------------------------
        result = []
        for rank, (sub, cnt) in enumerate(ranked, start=1):
            user_info = user_info_map.get(
                sub,
                {"name": "Unknown user", "username": "", "picture": None},
            )
            total = cnt["annotation_count"] + cnt["report_count"]
            result.append(
                {
                    "rank": rank,
                    "user": user_info,
                    "annotation_count": cnt["annotation_count"],
                    "report_count": cnt["report_count"],
                    "total_count": total,
                    "is_current_user": current_sub is not None and sub == current_sub,
                }
            )

        return result
