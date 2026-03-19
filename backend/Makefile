# Backend Makefile
# FastAPI + PostgreSQL + Redis + Alembic

.PHONY: help install dev start test lint format migrate migrate-create migrate-downgrade docker-up docker-down docker-logs clean

# Default target
help:
	@echo "Available commands:"
	@echo ""
	@echo "  Dependencies:"
	@echo "    make install         - Install/update dependencies (uv sync)"
	@echo "    make add pkg=<name>  - Add a new package (e.g., make add pkg=requests)"
	@echo ""
	@echo "  Development:"
	@echo "    make dev             - Start development server with auto-reload"
	@echo "    make start           - Start production server"
	@echo ""
	@echo "  Database:"
	@echo "    make migrate         - Run pending migrations (alembic upgrade head)"
	@echo "    make migrate-create  - Create new migration (requires msg=<description>)"
	@echo "    make migrate-downgrade - Rollback last migration"
	@echo ""
	@echo "  Code Quality:"
	@echo "    make lint            - Run ruff linter"
	@echo "    make format          - Format code with ruff"
	@echo "    make check           - Run both lint and format check"
	@echo ""
	@echo "  Docker:"
	@echo "    make docker-up       - Start PostgreSQL and Redis containers"
	@echo "    make docker-down     - Stop containers"
	@echo "    make docker-logs     - View container logs"
	@echo ""
	@echo "  Utilities:"
	@echo "    make clean           - Remove __pycache__ and .pyc files"
	@echo ""

# Dependencies
install:
	uv sync

add:
	@if [ -z "$(pkg)" ]; then \
		echo "Error: pkg parameter required (e.g., make add pkg=requests)"; \
		exit 1; \
	fi
	uv add $(pkg)

# Development
dev:
	uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000

start:
	uv run uvicorn main:app --host 0.0.0.0 --port 8000

# Database migrations
migrate:
	uv run alembic upgrade head

migrate-create:
	@if [ -z "$(msg)" ]; then \
		echo "Error: msg parameter required (e.g., make migrate-create msg='add users table')"; \
		exit 1; \
	fi
	uv run alembic revision --autogenerate -m "$(msg)"

migrate-downgrade:
	uv run alembic downgrade -1

# Code quality
lint:
	uv run ruff check .

format:
	uv run ruff format .

check: lint format

# Docker
docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

# Cleanup
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
