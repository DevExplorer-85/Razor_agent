"""
Synthetic Data Generator — Finance Controller Agent

Generates 60+ records across all data sources with intentional anomalies:
- 3 duplicate transaction IDs (webhook replay attack simulation)
- 4 amount mismatches (rounding/fee errors)
- 3 missing UTR references
- 4 late settlements (date shift >3 days)
- 2 currency mismatches
- 2 tampered GSTINs (valid amount, wrong GSTIN)
- 3 invalid/missing signatures

Run: python -m data.generate_synthetic
"""
from __future__ import annotations
import json
import csv
import hmac
import hashlib
import random
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
project_root = backend_dir.parent
for p in (str(project_root), str(backend_dir)):
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from backend.config import WEBHOOK_SECRET
except ImportError:
    from config import WEBHOOK_SECRET


DATA_DIR = Path(__file__).resolve().parent
random.seed(42)  # Reproducible

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
CUSTOMER_NAMES = [
    "Priya Sharma", "Amit Patel", "Sneha Reddy", "Vikram Singh", "Ananya Gupta",
    "Rahul Mehta", "Kavita Nair", "Rohan Joshi", "Deepa Iyer", "Arjun Kapoor",
    "Meera Verma", "Suresh Kumar", "Neha Agarwal", "Karthik Rao", "Pooja Desai",
]
EMAILS = [f"{n.split()[0].lower()}@example.com" for n in CUSTOMER_NAMES]
METHODS = ["upi", "card", "netbanking", "wallet", "upi", "upi", "card"]
HSN_CODES = ["998431", "998314", "998313", "998412", "998399"]
GSTINS = [
    "27AABCU9603R1ZM", "29AABCU9603R1ZN", "07AABCU9603R1ZP",
    "33AABCU9603R1ZQ", "06AABCU9603R1ZR", "09AABCU9603R1ZS",
    "19AABCU9603R1ZT", "36AABCU9603R1ZU", "32AABCU9603R1ZV",
    "21AABCU9603R1ZW", "24AABCU9603R1ZX", "08AABCU9603R1ZY",
]
FAKE_GSTINS = ["27ZZZZZ0000Z1ZZ", "29XXXXX9999X1XX"]  # For tampered invoices

BASE_DATE = datetime(2026, 8, 1)


def ts(dt: datetime) -> int:
    """Convert datetime to unix timestamp."""
    return int(dt.timestamp())


def sign_payload(payload_dict: dict) -> str:
    """Compute HMAC-SHA256 signature for a payload dict."""
    payload_str = json.dumps(payload_dict, sort_keys=True, separators=(",", ":"))
    return hmac.new(
        WEBHOOK_SECRET.encode(), payload_str.encode(), hashlib.sha256
    ).hexdigest()


def gen_utr() -> str:
    """Generate a realistic UTR reference."""
    banks = ["AXIS", "HDFC", "ICIC", "SBIN", "UTIB"]
    return f"{random.choice(banks)}CN{random.randint(1000000000, 9999999999)}"


# ---------------------------------------------------------------------------
# Generate Settlements
# ---------------------------------------------------------------------------
def generate_settlements(n=50):
    settlements = []
    utrs = []

    for i in range(n):
        dt = BASE_DATE + timedelta(days=i % 30, hours=random.randint(0, 23))
        amount = random.randint(50000, 5000000)  # ₹500 - ₹50,000 in paise
        fees = int(amount * 0.02)  # 2% fee
        tax = int(fees * 0.18)     # 18% GST on fees
        utr = gen_utr()
        utrs.append(utr)

        currency = "INR"
        # Anomaly: 2 currency mismatches (records 40, 41)
        if i in (40, 41):
            currency = "USD" if i == 40 else "EUR"

        payload = {
            "id": f"setl_{1000 + i:05d}",
            "entity": "settlement",
            "amount": amount,
            "status": "processed",
            "fees": fees,
            "tax": tax,
            "utr": utr,
            "created_at": ts(dt),
            "currency": currency,
        }

        # Anomaly: 3 missing UTR (records 35, 36, 37)
        if i in (35, 36, 37):
            payload["utr"] = ""
            utrs[-1] = ""

        # Anomaly: 4 late settlements — shift date by 5-8 days (records 30-33)
        if i in (30, 31, 32, 33):
            late_dt = dt + timedelta(days=random.randint(5, 8))
            payload["created_at"] = ts(late_dt)

        # Compute signature (on clean payload)
        sig = sign_payload(payload)
        payload["signature"] = sig

        # Anomaly: 3 invalid signatures (records 45, 46, 47)
        if i in (45, 46, 47):
            payload["signature"] = "INVALID_SIG_" + str(i)

        settlements.append(payload)

    # Anomaly: 3 duplicate IDs (copy records 5, 10, 15 with same IDs)
    for dup_idx in (5, 10, 15):
        dup = dict(settlements[dup_idx])
        dup["created_at"] = ts(BASE_DATE + timedelta(days=28))  # Different timestamp
        settlements.append(dup)

    return settlements, utrs


# ---------------------------------------------------------------------------
# Generate Payments (linked to settlements)
# ---------------------------------------------------------------------------
def generate_payments(settlements):
    payments = []
    for i, setl in enumerate(settlements):
        if i >= 50:  # Skip duplicates for payment generation
            break
        # 1-3 payments per settlement
        num_payments = random.choice([1, 1, 1, 2, 2, 3])
        remaining = setl["amount"]

        for j in range(num_payments):
            if j == num_payments - 1:
                pay_amount = remaining
            else:
                pay_amount = remaining // (num_payments - j)
                remaining -= pay_amount

            fee = int(pay_amount * 0.02)
            tax = int(fee * 0.18)
            cust_idx = (i + j) % len(CUSTOMER_NAMES)

            payment = {
                "id": f"pay_{i:04d}_{j:02d}",
                "order_id": f"order_{i:04d}_{j:02d}",
                "amount": pay_amount,
                "currency": setl.get("currency", "INR"),
                "method": random.choice(METHODS),
                "fee": fee,
                "tax": tax,
                "status": "captured",
                "settlement_id": setl["id"],
                "customer_email": EMAILS[cust_idx],
                "customer_name": CUSTOMER_NAMES[cust_idx],
                "created_at": setl["created_at"] - random.randint(3600, 86400),
            }
            payments.append(payment)

    return payments


# ---------------------------------------------------------------------------
# Generate Bank Statements (from settlements)
# ---------------------------------------------------------------------------
def generate_bank_statements(settlements, utrs):
    entries = []
    balance = 100000000  # Starting balance: ₹10,00,000

    for i, setl in enumerate(settlements):
        if i >= 50:
            break
        utr = utrs[i] if i < len(utrs) else ""
        credit = setl["amount"] - setl["fees"] - setl["tax"]  # Net credit
        dt = datetime.fromtimestamp(setl["created_at"])

        # Anomaly: 4 amount mismatches (records 20-23) — rounding errors
        if i in (20, 21, 22, 23):
            credit += random.choice([-50, 50, -100, 100])  # ±₹0.50 to ±₹1

        balance += credit
        entry = {
            "date": dt.strftime("%Y-%m-%d"),
            "description": f"RAZORPAY SETTLEMENT {setl['id']}",
            "reference": utr,
            "credit": credit,
            "debit": 0,
            "balance": balance,
            "utr": utr,
        }
        entries.append(entry)

    return entries


# ---------------------------------------------------------------------------
# Generate Ledger Entries (from payments)
# ---------------------------------------------------------------------------
def generate_ledger_entries(payments):
    entries = []
    for i, pay in enumerate(payments):
        dt = datetime.fromtimestamp(pay["created_at"])
        entry = {
            "entry_id": f"led_{i:05d}",
            "date": dt.strftime("%Y-%m-%d"),
            "payment_id": pay["id"],
            "order_id": pay["order_id"],
            "amount": pay["amount"],
            "currency": pay.get("currency", "INR"),
            "description": f"Payment received - {pay['customer_name']}",
            "category": "revenue",
        }
        entries.append(entry)

    return entries


# ---------------------------------------------------------------------------
# Generate Invoices & GST Filings (for Tax module)
# ---------------------------------------------------------------------------
def generate_invoices_and_gst(payments):
    invoices = []
    gst_filings = []

    for i, pay in enumerate(payments[:40]):  # First 40 payments get invoices
        dt = datetime.fromtimestamp(pay["created_at"])
        gstin = GSTINS[i % len(GSTINS)]
        taxable = pay["amount"]
        cgst = int(taxable * 0.09)
        sgst = int(taxable * 0.09)
        total = taxable + cgst + sgst

        inv = {
            "invoice_id": f"INV-2026-{i+1:04d}",
            "date": dt.strftime("%Y-%m-%d"),
            "customer_name": pay.get("customer_name", "Unknown"),
            "gstin": gstin,
            "hsn_code": random.choice(HSN_CODES),
            "taxable_value": taxable,
            "cgst": cgst,
            "sgst": sgst,
            "igst": 0,
            "total": total,
            "payment_id": pay["id"],
        }
        invoices.append(inv)

        # Corresponding GST filing
        filing_gstin = gstin
        filing_taxable = taxable
        filing_cgst = cgst
        filing_sgst = sgst

        # Anomaly: 2 tampered GSTINs (records 25, 26)
        if i in (25, 26):
            filing_gstin = FAKE_GSTINS[i - 25]

        # Anomaly: mix in a tax amount mismatch (record 30)
        if i == 30:
            filing_cgst += 500  # Off by ₹5

        filing = {
            "filing_id": f"GST-2026-{i+1:04d}",
            "return_period": "082026",
            "supplier_gstin": filing_gstin,
            "invoice_number": inv["invoice_id"],
            "invoice_date": inv["date"],
            "taxable_value": filing_taxable,
            "cgst": filing_cgst,
            "sgst": filing_sgst,
            "igst": 0,
            "total": filing_taxable + filing_cgst + filing_sgst,
        }
        gst_filings.append(filing)

    return invoices, gst_filings


# ---------------------------------------------------------------------------
# Generate Operating Expenses (OpEx, SaaS, Hosting, Payroll, Ads)
# ---------------------------------------------------------------------------
def generate_operating_expenses():
    vendors = [
        ("AWS Cloud Hosting", "Cloud Infrastructure", 450000, "998313", "YES"),
        ("Slack Technologies", "SaaS Subscriptions", 65000, "998431", "YES"),
        ("Google Ads India", "Marketing & Ad Spend", 250000, "998314", "YES"),
        ("Meta Platform Ads", "Marketing & Ad Spend", 180000, "998314", "YES"),
        ("GitHub Enterprise", "Developer Tools", 42000, "998431", "YES"),
        ("WeWork Co-Working", "Office Rent & Utilities", 350000, "997212", "YES"),
        ("Employee Payroll", "Salaries & Statutory", 2800000, "N/A", "NO"),
        ("Razorpay Gateway Fees", "Payment Processing", 115000, "997159", "YES"),
        ("KPMG Audit Advisory", "Legal & Accounting", 220000, "998222", "YES"),
        ("Twilio SMS Gateway", "Communication APIs", 38000, "998412", "YES"),
    ]

    opex = []
    for i, (vname, cat, amt, code, itc) in enumerate(vendors):
        dt = BASE_DATE + timedelta(days=(i * 3) % 28)
        opex.append({
            "expense_id": f"OPEX-2026-{i+1:03d}",
            "category": cat,
            "vendor_name": vname,
            "amount_rupees": amt,
            "expense_date": dt.strftime("%Y-%m-%d"),
            "payment_status": "PAID" if i % 4 != 0 else "PENDING",
            "tax_deductible_itc": itc,
            "hsn_sac_code": code
        })
    return opex


# ---------------------------------------------------------------------------
# Generate Tax Deductions (TDS Section 194C / 194J / 194I)
# ---------------------------------------------------------------------------
def generate_tax_deductions_tds():
    records = [
        ("KPMG Audit Advisory", "AAACK1234F", "194J", 220000, 10.0, 22000, "DEPOSITED"),
        ("WeWork Office Rent", "AAACW9876G", "194I", 350000, 10.0, 35000, "DEPOSITED"),
        ("Apex Security Agency", "AAACA4321H", "194C", 120000, 2.0, 2400, "PENDING"),
        ("CloudScale Tech Consultancy", "AAACC5678J", "194J", 450000, 10.0, 45000, "PENDING"),
        ("DesignWorks Studio", "AAACD8765K", "194J", 85000, 10.0, 8500, "DEPOSITED"),
    ]

    tds_list = []
    for i, (vname, pan, sec, gross, rate, ded, status) in enumerate(records):
        dt = BASE_DATE + timedelta(days=i * 5)
        tds_list.append({
            "tds_id": f"TDS-2026-{i+1:03d}",
            "vendor_name": vname,
            "vendor_pan": pan,
            "section": sec,
            "gross_payment_rupees": gross,
            "tds_rate_percent": rate,
            "tds_deducted_rupees": ded,
            "deduction_date": dt.strftime("%Y-%m-%d"),
            "challan_status": status
        })
    return tds_list


# ---------------------------------------------------------------------------
# Generate Vendor Payables (Accounts Payable Aging)
# ---------------------------------------------------------------------------
def generate_vendor_payables():
    payables_data = [
        ("AWS Cloud Hosting", "AWS-INV-9901", 450000, "2026-08-05", "2026-09-05", "CURRENT", "UNPAID"),
        ("CloudScale Tech Consultancy", "CST-INV-4410", 450000, "2026-07-15", "2026-08-15", "1-30_DAYS", "OVERDUE"),
        ("Apex Security Agency", "APX-INV-1102", 120000, "2026-06-30", "2026-07-30", "31-60_DAYS", "OVERDUE"),
        ("Twilio Communication APIs", "TW-INV-8812", 38000, "2026-08-20", "2026-09-20", "CURRENT", "PARTIAL"),
        ("DesignWorks Studio", "DWS-INV-3091", 85000, "2026-08-10", "2026-09-10", "CURRENT", "UNPAID"),
    ]

    payables = []
    for i, (vname, iref, amt, idate, ddate, aging, status) in enumerate(payables_data):
        payables.append({
            "payable_id": f"PAY-2026-{i+1:03d}",
            "vendor_name": vname,
            "invoice_ref": iref,
            "invoice_amount_rupees": amt,
            "invoice_date": idate,
            "due_date": ddate,
            "aging_category": aging,
            "tds_applicable": "YES",
            "status": status
        })
    return payables


# ---------------------------------------------------------------------------
# Generate Corporate Revenue Streams
# ---------------------------------------------------------------------------
def generate_corporate_revenue():
    rev_data = [
        ("Subscription SaaS MRR", "Enterprise Tier - 45 Subscriptions", 3200000, "2026-08-01", "COLLECTED"),
        ("Enterprise Contract", "Tata Consultancy Services - License", 1500000, "2026-08-10", "COLLECTED"),
        ("Razorpay Payment Gateway", "Online Merchant Collections", 45820000, "2026-08-25", "COLLECTED"),
        ("Enterprise Contract", "Infosys Finance Solutions - Custom Integration", 2500000, "2026-08-28", "ACCRUED"),
    ]

    revenues = []
    for i, (chan, client, amt, rdate, status) in enumerate(rev_data):
        revenues.append({
            "revenue_id": f"REV-2026-{i+1:03d}",
            "channel": chan,
            "client_name": client,
            "amount_rupees": amt,
            "recognition_date": rdate,
            "status": status
        })
    return revenues


# ---------------------------------------------------------------------------
# Write to files
# ---------------------------------------------------------------------------
def write_json(data, filename):
    path = DATA_DIR / filename
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"  ✓ {filename}: {len(data)} records")


def write_csv(data, filename):
    if not data:
        return
    path = DATA_DIR / filename
    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
    print(f"  ✓ {filename}: {len(data)} records")


def main():
    print("=" * 60)
    print("Finance Controller Agent — Versatile Synthetic Data Generator")
    print("=" * 60)
    print()

    print("Generating settlements...")
    settlements, utrs = generate_settlements(50)
    write_json(settlements, "razorpay_settlements.json")

    print("Generating payments...")
    payments = generate_payments(settlements)
    write_json(payments, "razorpay_payments.json")

    print("Generating bank statements...")
    bank_entries = generate_bank_statements(settlements, utrs)
    write_csv(bank_entries, "bank_statements.csv")

    print("Generating ledger entries...")
    ledger_entries = generate_ledger_entries(payments)
    write_csv(ledger_entries, "ledger_entries.csv")

    print("Generating invoices & GST filings...")
    invoices, gst_filings = generate_invoices_and_gst(payments)
    write_csv(invoices, "invoices.csv")
    write_csv(gst_filings, "gst_filings.csv")

    print("Generating Operating Expenses (OpEx)...")
    opex = generate_operating_expenses()
    write_csv(opex, "operating_expenses.csv")

    print("Generating TDS Tax Deductions...")
    tds = generate_tax_deductions_tds()
    write_csv(tds, "tax_deductions_tds.csv")

    print("Generating Vendor Payables...")
    payables = generate_vendor_payables()
    write_csv(payables, "vendor_payables.csv")

    print("Generating Corporate Revenue Streams...")
    revenue = generate_corporate_revenue()
    write_csv(revenue, "corporate_revenue.csv")

    # Summary
    total = (
        len(settlements) + len(payments) + len(bank_entries)
        + len(ledger_entries) + len(invoices) + len(gst_filings)
        + len(opex) + len(tds) + len(payables) + len(revenue)
    )
    print()
    print(f"Total records generated: {total}")
    print("Versatile corporate finance data ready!")


if __name__ == "__main__":
    main()
