"""
Core scraper: fetches pages, extracts meaningful text content.
Handles both HTML pages and PDF documents.
"""

import hashlib
import io
import logging
import time
from dataclasses import dataclass

import httpx
import pdfplumber
from bs4 import BeautifulSoup

import config

logger = logging.getLogger(__name__)


@dataclass
class ScrapeResult:
    """Result of scraping a single source."""
    source_id: str
    url: str
    extracted_text: str
    content_hash: str
    content_length: int
    http_status: int
    raw_content: bytes
    duration_ms: int
    error: str | None = None


def _clean_html_text(html: str, css_selector: str | None = None) -> str:
    """Extract meaningful text from HTML, stripping nav/footer/scripts."""
    soup = BeautifulSoup(html, "lxml")

    # Remove noise elements
    for tag in soup(["script", "style", "nav", "footer", "header", "noscript", "iframe"]):
        tag.decompose()

    # If a CSS selector is provided, extract only that section
    if css_selector:
        target = soup.select_one(css_selector)
        if target:
            soup = target

    # Get text, collapse whitespace
    text = soup.get_text(separator="\n", strip=True)

    # Collapse multiple blank lines into one
    lines = [line.strip() for line in text.splitlines()]
    cleaned_lines = []
    prev_blank = False
    for line in lines:
        if not line:
            if not prev_blank:
                cleaned_lines.append("")
            prev_blank = True
        else:
            cleaned_lines.append(line)
            prev_blank = False

    return "\n".join(cleaned_lines).strip()


def _extract_pdf_text(pdf_bytes: bytes) -> str:
    """Extract text content from a PDF document."""
    text_parts = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n\n".join(text_parts).strip()


def _compute_hash(text: str) -> str:
    """SHA-256 hash of the extracted text."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def fetch_source(
    source_id: str,
    url: str,
    source_type: str,
    css_selector: str | None = None,
) -> ScrapeResult:
    """
    Fetch a single source URL and extract its text content.

    Args:
        source_id: Database ID of the source.
        url: The URL to fetch.
        source_type: 'html' or 'pdf'.
        css_selector: Optional CSS selector to narrow content extraction.

    Returns:
        ScrapeResult with extracted text and metadata.
    """
    start = time.monotonic()
    try:
        with httpx.Client(
            timeout=config.REQUEST_TIMEOUT,
            follow_redirects=True,
            headers={"User-Agent": config.USER_AGENT},
        ) as client:
            response = client.get(url)
            raw_content = response.content
            http_status = response.status_code

        if http_status != 200:
            duration_ms = int((time.monotonic() - start) * 1000)
            return ScrapeResult(
                source_id=source_id,
                url=url,
                extracted_text="",
                content_hash="",
                content_length=0,
                http_status=http_status,
                raw_content=raw_content,
                duration_ms=duration_ms,
                error=f"HTTP {http_status}",
            )

        # Extract text based on source type
        if source_type == "pdf":
            extracted_text = _extract_pdf_text(raw_content)
        else:
            extracted_text = _clean_html_text(
                raw_content.decode("utf-8", errors="replace"),
                css_selector=css_selector,
            )

        content_hash = _compute_hash(extracted_text)
        duration_ms = int((time.monotonic() - start) * 1000)

        return ScrapeResult(
            source_id=source_id,
            url=url,
            extracted_text=extracted_text,
            content_hash=content_hash,
            content_length=len(extracted_text),
            http_status=http_status,
            raw_content=raw_content,
            duration_ms=duration_ms,
        )

    except Exception as e:
        duration_ms = int((time.monotonic() - start) * 1000)
        logger.error("Failed to fetch %s: %s", url, e)
        return ScrapeResult(
            source_id=source_id,
            url=url,
            extracted_text="",
            content_hash="",
            content_length=0,
            http_status=0,
            raw_content=b"",
            duration_ms=duration_ms,
            error=str(e),
        )
