"""
Finance Controller Agent — Shared Data Models

Dataclasses used across all modules for type-safe, consistent data handling.
Modeled after Razorpay's actual settlement/payment API payload structures.
"""
from __future__ import annotations
from dataclasses import dataclass, field, asdict
from typing import Optional, List
from datetime import datetime, timezone
import json


# ---------------------------------------------------------------------------
# Razorpay Entities (modeled after real API payloads)
# ---------------------------------------------------------------------------

@dataclass
class Settlement:
    """Razorpay settlement record (mirrors settlement.processed webhook)."""
    id: str                          # e.g., "setl_ABC123"
    entity: str = "settlement"
    amount: int = 0                  # In paise (smallest currency unit)
    status: str = "processed"        # processed / created / failed
    fees: int = 0                    # Razorpay fees in paise
    tax: int = 0                     # Tax on fees in paise
    utr: str = ""                    # Unique Transaction Reference
    created_at: int = 0              # Unix timestamp
    signature: str = ""              # HMAC-SHA256 signature for verification
    currency: str = "INR"

    def to_dict(self):
        return asdict(self)


@dataclass
class Payment:
    """Razorpay payment record (mirrors payment.captured webhook)."""
    id: str                          # e.g., "pay_XYZ789"
    order_id: str = ""               # e.g., "order_DEF456"
    amount: int = 0                  # In paise
    currency: str = "INR"
    method: str = "upi"              # card / netbanking / upi / wallet
    fee: int = 0                     # Razorpay fee in paise
    tax: int = 0                     # Tax on fee in paise
    status: str = "captured"
    settlement_id: str = ""          # Links to Settlement.id
    customer_email: str = ""
    customer_name: str = ""
    created_at: int = 0

    def to_dict(self):
        return asdict(self)


# ---------------------------------------------------------------------------
# Internal Financial Records
# ---------------------------------------------------------------------------

@dataclass
class BankEntry:
    """Bank statement line item."""
    date: str                        # ISO format: YYYY-MM-DD
    description: str = ""
    reference: str = ""              # UTR or transaction reference
    credit: int = 0                  # Amount credited (paise)
    debit: int = 0                   # Amount debited (paise)
    balance: int = 0                 # Running balance (paise)
    utr: str = ""                    # UTR for matching

    def to_dict(self):
        return asdict(self)


@dataclass
class LedgerEntry:
    """Internal accounting ledger entry."""
    entry_id: str
    date: str                        # ISO format
    payment_id: str = ""             # Links to Payment.id
    order_id: str = ""
    amount: int = 0                  # Canonical amount (paise)
    currency: str = "INR"
    description: str = ""
    category: str = ""               # revenue / refund / fee / tax

    def to_dict(self):
        return asdict(self)


# ---------------------------------------------------------------------------
# Tax / GST Entities
# ---------------------------------------------------------------------------

@dataclass
class Invoice:
    """Tax invoice issued to customer."""
    invoice_id: str
    date: str                        # ISO format
    customer_name: str = ""
    gstin: str = ""                  # 15-char GSTIN
    hsn_code: str = ""               # HSN/SAC code
    taxable_value: int = 0           # Pre-tax amount (paise)
    cgst: int = 0                    # Central GST (paise)
    sgst: int = 0                    # State GST (paise)
    igst: int = 0                    # Integrated GST (paise)
    total: int = 0                   # Total including tax (paise)
    payment_id: str = ""             # Links to Payment.id

    def to_dict(self):
        return asdict(self)


@dataclass
class GSTFiling:
    """GST return filing record (GSTR-2B style)."""
    filing_id: str
    return_period: str = ""          # e.g., "082026" (MMYYYY)
    supplier_gstin: str = ""
    invoice_number: str = ""         # Should match Invoice.invoice_id
    invoice_date: str = ""
    taxable_value: int = 0
    cgst: int = 0
    sgst: int = 0
    igst: int = 0
    total: int = 0

    def to_dict(self):
        return asdict(self)


# ---------------------------------------------------------------------------
# Reconciliation / Matching Results
# ---------------------------------------------------------------------------

@dataclass
class MatchResult:
    """Result of matching two records from different sources."""
    record_a_id: str                 # ID from source A
    record_a_source: str             # e.g., "settlement", "bank", "ledger"
    record_b_id: str                 # ID from source B
    record_b_source: str
    match_type: str = "NONE"         # EXACT / FUZZY / NONE
    confidence: float = 0.0          # 0.0 - 1.0
    matched_fields: List[str] = field(default_factory=list)
    notes: str = ""

    def to_dict(self):
        return asdict(self)


@dataclass
class ExceptionRecord:
    """A record that failed one or more validation checks."""
    record_id: str
    source: str                      # Which data source
    reason_code: str                 # From config.ReasonCode
    details: str = ""                # Human-readable explanation
    severity: str = "HIGH"           # HIGH / MEDIUM / LOW
    timestamp: str = ""              # When the exception was logged
    related_record_id: str = ""      # ID of the conflicting record, if any

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()

    def to_dict(self):
        return asdict(self)


@dataclass
class ReconciliationReport:
    """Complete output of a reconciliation run."""
    matched: List[MatchResult] = field(default_factory=list)
    unmatched_settlements: List[str] = field(default_factory=list)
    unmatched_bank: List[str] = field(default_factory=list)
    unmatched_ledger: List[str] = field(default_factory=list)
    exceptions: List[ExceptionRecord] = field(default_factory=list)
    match_rate: float = 0.0          # Percentage
    total_settlements: int = 0
    total_bank_entries: int = 0
    total_ledger_entries: int = 0
    timestamp: str = ""
    trust_summary: dict = field(default_factory=dict)

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()

    def to_dict(self):
        return {
            "matched": [m.to_dict() for m in self.matched],
            "unmatched_settlements": self.unmatched_settlements,
            "unmatched_bank": self.unmatched_bank,
            "unmatched_ledger": self.unmatched_ledger,
            "exceptions": [e.to_dict() for e in self.exceptions],
            "match_rate": self.match_rate,
            "total_settlements": self.total_settlements,
            "total_bank_entries": self.total_bank_entries,
            "total_ledger_entries": self.total_ledger_entries,
            "timestamp": self.timestamp,
            "trust_summary": self.trust_summary,
        }

    def to_json(self, indent=2):
        return json.dumps(self.to_dict(), indent=indent)


@dataclass
class TaxMatchReport:
    """Output of the GST tax-line matching run."""
    matched: List[MatchResult] = field(default_factory=list)
    unmatched_invoices: List[str] = field(default_factory=list)
    unmatched_filings: List[str] = field(default_factory=list)
    exceptions: List[ExceptionRecord] = field(default_factory=list)
    match_rate: float = 0.0
    total_invoices: int = 0
    total_filings: int = 0
    timestamp: str = ""

    def __post_init__(self):
        if not self.timestamp:
            self.timestamp = datetime.now(timezone.utc).isoformat()

    def to_dict(self):
        return {
            "matched": [m.to_dict() for m in self.matched],
            "unmatched_invoices": self.unmatched_invoices,
            "unmatched_filings": self.unmatched_filings,
            "exceptions": [e.to_dict() for e in self.exceptions],
            "match_rate": self.match_rate,
            "total_invoices": self.total_invoices,
            "total_filings": self.total_filings,
            "timestamp": self.timestamp,
        }

    def to_json(self, indent=2):
        return json.dumps(self.to_dict(), indent=indent)
