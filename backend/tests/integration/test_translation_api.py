"""
Integration tests for Translation API endpoints.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session

from app.models import TranslationAnnotation, TranslationDataset, TranslationEntry, User
from app.services.auth import AuthService


# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def admin_user(db_session: Session) -> User:
    """
    Create an admin user directly in the database.
    This avoids the need to register and upgrade users in tests.
    """
    admin = User(
        email="admin_translation@test.com",
        identifier="admin_translation",
        hashed_password=AuthService.hash_password("adminpassword123"),
        is_superuser=True,
        is_active=True,
        is_verified=True,
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin


# =============================================================================
# Helper Functions
# =============================================================================


async def register_and_login_user(client: AsyncClient, user_data: dict) -> dict:
    """
    Register a user and return cookies from login.
    Helper function for authentication in tests.
    """
    register_response = await client.post("/api/v1/auth/register", json=user_data)
    assert register_response.status_code == 201

    login_response = await client.post(
        "/api/v1/auth/login",
        json={"email": user_data["email"], "password": user_data["password"]},
    )
    assert login_response.status_code == 200

    return login_response.cookies


async def login_admin_user(client: AsyncClient, admin_user: User) -> dict:
    """
    Login an admin user and return cookies.
    """
    login_response = await client.post(
        "/api/v1/auth/login",
        json={"email": admin_user.email, "password": "adminpassword123"},
    )
    assert login_response.status_code == 200
    return login_response.cookies


def create_test_dataset_with_entries(
    db_session: Session, source_lang: str = "en", target_lang: str = "ar"
) -> TranslationDataset:
    """
    Create a test dataset with sample entries.
    """
    dataset = TranslationDataset(
        name=f"Test Dataset {source_lang}->{target_lang}",
        source_language=source_lang,
        target_language=target_lang,
        description="Test dataset for integration tests",
        category="test",
    )
    db_session.add(dataset)
    db_session.flush()

    entries = [
        TranslationEntry(
            dataset_id=dataset.id,
            source_text=f"Hello {i}",
            reference_translation=f"مرحبا {i}",
            status="pending",
        )
        for i in range(5)
    ]
    db_session.add_all(entries)
    db_session.commit()

    return dataset


# =============================================================================
# Dataset Management Tests (Admin Only)
# =============================================================================


@pytest.mark.asyncio
async def test_create_dataset_as_admin(
    client: AsyncClient, admin_user: User, db_session: Session
):
    """Admin can successfully create a translation dataset."""
    cookies = await login_admin_user(client, admin_user)

    dataset_data = {
        "name": "Test Translation Dataset",
        "source_language": "en",
        "target_language": "ar",
        "description": "Test description",
        "category": "general",
    }

    response = await client.post(
        "/api/v1/translation/datasets",
        json=dataset_data,
        cookies=cookies,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Translation Dataset"
    assert data["source_language"] == "en"
    assert data["target_language"] == "ar"
    assert data["description"] == "Test description"
    assert data["category"] == "general"
    assert "id" in data
    assert "created_at" in data


@pytest.mark.asyncio
async def test_create_dataset_as_regular_user_fails(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """Regular user cannot create a dataset (403 Forbidden)."""
    cookies = await register_and_login_user(client, test_user_data)

    dataset_data = {
        "name": "Unauthorized Dataset",
        "source_language": "en",
        "target_language": "ar",
    }

    response = await client.post(
        "/api/v1/translation/datasets",
        json=dataset_data,
        cookies=cookies,
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_create_dataset_without_auth_fails(client: AsyncClient):
    """Unauthenticated request cannot create a dataset (401 Unauthorized)."""
    dataset_data = {
        "name": "Unauthorized Dataset",
        "source_language": "en",
        "target_language": "ar",
    }

    response = await client.post("/api/v1/translation/datasets", json=dataset_data)

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_datasets(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """Authenticated user can list all datasets."""
    cookies = await register_and_login_user(client, test_user_data)

    create_test_dataset_with_entries(db_session)

    response = await client.get(
        "/api/v1/translation/datasets",
        cookies=cookies,
    )

    assert response.status_code == 200
    data = response.json()
    assert "datasets" in data
    assert "total" in data
    assert len(data["datasets"]) >= 1


@pytest.mark.asyncio
async def test_list_datasets_pagination(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """Pagination works correctly for dataset listing."""
    cookies = await register_and_login_user(client, test_user_data)

    create_test_dataset_with_entries(db_session)

    response = await client.get(
        "/api/v1/translation/datasets?skip=0&limit=2",
        cookies=cookies,
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["datasets"]) <= 2


@pytest.mark.asyncio
async def test_get_dataset_by_id(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """User can retrieve a specific dataset by ID."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    response = await client.get(
        f"/api/v1/translation/datasets/{dataset.id}",
        cookies=cookies,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(dataset.id)
    assert data["name"] == dataset.name


@pytest.mark.asyncio
async def test_get_nonexistent_dataset(client: AsyncClient, test_user_data: dict):
    """Returns 404 for non-existent dataset."""
    cookies = await register_and_login_user(client, test_user_data)

    response = await client.get(
        "/api/v1/translation/datasets/00000000-0000-0000-0000-000000000000",
        cookies=cookies,
    )

    assert response.status_code == 404


# =============================================================================
# CSV Upload Tests (Admin Only)
# =============================================================================


@pytest.mark.asyncio
async def test_upload_csv_as_admin(
    client: AsyncClient, admin_user: User, db_session: Session
):
    """Admin can upload a valid CSV file."""
    cookies = await login_admin_user(client, admin_user)
    dataset = create_test_dataset_with_entries(db_session)

    csv_content = (
        "source_text,reference_translation\nHello,مرحبا\nGoodbye,وداعا".encode("utf-8")
    )

    response = await client.post(
        f"/api/v1/translation/datasets/{dataset.id}/upload",
        files={"file": ("test.csv", csv_content, "text/csv")},
        cookies=cookies,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["success_count"] == 2
    assert data["failed_count"] == 0
    assert "message" in data


@pytest.mark.asyncio
async def test_upload_csv_as_regular_user_fails(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """Regular user cannot upload CSV (403 Forbidden)."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    csv_content = "source_text,reference_translation\nHello,مرحبا".encode("utf-8")

    response = await client.post(
        f"/api/v1/translation/datasets/{dataset.id}/upload",
        files={"file": ("test.csv", csv_content, "text/csv")},
        cookies=cookies,
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_upload_invalid_csv_format(
    client: AsyncClient, admin_user: User, db_session: Session
):
    """Returns 400 for CSV missing required columns."""
    cookies = await login_admin_user(client, admin_user)
    dataset = create_test_dataset_with_entries(db_session)

    csv_content = "wrong_column,another_column\nHello,World".encode("utf-8")

    response = await client.post(
        f"/api/v1/translation/datasets/{dataset.id}/upload",
        files={"file": ("test.csv", csv_content, "text/csv")},
        cookies=cookies,
    )

    assert response.status_code == 400
    data = response.json()
    assert "source_text" in data["detail"] or "reference_translation" in data["detail"]


@pytest.mark.asyncio
async def test_upload_csv_to_nonexistent_dataset(client: AsyncClient, admin_user: User):
    """Returns 400 for uploading to non-existent dataset."""
    cookies = await login_admin_user(client, admin_user)

    csv_content = "source_text,reference_translation\nHello,مرحبا".encode("utf-8")

    response = await client.post(
        "/api/v1/translation/datasets/00000000-0000-0000-0000-000000000000/upload",
        files={"file": ("test.csv", csv_content, "text/csv")},
        cookies=cookies,
    )

    assert response.status_code == 400


@pytest.mark.asyncio
async def test_upload_non_csv_file(
    client: AsyncClient, admin_user: User, db_session: Session
):
    """Returns 400 for non-CSV file upload."""
    cookies = await login_admin_user(client, admin_user)
    dataset = create_test_dataset_with_entries(db_session)

    text_content = b"This is not a CSV file"

    response = await client.post(
        f"/api/v1/translation/datasets/{dataset.id}/upload",
        files={"file": ("test.txt", text_content, "text/plain")},
        cookies=cookies,
    )

    assert response.status_code == 400


# =============================================================================
# Annotation Workflow Tests (All Authenticated Users)
# =============================================================================


@pytest.mark.asyncio
async def test_get_next_entry(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """User can get a random pending entry for annotation."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    response = await client.get(
        f"/api/v1/translation/entries/next?dataset_id={dataset.id}",
        cookies=cookies,
    )

    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "source_text" in data
    assert "reference_translation" in data
    assert data["status"] == "pending"
    assert data["dataset_id"] == str(dataset.id)


@pytest.mark.asyncio
async def test_get_next_entry_no_pending(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """Returns 404 when no pending entries available for user."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    # Mark all entries as completed
    for entry in dataset.entries:
        entry.status = "completed"
    db_session.commit()

    response = await client.get(
        f"/api/v1/translation/entries/next?dataset_id={dataset.id}",
        cookies=cookies,
    )

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_submit_annotation_validate(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """User can validate (agree with reference translation)."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    entry = (
        db_session.query(TranslationEntry)
        .filter(
            TranslationEntry.dataset_id == dataset.id,
            TranslationEntry.status == "pending",
        )
        .first()
    )

    annotation_data = {
        "corrected_translation": entry.reference_translation,
        "notes": "Approved - looks good",
    }

    response = await client.post(
        f"/api/v1/translation/entries/{entry.id}/annotate",
        json=annotation_data,
        cookies=cookies,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["corrected_translation"] == entry.reference_translation
    assert data["notes"] == "Approved - looks good"
    assert "id" in data
    assert "user_id" in data

    db_session.refresh(entry)
    assert entry.status == "completed"


@pytest.mark.asyncio
async def test_submit_annotation_correct(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """User can submit a corrected translation."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    entry = (
        db_session.query(TranslationEntry)
        .filter(
            TranslationEntry.dataset_id == dataset.id,
            TranslationEntry.status == "pending",
        )
        .first()
    )

    corrected = entry.reference_translation + " - corrected"
    annotation_data = {
        "corrected_translation": corrected,
        "notes": "Added clarification",
    }

    response = await client.post(
        f"/api/v1/translation/entries/{entry.id}/annotate",
        json=annotation_data,
        cookies=cookies,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["corrected_translation"] == corrected


@pytest.mark.asyncio
async def test_submit_annotation_without_auth(client: AsyncClient, db_session: Session):
    """Unauthenticated request gets 401."""
    dataset = create_test_dataset_with_entries(db_session)
    entry = (
        db_session.query(TranslationEntry)
        .filter(TranslationEntry.dataset_id == dataset.id)
        .first()
    )

    annotation_data = {
        "corrected_translation": "Test translation",
    }

    response = await client.post(
        f"/api/v1/translation/entries/{entry.id}/annotate",
        json=annotation_data,
    )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_submit_annotation_twice_fails(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """User cannot annotate the same entry twice."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    entry = (
        db_session.query(TranslationEntry)
        .filter(
            TranslationEntry.dataset_id == dataset.id,
            TranslationEntry.status == "pending",
        )
        .first()
    )

    annotation_data = {
        "corrected_translation": entry.reference_translation,
    }

    response1 = await client.post(
        f"/api/v1/translation/entries/{entry.id}/annotate",
        json=annotation_data,
        cookies=cookies,
    )
    assert response1.status_code == 201

    response2 = await client.post(
        f"/api/v1/translation/entries/{entry.id}/annotate",
        json=annotation_data,
        cookies=cookies,
    )
    assert response2.status_code == 400
    assert "already annotated" in response2.json()["detail"]


@pytest.mark.asyncio
async def test_submit_annotation_empty_translation(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """Returns 422 for empty corrected_translation."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    entry = (
        db_session.query(TranslationEntry)
        .filter(
            TranslationEntry.dataset_id == dataset.id,
            TranslationEntry.status == "pending",
        )
        .first()
    )

    annotation_data = {
        "corrected_translation": "",
    }

    response = await client.post(
        f"/api/v1/translation/entries/{entry.id}/annotate",
        json=annotation_data,
        cookies=cookies,
    )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_submit_annotation_nonexistent_entry(
    client: AsyncClient, test_user_data: dict
):
    """Returns 404 for annotating non-existent entry."""
    cookies = await register_and_login_user(client, test_user_data)

    annotation_data = {
        "corrected_translation": "Test translation",
    }

    response = await client.post(
        "/api/v1/translation/entries/00000000-0000-0000-0000-000000000000/annotate",
        json=annotation_data,
        cookies=cookies,
    )

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_entry_by_id(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """User can retrieve a specific entry by ID."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    entry = (
        db_session.query(TranslationEntry)
        .filter(TranslationEntry.dataset_id == dataset.id)
        .first()
    )

    response = await client.get(
        f"/api/v1/translation/entries/{entry.id}",
        cookies=cookies,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(entry.id)
    assert data["source_text"] == entry.source_text


@pytest.mark.asyncio
async def test_get_entry_with_annotation(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """Entry includes user's annotation if it exists."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    user = db_session.query(User).filter(User.email == test_user_data["email"]).first()
    entry = (
        db_session.query(TranslationEntry)
        .filter(
            TranslationEntry.dataset_id == dataset.id,
            TranslationEntry.status == "pending",
        )
        .first()
    )

    annotation = TranslationAnnotation(
        entry_id=entry.id,
        user_id=user.id,
        corrected_translation="Test correction",
        notes="Test notes",
    )
    db_session.add(annotation)
    entry.status = "completed"
    db_session.commit()

    response = await client.get(
        f"/api/v1/translation/entries/{entry.id}",
        cookies=cookies,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["annotation"] is not None
    assert data["annotation"]["corrected_translation"] == "Test correction"


@pytest.mark.asyncio
async def test_get_nonexistent_entry(client: AsyncClient, test_user_data: dict):
    """Returns 404 for non-existent entry."""
    cookies = await register_and_login_user(client, test_user_data)

    response = await client.get(
        "/api/v1/translation/entries/00000000-0000-0000-0000-000000000000",
        cookies=cookies,
    )

    assert response.status_code == 404


# =============================================================================
# Statistics Tests
# =============================================================================


@pytest.mark.asyncio
async def test_get_dataset_stats(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """Returns overall statistics for dataset."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    response = await client.get(
        f"/api/v1/translation/datasets/{dataset.id}/stats",
        cookies=cookies,
    )

    assert response.status_code == 200
    data = response.json()

    assert "dataset" in data
    assert "overall_stats" in data
    assert "user_stats" in data

    assert data["overall_stats"]["total_entries"] == 5
    assert data["overall_stats"]["pending_count"] == 5
    assert data["overall_stats"]["completed_count"] == 0
    assert data["overall_stats"]["completion_percentage"] == 0.0


@pytest.mark.asyncio
async def test_get_dataset_stats_includes_user_stats(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """Statistics include user-specific progress."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    entry = (
        db_session.query(TranslationEntry)
        .filter(
            TranslationEntry.dataset_id == dataset.id,
            TranslationEntry.status == "pending",
        )
        .first()
    )

    user = db_session.query(User).filter(User.email == test_user_data["email"]).first()

    annotation = TranslationAnnotation(
        entry_id=entry.id,
        user_id=user.id,
        corrected_translation="Test",
    )
    db_session.add(annotation)
    entry.status = "completed"
    db_session.commit()

    response = await client.get(
        f"/api/v1/translation/datasets/{dataset.id}/stats",
        cookies=cookies,
    )

    assert response.status_code == 200
    data = response.json()

    assert data["overall_stats"]["completed_count"] == 1
    assert data["user_stats"]["annotated_by_user"] == 1
    assert data["user_stats"]["remaining_for_user"] == 4
    assert data["user_stats"]["user_completion_percentage"] == 20.0


@pytest.mark.asyncio
async def test_stats_for_empty_dataset(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """Handles dataset with no entries correctly."""
    cookies = await register_and_login_user(client, test_user_data)

    empty_dataset = TranslationDataset(
        name="Empty Dataset",
        source_language="en",
        target_language="ar",
    )
    db_session.add(empty_dataset)
    db_session.commit()

    response = await client.get(
        f"/api/v1/translation/datasets/{empty_dataset.id}/stats",
        cookies=cookies,
    )

    assert response.status_code == 200
    data = response.json()

    assert data["overall_stats"]["total_entries"] == 0
    assert data["overall_stats"]["completion_percentage"] == 0.0
    assert data["user_stats"]["annotated_by_user"] == 0


# =============================================================================
# Edge Cases
# =============================================================================


@pytest.mark.asyncio
async def test_csv_upload_with_empty_rows(
    client: AsyncClient, admin_user: User, db_session: Session
):
    """CSV upload handles empty rows correctly."""
    cookies = await login_admin_user(client, admin_user)
    dataset = create_test_dataset_with_entries(db_session)

    csv_content = (
        "source_text,reference_translation\nHello,مرحبا\n,\nGoodbye,وداعا".encode(
            "utf-8"
        )
    )

    response = await client.post(
        f"/api/v1/translation/datasets/{dataset.id}/upload",
        files={"file": ("test.csv", csv_content, "text/csv")},
        cookies=cookies,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["failed_count"] == 1
    assert len(data["errors"]) == 1


@pytest.mark.asyncio
async def test_annotation_without_notes(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """User can submit annotation without optional notes."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    entry = (
        db_session.query(TranslationEntry)
        .filter(
            TranslationEntry.dataset_id == dataset.id,
            TranslationEntry.status == "pending",
        )
        .first()
    )

    annotation_data = {
        "corrected_translation": entry.reference_translation,
    }

    response = await client.post(
        f"/api/v1/translation/entries/{entry.id}/annotate",
        json=annotation_data,
        cookies=cookies,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["notes"] is None
