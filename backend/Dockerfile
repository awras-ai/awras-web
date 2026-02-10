# Stage 1: Builder stage for installing dependencies
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

# Set working directory
WORKDIR /app

# Install Python development headers for any packages that need compilation
RUN apt-get update && apt-get install -y \
  python3-dev \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Increase timeout and retries for network stability
ENV UV_HTTP_TIMEOUT=600
ENV UV_HTTP_RETRY=10
ENV UV_CACHE_DIR=/tmp/uv-cache
ENV UV_LINK_MODE=copy

# Clear cache and install dependencies with retry logic and verbose output
RUN rm -rf /tmp/uv-cache && \
  echo "Attempting to install dependencies..." && \
  uv sync --no-dev --verbose || ( \
  echo "First attempt failed, cleaning cache and retrying with longer timeout..." && \
  rm -rf /tmp/uv-cache ~/.cache/uv && \
  UV_HTTP_TIMEOUT=1200 uv sync --no-dev --verbose \
  )

# Stage 2: Runtime stage
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

# Install runtime dependencies: libpq for PostgreSQL and netcat for health check
RUN apt-get update && apt-get install -y \
  libpq5 \
  netcat-openbsd \
  curl \
  ffmpeg \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy installed dependencies from builder
COPY --from=builder /app/.venv ./.venv

# Copy application code (respects .dockerignore)
COPY . .

# Ensure .chainlit folder exists with its configs
COPY .chainlit ./.chainlit

# Set environment variables
ENV PYTHONPATH=/app
ENV PATH="/app/.venv/bin:$PATH"

# Create entrypoint script for running migrations before starting app
RUN echo '#!/bin/sh\n\
  # Wait for database to be ready\n\
  echo "Waiting for database on ${POSTGRES_HOST:-postgres}:${POSTGRES_PORT:-5432}..."\n\
  while ! python3 -c "import socket; socket.create_connection(('${POSTGRES_HOST:-postgres}', ${POSTGRES_PORT:-5432}), timeout=5)" 2>/dev/null; do\
  sleep 1\
  done\
  echo "Database is ready!"\n\
  \n\
  # Run migrations\n\
  alembic upgrade head\n\
  \n\
  # Start the application\n\
  exec uvicorn main:app --host 0.0.0.0 --port 8000\n\
  ' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Use entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
