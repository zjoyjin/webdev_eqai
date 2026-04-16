"""
dataset_loader.py — Load and parse the EQAI measurement dataset.

Handles the specific multi-row header structure of 测评总览.xlsx / .csv:
  - Rows 0-6: display headers (skipped)
  - Row 7   : actual variable names  ← header row
  - Row 8+  : data records

Key quirk: measure_define (item definitions) is only populated on the first
dimension row of each measure group. We forward-fill it to all sibling rows.
"""

import logging
from pathlib import Path
from typing import Union

import pandas as pd

logger = logging.getLogger(__name__)

# ── Column mapping: raw dataset names → clean internal names ──────────────────
COLUMN_MAP = {
    "Variables":          "scheduled",
    "module":             "module_cn",
    "module_code":        "module_code",
    "measuregroup_en":    "measure_name_en",
    "measuregroup_cn":    "measure_name_cn",
    "measuregroup_title": "measuregroup_title",
    "measuregroup_code":  "measuregroup_code",
    "measure":            "dimension_cn",
    "measure_code":       "dimension_code",
    "measure_define":     "item_definition",
    "popul":              "population",
    "popul_code":         "population_code",
    "lan":                "language",
    "lan_code":           "language_code",
    "source":             "source_type",
    "source_code":        "source_code",
    "version":            "version",
    "measure_id":         "measure_id_text",
    "measure_id_num":     "measure_id_num",
    "data_available":     "data_available",
    "data_source":        "source_reference",
    # Status columns — kept for reference but not stored in main schema
    "status_assigned":    "status_assigned",
    "status_itemtran":    "status_itemtran",
    "status_EFAdatanal":  "status_efa",
    "status_CFAdatanal":  "status_cfa",
    "status_finalscore_long": "status_finalscore",
    "status_mlanal":      "status_ml",
}

# Module CN → EN lookup (derived from domain knowledge)
MODULE_EN_MAP = {
    "身心健康":   "Mental Health",
    "能力与发展": "Ability & Development",
    "家长参与":   "Parent Involvement",
}

# Number of header rows to skip before the actual column names row
HEADER_SKIP_ROWS = 7


def load_dataset(filepath: Union[str, Path]) -> pd.DataFrame:
    """
    Load the EQAI measurement dataset from Excel or CSV.

    Returns a cleaned DataFrame with one row per measurement dimension,
    with all columns renamed to internal snake_case names.

    Args:
        filepath: Path to .xlsx or .csv file.

    Returns:
        pd.DataFrame with cleaned, validated records.

    Raises:
        ValueError: If file format is unsupported or required columns missing.
        FileNotFoundError: If file does not exist.
    """
    filepath = Path(filepath)
    if not filepath.exists():
        raise FileNotFoundError(f"Dataset not found: {filepath}")

    logger.info(f"Loading dataset from: {filepath.name}")

    # ── Read file ─────────────────────────────────────────────────────────────
    ext = filepath.suffix.lower()
    if ext in (".xlsx", ".xls"):
        df = pd.read_excel(
            filepath,
            skiprows=HEADER_SKIP_ROWS,
            header=0,
            dtype=str,          # read everything as string first; cast later
            engine="openpyxl",
        )
    elif ext == ".csv":
        df = pd.read_csv(
            filepath,
            skiprows=HEADER_SKIP_ROWS,
            header=0,
            dtype=str,
            encoding="utf-8-sig",   # handles BOM from Excel-exported CSVs
            on_bad_lines="skip",    # skip malformed rows (multi-line cells)
        )
    else:
        raise ValueError(f"Unsupported file type: {ext}. Use .xlsx or .csv")

    logger.info(f"Raw shape after load: {df.shape}")

    # ── Drop fully empty rows ─────────────────────────────────────────────────
    df.dropna(how="all", inplace=True)
    df.reset_index(drop=True, inplace=True)

    # ── Rename columns ────────────────────────────────────────────────────────
    # Only rename columns that exist in the file (handles version differences)
    existing_map = {k: v for k, v in COLUMN_MAP.items() if k in df.columns}
    df.rename(columns=existing_map, inplace=True)

    _validate_required_columns(df)

    # ── Forward-fill item_definition within each measure group ───────────────
    # measure_define is only written on the first dimension row per group.
    # Forward-fill within each measuregroup_code so all siblings share it.
    if "item_definition" in df.columns and "measuregroup_code" in df.columns:
        df["item_definition"] = (
            df.groupby("measuregroup_code", sort=False)["item_definition"]
            .transform(lambda s: s.replace("", pd.NA).ffill())
        )

    # ── Type coercions ────────────────────────────────────────────────────────
    df = _coerce_types(df)

    # ── Derived fields ────────────────────────────────────────────────────────
    df["module_en"] = df["module_cn"].map(MODULE_EN_MAP).fillna("")

    # ── Filter: only include scheduled=TRUE rows ──────────────────────────────
    # Rows marked FALSE are not ready for April launch
    if "scheduled" in df.columns:
        before = len(df)
        df = df[df["scheduled"] == True].copy()  # noqa: E712
        logger.info(f"Filtered to scheduled=TRUE: {before} → {len(df)} rows")

    df.reset_index(drop=True, inplace=True)
    logger.info(f"Final clean shape: {df.shape}")
    return df


# ── Private helpers ───────────────────────────────────────────────────────────

def _validate_required_columns(df: pd.DataFrame) -> None:
    """Raise ValueError if essential columns are missing."""
    required = {"measure_id_num", "measure_name_en", "module_cn", "dimension_cn"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(
            f"Dataset is missing required columns: {missing}\n"
            f"Found columns: {list(df.columns)}"
        )


def _coerce_types(df: pd.DataFrame) -> pd.DataFrame:
    """Convert string representations to proper Python types."""

    # Boolean: scheduled, data_available
    for col in ("scheduled", "data_available"):
        if col in df.columns:
            df[col] = df[col].str.upper().map(
                {"TRUE": True, "FALSE": False, "YES": True, "NO": False}
            )

    # Integer: module_code, population_code, language_code, source_code
    for col in ("module_code", "population_code", "language_code", "source_code"):
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").astype("Int64")

    # Strip whitespace from all text columns
    str_cols = df.select_dtypes(include="object").columns
    for col in str_cols:
        df[col] = df[col].str.strip().replace("", pd.NA)

    return df
