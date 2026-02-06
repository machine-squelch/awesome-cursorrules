"""Configuration loaded from environment variables."""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from project root
env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(env_path)


# Supabase
SUPABASE_URL: str = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

# Resend
RESEND_API_KEY: str = os.environ.get("RESEND_API_KEY", "")
ALERT_FROM_EMAIL: str = os.environ.get("ALERT_FROM_EMAIL", "alerts@strmonitor.com")

# Admin
ADMIN_EMAIL: str = os.environ.get("ADMIN_EMAIL", "")
ADMIN_NOTIFY_SLACK_WEBHOOK: str = os.environ.get("ADMIN_NOTIFY_SLACK_WEBHOOK", "")

# Scraper settings
CHANGE_THRESHOLD: float = 0.005  # Minimum change ratio to flag (0.5%)
CONTENT_DROP_THRESHOLD: float = 0.5  # Alert if content drops below 50% of previous
REQUEST_TIMEOUT: int = 30  # seconds
USER_AGENT: str = "STRMonitor/1.0 (compliance monitoring service)"
