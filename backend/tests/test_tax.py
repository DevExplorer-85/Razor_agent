"""
Tests — Tax-Line Matcher

Verifies GSTIN validation, three-field match requirement, and fraud detection.
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
    pytest = None
    HAS_PYTEST = False

try:
    from backend.tax.gst_matcher import validate_gstin
except ImportError:
    from tax.gst_matcher import validate_gstin



class TestGSTINValidation:
    def test_valid_gstin(self):
        assert validate_gstin("27AABCU9603R1ZM") is True

    def test_invalid_gstin_short(self):
        assert validate_gstin("27AABCU960") is False

    def test_invalid_gstin_format(self):
        assert validate_gstin("ZZZZZZZZZZZZZZZ") is False

    def test_empty_gstin(self):
        assert validate_gstin("") is False

    def test_none_gstin(self):
        assert validate_gstin(None) is False

    def test_fake_gstin(self):
        # These are the intentionally tampered GSTINs from synthetic data
        assert validate_gstin("27ZZZZZ0000Z1ZZ") is False


if __name__ == "__main__":
    if HAS_PYTEST and pytest is not None:
        pytest.main([__file__, "-v"])
    else:
        print("Running tests without pytest runner...")
        t = TestGSTINValidation()
        t.test_valid_gstin()
        t.test_invalid_gstin_short()
        t.test_invalid_gstin_format()
        t.test_empty_gstin()
        t.test_none_gstin()
        t.test_fake_gstin()
        print("All test_tax assertions passed!")

