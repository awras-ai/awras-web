# AWRAS Backend - Quick Start

## 🚀 Quick Start with uv

```bash
# Install dependencies
cd backend
uv sync

# Run locally (make sure PostgreSQL is running)
uv run uvicorn app.main:app --reload --port 8000

# Or run with Docker
cd ..
docker-compose up -d postgres backend
```

## 📋 Available Commands

```bash
# Install/update dependencies
uv sync

# Add a new dependency
uv add package-name

# Run the server
uv run uvicorn app.main:app --reload

# Run with custom host/port
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000

# Run database migrations
uv run alembic upgrade head

# Create new migration
uv run alembic revision --autogenerate -m "description"

# Run tests (when added)
uv run pytest

# Format code with ruff
uv run ruff format .

# Lint code
uv run ruff check .
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# Start only backend and database
docker-compose up -d postgres backend

# View backend logs
docker-compose logs -f backend

# Rebuild backend
docker-compose build backend

# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 🔧 Environment Variables

Create a `.env` file in the project root:

```env
POSTGRES_DB=awras
POSTGRES_USER=awras_user
POSTGRES_PASSWORD=awras_password
DATABASE_URL=postgresql://awras_user:awras_password@localhost:5432/awras
```

## 📡 API Endpoints

Once running, access:
- API: http://localhost:8000
- Interactive Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Email Subscription Endpoints

- `POST /api/v1/emails/subscribe` - Subscribe to waitlist
- `GET /api/v1/emails/subscriptions` - List all subscriptions
- `GET /api/v1/emails/subscriptions/{email}` - Get specific subscription
- `DELETE /api/v1/emails/subscriptions/{id}` - Unsubscribe

## 🏗️ Project Structure

```
backend/
├── app/
│   ├── api/v1/              # API endpoints
│   ├── core/                # Config & settings
│   ├── db/                  # Database setup
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── services/            # Business logic
│   └── main.py              # FastAPI app
├── pyproject.toml           # Dependencies (uv)
├── Dockerfile               # Container definition
└── .env                     # Environment variables
```
