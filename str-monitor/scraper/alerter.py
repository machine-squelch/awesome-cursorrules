"""
Alert system: notify admin of detected changes, send alerts to subscribers.
"""

import json
import logging

import httpx
import resend

import config
import evidence_store

logger = logging.getLogger(__name__)


def _init_resend() -> None:
    """Initialize the Resend client."""
    resend.api_key = config.RESEND_API_KEY


def notify_admin_change_detected(
    source_name: str,
    jurisdiction: str,
    change_ratio: float,
    diff_preview: str,
    change_id: str,
) -> None:
    """
    Notify the admin (founder) that a change was detected and needs review.
    Sends via Slack webhook if configured, otherwise email.
    """
    message = (
        f"*STR Monitor: Change Detected*\n"
        f"Source: {source_name}\n"
        f"Jurisdiction: {jurisdiction}\n"
        f"Change: {change_ratio:.1%} of content modified\n"
        f"Change ID: `{change_id}`\n\n"
        f"```\n{diff_preview[:1000]}\n```\n\n"
        f"Review and approve at: {config.SUPABASE_URL or 'your-admin-panel'}"
    )

    # Try Slack first
    if config.ADMIN_NOTIFY_SLACK_WEBHOOK:
        try:
            httpx.post(
                config.ADMIN_NOTIFY_SLACK_WEBHOOK,
                json={"text": message},
                timeout=10,
            )
            logger.info("Admin notified via Slack about change %s", change_id)
            return
        except Exception as e:
            logger.warning("Failed to send Slack notification: %s", e)

    # Fall back to email
    if config.ADMIN_EMAIL and config.RESEND_API_KEY:
        _init_resend()
        try:
            resend.Emails.send({
                "from": config.ALERT_FROM_EMAIL,
                "to": [config.ADMIN_EMAIL],
                "subject": f"[STR Monitor] Change detected: {source_name}",
                "text": message.replace("*", "").replace("`", ""),
            })
            logger.info("Admin notified via email about change %s", change_id)
        except Exception as e:
            logger.error("Failed to send admin email: %s", e)
    else:
        logger.warning("No admin notification channel configured!")


def notify_admin_scraper_error(
    source_name: str,
    error_message: str,
    content_dropped: bool = False,
) -> None:
    """Notify admin of a scraper error or content drop (possible breakage)."""
    severity = "CONTENT DROP" if content_dropped else "ERROR"
    message = (
        f"*STR Monitor: Scraper {severity}*\n"
        f"Source: {source_name}\n"
        f"Error: {error_message}\n\n"
        f"This may indicate the source website has changed structure. "
        f"Manual investigation required."
    )

    if config.ADMIN_NOTIFY_SLACK_WEBHOOK:
        try:
            httpx.post(
                config.ADMIN_NOTIFY_SLACK_WEBHOOK,
                json={"text": message},
                timeout=10,
            )
            return
        except Exception:
            pass

    if config.ADMIN_EMAIL and config.RESEND_API_KEY:
        _init_resend()
        try:
            resend.Emails.send({
                "from": config.ALERT_FROM_EMAIL,
                "to": [config.ADMIN_EMAIL],
                "subject": f"[STR Monitor] Scraper {severity}: {source_name}",
                "text": message.replace("*", "").replace("`", ""),
            })
        except Exception as e:
            logger.error("Failed to send scraper error email: %s", e)


def send_subscriber_alerts(change_id: str) -> int:
    """
    Send alert emails to all active subscribers for an approved change.

    Returns the number of alerts sent.
    """
    _init_resend()
    client = evidence_store.get_client()

    # Fetch the change with source info
    change_result = (
        client.table("changes")
        .select("*, sources(name, jurisdiction)")
        .eq("id", change_id)
        .single()
        .execute()
    )
    change = change_result.data

    if change["status"] != "approved":
        logger.warning("Change %s is not approved, skipping alerts", change_id)
        return 0

    source = change["sources"]
    jurisdiction = source["jurisdiction"]

    # Get subscribers for this jurisdiction
    subscribers = evidence_store.get_active_subscribers(jurisdiction)

    if not subscribers:
        logger.info("No active subscribers for jurisdiction %s", jurisdiction)
        return 0

    sent_count = 0
    for subscriber in subscribers:
        try:
            severity_label = {
                "critical": "URGENT",
                "warning": "Important",
                "info": "Update",
            }.get(change["severity"], "Update")

            subject = f"[{severity_label}] STR Rule Change: {source['name']}"

            html_body = _build_alert_email(
                subscriber_name=subscriber["name"],
                source_name=source["name"],
                jurisdiction=_format_jurisdiction(jurisdiction),
                summary=change.get("summary", "A change was detected."),
                severity=change["severity"],
                change_id=change_id,
            )

            result = resend.Emails.send({
                "from": config.ALERT_FROM_EMAIL,
                "to": [subscriber["email"]],
                "subject": subject,
                "html": html_body,
            })

            evidence_store.log_alert(
                change_id=change_id,
                subscriber_id=subscriber["id"],
                channel="email",
                resend_message_id=result.get("id") if isinstance(result, dict) else None,
            )
            sent_count += 1

        except Exception as e:
            logger.error(
                "Failed to send alert to %s for change %s: %s",
                subscriber["email"],
                change_id,
                e,
            )

    # Mark change as published
    evidence_store.mark_change_published(change_id)
    logger.info("Sent %d alerts for change %s", sent_count, change_id)
    return sent_count


def _format_jurisdiction(jurisdiction: str) -> str:
    """Format jurisdiction slug to display name."""
    return {
        "pleasanton": "Pleasanton, CA",
        "alameda_county": "Alameda County, CA",
        "california": "State of California",
    }.get(jurisdiction, jurisdiction)


def _build_alert_email(
    subscriber_name: str,
    source_name: str,
    jurisdiction: str,
    summary: str,
    severity: str,
    change_id: str,
) -> str:
    """Build the HTML email body for a subscriber alert."""
    severity_color = {
        "critical": "#DC2626",
        "warning": "#F59E0B",
        "info": "#3B82F6",
    }.get(severity, "#3B82F6")

    app_url = config.SUPABASE_URL.replace("supabase.co", "strmonitor.com")  # placeholder

    return f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="border-left: 4px solid {severity_color}; padding-left: 16px; margin-bottom: 24px;">
            <h2 style="margin: 0 0 8px 0; color: #111827;">STR Regulation Change Detected</h2>
            <p style="margin: 0; color: #6B7280; font-size: 14px;">{jurisdiction} &middot; {source_name}</p>
        </div>

        <p>Hi {subscriber_name},</p>

        <p>We detected a change in short-term rental regulations that may affect your property:</p>

        <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; font-size: 15px; line-height: 1.6;">{summary}</p>
        </div>

        <p>
            <a href="{app_url}/changes/{change_id}"
               style="display: inline-block; background: #111827; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
                View Full Details &amp; Evidence
            </a>
        </p>

        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;">

        <p style="color: #9CA3AF; font-size: 12px;">
            You're receiving this because you're subscribed to STR Monitor alerts for {jurisdiction}.
            This is an automated regulatory monitoring service. Always verify changes with official sources before taking action.
        </p>
    </div>
    """
