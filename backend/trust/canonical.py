"""
Trust Layer — Canonical Source Enforcement

Ensures that the internal ledger amount is the canonical source of truth.
External/client-supplied amounts never override the ledger amount without
an explicit reconciliation step.

Fraud vector defended: External amount override / man-in-the-middle tampering.
"""
from __future__ import annotations
from typing import Optional

from config import ReasonCode, AMOUNT_TOLERANCE_PAISE
from trust.exceptions import ExceptionLogger


def enforce_canonical_amount(
    ledger_amount: int,
    external_amount: int,
    record_id: str,
    external_source: str,
    exception_logger: ExceptionLogger,
    tolerance: int = AMOUNT_TOLERANCE_PAISE,
) -> dict:
    """
    Check that an external amount does not override the ledger amount.
    
    The ledger is always the canonical source. If an external source
    disagrees, the discrepancy is logged and the ledger amount is
    returned as authoritative.
    
    Returns:
        {
            "canonical_amount": int,     # Always the ledger amount
            "external_amount": int,
            "override_attempted": bool,  # True if amounts disagree
            "within_tolerance": bool,
        }
    """
    diff = abs(ledger_amount - external_amount)
    within_tolerance = diff <= tolerance
    override_attempted = not within_tolerance

    if override_attempted:
        exception_logger.log(
            record_id=record_id,
            source=external_source,
            reason_code=ReasonCode.CANONICAL_OVERRIDE,
            details=(
                f"External amount ({external_source}={external_amount}) differs from "
                f"canonical ledger amount ({ledger_amount}) by {diff} paise. "
                f"Ledger amount retained as authoritative."
            ),
            severity="HIGH",
        )

    return {
        "canonical_amount": ledger_amount,
        "external_amount": external_amount,
        "override_attempted": override_attempted,
        "within_tolerance": within_tolerance,
    }


def verify_canonical_batch(
    ledger_entries: list[dict],
    external_records: list[dict],
    match_key: str,
    exception_logger: ExceptionLogger,
    tolerance: int = AMOUNT_TOLERANCE_PAISE,
) -> list[dict]:
    """
    Batch-verify that external records don't override ledger amounts.
    
    Args:
        ledger_entries: List of ledger records (canonical source)
        external_records: List of external records to verify against
        match_key: Field name to join on (e.g., "payment_id")
        
    Returns:
        List of verification results for each matched pair
    """
    # Build ledger lookup
    ledger_lookup = {}
    for entry in ledger_entries:
        key = entry.get(match_key, "")
        if key:
            ledger_lookup[key] = entry

    results = []
    for ext_record in external_records:
        key = ext_record.get(match_key, "")
        if key and key in ledger_lookup:
            ledger = ledger_lookup[key]
            ledger_amount = ledger.get("amount", 0)
            ext_amount: int = ext_record.get("amount", ext_record.get("credit", 0)) or 0

            result = enforce_canonical_amount(
                ledger_amount=ledger_amount,
                external_amount=ext_amount,
                record_id=key,
                external_source="external",
                exception_logger=exception_logger,
                tolerance=tolerance,
            )
            result["match_key"] = key
            results.append(result)

    return results
