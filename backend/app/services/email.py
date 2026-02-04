"""
Email service for sending transactional emails via Resend.
"""

import logging
from typing import Optional

import resend

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


class EmailService:
    """Service for sending emails via Resend API."""

    @staticmethod
    def _get_client() -> bool:
        """Initialize Resend client. Returns True if API key is configured."""
        if not settings.RESEND_API_KEY:
            logger.warning("RESEND_API_KEY not configured - emails will not be sent")
            return False
        resend.api_key = settings.RESEND_API_KEY
        return True

    @staticmethod
    def send_verification_email(
        to_email: str,
        token: str,
        identifier: str,
    ) -> bool:
        """
        Send email verification link to user.

        Args:
            to_email: Recipient email address
            token: Verification token
            identifier: User's username for personalization

        Returns:
            True if email was sent successfully, False otherwise
        """
        if not EmailService._get_client():
            return False

        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to AWRAS!</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <p>Hi <strong>{identifier}</strong>,</p>
                <p>Thanks for signing up! Please verify your email address to complete your registration.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{verification_url}" 
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                              color: white; 
                              padding: 14px 30px; 
                              text-decoration: none; 
                              border-radius: 5px; 
                              display: inline-block;
                              font-weight: bold;">
                        Verify Email Address
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    If the button doesn't work, copy and paste this link into your browser:
                    <br>
                    <a href="{verification_url}" style="color: #667eea; word-break: break-all;">{verification_url}</a>
                </p>
                <p style="color: #666; font-size: 14px;">
                    This link will expire in {settings.EMAIL_VERIFICATION_EXPIRE_HOURS} hours.
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">
                    If you didn't create an account with AWRAS, you can safely ignore this email.
                </p>
            </div>
        </body>
        </html>
        """

        text_content = f"""
Welcome to AWRAS!

Hi {identifier},

Thanks for signing up! Please verify your email address to complete your registration.

Click here to verify: {verification_url}

This link will expire in {settings.EMAIL_VERIFICATION_EXPIRE_HOURS} hours.

If you didn't create an account with AWRAS, you can safely ignore this email.
        """

        try:
            params: resend.Emails.SendParams = {
                "from": settings.EMAIL_FROM,
                "to": [to_email],
                "subject": "Verify your AWRAS account",
                "html": html_content,
                "text": text_content,
            }
            response = resend.Emails.send(params)
            logger.info(
                f"Verification email sent to {to_email}, id: {response.get('id')}"
            )
            return True
        except Exception as e:
            logger.error(f"Failed to send verification email to {to_email}: {str(e)}")
            return False

    @staticmethod
    def send_password_reset_email(
        to_email: str,
        token: str,
        identifier: str,
    ) -> bool:
        """
        Send password reset link to user.

        Args:
            to_email: Recipient email address
            token: Password reset token
            identifier: User's username for personalization

        Returns:
            True if email was sent successfully, False otherwise
        """
        if not EmailService._get_client():
            return False

        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Password Reset Request</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
                <p>Hi <strong>{identifier}</strong>,</p>
                <p>We received a request to reset your password. Click the button below to create a new password.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_url}" 
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                              color: white; 
                              padding: 14px 30px; 
                              text-decoration: none; 
                              border-radius: 5px; 
                              display: inline-block;
                              font-weight: bold;">
                        Reset Password
                    </a>
                </div>
                <p style="color: #666; font-size: 14px;">
                    If the button doesn't work, copy and paste this link into your browser:
                    <br>
                    <a href="{reset_url}" style="color: #667eea; word-break: break-all;">{reset_url}</a>
                </p>
                <p style="color: #666; font-size: 14px;">
                    This link will expire in 1 hour.
                </p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">
                    If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
                </p>
            </div>
        </body>
        </html>
        """

        text_content = f"""
Password Reset Request

Hi {identifier},

We received a request to reset your password. Click the link below to create a new password:

{reset_url}

This link will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        """

        try:
            params: resend.Emails.SendParams = {
                "from": settings.EMAIL_FROM,
                "to": [to_email],
                "subject": "Reset your AWRAS password",
                "html": html_content,
                "text": text_content,
            }
            response = resend.Emails.send(params)
            logger.info(
                f"Password reset email sent to {to_email}, id: {response.get('id')}"
            )
            return True
        except Exception as e:
            logger.error(f"Failed to send password reset email to {to_email}: {str(e)}")
            return False
