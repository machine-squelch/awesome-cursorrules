"""
Evidence storage: persist snapshots and change records to Supabase.
"""

import logging
from datetime import datetime, timezone

from supabase import create_client, Client

import config

logger = logging.getLogger(__name__)

_client: Client | None = None


def get_client() -> Client:
    """Get or create the Supabase client (service role for full access)."""
    global _client
    if _client is None:
        _client = create_client(config.SUPABASE_URL, config.SUPABASE_SERVICE_ROLE_KEY)
    return _client


def get_active_sources() -> list[dict]:
    """Fetch all active monitoring sources."""
    client = get_client()
    result = client.table("sources").select("*").eq("is_active", True).execute()
    return result.data


def get_latest_snapshot(source_id: str) -> dict | None:
    """Get the most recent snapshot for a source."""
    client = get_client()
    result = (
        client.table("snapshots")
        .select("*")
        .eq("source_id", source_id)
        .order("fetched_at", desc=True)
        .limit(1)
        .execute()
    )
    if result.data:
        return result.data[0]
    return None


def store_snapshot(
    source_id: str,
    extracted_text: str,
    content_hash: str,
    content_length: int,
    http_status: int,
    raw_content: bytes,
) -> dict:
    """
    Store a new snapshot of a source's content.

    Also uploads the raw HTML/PDF to Supabase Storage for archival.
    """
    client = get_client()
    now = datetime.now(timezone.utc).isoformat()

    # Upload raw content to storage
    raw_path = f"snapshots/{source_id}/{now.replace(':', '-')}.bin"
    try:
        client.storage.from_("snapshots").upload(
            raw_path,
            raw_content,
            file_options={"content-type": "application/octet-stream"},
        )
    except Exception as e:
        logger.warning("Failed to upload raw content to storage: %s", e)
        raw_path = None

    # Insert snapshot record
    snapshot = {
        "source_id": source_id,
        "fetched_at": now,
        "content_hash": content_hash,
        "extracted_text": extracted_text,
        "raw_storage_path": raw_path,
        "content_length": content_length,
        "http_status": http_status,
    }
    result = client.table("snapshots").insert(snapshot).execute()
    return result.data[0]


def store_change(
    source_id: str,
    snapshot_before_id: str,
    snapshot_after_id: str,
    diff_text: str,
    severity: str = "info",
) -> dict:
    """Store a detected change record (pending human review)."""
    client = get_client()
    change = {
        "source_id": source_id,
        "snapshot_before_id": snapshot_before_id,
        "snapshot_after_id": snapshot_after_id,
        "diff_text": diff_text,
        "severity": severity,
        "status": "pending_review",
        "detected_at": datetime.now(timezone.utc).isoformat(),
    }
    result = client.table("changes").insert(change).execute()
    return result.data[0]


def log_scrape(
    source_id: str,
    status: str,
    content_length: int | None = None,
    content_hash: str | None = None,
    has_change: bool = False,
    error_message: str | None = None,
    duration_ms: int | None = None,
) -> None:
    """Log a scrape attempt for health monitoring."""
    client = get_client()
    now = datetime.now(timezone.utc).isoformat()
    log_entry = {
        "source_id": source_id,
        "started_at": now,
        "completed_at": now,
        "status": status,
        "content_length": content_length,
        "content_hash": content_hash,
        "has_change": has_change,
        "error_message": error_message,
        "duration_ms": duration_ms,
    }
    try:
        client.table("scrape_log").insert(log_entry).execute()
    except Exception as e:
        logger.error("Failed to write scrape log: %s", e)


def update_source_last_checked(source_id: str) -> None:
    """Update the last_checked_at timestamp on a source."""
    client = get_client()
    now = datetime.now(timezone.utc).isoformat()
    client.table("sources").update({"last_checked_at": now}).eq("id", source_id).execute()


def get_active_subscribers(jurisdiction: str | None = None) -> list[dict]:
    """Get all active subscribers, optionally filtered by jurisdiction."""
    client = get_client()
    query = client.table("subscribers").select("*").eq("status", "active")
    result = query.execute()

    if jurisdiction:
        return [
            s for s in result.data
            if jurisdiction in (s.get("jurisdictions") or [])
        ]
    return result.data


def get_pending_changes() -> list[dict]:
    """Get all changes pending review."""
    client = get_client()
    result = (
        client.table("changes")
        .select("*, sources(name, jurisdiction)")
        .eq("status", "pending_review")
        .order("detected_at", desc=True)
        .execute()
    )
    return result.data


def approve_change(change_id: str, summary: str, severity: str = "info") -> dict:
    """Approve a change and set its summary (called by admin)."""
    client = get_client()
    now = datetime.now(timezone.utc).isoformat()
    result = (
        client.table("changes")
        .update({
            "status": "approved",
            "summary": summary,
            "severity": severity,
            "approved_at": now,
        })
        .eq("id", change_id)
        .execute()
    )
    return result.data[0]


def mark_change_published(change_id: str) -> None:
    """Mark a change as published (alerts sent)."""
    client = get_client()
    now = datetime.now(timezone.utc).isoformat()
    client.table("changes").update({"published_at": now}).eq("id", change_id).execute()


def log_alert(change_id: str, subscriber_id: str, channel: str, resend_message_id: str | None = None) -> None:
    """Log an alert that was sent."""
    client = get_client()
    alert = {
        "change_id": change_id,
        "subscriber_id": subscriber_id,
        "channel": channel,
        "status": "sent",
        "resend_message_id": resend_message_id,
    }
    client.table("alert_log").insert(alert).execute()
