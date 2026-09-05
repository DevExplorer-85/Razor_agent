"""
Finance Controller Agent — Database Seeding Script

Populates SQLite database (finance_controller.db) from flat CSV & JSON
files located in backend/data/.
"""
import csv
import json
import sqlite3
from pathlib import Path

from config import DATA_DIR
from database import init_db, get_db_connection, clear_and_reseed_db


def seed_database(force_reseed: bool = False) -> dict:
    """Seeds the SQLite database from backend/data files."""
    init_db()

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if database already has data
    cursor.execute("SELECT COUNT(*) FROM razorpay_settlements")
    settlement_count = cursor.fetchone()[0]

    if settlement_count > 0 and not force_reseed:
        conn.close()
        return {"status": "skipped", "message": "Database already populated.", "settlements_count": settlement_count}

    if force_reseed:
        clear_and_reseed_db()
        conn = get_db_connection()
        cursor = conn.cursor()

    stats = {}

    # 1. Seed Razorpay Settlements
    json_path = DATA_DIR / "razorpay_settlements.json"
    if json_path.exists():
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            settlements = data if isinstance(data, list) else data.get("items", [])
            for s in settlements:
                cursor.execute("""
                    INSERT OR REPLACE INTO razorpay_settlements
                    (id, entity, amount, status, utr, fees, tax, created_at, hmac_signature)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    s.get("id"),
                    s.get("entity", "settlement"),
                    s.get("amount", 0),
                    s.get("status", "processed"),
                    s.get("utr"),
                    s.get("fees", 0),
                    s.get("tax", 0),
                    s.get("created_at"),
                    s.get("hmac_signature")
                ))
            stats["razorpay_settlements"] = len(settlements)

    # 2. Seed Bank Statements
    bank_csv = DATA_DIR / "bank_statements.csv"
    if bank_csv.exists():
        with open(bank_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count = 0
            for r in reader:
                cursor.execute("""
                    INSERT OR REPLACE INTO bank_statements
                    (utr, bank_name, account_number, credit_amount, debit_amount, transaction_date, description)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    r.get("utr") or r.get("reference_number") or r.get("id"),
                    r.get("bank_name", "Axis Bank"),
                    r.get("account_number", "9180200482910"),
                    int(float(r.get("credit_amount") or r.get("amount") or 0)),
                    int(float(r.get("debit_amount") or 0)),
                    r.get("transaction_date") or r.get("date"),
                    r.get("description", "Razorpay Payout Credit")
                ))
                count += 1
            stats["bank_statements"] = count

    # 3. Seed Ledger Entries
    ledger_csv = DATA_DIR / "ledger_entries.csv"
    if ledger_csv.exists():
        with open(ledger_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count = 0
            for r in reader:
                cursor.execute("""
                    INSERT OR REPLACE INTO ledger_entries
                    (entry_id, account_code, reference_code, amount, entry_type, posting_date, description)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    r.get("entry_id") or r.get("id"),
                    r.get("account_code", "1100-BANK"),
                    r.get("reference_code") or r.get("utr"),
                    int(float(r.get("amount") or 0)),
                    r.get("entry_type", "CREDIT"),
                    r.get("posting_date") or r.get("date"),
                    r.get("description", "Nodal Account Ledger Entry")
                ))
                count += 1
            stats["ledger_entries"] = count

    # 4. Seed Invoices
    inv_csv = DATA_DIR / "invoices.csv"
    if inv_csv.exists():
        with open(inv_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count = 0
            for r in reader:
                cursor.execute("""
                    INSERT OR REPLACE INTO invoices
                    (invoice_id, customer_name, gstin, taxable_amount, cgst, sgst, igst, total_tax, invoice_date, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    r.get("invoice_id") or r.get("id"),
                    r.get("customer_name") or r.get("vendor_name", "Enterprise Client"),
                    r.get("gstin") or r.get("vendor_gstin", "27AAAAA0000A1Z5"),
                    float(r.get("taxable_amount") or r.get("amount") or 0),
                    float(r.get("cgst") or 0),
                    float(r.get("sgst") or 0),
                    float(r.get("igst") or 0),
                    float(r.get("total_tax") or r.get("tax") or 0),
                    r.get("invoice_date") or r.get("date"),
                    r.get("status", "ISSUED")
                ))
                count += 1
            stats["invoices"] = count

    # 5. Seed GST Filings
    gst_csv = DATA_DIR / "gst_filings.csv"
    if gst_csv.exists():
        with open(gst_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count = 0
            for r in reader:
                cursor.execute("""
                    INSERT OR REPLACE INTO gst_filings
                    (filing_id, vendor_name, vendor_gstin, invoice_number, claimed_taxable_amount, claimed_itc, filing_period, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    r.get("filing_id") or r.get("id"),
                    r.get("vendor_name", "Vendor Partner"),
                    r.get("vendor_gstin") or r.get("gstin", "27AAAAA0000A1Z5"),
                    r.get("invoice_number") or r.get("invoice_id", "INV-001"),
                    float(r.get("claimed_taxable_amount") or r.get("taxable_amount") or 0),
                    float(r.get("claimed_itc") or r.get("itc") or 0),
                    r.get("filing_period", "2026-08"),
                    r.get("status", "FILED")
                ))
                count += 1
            stats["gst_filings"] = count

    # 6. Seed Operating Expenses (OpEx)
    opex_csv = DATA_DIR / "operating_expenses.csv"
    if opex_csv.exists():
        with open(opex_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count = 0
            for r in reader:
                cursor.execute("""
                    INSERT OR REPLACE INTO operating_expenses
                    (expense_id, category, vendor_name, amount_rupees, expense_date, payment_status, tax_deductible_itc, hsn_sac_code)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    r.get("expense_id"),
                    r.get("category"),
                    r.get("vendor_name"),
                    float(r.get("amount_rupees") or 0),
                    r.get("expense_date"),
                    r.get("payment_status", "PAID"),
                    r.get("tax_deductible_itc", "YES"),
                    r.get("hsn_sac_code", "N/A")
                ))
                count += 1
            stats["operating_expenses"] = count

    # 7. Seed Tax Deductions (TDS)
    tds_csv = DATA_DIR / "tax_deductions_tds.csv"
    if tds_csv.exists():
        with open(tds_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count = 0
            for r in reader:
                cursor.execute("""
                    INSERT OR REPLACE INTO tax_deductions_tds
                    (tds_id, vendor_name, vendor_pan, section, gross_payment_rupees, tds_rate_percent, tds_deducted_rupees, deduction_date, challan_status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    r.get("tds_id"),
                    r.get("vendor_name"),
                    r.get("vendor_pan"),
                    r.get("section"),
                    float(r.get("gross_payment_rupees") or 0),
                    float(r.get("tds_rate_percent") or 0),
                    float(r.get("tds_deducted_rupees") or 0),
                    r.get("deduction_date"),
                    r.get("challan_status", "DEPOSITED")
                ))
                count += 1
            stats["tax_deductions_tds"] = count

    # 8. Seed Vendor Payables
    payables_csv = DATA_DIR / "vendor_payables.csv"
    if payables_csv.exists():
        with open(payables_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count = 0
            for r in reader:
                cursor.execute("""
                    INSERT OR REPLACE INTO vendor_payables
                    (payable_id, vendor_name, invoice_ref, invoice_amount_rupees, invoice_date, due_date, aging_category, tds_applicable, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    r.get("payable_id"),
                    r.get("vendor_name"),
                    r.get("invoice_ref"),
                    float(r.get("invoice_amount_rupees") or 0),
                    r.get("invoice_date"),
                    r.get("due_date"),
                    r.get("aging_category", "CURRENT"),
                    r.get("tds_applicable", "YES"),
                    r.get("status", "UNPAID")
                ))
                count += 1
            stats["vendor_payables"] = count

    # 9. Seed Corporate Revenue
    rev_csv = DATA_DIR / "corporate_revenue.csv"
    if rev_csv.exists():
        with open(rev_csv, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count = 0
            for r in reader:
                cursor.execute("""
                    INSERT OR REPLACE INTO corporate_revenue
                    (revenue_id, channel, client_name, amount_rupees, recognition_date, status)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (
                    r.get("revenue_id"),
                    r.get("channel"),
                    r.get("client_name"),
                    float(r.get("amount_rupees") or 0),
                    r.get("recognition_date"),
                    r.get("status", "COLLECTED")
                ))
                count += 1
            stats["corporate_revenue"] = count

    # Log initial audit entry
    cursor.execute(
        "INSERT INTO audit_logs (action, entity_type, details) VALUES (?, ?, ?)",
        ("SEED_DATABASE", "SYSTEM", json.dumps(stats))
    )

    conn.commit()
    conn.close()

    return {"status": "success", "seeded_tables": stats}


if __name__ == "__main__":
    result = seed_database(force_reseed=True)
    print("Database seeding completed:", result)
