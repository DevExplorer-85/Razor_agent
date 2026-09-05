"""
Tests — Reconciliation Engine

Verifies matching logic, match rate calculation, and exception reporting.
"""
import sys
from pathlib import Path
backend_dir = Path(__file__).resolve().parent.parent
project_root = backend_dir.parent
for p in (str(project_root), str(backend_dir)):
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    # pyrefly: ignore [missing-import]
    import pytest
    HAS_PYTEST = True
except ImportError:
    pytest = None  # type: ignore[assignment]
    HAS_PYTEST = False

from backend.engine.matcher import (
    exact_match, fuzzy_match, two_pass_match,
    FieldExtractor, string_similarity,
)
from backend.engine.models import ReconciliationReport, MatchResult, ExceptionRecord
from backend.config import MatchType




class TestStringSimiliarity:
    def test_identical_strings(self):
        assert string_similarity("AXISCN1234567890", "AXISCN1234567890") == 100

    def test_similar_strings(self):
        score = string_similarity("AXISCN1234567890", "AXISCN1234567891")
        assert score >= 80

    def test_different_strings(self):
        score = string_similarity("AXISCN1234567890", "HDFCCN9876543210")
        assert score < 80


class TestExactMatch:
    def setup_method(self):
        self.extractor = FieldExtractor(
            id_field="id", amount_field="amount", currency_field="currency",
            reference_field="ref", date_field="date", date_format="iso",
        )

    def test_perfect_match(self):
        records_a = [{"id": "a1", "amount": 1000, "currency": "INR", "ref": "UTR001"}]
        records_b = [{"id": "b1", "amount": 1000, "currency": "INR", "ref": "UTR001"}]

        matches, unmatched_a, unmatched_b = exact_match(
            records_a, records_b, self.extractor, self.extractor, "src_a", "src_b"
        )
        assert len(matches) == 1
        assert matches[0].match_type == MatchType.EXACT
        assert matches[0].confidence == 1.0
        assert len(unmatched_a) == 0
        assert len(unmatched_b) == 0

    def test_amount_mismatch_no_match(self):
        records_a = [{"id": "a1", "amount": 1000, "currency": "INR", "ref": "UTR001"}]
        records_b = [{"id": "b1", "amount": 2000, "currency": "INR", "ref": "UTR001"}]

        matches, unmatched_a, _ = exact_match(
            records_a, records_b, self.extractor, self.extractor, "src_a", "src_b"
        )
        assert len(matches) == 0
        assert len(unmatched_a) == 1

    def test_currency_mismatch_no_match(self):
        records_a = [{"id": "a1", "amount": 1000, "currency": "INR", "ref": "UTR001"}]
        records_b = [{"id": "b1", "amount": 1000, "currency": "USD", "ref": "UTR001"}]

        matches, unmatched_a, _ = exact_match(
            records_a, records_b, self.extractor, self.extractor, "src_a", "src_b"
        )
        assert len(matches) == 0

    def test_missing_reference_skipped(self):
        records_a = [{"id": "a1", "amount": 1000, "currency": "INR", "ref": ""}]
        records_b = [{"id": "b1", "amount": 1000, "currency": "INR", "ref": "UTR001"}]

        matches, unmatched_a, _ = exact_match(
            records_a, records_b, self.extractor, self.extractor, "src_a", "src_b"
        )
        assert len(matches) == 0
        assert len(unmatched_a) == 1


class TestFuzzyMatch:
    def setup_method(self):
        self.extractor = FieldExtractor(
            id_field="id", amount_field="amount", currency_field="currency",
            reference_field="ref", date_field="date", date_format="iso",
        )

    def test_amount_within_tolerance(self):
        records_a = [{"id": "a1", "amount": 1000, "currency": "INR", "ref": "", "date": "2026-08-01"}]
        records_b = [{"id": "b1", "amount": 1050, "currency": "INR", "ref": "", "date": "2026-08-01"}]

        matches, _, _ = fuzzy_match(
            records_a, records_b, self.extractor, self.extractor,
            "src_a", "src_b", amount_tolerance=100
        )
        assert len(matches) == 1
        assert matches[0].match_type == MatchType.FUZZY

    def test_date_proximity(self):
        records_a = [{"id": "a1", "amount": 1000, "currency": "INR", "ref": "UTR001", "date": "2026-08-01"}]
        records_b = [{"id": "b1", "amount": 1000, "currency": "INR", "ref": "UTR002", "date": "2026-08-03"}]

        matches, _, _ = fuzzy_match(
            records_a, records_b, self.extractor, self.extractor,
            "src_a", "src_b", date_tolerance_days=3
        )
        assert len(matches) == 1


class TestTwoPassMatch:
    def test_mixed_match(self):
        ext = FieldExtractor(
            id_field="id", amount_field="amount", currency_field="currency",
            reference_field="ref", date_field="date", date_format="iso",
        )
        records_a = [
            {"id": "a1", "amount": 1000, "currency": "INR", "ref": "UTR001", "date": "2026-08-01"},
            {"id": "a2", "amount": 2000, "currency": "INR", "ref": "", "date": "2026-08-05"},
        ]
        records_b = [
            {"id": "b1", "amount": 1000, "currency": "INR", "ref": "UTR001", "date": "2026-08-01"},
            {"id": "b2", "amount": 2000, "currency": "INR", "ref": "", "date": "2026-08-06"},
        ]

        matches, unmatched_a, unmatched_b = two_pass_match(
            records_a, records_b, ext, ext, "src_a", "src_b"
        )
        # First should be exact, second should be fuzzy
        assert len(matches) >= 1
        assert matches[0].match_type == MatchType.EXACT


class TestReconciliationReport:
    def test_report_serialization(self):
        report = ReconciliationReport(
            matched=[
                MatchResult("a1", "settlement", "b1", "bank", "EXACT", 1.0, ["ref", "amount"])
            ],
            unmatched_settlements=["s1"],
            exceptions=[
                ExceptionRecord("s2", "settlement", "DUPLICATE_ID", "test", "HIGH")
            ],
            match_rate=75.0,
            total_settlements=4,
        )
        data = report.to_dict()
        assert data["match_rate"] == 75.0
        assert len(data["matched"]) == 1
        assert len(data["exceptions"]) == 1

        json_str = report.to_json()
        assert '"match_rate": 75.0' in json_str


if __name__ == "__main__":
    if HAS_PYTEST and pytest is not None:
        pytest.main([__file__, "-v"])
    else:
        print("Running engine tests without pytest runner...")
        t1 = TestStringSimiliarity()
        t1.test_identical_strings()
        t1.test_similar_strings()
        t1.test_different_strings()
        
        t2 = TestExactMatch()
        t2.setup_method()
        t2.test_perfect_match()
        t2.setup_method()
        t2.test_amount_mismatch_no_match()
        t2.setup_method()
        t2.test_currency_mismatch_no_match()
        t2.setup_method()
        t2.test_missing_reference_skipped()
        
        t3 = TestFuzzyMatch()
        t3.setup_method()
        t3.test_amount_within_tolerance()
        t3.setup_method()
        t3.test_date_proximity()
        
        t4 = TestTwoPassMatch()
        t4.test_mixed_match()
        
        t5 = TestReconciliationReport()
        t5.test_report_serialization()
        print("All test_engine assertions passed!")

