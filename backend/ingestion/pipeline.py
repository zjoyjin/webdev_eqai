"""
pipeline.py — Main ingestion pipeline orchestrator.

Usage:
    # From project root (backend/):
    python -m ingestion.pipeline --file data/raw/测评总览.xlsx

    # Or import and call from another script:
    from ingestion.pipeline import run_ingestion
    run_ingestion("data/raw/测评总览.xlsx")

Flow:
    1. Load dataset (Excel or CSV) → DataFrame
    2. Normalize rows → list[KnowledgeRecord]
    3. Upsert knowledge_entries to Supabase → collect entry UUIDs
    4. Build embedding inputs (EN + ZH per record)
    5. Call OpenAI in batches → get vectors
    6. Upsert entry_embeddings to Supabase
    7. Log ingestion run to ingestion_log table

Re-ingestion safety:
    - Upserts use ON CONFLICT on measure_id_num (entries) and
      (entry_id, lang) (embeddings), so re-running is always safe.
    - Embeddings are replaced if the text has changed, ensuring
      vectors stay current when the dataset is updated.
"""

import argparse
import logging
import sys
import time
from pathlib import Path

# Ensure project root is on sys.path when running as a script
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import settings
from app.db.supabase_client import get_supabase
from app.db.queries import (
    upsert_knowledge_entry,
    upsert_embedding,
    log_ingestion_run,
)
from ingestion.loaders.dataset_loader import load_dataset
from ingestion.transformers.normalizer import normalize_dataframe, KnowledgeRecord
from ingestion.embedder_batch import generate_embeddings, EmbeddingInput

# ── Logging setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("ingestion.pipeline")


def run_ingestion(filepath: str | Path) -> dict:
    """
    Run the full ingestion pipeline for a dataset file.

    Args:
        filepath: Path to .xlsx or .csv file.

    Returns:
        Summary dict with counts: processed, inserted, updated, failed.
    """
    filepath = Path(filepath)
    logger.info(f"━━━ Starting ingestion: {filepath.name} ━━━")
    start_time = time.time()

    db = get_supabase()
    summary = {
        "filename":       filepath.name,
        "rows_processed": 0,
        "rows_inserted":  0,
        "rows_updated":   0,
        "rows_failed":    0,
        "embed_failed":   0,
        "failures":       [],
    }

    # ── Step 1: Load ──────────────────────────────────────────────────────────
    logger.info("Step 1/5 — Loading dataset...")
    df = load_dataset(filepath)
    summary["rows_processed"] = len(df)
    logger.info(f"  Loaded {len(df)} records")

    # ── Step 2: Normalize ─────────────────────────────────────────────────────
    logger.info("Step 2/5 — Normalizing records...")
    records, norm_failures = normalize_dataframe(df)
    summary["rows_failed"] += len(norm_failures)
    summary["failures"].extend(norm_failures)
    logger.info(f"  {len(records)} valid records, {len(norm_failures)} failed")

    # ── Step 3: Upsert knowledge_entries ──────────────────────────────────────
    logger.info("Step 3/5 — Upserting knowledge entries to Supabase...")
    entry_id_map: dict[str, str] = {}  # measure_id_num → DB UUID

    for record in records:
        entry_uuid = upsert_knowledge_entry(db, record)
        if entry_uuid:
            entry_id_map[record.measure_id_num] = entry_uuid
            summary["rows_inserted"] += 1
        else:
            summary["rows_failed"] += 1
            summary["failures"].append({
                "measure_id_num": record.measure_id_num,
                "error": "upsert_knowledge_entry returned None",
            })

    logger.info(f"  {summary['rows_inserted']} entries upserted")

    # ── Step 4: Build embedding inputs ────────────────────────────────────────
    logger.info("Step 4/5 — Generating embeddings...")
    embedding_inputs: list[EmbeddingInput] = []

    for record in records:
        entry_uuid = entry_id_map.get(record.measure_id_num)
        if not entry_uuid:
            continue  # skip if upsert failed above

        # English embedding
        if record.embedding_text_en.strip():
            embedding_inputs.append(EmbeddingInput(
                entry_id=entry_uuid,
                lang="en",
                text=record.embedding_text_en,
            ))

        # Chinese embedding
        if record.embedding_text_zh.strip():
            embedding_inputs.append(EmbeddingInput(
                entry_id=entry_uuid,
                lang="zh",
                text=record.embedding_text_zh,
            ))

    logger.info(f"  {len(embedding_inputs)} embedding inputs prepared")

    # ── Step 5: Embed and upsert ──────────────────────────────────────────────
    logger.info("Step 5/5 — Calling OpenAI and upserting embeddings...")
    embed_results, embed_failures = generate_embeddings(
        inputs=embedding_inputs,
        batch_size=settings.ingestion_batch_size,
    )

    embed_ok = 0
    embed_fail = 0
    for result in embed_results:
        success = upsert_embedding(db, result)
        if success:
            embed_ok += 1
        else:
            embed_fail += 1

    summary["embed_failed"] = embed_fail + len(embed_failures)
    logger.info(f"  {embed_ok} embeddings stored, {summary['embed_failed']} failed")

    # ── Log run ───────────────────────────────────────────────────────────────
    log_ingestion_run(
        db=db,
        filename=filepath.name,
        rows_processed=summary["rows_processed"],
        rows_inserted=summary["rows_inserted"],
        rows_updated=summary["rows_updated"],
        rows_failed=summary["rows_failed"],
        error_details=summary["failures"][:50],  # cap log size
    )

    elapsed = time.time() - start_time
    logger.info(f"━━━ Ingestion complete in {elapsed:.1f}s ━━━")
    logger.info(
        f"  Processed: {summary['rows_processed']} | "
        f"Inserted: {summary['rows_inserted']} | "
        f"Failed: {summary['rows_failed']} | "
        f"Embed failed: {summary['embed_failed']}"
    )

    return summary


# ── CLI entry point ───────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="EQAI Knowledge Base Ingestion Pipeline",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python -m ingestion.pipeline --file data/raw/测评总览.xlsx
  python -m ingestion.pipeline --file data/raw/测评总览.csv
        """
    )
    parser.add_argument(
        "--file",
        required=True,
        help="Path to the dataset file (.xlsx or .csv)",
    )
    args = parser.parse_args()

    summary = run_ingestion(args.file)

    if summary["rows_failed"] > 0:
        logger.warning(f"{summary['rows_failed']} rows failed — check logs above")
        sys.exit(1)

    sys.exit(0)


if __name__ == "__main__":
    main()
