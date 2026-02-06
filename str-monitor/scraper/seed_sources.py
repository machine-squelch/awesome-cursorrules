"""
Seed the sources table with initial URLs to monitor.
Run once: python seed_sources.py
"""

import json
import logging
import sys
from pathlib import Path

import evidence_store

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def seed() -> None:
    """Load sources from sources.json and insert into database."""
    sources_file = Path(__file__).parent / "sources.json"
    with open(sources_file) as f:
        sources = json.load(f)

    client = evidence_store.get_client()

    for source in sources:
        # Check if source already exists by URL
        existing = (
            client.table("sources")
            .select("id")
            .eq("url", source["url"])
            .execute()
        )

        if existing.data:
            logger.info("Source already exists: %s", source["name"])
            continue

        record = {
            "name": source["name"],
            "url": source["url"],
            "source_type": source["source_type"],
            "jurisdiction": source["jurisdiction"],
            "category": source["category"],
            "css_selector": source.get("css_selector"),
            "is_active": True,
        }

        client.table("sources").insert(record).execute()
        logger.info("Seeded: %s", source["name"])

    logger.info("Seeding complete.")


if __name__ == "__main__":
    seed()
