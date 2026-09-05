"""
Trust Layer — Exception Logger

Central exception registry. Every record that fails a trust/validation check
is logged here with a structured reason code. Nothing is silently dropped
or silently accepted.
"""
from __future__ import annotations
from typing import List, Optional
from datetime import datetime, timezone
import json

from backend.engine.models import ExceptionRecord


class ExceptionLogger:
    """
    Accumulates validation exceptions during a reconciliation run.
    
    Every module routes failed checks through this logger so the final
    report contains a complete audit trail of every rejected/flagged record.
    """

    def __init__(self):
        self._exceptions: List[ExceptionRecord] = []

    def log(
        self,
        record_id: str,
        source: str,
        reason_code: str,
        details: str = "",
        severity: str = "HIGH",
        related_record_id: str = "",
    ) -> ExceptionRecord:
        """Log a validation exception. Returns the created ExceptionRecord."""
        exc = ExceptionRecord(
            record_id=record_id,
            source=source,
            reason_code=reason_code,
            details=details,
            severity=severity,
            timestamp=datetime.now(timezone.utc).isoformat(),
            related_record_id=related_record_id,
        )
        self._exceptions.append(exc)
        return exc

    @property
    def exceptions(self) -> List[ExceptionRecord]:
        """Return all logged exceptions (read-only copy)."""
        return list(self._exceptions)

    @property
    def count(self) -> int:
        return len(self._exceptions)

    def get_by_reason(self, reason_code: str) -> List[ExceptionRecord]:
        """Filter exceptions by reason code."""
        return [e for e in self._exceptions if e.reason_code == reason_code]

    def get_by_record(self, record_id: str) -> List[ExceptionRecord]:
        """Get all exceptions for a specific record."""
        return [e for e in self._exceptions if e.record_id == record_id]

    def summary(self) -> dict:
        """Return a summary count by reason code."""
        counts: dict[str, int] = {}
        for exc in self._exceptions:
            counts[exc.reason_code] = counts.get(exc.reason_code, 0) + 1
        return {
            "total_exceptions": self.count,
            "by_reason_code": counts,
        }

    def to_list(self) -> List[dict]:
        return [e.to_dict() for e in self._exceptions]

    def clear(self):
        """Reset for a new run."""
        self._exceptions.clear()
