"""
Object storage service for handling file uploads to Cloudflare R2 (S3-compatible).
"""

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from fastapi import UploadFile
import uuid
from typing import Optional

from app.core.config import get_settings

settings = get_settings()


class ObjectStorageService:
    """Service for interacting with Cloudflare R2 object storage."""

    def __init__(self):
        self.s3_client = boto3.client(
            "s3",
            endpoint_url=settings.R2_ENDPOINT_URL,
            aws_access_key_id=settings.R2_ACCESS_KEY_ID,
            aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
            config=Config(signature_version="s3v4"),
            region_name="auto",  # R2 requires region to be 'auto'
        )
        self.bucket_name = settings.R2_BUCKET_NAME

    def upload_file(self, file: UploadFile, folder: str = "profiles") -> Optional[str]:
        """
        Upload a file to R2 storage.

        Args:
            file: The file to upload
            folder: The folder path within the bucket

        Returns:
            The key (path) of the uploaded file, or None if upload failed
        """
        try:
            # Generate a unique filename while preserving extension
            file_ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
            filename = f"{uuid.uuid4()}.{file_ext}"
            key = f"{folder}/{filename}"

            # Reset file pointer to beginning
            file.file.seek(0)

            self.s3_client.upload_fileobj(
                file.file,
                self.bucket_name,
                key,
                ExtraArgs={"ContentType": file.content_type},
            )
            return key
        except ClientError as e:
            print(f"Error uploading file to R2: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error uploading file: {e}")
            return None

    def get_presigned_url(self, key: str, expiration: int = 3600) -> Optional[str]:
        """
        Generate a presigned URL for a file.

        Args:
            key: The file key (path) in the bucket
            expiration: URL expiration time in seconds (default 1 hour)

        Returns:
            Presigned URL string or None if generation failed
        """
        if not key:
            return None

        try:
            url = self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": key},
                ExpiresIn=expiration,
            )
            return url
        except ClientError as e:
            print(f"Error generating presigned URL: {e}")
            return None


# Singleton instance
storage_service = ObjectStorageService()
