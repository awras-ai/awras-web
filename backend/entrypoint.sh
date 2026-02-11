#!/bin/sh
set -e

# Wait for database to be ready
echo "Waiting for database on ${POSTGRES_HOST:-postgres}:${POSTGRES_PORT:-5432}..."
while ! python3 -c "import socket; socket.create_connection(('${POSTGRES_HOST:-postgres}', ${POSTGRES_PORT:-5432}), timeout=5)" 2>/dev/null; do
  sleep 1
done
echo "Database is ready!"

# Run migrations
alembic upgrade head

# Start the application
exec uvicorn main:app --host 0.0.0.0 --port 8000
