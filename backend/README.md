# AWRAS Backend API

A modular FastAPI backend for managing email subscriptions and waitlist.

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── api/
│   │   └── v1/              # API version 1
│   │       ├── __init__.py
│   │       └── email_subscription.py
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py        # Application configuration
│   ├── db/
│   │   ├── __init__.py
│   │   └── database.py      # Database connection and session
│   ├── models/
│   │   ├── __init__.py
│   │   └── email_subscription.py  # SQLAlchemy models
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── email_subscription.py  # Pydantic schemas
│   └── services/
│       ├── __init__.py
│       └── email_subscription.py  # Business logic
├── .env.example             # Environment variables example
├── .gitignore
├── requirements.txt
└── README.md
```

## Features

- **Modular Architecture**: Separated concerns (API, models, schemas, services, core)
- **Email Subscription Management**: Create, read, and soft-delete email subscriptions
- **SQLAlchemy ORM**: Database abstraction with support for multiple databases
- **Pydantic Validation**: Request/response validation and serialization
- **CORS Support**: Configured for frontend integration
- **Type Hints**: Full type annotation for better IDE support
- **Environment Configuration**: Settings loaded from environment variables

## Setup

### Prerequisites
- Python 3.12+
- [uv](https://github.com/astral-sh/uv) package manager
- PostgreSQL (or use Docker Compose)

### Local Development

1. **Install uv (if not already installed):**
   ```bash
   curl -LsSf https://astral.sh/uv/install.sh | sh
   ```

2. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

3. **Install dependencies:**
   ```bash
   uv sync
   ```

4. **Configure environment:**
   ```bash
   cp .env.example .env
   # For local development, use localhost instead of postgres:
   # DATABASE_URL="postgresql://awras_user:awras_password@localhost:5432/awras"
   ```

5. **Run the application:**
   ```bash
   uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Docker Development

```bash
# From project root
docker-compose up -d postgres backend

# View logs
docker-compose logs -f backend
```

## API Endpoints

### Email Subscriptions

- `POST /api/v1/emails/subscribe` - Subscribe an email to the waitlist
- `GET /api/v1/emails/subscriptions` - Get all subscriptions (with pagination)
- `GET /api/v1/emails/subscriptions/{email}` - Get subscription by email
- `DELETE /api/v1/emails/subscriptions/{id}` - Unsubscribe (soft delete)

### Health

- `GET /` - Root endpoint with API info
- `GET /health` - Health check

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Database

The application uses **PostgreSQL** as configured in your Docker Compose setup.

### Database Connection

- **Docker**: `postgresql://awras_user:awras_password@postgres:5432/awras`
- **Local**: `postgresql://awras_user:awras_password@localhost:5432/awras`

### Migrations (using Alembic)

```bash
# Create a new migration
uv run alembic revision --autogenerate -m "description"

# Apply migrations
uv run alembic upgrade head

# Rollback migration
uv run alembic downgrade -1
```

## Development

### Adding New Features

1. **Model**: Create SQLAlchemy model in `app/models/`
2. **Schema**: Create Pydantic schemas in `app/schemas/`
3. **Service**: Add business logic in `app/services/`
4. **Router**: Create API endpoints in `app/api/v1/`
5. **Register**: Include router in `app/api/v1/__init__.py`

### Example: Adding a New Resource

```python
# 1. Model (app/models/resource.py)
from app.db.database import Base
from sqlalchemy import Column, Integer, String

class Resource(Base):
    __tablename__ = "resources"
    id = Column(Integer, primary_key=True)
    name = Column(String)

# 2. Schema (app/schemas/resource.py)
from pydantic import BaseModel

class ResourceCreate(BaseModel):
    name: str

# 3. Service (app/services/resource.py)
class ResourceService:
    @staticmethod
    def create_resource(db, resource):
        # Business logic here
        pass

# 4. Router (app/api/v1/resource.py)
from fastapi import APIRouter
router = APIRouter(prefix="/resources")

@router.post("/")
async def create_resource():
    # Endpoint logic
    pass

# 5. Register (app/api/v1/__init__.py)
from app.api.v1 import resource
api_router.include_router(resource.router)
```

## License

MIT
