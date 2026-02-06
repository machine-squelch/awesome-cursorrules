"""
Main entry point for the scraper.
Run via cron: python run.py

Workflow:
1. Load all active sources from database
2. Fetch each source
3. Compare against last stored version
4. If changed: store snapshot, create change record, notify admin
5. If error/content drop: notify admin
6. Log everything
"""

import logging
import sys
import time

import scraper
import diff_engine
import evidence_store
import alerter

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)


def run_scrape_cycle() -> dict:
    """
    Run a complete scrape cycle across all active sources.

    Returns summary stats: {total, checked, changed, errors}
    """
    logger.info("Starting scrape cycle")
    start = time.monotonic()

    sources = evidence_store.get_active_sources()
    logger.info("Found %d active sources to check", len(sources))

    stats = {"total": len(sources), "checked": 0, "changed": 0, "errors": 0}

    for source in sources:
        source_id = source["id"]
        source_name = source["name"]
        logger.info("Checking: %s", source_name)

        try:
            # Fetch the page
            result = scraper.fetch_source(
                source_id=source_id,
                url=source["url"],
                source_type=source["source_type"],
                css_selector=source.get("css_selector"),
            )

            # Handle fetch errors
            if result.error:
                logger.error("Fetch error for %s: %s", source_name, result.error)
                evidence_store.log_scrape(
                    source_id=source_id,
                    status="error",
                    error_message=result.error,
                    duration_ms=result.duration_ms,
                )
                alerter.notify_admin_scraper_error(source_name, result.error)
                stats["errors"] += 1
                continue

            # Get previous snapshot for comparison
            prev_snapshot = evidence_store.get_latest_snapshot(source_id)
            prev_text = prev_snapshot["extracted_text"] if prev_snapshot else ""

            # Compare
            diff = diff_engine.compute_diff(
                old_text=prev_text,
                new_text=result.extracted_text,
                source_name=source_name,
            )

            # Alert on content drops (possible scraper breakage)
            if diff.content_dropped:
                alerter.notify_admin_scraper_error(
                    source_name,
                    f"Content dropped from {len(prev_text)} to {result.content_length} chars",
                    content_dropped=True,
                )

            # Always store the new snapshot (for evidence trail)
            new_snapshot = evidence_store.store_snapshot(
                source_id=source_id,
                extracted_text=result.extracted_text,
                content_hash=result.content_hash,
                content_length=result.content_length,
                http_status=result.http_status,
                raw_content=result.raw_content,
            )

            # If content actually changed, create a change record
            if diff.has_change and prev_snapshot:
                severity = "warning" if diff.change_ratio > 0.1 else "info"
                change = evidence_store.store_change(
                    source_id=source_id,
                    snapshot_before_id=prev_snapshot["id"],
                    snapshot_after_id=new_snapshot["id"],
                    diff_text=diff.diff_text,
                    severity=severity,
                )

                # Notify admin for review
                alerter.notify_admin_change_detected(
                    source_name=source_name,
                    jurisdiction=source["jurisdiction"],
                    change_ratio=diff.change_ratio,
                    diff_preview=diff.diff_text,
                    change_id=change["id"],
                )

                stats["changed"] += 1
                logger.info("Change recorded for %s (change_id=%s)", source_name, change["id"])

            # Log successful scrape
            evidence_store.log_scrape(
                source_id=source_id,
                status="success",
                content_length=result.content_length,
                content_hash=result.content_hash,
                has_change=diff.has_change,
                duration_ms=result.duration_ms,
            )

            # Update source timestamp
            evidence_store.update_source_last_checked(source_id)
            stats["checked"] += 1

        except Exception as e:
            logger.exception("Unexpected error processing %s: %s", source_name, e)
            evidence_store.log_scrape(
                source_id=source_id,
                status="error",
                error_message=str(e),
            )
            stats["errors"] += 1

    elapsed = time.monotonic() - start
    logger.info(
        "Scrape cycle complete in %.1fs: %d checked, %d changed, %d errors",
        elapsed,
        stats["checked"],
        stats["changed"],
        stats["errors"],
    )
    return stats


def main() -> None:
    """Entry point."""
    try:
        stats = run_scrape_cycle()
        if stats["errors"] > 0:
            sys.exit(1)  # Non-zero exit for cron alerting
    except Exception:
        logger.exception("Fatal error in scrape cycle")
        sys.exit(2)


if __name__ == "__main__":
    main()
