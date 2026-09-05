"""
Finance Controller Agent — Shared Configuration

Central configuration for all modules. Contains webhook secrets, file paths,
matching thresholds, and reason codes used across the trust and reconciliation layers.
"""
import os
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

# Output paths
OUTPUT_DIR = BASE_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)
DB_PATH = BASE_DIR / "finance_controller.db"
RECONCILIATION_OUTPUT = OUTPUT_DIR / "reconciliation_report.json"
TAX_OUTPUT = OUTPUT_DIR / "tax_match_report.json"
FORECAST_OUTPUT = OUTPUT_DIR / "forecast_report.json"
CHROMA_DIR = OUTPUT_DIR / "chroma_db"

# ---------------------------------------------------------------------------
# Webhook / Signature Verification
# ---------------------------------------------------------------------------
# Simulated Razorpay webhook secret (in production, sourced from env / vault)
WEBHOOK_SECRET = os.getenv(
    "RAZORPAY_WEBHOOK_SECRET",
    "whsec_finance_controller_demo_secret_2024"
)

# ---------------------------------------------------------------------------
# Matching Thresholds
# ---------------------------------------------------------------------------
AMOUNT_TOLERANCE_PAISE = 100          # ±₹1 (in paise) for rounding tolerance
DATE_TOLERANCE_DAYS = 3               # ±3 days for date proximity matching
FUZZY_MATCH_THRESHOLD = 80            # Minimum fuzzywuzzy score (0-100)
FUZZY_REF_THRESHOLD = 75              # Minimum score for reference string match

# ---------------------------------------------------------------------------
# Reason Codes (used by trust/exceptions.py)
# ---------------------------------------------------------------------------
class ReasonCode:
    """Structured reason codes for every type of validation failure."""
    SIG_INVALID = "SIG_INVALID"              # Webhook signature failed HMAC check
    DUPLICATE_ID = "DUPLICATE_ID"            # Repeated settlement/payment ID (replay)
    AMOUNT_MISMATCH = "AMOUNT_MISMATCH"      # Amount disagrees across sources
    CURRENCY_MISMATCH = "CURRENCY_MISMATCH"  # Currency disagrees across sources
    REF_MISSING = "REF_MISSING"              # UTR / reference ID missing
    GSTIN_MISMATCH = "GSTIN_MISMATCH"        # GSTIN disagrees between invoice & filing
    PARTIAL_MATCH = "PARTIAL_MATCH"          # Single-field match only (suspicious)
    DATE_OUTLIER = "DATE_OUTLIER"            # Settlement date far from expected
    CANONICAL_OVERRIDE = "CANONICAL_OVERRIDE" # External amount tried to override ledger
    UNMATCHED = "UNMATCHED"                  # No match found in any source
    TAX_AMOUNT_MISMATCH = "TAX_AMOUNT_MISMATCH"  # Tax amount disagrees

# ---------------------------------------------------------------------------
# Match Types
# ---------------------------------------------------------------------------
class MatchType:
    EXACT = "EXACT"
    FUZZY = "FUZZY"
    NONE = "NONE"

# ---------------------------------------------------------------------------
# Gemini / LLM Configuration (Module 2 — Q&A Agent)
# ---------------------------------------------------------------------------
GEMINI_API_KEY = os.getenv("GOOGLE_API_KEY", "")
GEMINI_MODEL = "gemini-2.0-flash"
USE_LLM = bool(GEMINI_API_KEY)  # Falls back to rule-based if no key

# ---------------------------------------------------------------------------
# Currency
# ---------------------------------------------------------------------------
CANONICAL_CURRENCY = "INR"
