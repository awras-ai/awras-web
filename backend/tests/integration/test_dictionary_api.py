"""
Integration tests for Dictionary API endpoints.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.orm import Session

from app.models import (
    DictionaryAnnotation,
    DictionaryDataset,
    DictionaryEntry,
    User,
)
from app.services.auth import AuthService


# =============================================================================
# Fixtures
# =============================================================================


@pytest.fixture
def admin_user(db_session: Session) -> User:
    """
    Create an admin user directly in the database.
    """
    admin = User(
        email="admin_dictionary@test.com",
        identifier="admin_dictionary",
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


def create_test_dataset(db_session: Session, language: str = "ar") -> DictionaryDataset:
    """
    Create a test dataset with sample entries.
    """
    dataset = DictionaryDataset(
        name=f"Test Dictionary Dataset ({language})",
        language=language,
        description="Test dictionary for integration tests",
        category="test",
    )
    db_session.add(dataset)
    db_session.commit()
    db_session.refresh(dataset)
    return dataset


def create_test_dataset_with_entries(
    db_session: Session, language: str = "ar"
) -> DictionaryDataset:
    """
    Create a test dataset with sample entries.
    """
    dataset = DictionaryDataset(
        name=f"Test Dictionary Dataset ({language})",
        language=language,
        description="Test dictionary for integration tests",
        category="test",
    )
    db_session.add(dataset)
    db_session.flush()

    entries = [
        DictionaryEntry(
            dataset_id=dataset.id,
            word=f"كتاب{i}",
            meaning=f"book {i}",
            examples=f"This is book number {i}." if i % 2 == 0 else None,
            tags=["noun", "common"] if i % 2 == 0 else ["noun"],
            status="pending",
            is_user_submitted=False,
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
    """Admin can successfully create a dictionary dataset."""
    cookies = await login_admin_user(client, admin_user)

    dataset_data = {
        "name": "Arabic Dictionary",
        "language": "ar",
        "description": "Arabic to Arabic dictionary",
        "category": "general",
    }

    response = await client.post(
        "/api/v1/dictionary/datasets",
        json=dataset_data,
        cookies=cookies,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Arabic Dictionary"
    assert data["language"] == "ar"
    assert data["description"] == "Arabic to Arabic dictionary"
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
        "language": "ar",
    }

    response = await client.post(
        "/api/v1/dictionary/datasets",
        json=dataset_data,
        cookies=cookies,
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_create_dataset_without_auth_fails(client: AsyncClient):
    """Unauthenticated request cannot create a dataset (401 Unauthorized)."""
    dataset_data = {
        "name": "Unauthorized Dataset",
        "language": "ar",
    }

    response = await client.post("/api/v1/dictionary/datasets", json=dataset_data)

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_datasets(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """Authenticated user can list all datasets."""
    cookies = await register_and_login_user(client, test_user_data)

    create_test_dataset_with_entries(db_session)

    response = await client.get(
        "/api/v1/dictionary/datasets",
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
        "/api/v1/dictionary/datasets?skip=0&limit=2",
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
        f"/api/v1/dictionary/datasets/{dataset.id}",
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
        "/api/v1/dictionary/datasets/00000000-0000-0000-0000-000000000000",
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
        "word,meaning,examples,tags\n"
        "قلم,pen,A writing instrument.,stationery,noun\n"
        "ماء,water,Essential for life.,liquid,noun\n".encode("utf-8")
    )

    response = await client.post(
        f"/api/v1/dictionary/datasets/{dataset.id}/upload",
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

    csv_content = "word,meaning\قلم,pen".encode("utf-8")

    response = await client.post(
        f"/api/v1/dictionary/datasets/{dataset.id}/upload",
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
        f"/api/v1/dictionary/datasets/{dataset.id}/upload",
        files={"file": ("test.csv", csv_content, "text/csv")},
        cookies=cookies,
    )

    assert response.status_code == 400
    data = response.json()
    assert "word" in data["detail"] or "meaning" in data["detail"]


@pytest.mark.asyncio
async def test_upload_csv_to_nonexistent_dataset(client: AsyncClient, admin_user: User):
    """Returns 400 for uploading to non-existent dataset."""
    cookies = await login_admin_user(client, admin_user)

    csv_content = "word,meaning\nقلم,pen".encode("utf-8")

    response = await client.post(
        "/api/v1/dictionary/datasets/00000000-0000-0000-0000-000000000000/upload",
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
        f"/api/v1/dictionary/datasets/{dataset.id}/upload",
        files={"file": ("test.txt", text_content, "text/plain")},
        cookies=cookies,
    )

    assert response.status_code == 400


# =============================================================================
# Entry Creation Tests
# =============================================================================


@pytest.mark.asyncio
async def test_create_entry_as_regular_user(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """Regular user can create a dictionary entry."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset(db_session)

    entry_data = {
        "dataset_id": str(dataset.id),
        "word": "شمس",
        "meaning": "sun",
        "examples": "The sun is bright.",
        "tags": ["noun", "nature"],
    }

    response = await client.post(
        "/api/v1/dictionary/entries",
        json=entry_data,
        cookies=cookies,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["word"] == "شمس"
    assert data["meaning"] == "sun"
    assert data["examples"] == "The sun is bright."
    assert data["tags"] == ["noun", "nature"]
    assert data["is_user_submitted"] is True
    assert data["status"] == "pending"
    assert data["dataset_id"] == str(dataset.id)


@pytest.mark.asyncio
async def test_create_entry_as_admin(
    client: AsyncClient, admin_user: User, db_session: Session
):
    """Admin can create a dictionary entry."""
    cookies = await login_admin_user(client, admin_user)
    dataset = create_test_dataset(db_session)

    entry_data = {
        "dataset_id": str(dataset.id),
        "word": "قمر",
        "meaning": "moon",
    }

    response = await client.post(
        "/api/v1/dictionary/entries",
        json=entry_data,
        cookies=cookies,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["word"] == "قمر"
    assert data["meaning"] == "moon"
    assert data["is_user_submitted"] is False
    assert data["status"] == "pending"


@pytest.mark.asyncio
async def test_create_entry_without_auth_fails(client: AsyncClient):
    """Unauthenticated request cannot create an entry (401 Unauthorized)."""
    entry_data = {
        "dataset_id": "00000000-0000-0000-0000-000000000000",
        "word": "test",
        "meaning": "test meaning",
    }

    response = await client.post("/api/v1/dictionary/entries", json=entry_data)

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_entry_nonexistent_dataset(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """Returns 404 for non-existent dataset."""
    cookies = await register_and_login_user(client, test_user_data)

    entry_data = {
        "dataset_id": "00000000-0000-0000-0000-000000000000",
        "word": "test",
        "meaning": "test meaning",
    }

    response = await client.post(
        "/api/v1/dictionary/entries",
        json=entry_data,
        cookies=cookies,
    )

    assert response.status_code == 404


# =============================================================================
# Search Tests
# =============================================================================


@pytest.mark.asyncio
async def test_search_entries_by_word(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """User can search entries by word."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    response = await client.get(
        f"/api/v1/dictionary/entries/search?q=كتاب0",
        cookies=cookies,
    )

    assert response.status_code == 200
    data = response.json()
    assert "entries" in data
    assert "total" in data
    assert "query" in data
    assert data["query"] == "كتاب0"
    assert len(data["entries"]) >= 1
    assert data["entries"][0]["word"] == "كتاب0"


@pytest.mark.asyncio
async def test_search_entries_by_meaning(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """User can search entries by meaning."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    response = await client.get(
        "/api/v1/dictionary/entries/search?q=book 1",
        cookies=cookies,
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["entries"]) >= 1
    assert "book 1" in data["entries"][0]["meaning"]


@pytest.mark.asyncio
async def test_search_entries_with_dataset_filter(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """Search can be filtered by dataset_id."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset1 = create_test_dataset_with_entries(db_session, language="ar")
    dataset2 = create_test_dataset(db_session, language="en")

    entry = DictionaryEntry(
        dataset_id=dataset2.id,
        word="apple",
        meaning="a fruit",
        status="pending",
        is_user_submitted=False,
    )
    db_session.add(entry)
    db_session.commit()

    response = await client.get(
        f"/api/v1/dictionary/entries/search?q=book&dataset_id={dataset2.id}",
        cookies=cookies,
    )

    assert response.status_code == 200
    data = response.json()
    for entry in data["entries"]:
        assert entry["dataset_id"] == str(dataset2.id)


@pytest.mark.asyncio
async def test_search_entries_pagination(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """Search supports pagination."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    response = await client.get(
        "/api/v1/dictionary/entries/search?q=book&skip=0&limit=2",
        cookies=cookies,
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["entries"]) <= 2


@pytest.mark.asyncio
async def test_search_entries_no_results(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """Search returns empty list when no matches found."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    response = await client.get(
        "/api/v1/dictionary/entries/search?q=nonexistentword12345",
        cookies=cookies,
    )

    assert response.status_code == 200
    data = response.json()
    assert len(data["entries"]) == 0
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_search_entries_without_auth_fails(client: AsyncClient):
    """Unauthenticated search returns 401."""
    response = await client.get("/api/v1/dictionary/entries/search?q=test")

    assert response.status_code == 401


# =============================================================================
# User Dashboard Tests (Submissions + Annotations)
# =============================================================================


@pytest.mark.asyncio
async def test_get_user_entries_shows_submissions_and_annotations(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """GET /entries/user returns both user's submissions and annotations."""
    cookies = await register_and_login_user(client, test_user_data)
    user = db_session.query(User).filter(User.email == test_user_data["email"]).first()

    dataset = create_test_dataset_with_entries(db_session)

    submitted_entry = DictionaryEntry(
        dataset_id=dataset.id,
        word="submitted_word",
        meaning="a word I submitted",
        status="pending",
        is_user_submitted=True,
        created_by_id=user.id,
    )
    db_session.add(submitted_entry)
    db_session.commit()
    db_session.refresh(submitted_entry)

    admin_dataset = DictionaryDataset(
        name="Admin Dataset",
        language="ar",
        description="Admin dataset",
        category="test",
    )
    db_session.add(admin_dataset)
    db_session.flush()

    admin_entry = DictionaryEntry(
        dataset_id=admin_dataset.id,
        word="admin_word",
        meaning="an admin entry",
        status="pending",
        is_user_submitted=False,
    )
    db_session.add(admin_entry)
    db_session.commit()
    db_session.refresh(admin_entry)

    annotation = DictionaryAnnotation(
        entry_id=admin_entry.id,
        user_id=user.id,
        corrected_meaning="corrected meaning",
    )
    db_session.add(annotation)
    admin_entry.status = "completed"
    db_session.commit()

    response = await client.get(
        "/api/v1/dictionary/entries/user",
        cookies=cookies,
    )

    assert response.status_code == 200
    data = response.json()

    assert "submitted_entries" in data
    assert "annotated_entries" in data
    assert isinstance(data["submitted_entries"], list)
    assert isinstance(data["annotated_entries"], list)

    submitted_ids = [e["id"] for e in data["submitted_entries"]]
    assert str(submitted_entry.id) in submitted_ids

    annotated_ids = [e["id"] for e in data["annotated_entries"]]
    assert str(admin_entry.id) in annotated_ids


@pytest.mark.asyncio
async def test_get_user_entries_empty(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """Returns empty lists when user has no submissions or annotations."""
    cookies = await register_and_login_user(client, test_user_data)

    response = await client.get(
        "/api/v1/dictionary/entries/user",
        cookies=cookies,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["submitted_entries"] == []
    assert data["annotated_entries"] == []


@pytest.mark.asyncio
async def test_get_user_entries_without_auth_fails(client: AsyncClient):
    """Unauthenticated request returns 401."""
    response = await client.get("/api/v1/dictionary/entries/user")

    assert response.status_code == 401


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
        f"/api/v1/dictionary/entries/next?dataset_id={dataset.id}",
        cookies=cookies,
    )

    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "word" in data
    assert "meaning" in data
    assert data["status"] == "pending"
    assert data["dataset_id"] == str(dataset.id)


@pytest.mark.asyncio
async def test_get_next_entry_no_pending(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """Returns 404 when no pending entries available for user."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    for entry in dataset.entries:
        entry.status = "completed"
    db_session.commit()

    response = await client.get(
        f"/api/v1/dictionary/entries/next?dataset_id={dataset.id}",
        cookies=cookies,
    )

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_submit_annotation_corrected_meaning(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """User can submit annotation with corrected meaning."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    entry = (
        db_session.query(DictionaryEntry)
        .filter(
            DictionaryEntry.dataset_id == dataset.id,
            DictionaryEntry.status == "pending",
        )
        .first()
    )

    annotation_data = {
        "corrected_meaning": entry.meaning + " - corrected",
        "notes": "Added clarification",
    }

    response = await client.post(
        f"/api/v1/dictionary/entries/{entry.id}/annotate",
        json=annotation_data,
        cookies=cookies,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["corrected_meaning"] == entry.meaning + " - corrected"
    assert data["notes"] == "Added clarification"
    assert "id" in data
    assert "user_id" in data

    db_session.refresh(entry)
    assert entry.status == "completed"


@pytest.mark.asyncio
async def test_submit_annotation_corrected_examples(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """User can submit annotation with corrected examples."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    entry = (
        db_session.query(DictionaryEntry)
        .filter(
            DictionaryEntry.dataset_id == dataset.id,
            DictionaryEntry.status == "pending",
        )
        .first()
    )

    annotation_data = {
        "corrected_examples": "New examples for this word.",
    }

    response = await client.post(
        f"/api/v1/dictionary/entries/{entry.id}/annotate",
        json=annotation_data,
        cookies=cookies,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["corrected_examples"] == "New examples for this word."


@pytest.mark.asyncio
async def test_submit_annotation_corrected_tags(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """User can submit annotation with corrected tags."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    entry = (
        db_session.query(DictionaryEntry)
        .filter(
            DictionaryEntry.dataset_id == dataset.id,
            DictionaryEntry.status == "pending",
        )
        .first()
    )

    annotation_data = {
        "corrected_tags": ["verb", "action"],
    }

    response = await client.post(
        f"/api/v1/dictionary/entries/{entry.id}/annotate",
        json=annotation_data,
        cookies=cookies,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["corrected_tags"] == ["verb", "action"]


@pytest.mark.asyncio
async def test_submit_annotation_without_auth(client: AsyncClient, db_session: Session):
    """Unauthenticated annotation request gets 401."""
    dataset = create_test_dataset_with_entries(db_session)
    entry = (
        db_session.query(DictionaryEntry)
        .filter(DictionaryEntry.dataset_id == dataset.id)
        .first()
    )

    annotation_data = {
        "corrected_meaning": "Test meaning",
    }

    response = await client.post(
        f"/api/v1/dictionary/entries/{entry.id}/annotate",
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
        db_session.query(DictionaryEntry)
        .filter(
            DictionaryEntry.dataset_id == dataset.id,
            DictionaryEntry.status == "pending",
        )
        .first()
    )

    annotation_data = {
        "corrected_meaning": entry.meaning,
    }

    response1 = await client.post(
        f"/api/v1/dictionary/entries/{entry.id}/annotate",
        json=annotation_data,
        cookies=cookies,
    )
    assert response1.status_code == 201

    response2 = await client.post(
        f"/api/v1/dictionary/entries/{entry.id}/annotate",
        json=annotation_data,
        cookies=cookies,
    )
    assert response2.status_code == 400
    assert "already annotated" in response2.json()["detail"]


@pytest.mark.asyncio
async def test_submit_annotation_no_corrections(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """Returns 400 when no correction fields are provided."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    entry = (
        db_session.query(DictionaryEntry)
        .filter(
            DictionaryEntry.dataset_id == dataset.id,
            DictionaryEntry.status == "pending",
        )
        .first()
    )

    annotation_data = {
        "notes": "Only notes, no corrections",
    }

    response = await client.post(
        f"/api/v1/dictionary/entries/{entry.id}/annotate",
        json=annotation_data,
        cookies=cookies,
    )

    assert response.status_code == 400
    assert "correction" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_submit_annotation_nonexistent_entry(
    client: AsyncClient, test_user_data: dict
):
    """Returns 404 for annotating non-existent entry."""
    cookies = await register_and_login_user(client, test_user_data)

    annotation_data = {
        "corrected_meaning": "Test meaning",
    }

    response = await client.post(
        "/api/v1/dictionary/entries/00000000-0000-0000-0000-000000000000/annotate",
        json=annotation_data,
        cookies=cookies,
    )

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_submit_annotation_own_entry_fails(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """User cannot annotate their own submitted entry."""
    cookies = await register_and_login_user(client, test_user_data)
    user = db_session.query(User).filter(User.email == test_user_data["email"]).first()
    dataset = create_test_dataset(db_session)

    submitted_entry = DictionaryEntry(
        dataset_id=dataset.id,
        word="my_word",
        meaning="my meaning",
        status="pending",
        is_user_submitted=True,
        created_by_id=user.id,
    )
    db_session.add(submitted_entry)
    db_session.commit()
    db_session.refresh(submitted_entry)

    annotation_data = {
        "corrected_meaning": "Trying to correct my own entry",
    }

    response = await client.post(
        f"/api/v1/dictionary/entries/{submitted_entry.id}/annotate",
        json=annotation_data,
        cookies=cookies,
    )

    assert response.status_code == 400
    assert "own entry" in response.json()["detail"].lower()


@pytest.mark.asyncio
async def test_get_entry_by_id(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """User can retrieve a specific entry by ID."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    entry = (
        db_session.query(DictionaryEntry)
        .filter(DictionaryEntry.dataset_id == dataset.id)
        .first()
    )

    response = await client.get(
        f"/api/v1/dictionary/entries/{entry.id}",
        cookies=cookies,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(entry.id)
    assert data["word"] == entry.word


@pytest.mark.asyncio
async def test_get_entry_with_annotation(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """Entry includes user's annotation if it exists."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    user = db_session.query(User).filter(User.email == test_user_data["email"]).first()
    entry = (
        db_session.query(DictionaryEntry)
        .filter(
            DictionaryEntry.dataset_id == dataset.id,
            DictionaryEntry.status == "pending",
        )
        .first()
    )

    annotation = DictionaryAnnotation(
        entry_id=entry.id,
        user_id=user.id,
        corrected_meaning="Corrected meaning",
        notes="Test notes",
    )
    db_session.add(annotation)
    entry.status = "completed"
    db_session.commit()

    response = await client.get(
        f"/api/v1/dictionary/entries/{entry.id}",
        cookies=cookies,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["annotation"] is not None
    assert data["annotation"]["corrected_meaning"] == "Corrected meaning"


@pytest.mark.asyncio
async def test_get_nonexistent_entry(client: AsyncClient, test_user_data: dict):
    """Returns 404 for non-existent entry."""
    cookies = await register_and_login_user(client, test_user_data)

    response = await client.get(
        "/api/v1/dictionary/entries/00000000-0000-0000-0000-000000000000",
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
        f"/api/v1/dictionary/datasets/{dataset.id}/stats",
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

    user = db_session.query(User).filter(User.email == test_user_data["email"]).first()

    entry = (
        db_session.query(DictionaryEntry)
        .filter(
            DictionaryEntry.dataset_id == dataset.id,
            DictionaryEntry.status == "pending",
        )
        .first()
    )

    annotation = DictionaryAnnotation(
        entry_id=entry.id,
        user_id=user.id,
        corrected_meaning="Corrected",
    )
    db_session.add(annotation)
    entry.status = "completed"
    db_session.commit()

    response = await client.get(
        f"/api/v1/dictionary/datasets/{dataset.id}/stats",
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

    empty_dataset = DictionaryDataset(
        name="Empty Dictionary",
        language="ar",
    )
    db_session.add(empty_dataset)
    db_session.commit()

    response = await client.get(
        f"/api/v1/dictionary/datasets/{empty_dataset.id}/stats",
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
        "word,meaning,examples,tags\n"
        "قلم,pen,A writing instrument.,stationery\n"
        ",empty word,\n"
        "ماء,water,Essential for life.,liquid".encode("utf-8")
    )

    response = await client.post(
        f"/api/v1/dictionary/datasets/{dataset.id}/upload",
        files={"file": ("test.csv", csv_content, "text/csv")},
        cookies=cookies,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["failed_count"] >= 1
    assert len(data["errors"]) >= 1


@pytest.mark.asyncio
async def test_annotation_without_notes(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """User can submit annotation without optional notes."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    entry = (
        db_session.query(DictionaryEntry)
        .filter(
            DictionaryEntry.dataset_id == dataset.id,
            DictionaryEntry.status == "pending",
        )
        .first()
    )

    annotation_data = {
        "corrected_meaning": entry.meaning,
    }

    response = await client.post(
        f"/api/v1/dictionary/entries/{entry.id}/annotate",
        json=annotation_data,
        cookies=cookies,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["notes"] is None


@pytest.mark.asyncio
async def test_search_single_character(
    client: AsyncClient, test_user_data: dict, db_session: Session
):
    """Search works with single character queries (no minimum length)."""
    cookies = await register_and_login_user(client, test_user_data)
    dataset = create_test_dataset_with_entries(db_session)

    response = await client.get(
        "/api/v1/dictionary/entries/search?q=ك",
        cookies=cookies,
    )

    assert response.status_code == 200
    data = response.json()
    assert "entries" in data
    assert "total" in data
