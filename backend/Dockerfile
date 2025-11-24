# Stage 1: Builder stage
FROM python:3.12-slim as builder

# Set working directory
WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy dependency files
COPY pyproject.toml ./

# Create virtual environment and install project dependencies declared in pyproject.toml
# `uv sync` reads pyproject.toml and installs the dependency set into the venv.
RUN uv venv /opt/venv && \
        uv pip install --python=/opt/venv/bin/python --no-cache \
            fastapi uvicorn sqlalchemy alembic pydantic pydantic-settings python-multipart \
            email-validator python-dotenv psycopg2-binary slowapi redis

# Stage 2: Runtime stage
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Set PATH to use the virtual environment
ENV PATH="/opt/venv/bin:$PATH"

# Copy application code
COPY ./app ./app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# Run the application
CMD ["/opt/venv/bin/python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
