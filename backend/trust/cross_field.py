"""
Trust Layer — Cross-Field Verification

Validates that amount, currency, and reference ID all agree across
bank statement, ledger, and settlement record. A single-field match
is flagged as PARTIAL_MATCH_SUSPICIOUS.

Fraud vector defended: Amount-only match accepting tampered records.
"""
from __future__ import annotations
from typing import List, Optional

from config import ReasonCode, AMOUNT_TOLERANCE_PAISE
from trust.exceptions import ExceptionLogger


def verify_cross_fields(
    record_a: dict,
    record_b: dict,
    source_a: str,
    source_b: str,
    exception_logger: ExceptionLogger,
    amount_tolerance: int = AMOUNT_TOLERANCE_PAISE,
) -> dict:
    """
    Verify that key fields agree between two records from different sources.
    
    Checks: amount, currency, and reference/UTR.
    
    Returns:
        {
            "all_match": bool,
            "amount_match": bool,
            "currency_match": bool,
            "reference_match": bool,
            "matched_fields": list[str],
            "mismatched_fields": list[str],
        }
    """
    result = {
        "all_match": False,
        "amount_match": False,
        "currency_match": False,
        "reference_match": False,
        "matched_fields": [],
        "mismatched_fields": [],
    }

    # --- Amount check ---
    amount_a = _extract_amount(record_a)
    amount_b = _extract_amount(record_b)
    if amount_a is not None and amount_b is not None:
        if abs(amount_a - amount_b) <= amount_tolerance:
            result["amount_match"] = True
            result["matched_fields"].append("amount")
        else:
            result["mismatched_fields"].append("amount")
            exception_logger.log(
                record_id=_get_id(record_a),
                source=source_a,
                reason_code=ReasonCode.AMOUNT_MISMATCH,
                details=f"Amount mismatch: {source_a}={amount_a} vs {source_b}={amount_b} "
                        f"(tolerance={amount_tolerance} paise)",
                severity="HIGH",
                related_record_id=_get_id(record_b),
            )

    # --- Currency check ---
    curr_a = record_a.get("currency", "INR")
    curr_b = record_b.get("currency", "INR")
    if curr_a == curr_b:
        result["currency_match"] = True
        result["matched_fields"].append("currency")
    else:
        result["mismatched_fields"].append("currency")
        exception_logger.log(
            record_id=_get_id(record_a),
            source=source_a,
            reason_code=ReasonCode.CURRENCY_MISMATCH,
            details=f"Currency mismatch: {source_a}={curr_a} vs {source_b}={curr_b}",
            severity="HIGH",
            related_record_id=_get_id(record_b),
        )

    # --- Reference / UTR check ---
    ref_a = _extract_reference(record_a)
    ref_b = _extract_reference(record_b)
    if ref_a and ref_b:
        if ref_a == ref_b:
            result["reference_match"] = True
            result["matched_fields"].append("reference")
        else:
            result["mismatched_fields"].append("reference")
    elif not ref_a or not ref_b:
        # One side missing reference — flag but don't hard-fail
        result["mismatched_fields"].append("reference")
        missing_source = source_a if not ref_a else source_b
        missing_id = _get_id(record_a) if not ref_a else _get_id(record_b)
        exception_logger.log(
            record_id=missing_id,
            source=missing_source,
            reason_code=ReasonCode.REF_MISSING,
            details=f"Reference/UTR missing on {missing_source} record",
            severity="MEDIUM",
        )

    # --- Partial match warning ---
    matches = len(result["matched_fields"])
    if 0 < matches < 3:
        # Some fields match but not all — suspicious
        exception_logger.log(
            record_id=_get_id(record_a),
            source=source_a,
            reason_code=ReasonCode.PARTIAL_MATCH,
            details=f"Partial match ({matches}/3 fields): "
                    f"matched={result['matched_fields']}, "
                    f"mismatched={result['mismatched_fields']}",
            severity="MEDIUM",
            related_record_id=_get_id(record_b),
        )

    result["all_match"] = (
        result["amount_match"]
        and result["currency_match"]
        and result["reference_match"]
    )

    return result


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _extract_amount(record: dict) -> Optional[int]:
    """Extract amount from a record, handling different field names."""
    for key in ("amount", "credit", "taxable_value", "total"):
        val = record.get(key)
        if val is not None and val != 0:
            return int(val)
    return None


def _extract_reference(record: dict) -> str:
    """Extract reference/UTR from a record."""
    for key in ("utr", "reference", "settlement_id"):
        val = record.get(key, "")
        if val:
            return str(val)
    return ""


def _get_id(record: dict) -> str:
    """Extract the primary ID from a record."""
    for key in ("id", "entry_id", "invoice_id", "filing_id"):
        val = record.get(key, "")
        if val:
            return str(val)
    return "UNKNOWN"
