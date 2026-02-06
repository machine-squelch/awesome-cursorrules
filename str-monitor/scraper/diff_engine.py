"""
Change detection: compare current scrape against last stored version.
Produces unified diffs and change metrics.
"""

import difflib
import logging
from dataclasses import dataclass

import config

logger = logging.getLogger(__name__)


@dataclass
class DiffResult:
    """Result of comparing two text versions."""
    has_change: bool
    change_ratio: float  # 0.0 to 1.0 - what fraction of lines changed
    diff_text: str  # unified diff
    added_lines: int
    removed_lines: int
    content_dropped: bool  # True if new content is suspiciously smaller


def compute_diff(
    old_text: str,
    new_text: str,
    source_name: str = "",
) -> DiffResult:
    """
    Compare old and new text versions.

    Returns a DiffResult with change details. Flags content drops
    (when new content is < 50% the size of old) as a potential
    scraper breakage signal.
    """
    if not old_text and not new_text:
        return DiffResult(
            has_change=False,
            change_ratio=0.0,
            diff_text="",
            added_lines=0,
            removed_lines=0,
            content_dropped=False,
        )

    # If there was no previous version, this is the first scrape
    if not old_text:
        return DiffResult(
            has_change=False,  # First scrape isn't a "change"
            change_ratio=0.0,
            diff_text="",
            added_lines=0,
            removed_lines=0,
            content_dropped=False,
        )

    old_lines = old_text.splitlines(keepends=True)
    new_lines = new_text.splitlines(keepends=True)

    # Check for suspicious content drop
    content_dropped = False
    if old_text and new_text:
        size_ratio = len(new_text) / len(old_text)
        if size_ratio < config.CONTENT_DROP_THRESHOLD:
            content_dropped = True
            logger.warning(
                "Content drop detected for '%s': old=%d chars, new=%d chars (%.1f%%)",
                source_name,
                len(old_text),
                len(new_text),
                size_ratio * 100,
            )

    # Generate unified diff
    diff = list(difflib.unified_diff(
        old_lines,
        new_lines,
        fromfile="previous",
        tofile="current",
        lineterm="",
    ))

    if not diff:
        return DiffResult(
            has_change=False,
            change_ratio=0.0,
            diff_text="",
            added_lines=0,
            removed_lines=0,
            content_dropped=content_dropped,
        )

    # Count actual changes (ignore diff headers)
    added = sum(1 for line in diff if line.startswith("+") and not line.startswith("+++"))
    removed = sum(1 for line in diff if line.startswith("-") and not line.startswith("---"))
    total_lines = max(len(old_lines), len(new_lines), 1)
    change_ratio = (added + removed) / total_lines

    # Only flag as a real change if above threshold
    has_change = change_ratio >= config.CHANGE_THRESHOLD

    diff_text = "\n".join(diff)

    if has_change:
        logger.info(
            "Change detected for '%s': +%d/-%d lines (%.1f%% changed)",
            source_name,
            added,
            removed,
            change_ratio * 100,
        )

    return DiffResult(
        has_change=has_change,
        change_ratio=change_ratio,
        diff_text=diff_text,
        added_lines=added,
        removed_lines=removed,
        content_dropped=content_dropped,
    )
