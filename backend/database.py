"""
Finance Controller Agent — SQLite Database Layer

Provides connection management, schema initialization, stats, and CRUD
operations for the persistent SQLite database (finance_controller.db).
Includes corporate finance tables: OpEx, TDS Tax, Vendor Payables, and Revenue.
"""
import sqlite3
import os
import json
from pathlib import Path
from typing import Dict, Any, List, Optional

from config import DB_PATH


def get_db_connection() -> sqlite3.Connection:
    """Returns a connection to SQLite database with ROW factory for dict access."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Initializes the database schema if tables do not exist."""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Razorpay Settlements Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS razorpay_settlements (
            id TEXT PRIMARY KEY,
            entity TEXT DEFAULT 'settlement',
            amount INTEGER NOT NULL,
            status TEXT DEFAULT 'processed',
            utr TEXT,
            fees INTEGER DEFAULT 0,
            tax INTEGER DEFAULT 0,
            created_at INTEGER,
            hmac_signature TEXT
        )
    """)

    # 2. Bank Statements Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bank_statements (
            utr TEXT PRIMARY KEY,
            bank_name TEXT NOT NULL,
            account_number TEXT,
            credit_amount INTEGER NOT NULL,
            debit_amount INTEGER DEFAULT 0,
            transaction_date TEXT,
            description TEXT
        )
    """)

    # 3. Ledger Entries Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS ledger_entries (
            entry_id TEXT PRIMARY KEY,
            account_code TEXT NOT NULL,
            reference_code TEXT,
            amount INTEGER NOT NULL,
            entry_type TEXT CHECK(entry_type IN ('DEBIT', 'CREDIT')),
            posting_date TEXT,
            description TEXT
        )
    """)

    # 4. Invoices Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS invoices (
            invoice_id TEXT PRIMARY KEY,
            customer_name TEXT,
            gstin TEXT NOT NULL,
            taxable_amount REAL NOT NULL,
            cgst REAL DEFAULT 0,
            sgst REAL DEFAULT 0,
            igst REAL DEFAULT 0,
            total_tax REAL NOT NULL,
            invoice_date TEXT,
            status TEXT DEFAULT 'ISSUED'
        )
    """)

    # 5. GST Filings Table (GSTR-2B)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS gst_filings (
            filing_id TEXT PRIMARY KEY,
            vendor_name TEXT,
            vendor_gstin TEXT NOT NULL,
            invoice_number TEXT NOT NULL,
            claimed_taxable_amount REAL NOT NULL,
            claimed_itc REAL NOT NULL,
            filing_period TEXT,
            status TEXT DEFAULT 'FILED'
        )
    """)

    # 6. Operating Expenses Table (OpEx, SaaS, Payroll, Rent, Ads)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS operating_expenses (
            expense_id TEXT PRIMARY KEY,
            category TEXT NOT NULL,
            vendor_name TEXT NOT NULL,
            amount_rupees REAL NOT NULL,
            expense_date TEXT,
            payment_status TEXT DEFAULT 'PAID',
            tax_deductible_itc TEXT DEFAULT 'YES',
            hsn_sac_code TEXT
        )
    """)

    # 7. Tax Deductions TDS Table (Section 194C / 194J / 194I)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tax_deductions_tds (
            tds_id TEXT PRIMARY KEY,
            vendor_name TEXT NOT NULL,
            vendor_pan TEXT NOT NULL,
            section TEXT NOT NULL,
            gross_payment_rupees REAL NOT NULL,
            tds_rate_percent REAL NOT NULL,
            tds_deducted_rupees REAL NOT NULL,
            deduction_date TEXT,
            challan_status TEXT DEFAULT 'DEPOSITED'
        )
    """)

    # 8. Vendor Payables Table (Accounts Payable Aging)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS vendor_payables (
            payable_id TEXT PRIMARY KEY,
            vendor_name TEXT NOT NULL,
            invoice_ref TEXT NOT NULL,
            invoice_amount_rupees REAL NOT NULL,
            invoice_date TEXT,
            due_date TEXT,
            aging_category TEXT NOT NULL,
            tds_applicable TEXT DEFAULT 'YES',
            status TEXT DEFAULT 'UNPAID'
        )
    """)

    # 9. Corporate Revenue Streams Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS corporate_revenue (
            revenue_id TEXT PRIMARY KEY,
            channel TEXT NOT NULL,
            client_name TEXT NOT NULL,
            amount_rupees REAL NOT NULL,
            recognition_date TEXT,
            status TEXT DEFAULT 'COLLECTED'
        )
    """)

    # 10. Reconciliation Runs Audit Log Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS reconciliation_runs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            run_timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            total_settlements INTEGER,
            total_bank_entries INTEGER,
            matched_count INTEGER,
            exceptions_count INTEGER,
            match_rate REAL,
            summary_json TEXT
        )
    """)

    # 11. General Audit Logs Table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            action TEXT NOT NULL,
            entity_type TEXT,
            entity_id TEXT,
            details TEXT
        )
    """)

    conn.commit()
    conn.close()


def get_all_tables() -> List[str]:
    """Returns list of all active tables."""
    return [
        "razorpay_settlements",
        "bank_statements",
        "ledger_entries",
        "invoices",
        "gst_filings",
        "operating_expenses",
        "tax_deductions_tds",
        "vendor_payables",
        "corporate_revenue",
        "reconciliation_runs",
        "audit_logs"
    ]


def get_db_stats() -> Dict[str, Any]:
    """Returns database size, table record counts, and status."""
    if not DB_PATH.exists():
        init_db()

    conn = get_db_connection()
    cursor = conn.cursor()

    tables = get_all_tables()

    counts = {}
    total_records = 0

    for table in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {table}")
            cnt = cursor.fetchone()[0]
            counts[table] = cnt
            total_records += cnt
        except Exception:
            counts[table] = 0

    conn.close()

    size_bytes = DB_PATH.stat().st_size if DB_PATH.exists() else 0
    size_mb = round(size_bytes / (1024 * 1024), 2)

    return {
        "status": "healthy",
        "database_path": str(DB_PATH),
        "size_mb": size_mb,
        "total_records": total_records,
        "table_counts": counts
    }


def get_table_records(table_name: str, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    """Fetches paginated rows from a specific database table."""
    allowed_tables = get_all_tables()
    if table_name not in allowed_tables:
        raise ValueError(f"Invalid table name: {table_name}")

    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(f"SELECT * FROM {table_name} LIMIT ? OFFSET ?", (limit, offset))
    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def insert_record(table_name: str, record: Dict[str, Any]) -> Dict[str, Any]:
    """Dynamically inserts a row into the specified table."""
    allowed_tables = [
        "razorpay_settlements",
        "bank_statements",
        "ledger_entries",
        "invoices",
        "gst_filings",
        "operating_expenses",
        "tax_deductions_tds",
        "vendor_payables",
        "corporate_revenue"
    ]
    if table_name not in allowed_tables:
        raise ValueError(f"Table '{table_name}' does not allow direct insertion.")

    conn = get_db_connection()
    cursor = conn.cursor()

    columns = ", ".join(record.keys())
    placeholders = ", ".join(["?"] * len(record))
    sql = f"INSERT OR REPLACE INTO {table_name} ({columns}) VALUES ({placeholders})"

    cursor.execute(sql, list(record.values()))

    # Audit log
    cursor.execute(
        "INSERT INTO audit_logs (action, entity_type, entity_id, details) VALUES (?, ?, ?, ?)",
        ("INSERT_RECORD", table_name, str(record.get("id") or record.get("utr") or record.get("invoice_id") or record.get("expense_id") or record.get("tds_id") or record.get("payable_id") or ""), json.dumps(record))
    )

    conn.commit()
    conn.close()

    return {"status": "success", "table": table_name, "inserted": record}


def clear_and_reseed_db() -> None:
    """Clears all table rows and re-initializes table structure."""
    conn = get_db_connection()
    cursor = conn.cursor()

    tables = get_all_tables()

    for table in tables:
        cursor.execute(f"DELETE FROM {table}")

    conn.commit()
    conn.close()
