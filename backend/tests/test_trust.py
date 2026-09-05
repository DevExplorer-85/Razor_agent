"""
Tests — Trust Layer

Verifies all trust/validation checks work correctly:
  - Invalid signatures are rejected
  - Duplicate IDs are flagged
  - Cross-field mismatches are caught
  - Canonical source enforcement blocks overrides
"""
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
project_root = backend_dir.parent
for p in (str(project_root), str(backend_dir)):
    if p not in sys.path:
        sys.path.insert(0, p)

import json
try:
    # pyrefly: ignore [missing-import]
    import pytest
    HAS_PYTEST = True
except ImportError:
    pytest = None
    HAS_PYTEST = False

from trust.exceptions import ExceptionLogger  # pyrefly: ignore[import-error]
from trust.signature import compute_signature, verify_signature, validate_settlement_signatures  # pyrefly: ignore[import-error]
from trust.dedup import DeduplicationChecker  # pyrefly: ignore[import-error]
from trust.cross_field import verify_cross_fields  # pyrefly: ignore[import-error]
from trust.canonical import enforce_canonical_amount  # pyrefly: ignore[import-error]
from trust import TrustValidator  # pyrefly: ignore[import-error]
from config import WEBHOOK_SECRET, ReasonCode  # pyrefly: ignore[import-error]




class TestSignatureVerification:
    def test_valid_signature(self):
        payload = '{"id":"setl_001","amount":1000}'
        sig = compute_signature(payload)
        assert verify_signature(payload, sig)

    def test_invalid_signature(self):
        payload = '{"id":"setl_001","amount":1000}'
        assert not verify_signature(payload, "INVALID_SIGNATURE")

    def test_tampered_payload(self):
        payload = '{"id":"setl_001","amount":1000}'
        sig = compute_signature(payload)
        tampered = '{"id":"setl_001","amount":9999}'
        assert not verify_signature(tampered, sig)

    def test_batch_validation(self):
        logger = ExceptionLogger()
        settlements = [
            {"id": "setl_001", "amount": 1000, "status": "processed"},
            {"id": "setl_002", "amount": 2000, "status": "processed"},
        ]
        # Sign the first, leave the second unsigned
        payload_str = json.dumps(
            {k: v for k, v in settlements[0].items()},
            sort_keys=True, separators=(",", ":")
        )
        settlements[0]["signature"] = compute_signature(payload_str)
        settlements[1]["signature"] = "BAD_SIG"

        valid, invalid = validate_settlement_signatures(settlements, logger)
        assert len(valid) == 1
        assert len(invalid) == 1
        assert logger.count >= 1
        assert logger.exceptions[0].reason_code == ReasonCode.SIG_INVALID


class TestDeduplication:
    def test_unique_ids(self):
        logger = ExceptionLogger()
        checker = DeduplicationChecker()
        assert checker.check_and_register("id_1", "test", logger) is True
        assert checker.check_and_register("id_2", "test", logger) is True
        assert logger.count == 0

    def test_duplicate_id(self):
        logger = ExceptionLogger()
        checker = DeduplicationChecker()
        checker.check_and_register("id_1", "test", logger)
        result = checker.check_and_register("id_1", "test", logger)
        assert result is False
        assert logger.count == 1
        assert logger.exceptions[0].reason_code == ReasonCode.DUPLICATE_ID

    def test_batch_dedup(self):
        logger = ExceptionLogger()
        checker = DeduplicationChecker()
        records = [
            {"id": "a"}, {"id": "b"}, {"id": "a"}, {"id": "c"}, {"id": "b"},
        ]
        unique, dupes = checker.check_batch(records, "id", "test", logger)
        assert len(unique) == 3
        assert len(dupes) == 2


class TestCrossFieldVerification:
    def test_all_fields_match(self):
        logger = ExceptionLogger()
        rec_a = {"id": "s1", "amount": 1000, "currency": "INR", "utr": "UTR001"}
        rec_b = {"id": "b1", "credit": 1000, "currency": "INR", "utr": "UTR001"}
        result = verify_cross_fields(rec_a, rec_b, "settlement", "bank", logger)
        assert result["all_match"] is True

    def test_amount_mismatch(self):
        logger = ExceptionLogger()
        rec_a = {"id": "s1", "amount": 1000, "currency": "INR", "utr": "UTR001"}
        rec_b = {"id": "b1", "credit": 5000, "currency": "INR", "utr": "UTR001"}
        result = verify_cross_fields(rec_a, rec_b, "settlement", "bank", logger)
        assert result["amount_match"] is False
        assert any(e.reason_code == ReasonCode.AMOUNT_MISMATCH for e in logger.exceptions)

    def test_currency_mismatch(self):
        logger = ExceptionLogger()
        rec_a = {"id": "s1", "amount": 1000, "currency": "INR", "utr": "UTR001"}
        rec_b = {"id": "b1", "credit": 1000, "currency": "USD", "utr": "UTR001"}
        result = verify_cross_fields(rec_a, rec_b, "settlement", "bank", logger)
        assert result["currency_match"] is False
        assert any(e.reason_code == ReasonCode.CURRENCY_MISMATCH for e in logger.exceptions)

    def test_partial_match_flagged(self):
        logger = ExceptionLogger()
        rec_a = {"id": "s1", "amount": 1000, "currency": "INR", "utr": "UTR001"}
        rec_b = {"id": "b1", "credit": 1000, "currency": "INR", "utr": "UTR999"}
        result = verify_cross_fields(rec_a, rec_b, "settlement", "bank", logger)
        assert result["all_match"] is False
        assert any(e.reason_code == ReasonCode.PARTIAL_MATCH for e in logger.exceptions)


class TestCanonicalEnforcement:
    def test_amounts_agree(self):
        logger = ExceptionLogger()
        result = enforce_canonical_amount(1000, 1000, "rec_1", "external", logger)
        assert result["override_attempted"] is False
        assert result["canonical_amount"] == 1000

    def test_override_blocked(self):
        logger = ExceptionLogger()
        result = enforce_canonical_amount(1000, 5000, "rec_1", "external", logger)
        assert result["override_attempted"] is True
        assert result["canonical_amount"] == 1000  # Ledger wins
        assert logger.count == 1
        assert logger.exceptions[0].reason_code == ReasonCode.CANONICAL_OVERRIDE

    def test_within_tolerance(self):
        logger = ExceptionLogger()
        result = enforce_canonical_amount(1000, 1050, "rec_1", "external", logger, tolerance=100)
        assert result["within_tolerance"] is True
        assert result["override_attempted"] is False


class TestTrustValidator:
    def test_full_pipeline(self):
        validator = TrustValidator()
        # Test that stats are tracked
        assert validator.stats["signatures_checked"] == 0
        summary = validator.get_summary()
        assert "total_exceptions" in summary

    def test_reset(self):
        validator = TrustValidator()
        validator.exception_logger.log("test", "test", "TEST_CODE")
        assert validator.exception_logger.count == 1
        validator.reset()
        assert validator.exception_logger.count == 0


if __name__ == "__main__":
    if HAS_PYTEST and pytest is not None:
        pytest.main([__file__, "-v"])
    else:
        print("Running trust tests without pytest runner...")
        t1 = TestSignatureVerification()
        t1.test_valid_signature()
        t1.test_invalid_signature()
        t1.test_tampered_payload()
        t1.test_batch_validation()
        
        t2 = TestDeduplication()
        t2.test_unique_ids()
        t2.test_duplicate_id()
        t2.test_batch_dedup()
        
        t3 = TestCrossFieldVerification()
        t3.test_all_fields_match()
        t3.test_amount_mismatch()
        t3.test_currency_mismatch()
        t3.test_partial_match_flagged()
        
        t4 = TestCanonicalEnforcement()
        t4.test_amounts_agree()
        t4.test_override_blocked()
        t4.test_within_tolerance()
        
        t5 = TestTrustValidator()
        t5.test_full_pipeline()
        t5.test_reset()
        print("All test_trust assertions passed!")

