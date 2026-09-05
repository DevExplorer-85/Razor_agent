"""
Module 1: Reconciliation Engine — Orchestrator

Pipeline: Load data → Trust validation → Two-pass matching → Report

This is the core of the Finance Controller Agent. Its structured JSON
output is consumed by Modules 2 (Q&A), 3 (Forecast), and 4 (Tax).
"""
from __future__ import annotations
import json
import csv
from pathlib import Path
from datetime import datetime
from typing import List

import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent
if backend_dir.name != "backend":
    backend_dir = backend_dir.parent
project_root = backend_dir.parent
for p in (str(project_root), str(backend_dir)):
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from backend.config import DATA_DIR, OUTPUT_DIR, RECONCILIATION_OUTPUT, ReasonCode
    from backend.engine.models import MatchResult, ExceptionRecord, ReconciliationReport
    from backend.engine.matcher import (
        two_pass_match,
        SETTLEMENT_EXTRACTOR, BANK_EXTRACTOR, LEDGER_EXTRACTOR,
        FieldExtractor,
    )
    from backend.trust import TrustValidator
except ImportError:
    import importlib
    _cfg = importlib.import_module("backend.config")
    DATA_DIR, OUTPUT_DIR, RECONCILIATION_OUTPUT, ReasonCode = _cfg.DATA_DIR, _cfg.OUTPUT_DIR, _cfg.RECONCILIATION_OUTPUT, _cfg.ReasonCode
    _models = importlib.import_module("backend.engine.models")
    MatchResult = _models.MatchResult
    ExceptionRecord = _models.ExceptionRecord
    ReconciliationReport = _models.ReconciliationReport
    _matcher = importlib.import_module("backend.engine.matcher")
    two_pass_match = _matcher.two_pass_match
    SETTLEMENT_EXTRACTOR = _matcher.SETTLEMENT_EXTRACTOR
    BANK_EXTRACTOR = _matcher.BANK_EXTRACTOR
    LEDGER_EXTRACTOR = _matcher.LEDGER_EXTRACTOR
    FieldExtractor = _matcher.FieldExtractor
    _trust = importlib.import_module("backend.trust")
    TrustValidator = _trust.TrustValidator



def load_json(filepath: Path) -> list[dict]:
    with open(filepath, "r") as f:
        return json.load(f)


def load_csv(filepath: Path) -> list[dict]:
    with open(filepath, "r", newline="") as f:
        reader = csv.DictReader(f)
        rows = []
        for row in reader:
            # Convert numeric fields
            for key in ("credit", "debit", "balance", "amount",
                        "taxable_value", "cgst", "sgst", "igst", "total",
                        "fee", "tax", "fees"):
                if key in row and row[key]:
                    try:
                        row[key] = int(float(row[key]))
                    except (ValueError, TypeError):
                        pass
            rows.append(row)
        return rows


class ReconciliationEngine:
    """
    Orchestrates the full reconciliation pipeline.
    
    1. Load all data sources
    2. Run trust validation (signature → dedup → cross-field → canonical)
    3. Match settlements ↔ bank statements (two-pass)
    4. Cross-reference with ledger entries
    5. Compile structured ReconciliationReport
    """

    def __init__(self, data_dir: Path = DATA_DIR):
        self.data_dir = data_dir
        self.trust = TrustValidator()
        self.report: ReconciliationReport | None = None

    def run(self) -> ReconciliationReport:
        """Execute the full reconciliation pipeline."""
        # ------------------------------------------------------------------
        # Step 1: Load data
        # ------------------------------------------------------------------
        settlements = load_json(self.data_dir / "razorpay_settlements.json")
        payments = load_json(self.data_dir / "razorpay_payments.json")
        bank_entries = load_csv(self.data_dir / "bank_statements.csv")
        ledger_entries = load_csv(self.data_dir / "ledger_entries.csv")

        total_settlements_loaded = len(settlements)
        total_bank_loaded = len(bank_entries)
        total_ledger_loaded = len(ledger_entries)

        # ------------------------------------------------------------------
        # Step 2: Trust validation
        # ------------------------------------------------------------------
        # 2a. Signature verification on settlements
        valid_settlements, invalid_settlements = self.trust.validate_signatures(
            settlements
        )

        # 2b. Deduplication on settlements
        unique_settlements, dup_settlements = self.trust.deduplicate(
            valid_settlements, "id", "settlement"
        )

        # 2c. Deduplication on bank entries (by UTR)
        unique_bank, dup_bank = self.trust.deduplicate(
            bank_entries, "utr", "bank_statement"
        )

        # 2d. Cross-field verification (settlement ↔ bank for matching pairs)
        # This happens during matching below

        # ------------------------------------------------------------------
        # Step 3: Match settlements ↔ bank statements
        # ------------------------------------------------------------------
        # Build settlement lookup keyed by UTR for bank matching
        settlement_bank_extractor = FieldExtractor(
            id_field="id", amount_field="amount", currency_field="currency",
            reference_field="utr", date_field="created_at", date_format="timestamp",
        )
        bank_extractor = FieldExtractor(
            id_field="utr", amount_field="credit", currency_field="currency",
            reference_field="utr", date_field="date", date_format="iso",
        )

        # Net amount for settlement = amount - fees - tax
        settlements_for_matching = []
        for s in unique_settlements:
            s_copy = dict(s)
            s_copy["net_amount"] = s["amount"] - s.get("fees", 0) - s.get("tax", 0)
            settlements_for_matching.append(s_copy)

        # Use net_amount for matching against bank credits
        net_extractor = FieldExtractor(
            id_field="id", amount_field="net_amount", currency_field="currency",
            reference_field="utr", date_field="created_at", date_format="timestamp",
        )

        all_matches, unmatched_settlements, unmatched_bank = two_pass_match(
            settlements_for_matching,
            unique_bank,
            net_extractor,
            bank_extractor,
            "settlement",
            "bank_statement",
        )

        # ------------------------------------------------------------------
        # Step 4: Cross-field verification on matched pairs
        # ------------------------------------------------------------------
        verified_matches = []
        for match in all_matches:
            # Find the original records
            setl_rec = next(
                (s for s in settlements_for_matching
                 if net_extractor.get_id(s) == match.record_a_id),
                None,
            )
            bank_rec = next(
                (b for b in unique_bank
                 if bank_extractor.get_id(b) == match.record_b_id),
                None,
            )
            if setl_rec and bank_rec:
                cross_result = self.trust.cross_field_verify(
                    setl_rec, bank_rec, "settlement", "bank_statement"
                )
                # Still keep the match but annotate if cross-field failed
                if not cross_result["all_match"]:
                    match.notes += f" | Cross-field issues: {cross_result['mismatched_fields']}"
                    match.confidence *= 0.7  # Reduce confidence

            verified_matches.append(match)

        # ------------------------------------------------------------------
        # Step 5: Canonical source check (ledger vs settlements)
        # ------------------------------------------------------------------
        # Group payments by settlement_id to compare totals
        setl_payment_totals = {}
        for pay in payments:
            sid = pay.get("settlement_id", "")
            if sid:
                setl_payment_totals[sid] = setl_payment_totals.get(sid, 0) + pay.get("amount", 0)

        for s in unique_settlements:
            sid = s["id"]
            if sid in setl_payment_totals:
                self.trust.enforce_canonical(
                    ledger_amount=setl_payment_totals[sid],
                    external_amount=s["amount"],
                    record_id=sid,
                    external_source="settlement",
                )

        # ------------------------------------------------------------------
        # Step 6: Log unmatched records as exceptions
        # ------------------------------------------------------------------
        for s in unmatched_settlements:
            self.trust.exception_logger.log(
                record_id=net_extractor.get_id(s),
                source="settlement",
                reason_code=ReasonCode.UNMATCHED,
                details="Settlement has no matching bank statement entry",
                severity="MEDIUM",
            )

        for b in unmatched_bank:
            self.trust.exception_logger.log(
                record_id=bank_extractor.get_id(b) or b.get("description", "UNKNOWN"),
                source="bank_statement",
                reason_code=ReasonCode.UNMATCHED,
                details="Bank entry has no matching settlement record",
                severity="MEDIUM",
            )

        # ------------------------------------------------------------------
        # Step 7: Compile report
        # ------------------------------------------------------------------
        total_matchable = total_settlements_loaded  # Base for match rate
        match_rate = (
            (len(verified_matches) / total_matchable * 100)
            if total_matchable > 0 else 0.0
        )

        self.report = ReconciliationReport(
            matched=verified_matches,
            unmatched_settlements=[
                net_extractor.get_id(s) for s in unmatched_settlements
            ],
            unmatched_bank=[
                bank_extractor.get_id(b) or b.get("description", "")
                for b in unmatched_bank
            ],
            unmatched_ledger=[],  # Ledger checked via canonical
            exceptions=self.trust.exception_logger.exceptions,
            match_rate=round(match_rate, 2),
            total_settlements=total_settlements_loaded,
            total_bank_entries=total_bank_loaded,
            total_ledger_entries=total_ledger_loaded,
            trust_summary=self.trust.get_summary(),
        )

        # Save to file
        OUTPUT_DIR.mkdir(exist_ok=True)
        with open(RECONCILIATION_OUTPUT, "w") as f:
            f.write(self.report.to_json())

        return self.report

    def get_clean_records(self) -> list[dict]:
        """
        Return only matched, non-exception records.
        Used by Module 3 (Forecaster) to exclude fraud-tainted data.
        """
        report = self.report or self.run()

        exception_ids = {e.record_id for e in report.exceptions}
        clean = []
        for match in report.matched:
            if (match.record_a_id not in exception_ids
                    and match.record_b_id not in exception_ids
                    and match.match_type == "EXACT"):
                clean.append(match.to_dict())
        return clean

    def get_all_records_for_qa(self) -> list[dict]:
        """
        Return all records with exception flags for Module 2 (Q&A).
        Each record is annotated with its status.
        """
        report = self.report or self.run()

        exception_ids = {e.record_id for e in report.exceptions}
        exception_lookup = {}
        for e in report.exceptions:
            if e.record_id not in exception_lookup:
                exception_lookup[e.record_id] = []
            exception_lookup[e.record_id].append(e.to_dict())

        records = []
        for match in report.matched:
            rec = match.to_dict()
            rec["has_exceptions"] = (
                match.record_a_id in exception_ids
                or match.record_b_id in exception_ids
            )
            rec["exceptions"] = (
                exception_lookup.get(match.record_a_id, [])
                + exception_lookup.get(match.record_b_id, [])
            )
            rec["status"] = "matched"
            records.append(rec)

        # Add unmatched settlements
        for sid in report.unmatched_settlements:
            records.append({
                "record_a_id": sid,
                "record_a_source": "settlement",
                "record_b_id": "",
                "record_b_source": "",
                "match_type": "NONE",
                "confidence": 0.0,
                "status": "unmatched",
                "has_exceptions": True,
                "exceptions": exception_lookup.get(sid, []),
            })

        return records


def run_reconciliation() -> ReconciliationReport:
    """Convenience function for running reconciliation."""
    engine = ReconciliationEngine()
    report = engine.run()

    print("=" * 60)
    print("RECONCILIATION REPORT")
    print("=" * 60)
    print(f"Match Rate: {report.match_rate}%")
    print(f"Matched Records: {len(report.matched)}")
    print(f"Unmatched Settlements: {len(report.unmatched_settlements)}")
    print(f"Unmatched Bank Entries: {len(report.unmatched_bank)}")
    print(f"Exceptions: {len(report.exceptions)}")
    print()
    print("Trust Layer Summary:")
    for key, val in report.trust_summary.items():
        print(f"  {key}: {val}")
    print()
    print(f"Report saved to: {RECONCILIATION_OUTPUT}")

    return report


if __name__ == "__main__":
    run_reconciliation()
