"""
Script to create a superuser (admin) account.

Usage:
    uv run python scripts/create_superuser.py

This script is NOT exposed via API for security reasons.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from getpass import getpass

from app.db.database import SessionLocal
from app.models.user import User
from app.services.auth import AuthService


def create_superuser() -> None:
    """Interactive CLI to create a superuser."""
    print("=" * 50)
    print("Superuser Creation Script")
    print("=" * 50)
    print()

    db = SessionLocal()
    try:
        email = input("Email: ").strip()
        if not email:
            print("Error: Email is required.")
            return

        identifier = input("Identifier (username): ").strip()
        if not identifier:
            print("Error: Identifier is required.")
            return

        password = getpass("Password: ")
        if not password:
            print("Error: Password is required.")
            return

        if len(password) < 8:
            print("Error: Password must be at least 8 characters.")
            return

        confirm_password = getpass("Confirm password: ")
        if password != confirm_password:
            print("Error: Passwords do not match.")
            return

        existing_email = db.query(User).filter(User.email == email.lower()).first()
        if existing_email:
            print(f"Error: Email '{email}' is already registered.")
            return

        existing_identifier = (
            db.query(User).filter(User.identifier == identifier.lower()).first()
        )
        if existing_identifier:
            print(f"Error: Identifier '{identifier}' is already taken.")
            return

        user = User(
            email=email.lower(),
            identifier=identifier.lower(),
            hashed_password=AuthService.hash_password(password),
            is_superuser=True,
            is_active=True,
            is_verified=True,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        print()
        print("=" * 50)
        print("Superuser created successfully!")
        print(f"  Email: {user.email}")
        print(f"  Identifier: {user.identifier}")
        print(f"  ID: {user.id}")
        print("=" * 50)

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    create_superuser()
