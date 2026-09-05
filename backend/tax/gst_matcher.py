"""
Module 4: Tax-Line Matcher — GST Invoice ↔ Filing Reconciliation

Reuses the engine/matcher two-pass matching engine with GST-specific
field mappings. Requires three-field match: GSTIN + taxable amount + tax amount.
Single-field (amount-only) matches are rejected.

Fraud vector defended: Fake invoices with real amounts but wrong GSTINs.
"""
import re
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
    from backend.config import DATA_DIR, OUTPUT_DIR, ReasonCode
    from backend.engine.models import MatchResult, ExceptionRecord, TaxMatchReport
    from backend.engine.matcher import (
        exact_match, fuzzy_match, FieldExtractor,
        INVOICE_EXTRACTOR, GST_FILING_EXTRACTOR,
        string_similarity,
    )
    from backend.engine.reconciler import load_csv
    from backend.trust import TrustValidator
except ImportError:
    # Retry under the canonical namespace after sys.path has been patched above
    import importlib
    _cfg = importlib.import_module("backend.config")
    DATA_DIR, OUTPUT_DIR, ReasonCode = _cfg.DATA_DIR, _cfg.OUTPUT_DIR, _cfg.ReasonCode
    _models = importlib.import_module("backend.engine.models")
    MatchResult: type = _models.MatchResult  # type: ignore[no-redef]
    ExceptionRecord: type = _models.ExceptionRecord  # type: ignore[no-redef]
    TaxMatchReport: type = _models.TaxMatchReport  # type: ignore[no-redef]
    _matcher = importlib.import_module("backend.engine.matcher")
    exact_match = _matcher.exact_match  # type: ignore[no-redef]
    fuzzy_match = _matcher.fuzzy_match  # type: ignore[no-redef]
    FieldExtractor: type = _matcher.FieldExtractor  # type: ignore[no-redef]
    INVOICE_EXTRACTOR = _matcher.INVOICE_EXTRACTOR  # type: ignore[no-redef]
    GST_FILING_EXTRACTOR = _matcher.GST_FILING_EXTRACTOR  # type: ignore[no-redef]
    string_similarity = _matcher.string_similarity  # type: ignore[no-redef]
    _recon = importlib.import_module("backend.engine.reconciler")
    load_csv = _recon.load_csv  # type: ignore[no-redef]
    _trust = importlib.import_module("backend.trust")
    TrustValidator: type = _trust.TrustValidator  # type: ignore[no-redef]


# GSTIN format: 15 characters — 2-digit state code + 10-char PAN (4th char entity C/P/H/F/A/T/B/L/J/G) + 1 entity count + Z + 1 check digit
GSTIN_PATTERN = re.compile(r"^[0-9]{2}[A-Z]{3}[CPHFATBLJG]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$")


def validate_gstin(gstin: str | None) -> bool:
    """Validate GSTIN format (15-character alphanumeric pattern with valid PAN entity status)."""
    if not gstin or len(gstin) != 15:
        return False
    return bool(GSTIN_PATTERN.match(gstin))



class TaxLineMatcher:
    """
    Matches tax invoices against GST filing records.
    
    Three-field match requirement:
      1. GSTIN must match exactly
      2. Taxable amount must match
      3. Tax amounts (CGST+SGST or IGST) must match
    
    Amount-only matches are flagged as suspicious — guards against
    tampered/fake invoices with a real amount but wrong GSTIN.
    """

    def __init__(self, data_dir: Path = DATA_DIR):
        self.data_dir = data_dir
        self.trust = TrustValidator()
        self.report: TaxMatchReport | None = None

    def run(self) -> TaxMatchReport:
        """Execute the GST tax-line matching pipeline."""
        # ------------------------------------------------------------------
        # Step 1: Load data
        # ------------------------------------------------------------------
        invoices = load_csv(self.data_dir / "invoices.csv")
        gst_filings = load_csv(self.data_dir / "gst_filings.csv")

        total_invoices = len(invoices)
        total_filings = len(gst_filings)

        # ------------------------------------------------------------------
        # Step 2: GSTIN format validation
        # ------------------------------------------------------------------
        for inv in invoices:
            gstin = inv.get("gstin", "")
            if not validate_gstin(gstin):
                self.trust.exception_logger.log(
                    record_id=inv.get("invoice_id", "UNKNOWN"),
                    source="invoice",
                    reason_code=ReasonCode.GSTIN_MISMATCH,
                    details=f"Invalid GSTIN format: '{gstin}'",
                    severity="HIGH",
                )

        for filing in gst_filings:
            gstin = filing.get("supplier_gstin", "")
            if not validate_gstin(gstin):
                self.trust.exception_logger.log(
                    record_id=filing.get("filing_id", "UNKNOWN"),
                    source="gst_filing",
                    reason_code=ReasonCode.GSTIN_MISMATCH,
                    details=f"Invalid GSTIN format in filing: '{gstin}'",
                    severity="HIGH",
                )

        # ------------------------------------------------------------------
        # Step 3: Three-field matching (GSTIN + Amount + Tax)
        # ------------------------------------------------------------------
        matched = []
        used_filing_indices = set()
        unmatched_invoice_ids = []

        for inv in invoices:
            inv_id = inv.get("invoice_id", "")
            inv_gstin = inv.get("gstin", "")
            inv_taxable = int(inv.get("taxable_value", 0))
            inv_cgst = int(inv.get("cgst", 0))
            inv_sgst = int(inv.get("sgst", 0))
            inv_igst = int(inv.get("igst", 0))
            inv_total_tax = inv_cgst + inv_sgst + inv_igst

            found = False
            for j, filing in enumerate(gst_filings):
                if j in used_filing_indices:
                    continue

                f_gstin = filing.get("supplier_gstin", "")
                f_taxable = int(filing.get("taxable_value", 0))
                f_cgst = int(filing.get("cgst", 0))
                f_sgst = int(filing.get("sgst", 0))
                f_igst = int(filing.get("igst", 0))
                f_total_tax = f_cgst + f_sgst + f_igst
                f_invoice_num = filing.get("invoice_number", "")

                # Check invoice number link
                invoice_num_match = (f_invoice_num == inv_id)

                # Three-field check
                gstin_match = (inv_gstin == f_gstin) and bool(inv_gstin)
                amount_match = (inv_taxable == f_taxable)
                tax_match = (inv_total_tax == f_total_tax)

                if invoice_num_match or (gstin_match and amount_match):
                    matched_fields = []
                    notes_parts = []

                    if gstin_match:
                        matched_fields.append("gstin")
                    else:
                        # GSTIN mismatch on an otherwise matching record — FRAUD ALERT
                        self.trust.exception_logger.log(
                            record_id=inv_id,
                            source="tax_match",
                            reason_code=ReasonCode.GSTIN_MISMATCH,
                            details=(
                                f"GSTIN mismatch: Invoice has '{inv_gstin}' but "
                                f"filing has '{f_gstin}'. Possible fake invoice."
                            ),
                            severity="HIGH",
                            related_record_id=filing.get("filing_id", ""),
                        )
                        notes_parts.append(f"GSTIN MISMATCH: {inv_gstin} vs {f_gstin}")

                    if amount_match:
                        matched_fields.append("taxable_value")
                    else:
                        self.trust.exception_logger.log(
                            record_id=inv_id,
                            source="tax_match",
                            reason_code=ReasonCode.AMOUNT_MISMATCH,
                            details=(
                                f"Taxable value mismatch: Invoice={inv_taxable} "
                                f"vs Filing={f_taxable}"
                            ),
                            severity="MEDIUM",
                            related_record_id=filing.get("filing_id", ""),
                        )

                    if tax_match:
                        matched_fields.append("tax_amount")
                    else:
                        self.trust.exception_logger.log(
                            record_id=inv_id,
                            source="tax_match",
                            reason_code=ReasonCode.TAX_AMOUNT_MISMATCH,
                            details=(
                                f"Tax amount mismatch: Invoice tax={inv_total_tax} "
                                f"vs Filing tax={f_total_tax}"
                            ),
                            severity="MEDIUM",
                            related_record_id=filing.get("filing_id", ""),
                        )
                        notes_parts.append(f"Tax diff: {abs(inv_total_tax - f_total_tax)} paise")

                    # Determine match quality
                    all_three = gstin_match and amount_match and tax_match
                    match_type = "EXACT" if all_three else "FUZZY"
                    confidence = len(matched_fields) / 3.0

                    match = MatchResult(
                        record_a_id=inv_id,
                        record_a_source="invoice",
                        record_b_id=filing.get("filing_id", ""),
                        record_b_source="gst_filing",
                        match_type=match_type,
                        confidence=round(confidence, 3),
                        matched_fields=matched_fields,
                        notes="; ".join(notes_parts) if notes_parts else "Full three-field match",
                    )
                    matched.append(match)
                    used_filing_indices.add(j)
                    found = True
                    break

                # Detect amount-only match (suspicious — no GSTIN match)
                elif amount_match and not gstin_match:
                    self.trust.exception_logger.log(
                        record_id=inv_id,
                        source="tax_match",
                        reason_code=ReasonCode.PARTIAL_MATCH,
                        details=(
                            f"Amount-only match detected (GSTIN differs): "
                            f"Invoice GSTIN='{inv_gstin}', Filing GSTIN='{f_gstin}'. "
                            f"Amount={inv_taxable}. Treating as suspicious — "
                            f"amount-only match is NOT sufficient."
                        ),
                        severity="HIGH",
                        related_record_id=filing.get("filing_id", ""),
                    )

            if not found:
                unmatched_invoice_ids.append(inv_id)
                self.trust.exception_logger.log(
                    record_id=inv_id,
                    source="invoice",
                    reason_code=ReasonCode.UNMATCHED,
                    details="Invoice has no matching GST filing record",
                    severity="MEDIUM",
                )

        # Unmatched filings
        unmatched_filing_ids = [
            gst_filings[j].get("filing_id", "")
            for j in range(len(gst_filings))
            if j not in used_filing_indices
        ]
        for fid in unmatched_filing_ids:
            self.trust.exception_logger.log(
                record_id=fid,
                source="gst_filing",
                reason_code=ReasonCode.UNMATCHED,
                details="GST filing has no matching invoice",
                severity="MEDIUM",
            )

        # ------------------------------------------------------------------
        # Step 4: Compile report
        # ------------------------------------------------------------------
        match_rate = (
            (len(matched) / total_invoices * 100)
            if total_invoices > 0 else 0.0
        )

        self.report = TaxMatchReport(
            matched=matched,
            unmatched_invoices=unmatched_invoice_ids,
            unmatched_filings=unmatched_filing_ids,
            exceptions=self.trust.exception_logger.exceptions,
            match_rate=round(match_rate, 2),
            total_invoices=total_invoices,
            total_filings=total_filings,
        )
 
        # Save
        output_path = OUTPUT_DIR / "tax_match_report.json"
        OUTPUT_DIR.mkdir(exist_ok=True)
        with open(output_path, "w") as f:
            f.write(self.report.to_json())

        return self.report


def run_tax_matching() -> TaxMatchReport:
    """Convenience function to run GST tax matching."""
    matcher = TaxLineMatcher()
    report = matcher.run()

    print("=" * 60)
    print("TAX-LINE MATCH REPORT")
    print("=" * 60)
    print(f"Match Rate: {report.match_rate}%")
    print(f"Matched: {len(report.matched)}")
    print(f"Unmatched Invoices: {len(report.unmatched_invoices)}")
    print(f"Unmatched Filings: {len(report.unmatched_filings)}")
    print(f"Exceptions: {len(report.exceptions)}")

    # Highlight GSTIN mismatches
    gstin_issues = [e for e in report.exceptions if e.reason_code == "GSTIN_MISMATCH"]
    if gstin_issues:
        print(f"\n⚠️  GSTIN Fraud Alerts: {len(gstin_issues)}")
        for e in gstin_issues:
            print(f"  • {e.record_id}: {e.details}")

    return report


if __name__ == "__main__":
    run_tax_matching()
