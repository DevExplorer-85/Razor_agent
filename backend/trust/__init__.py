"""
Trust Layer — Pipeline Orchestrator

Provides a single entry point that runs all trust checks in sequence:
  1. Signature verification
  2. Deduplication
  3. Cross-field verification
  4. Canonical source enforcement

Every module calls trust.validate() before treating data as fact.
"""
from __future__ import annotations
from typing import Tuple

from trust.exceptions import ExceptionLogger
from trust.signature import validate_settlement_signatures
from trust.dedup import DeduplicationChecker
from trust.cross_field import verify_cross_fields
from trust.canonical import enforce_canonical_amount
from config import WEBHOOK_SECRET


class TrustValidator:
    """
    Unified trust/validation pipeline.
    
    Instantiate once per reconciliation run. Accumulates all exceptions
    in a shared ExceptionLogger that feeds into the final report.
    """

    def __init__(self, webhook_secret: str = WEBHOOK_SECRET):
        self.exception_logger = ExceptionLogger()
        self.dedup_checker = DeduplicationChecker()
        self.webhook_secret = webhook_secret

        # Counters for the trust dashboard
        self.stats = {
            "signatures_checked": 0,
            "signatures_valid": 0,
            "signatures_invalid": 0,
            "duplicates_found": 0,
            "records_deduplicated": 0,
            "cross_field_checks": 0,
            "cross_field_passed": 0,
            "cross_field_failed": 0,
            "canonical_checks": 0,
            "canonical_overrides_blocked": 0,
        }

    def validate_signatures(self, settlements: list[dict]) -> Tuple[list[dict], list[dict]]:
        """Step 1: Verify webhook signatures."""
        valid, invalid = validate_settlement_signatures(
            settlements, self.exception_logger, self.webhook_secret
        )
        self.stats["signatures_checked"] += len(settlements)
        self.stats["signatures_valid"] += len(valid)
        self.stats["signatures_invalid"] += len(invalid)
        return valid, invalid

    def deduplicate(
        self, records: list[dict], id_field: str, source: str
    ) -> Tuple[list[dict], list[dict]]:
        """Step 2: Remove duplicate IDs."""
        unique, dupes = self.dedup_checker.check_batch(
            records, id_field, source, self.exception_logger
        )
        self.stats["records_deduplicated"] += len(records)
        self.stats["duplicates_found"] += len(dupes)
        return unique, dupes

    def cross_field_verify(
        self,
        record_a: dict,
        record_b: dict,
        source_a: str,
        source_b: str,
    ) -> dict:
        """Step 3: Cross-field agreement check."""
        result = verify_cross_fields(
            record_a, record_b, source_a, source_b, self.exception_logger
        )
        self.stats["cross_field_checks"] += 1
        if result["all_match"]:
            self.stats["cross_field_passed"] += 1
        else:
            self.stats["cross_field_failed"] += 1
        return result

    def enforce_canonical(
        self,
        ledger_amount: int,
        external_amount: int,
        record_id: str,
        external_source: str,
    ) -> dict:
        """Step 4: Canonical source enforcement."""
        result = enforce_canonical_amount(
            ledger_amount, external_amount, record_id,
            external_source, self.exception_logger
        )
        self.stats["canonical_checks"] += 1
        if result["override_attempted"]:
            self.stats["canonical_overrides_blocked"] += 1
        return result

    def get_summary(self) -> dict:
        """Return trust layer summary for the dashboard."""
        return {
            **self.stats,
            "total_exceptions": self.exception_logger.count,
            "exceptions_by_reason": self.exception_logger.summary()["by_reason_code"],
        }

    def reset(self):
        """Reset for a fresh run."""
        self.exception_logger.clear()
        self.dedup_checker.reset()
        self.stats = {k: 0 for k in self.stats}
