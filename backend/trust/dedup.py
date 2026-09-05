"""
Trust Layer — Deduplication Checker

Flags repeated transaction/settlement IDs instead of silently double-counting.
Simulates defense against webhook replay attacks.

Fraud vector defended: Webhook replay attacks / duplicate settlement injection.
"""
from __future__ import annotations
from typing import Tuple, Set

from config import ReasonCode
from trust.exceptions import ExceptionLogger


class DeduplicationChecker:
    """
    Maintains a seen-ID registry and flags repeated IDs.
    
    In production this would be backed by Redis or a database;
    for the demo we use an in-memory set.
    """

    def __init__(self):
        self._seen_ids: Set[str] = set()

    def check_and_register(
        self,
        record_id: str,
        source: str,
        exception_logger: ExceptionLogger,
    ) -> bool:
        """
        Check if a record ID has been seen before.
        
        Returns:
            True if this is the first time (unique), False if duplicate.
        """
        if record_id in self._seen_ids:
            exception_logger.log(
                record_id=record_id,
                source=source,
                reason_code=ReasonCode.DUPLICATE_ID,
                details=f"Duplicate {source} ID detected — possible replay attack. "
                        f"ID '{record_id}' has already been processed.",
                severity="HIGH",
            )
            return False

        self._seen_ids.add(record_id)
        return True

    def check_batch(
        self,
        records: list[dict],
        id_field: str,
        source: str,
        exception_logger: ExceptionLogger,
    ) -> Tuple[list[dict], list[dict]]:
        """
        Check a batch of records for duplicates.
        
        Returns:
            (unique_records, duplicate_records)
        """
        unique = []
        duplicates = []

        for record in records:
            record_id = record.get(id_field, "UNKNOWN")
            if self.check_and_register(record_id, source, exception_logger):
                unique.append(record)
            else:
                duplicates.append(record)

        return unique, duplicates

    @property
    def seen_count(self) -> int:
        return len(self._seen_ids)

    def reset(self):
        """Clear the registry for a fresh run."""
        self._seen_ids.clear()
