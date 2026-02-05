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
        Send email verification OTP to user.

        Args:
            to_email: Recipient email address
            token: Verification OTP (6 digits)
            identifier: User's username for personalization

        Returns:
            True if email was sent successfully, False otherwise
        """
        if not EmailService._get_client():
            return False

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #000;
                    background-color: #fff;
                    margin: 0;
                    padding: 20px;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 40px;
                }}
                .otp {{
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 5px;
                    margin: 30px 0;
                    text-align: center;
                    padding: 20px;
                    display: inline-block;
                }}
                .footer {{
                    margin-top: 40px;
                    font-size: 12px;
                    border-top: 1px solid #000;
                    padding-top: 20px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1 style="margin-top: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">AWRAS Verification</h1>
                
                <p>Hello {identifier},</p>
                
                <p>Please use the following code to verify your email address:</p>
                
                <div style="text-align: center;">
                    <div class="otp">{token}</div>
                </div>
                
                <p>This code will expire in {settings.EMAIL_VERIFICATION_EXPIRE_HOURS} hours.</p>
                
                <p>If you didn't request this code, you can safely ignore this email.</p>
                
                <div class="footer">
                    AWRAS AI - An AI that understands our language 🇩🇿
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
AWRAS VERIFICATION

Hello {identifier},

Please use the following code to verify your email address:

{token}

This code will expire in {settings.EMAIL_VERIFICATION_EXPIRE_HOURS} hours.

If you didn't request this code, you can safely ignore this email.
        """

        try:
            params: resend.Emails.SendParams = {
                "from": settings.EMAIL_FROM,
                "to": [to_email],
                "subject": f"Your AWRAS verification code: {token}",
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
        Send password reset OTP to user.

        Args:
            to_email: Recipient email address
            token: Password reset OTP (6 digits)
            identifier: User's username for personalization

        Returns:
            True if email was sent successfully, False otherwise
        """
        if not EmailService._get_client():
            return False

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #000;
                    background-color: #fff;
                    margin: 0;
                    padding: 20px;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    border: 1px solid #000;
                    padding: 40px;
                }}
                .otp {{
                    font-size: 32px;
                    font-weight: bold;
                    letter-spacing: 5px;
                    margin: 30px 0;
                    text-align: center;
                    border: 2px solid #000;
                    padding: 20px;
                    display: inline-block;
                }}
                .footer {{
                    margin-top: 40px;
                    font-size: 12px;
                    border-top: 1px solid #000;
                    padding-top: 20px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1 style="margin-top: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">Password Reset</h1>
                
                <p>Hello {identifier},</p>
                
                <p>We received a request to reset your password. Use the following code to proceed:</p>
                
                <div style="text-align: center;">
                    <div class="otp">{token}</div>
                </div>
                
                <p>This code will expire in 1 hour.</p>
                
                <p>If you didn't request a password reset, you can safely ignore this email.</p>
                
                <div class="footer">
                    AWRAS AI - Automated Workflow & Reasoning Agent System
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
PASSWORD RESET

Hello {identifier},

We received a request to reset your password. Use the following code to proceed:

{token}

This code will expire in 1 hour.

If you didn't request a password reset, you can safely ignore this email.
        """

        try:
            params: resend.Emails.SendParams = {
                "from": settings.EMAIL_FROM,
                "to": [to_email],
                "subject": f"Reset your AWRAS password: {token}",
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
