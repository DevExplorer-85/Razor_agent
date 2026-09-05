"""
Module 1: Reconciliation Engine — Matcher

Two-pass matching engine:
  Pass 1: Exact match on UTR/reference + amount + currency (all three must agree)
  Pass 2: Fuzzy match for remaining unmatched records (date proximity,
           partial reference strings, amount tolerance)

This engine is reusable — Module 4 (Tax-Line Matcher) calls it with
GST-specific field mappings.
"""
from __future__ import annotations
from typing import List, Tuple, Optional, Callable
from datetime import datetime, timedelta

try:
    from backend.config import (
        AMOUNT_TOLERANCE_PAISE,
        DATE_TOLERANCE_DAYS,
        FUZZY_MATCH_THRESHOLD,
        FUZZY_REF_THRESHOLD,
        MatchType,
    )
    from backend.engine.models import MatchResult
except ImportError:
    import importlib
    _cfg = importlib.import_module("backend.config")
    AMOUNT_TOLERANCE_PAISE = _cfg.AMOUNT_TOLERANCE_PAISE
    DATE_TOLERANCE_DAYS = _cfg.DATE_TOLERANCE_DAYS
    FUZZY_MATCH_THRESHOLD = _cfg.FUZZY_MATCH_THRESHOLD
    FUZZY_REF_THRESHOLD = _cfg.FUZZY_REF_THRESHOLD
    MatchType = _cfg.MatchType
    _models = importlib.import_module("backend.engine.models")
    MatchResult = _models.MatchResult

# Try to import thefuzz; fall back to simple ratio if unavailable
try:
    # pyrefly: ignore [missing-import]
    from thefuzz import fuzz
    HAS_FUZZ = True
except ImportError:
    HAS_FUZZ = False


def _simple_ratio(a: str, b: str) -> int:
    """Fallback similarity ratio when thefuzz is not installed."""
    if not a or not b:
        return 0
    a, b = a.lower(), b.lower()
    if a == b:
        return 100
    # Simple overlap ratio
    shorter, longer = (a, b) if len(a) <= len(b) else (b, a)
    if shorter in longer:
        return int(100 * len(shorter) / len(longer))
    common = sum(1 for c in shorter if c in longer)
    return int(100 * common / max(len(longer), 1))


def string_similarity(a: str, b: str) -> int:
    """Return similarity score 0-100 between two strings."""
    if HAS_FUZZ:
        return fuzz.ratio(a, b)
    return _simple_ratio(a, b)


# ---------------------------------------------------------------------------
# Field Extractors (configurable per use-case)
# ---------------------------------------------------------------------------

class FieldExtractor:
    """
    Defines how to extract matching fields from a record dict.
    Override for different source types (settlements, invoices, etc.)
    """
    def __init__(
        self,
        id_field: str = "id",
        amount_field: str = "amount",
        currency_field: str = "currency",
        reference_field: str = "utr",
        date_field: str = "created_at",
        date_format: str = "timestamp",  # "timestamp" or "iso"
    ):
        self.id_field = id_field
        self.amount_field = amount_field
        self.currency_field = currency_field
        self.reference_field = reference_field
        self.date_field = date_field
        self.date_format = date_format

    def get_id(self, record: dict) -> str:
        return str(record.get(self.id_field, ""))

    def get_amount(self, record: dict) -> int:
        return int(record.get(self.amount_field, 0))

    def get_currency(self, record: dict) -> str:
        return record.get(self.currency_field, "INR")

    def get_reference(self, record: dict) -> str:
        return str(record.get(self.reference_field, ""))

    def get_date(self, record: dict) -> Optional[datetime]:
        val = record.get(self.date_field)
        if val is None:
            return None
        if self.date_format == "timestamp":
            try:
                return datetime.fromtimestamp(int(val))
            except (ValueError, TypeError, OSError):
                return None
        else:  # ISO format
            try:
                return datetime.fromisoformat(str(val))
            except ValueError:
                return None


# ---------------------------------------------------------------------------
# Default extractors for each source type
# ---------------------------------------------------------------------------

SETTLEMENT_EXTRACTOR = FieldExtractor(
    id_field="id", amount_field="amount", currency_field="currency",
    reference_field="utr", date_field="created_at", date_format="timestamp",
)

BANK_EXTRACTOR = FieldExtractor(
    id_field="utr", amount_field="credit", currency_field="currency",
    reference_field="utr", date_field="date", date_format="iso",
)

LEDGER_EXTRACTOR = FieldExtractor(
    id_field="entry_id", amount_field="amount", currency_field="currency",
    reference_field="payment_id", date_field="date", date_format="iso",
)

INVOICE_EXTRACTOR = FieldExtractor(
    id_field="invoice_id", amount_field="taxable_value", currency_field="currency",
    reference_field="invoice_id", date_field="date", date_format="iso",
)

GST_FILING_EXTRACTOR = FieldExtractor(
    id_field="filing_id", amount_field="taxable_value", currency_field="currency",
    reference_field="invoice_number", date_field="invoice_date", date_format="iso",
)


# ---------------------------------------------------------------------------
# Matching Engine
# ---------------------------------------------------------------------------

def exact_match(
    records_a: list[dict],
    records_b: list[dict],
    extractor_a: FieldExtractor,
    extractor_b: FieldExtractor,
    source_a: str,
    source_b: str,
) -> Tuple[List[MatchResult], list[dict], list[dict]]:
    """
    Pass 1: Exact matching.
    
    Requires ALL three fields to match: reference + amount + currency.
    
    Returns:
        (matches, unmatched_a, unmatched_b)
    """
    matches = []
    used_b_indices = set()
    unmatched_a_indices = []

    for i, rec_a in enumerate(records_a):
        ref_a = extractor_a.get_reference(rec_a)
        amt_a = extractor_a.get_amount(rec_a)
        cur_a = extractor_a.get_currency(rec_a)
        found = False

        if not ref_a:
            unmatched_a_indices.append(i)
            continue

        for j, rec_b in enumerate(records_b):
            if j in used_b_indices:
                continue

            ref_b = extractor_b.get_reference(rec_b)
            amt_b = extractor_b.get_amount(rec_b)
            cur_b = extractor_b.get_currency(rec_b)

            if ref_a == ref_b and amt_a == amt_b and cur_a == cur_b:
                match = MatchResult(
                    record_a_id=extractor_a.get_id(rec_a),
                    record_a_source=source_a,
                    record_b_id=extractor_b.get_id(rec_b),
                    record_b_source=source_b,
                    match_type=MatchType.EXACT,
                    confidence=1.0,
                    matched_fields=["reference", "amount", "currency"],
                    notes="Exact match on all three fields",
                )
                matches.append(match)
                used_b_indices.add(j)
                found = True
                break

        if not found:
            unmatched_a_indices.append(i)

    unmatched_a = [records_a[i] for i in unmatched_a_indices]
    unmatched_b = [records_b[j] for j in range(len(records_b)) if j not in used_b_indices]

    return matches, unmatched_a, unmatched_b


def fuzzy_match(
    records_a: list[dict],
    records_b: list[dict],
    extractor_a: FieldExtractor,
    extractor_b: FieldExtractor,
    source_a: str,
    source_b: str,
    amount_tolerance: int = AMOUNT_TOLERANCE_PAISE,
    date_tolerance_days: int = DATE_TOLERANCE_DAYS,
    ref_threshold: int = FUZZY_REF_THRESHOLD,
) -> Tuple[List[MatchResult], list[dict], list[dict]]:
    """
    Pass 2: Fuzzy matching for remaining unmatched records.
    
    Considers:
    - Amount within tolerance (±₹1 default)
    - Date proximity (±3 days default)
    - Partial reference string matching (Levenshtein)
    
    Returns:
        (matches, still_unmatched_a, still_unmatched_b)
    """
    matches = []
    used_b_indices = set()
    unmatched_a_indices = []

    for i, rec_a in enumerate(records_a):
        amt_a = extractor_a.get_amount(rec_a)
        date_a = extractor_a.get_date(rec_a)
        ref_a = extractor_a.get_reference(rec_a)

        best_score = 0.0
        best_j = -1
        best_fields = []
        best_notes = ""

        for j, rec_b in enumerate(records_b):
            if j in used_b_indices:
                continue

            score = 0.0
            fields = []
            notes_parts = []

            # Amount proximity
            amt_b = extractor_b.get_amount(rec_b)
            amt_diff = abs(amt_a - amt_b) if amt_a and amt_b else float("inf")
            if amt_diff <= amount_tolerance:
                score += 0.4
                fields.append("amount")
                if amt_diff > 0:
                    notes_parts.append(f"amount diff: {amt_diff} paise")

            # Date proximity
            date_b = extractor_b.get_date(rec_b)
            if date_a and date_b:
                day_diff = abs((date_a - date_b).days)
                if day_diff <= date_tolerance_days:
                    score += 0.3
                    fields.append("date")
                    if day_diff > 0:
                        notes_parts.append(f"date diff: {day_diff} days")

            # Reference similarity
            ref_b = extractor_b.get_reference(rec_b)
            if ref_a and ref_b:
                ref_score = string_similarity(ref_a, ref_b)
                if ref_score >= ref_threshold:
                    score += 0.3 * (ref_score / 100)
                    fields.append("reference")
                    notes_parts.append(f"ref similarity: {ref_score}%")

            if score > best_score and len(fields) >= 2:
                best_score = score
                best_j = j
                best_fields = fields
                best_notes = "; ".join(notes_parts)

        if best_j >= 0 and best_score >= 0.5:
            match = MatchResult(
                record_a_id=extractor_a.get_id(rec_a),
                record_a_source=source_a,
                record_b_id=extractor_b.get_id(records_b[best_j]),
                record_b_source=source_b,
                match_type=MatchType.FUZZY,
                confidence=round(best_score, 3),
                matched_fields=best_fields,
                notes=f"Fuzzy match: {best_notes}",
            )
            matches.append(match)
            used_b_indices.add(best_j)
        else:
            unmatched_a_indices.append(i)

    still_unmatched_a = [records_a[i] for i in unmatched_a_indices]
    still_unmatched_b = [records_b[j] for j in range(len(records_b)) if j not in used_b_indices]

    return matches, still_unmatched_a, still_unmatched_b


def two_pass_match(
    records_a: list[dict],
    records_b: list[dict],
    extractor_a: FieldExtractor,
    extractor_b: FieldExtractor,
    source_a: str,
    source_b: str,
    **fuzzy_kwargs,
) -> Tuple[List[MatchResult], list[dict], list[dict]]:
    """
    Full two-pass matching: exact first, then fuzzy on remainder.
    
    Returns:
        (all_matches, final_unmatched_a, final_unmatched_b)
    """
    # Pass 1: Exact
    exact_matches, unmatched_a, unmatched_b = exact_match(
        records_a, records_b, extractor_a, extractor_b, source_a, source_b
    )

    # Pass 2: Fuzzy on remainder
    fuzzy_matches, final_unmatched_a, final_unmatched_b = fuzzy_match(
        unmatched_a, unmatched_b, extractor_a, extractor_b,
        source_a, source_b, **fuzzy_kwargs
    )

    all_matches = exact_matches + fuzzy_matches
    return all_matches, final_unmatched_a, final_unmatched_b
