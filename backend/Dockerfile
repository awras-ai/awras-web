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

# Install runtime dependencies: libpq for PostgreSQL and curl for health check
RUN apt-get update && apt-get install -y \
  libpq5 \
  curl \
  ffmpeg \
  && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy installed dependencies from builder
COPY --from=builder /app/.venv ./.venv

# Copy application code (respects .dockerignore)
COPY . .

# Set environment variables
ENV PYTHONPATH=/app
ENV PATH="/app/.venv/bin:$PATH"

# Copy entrypoint script
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Use entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
