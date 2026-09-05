<<<<<<< HEAD
# Razor_agent
=======
# Finance Controller Agent — Razorpay Reconciliation Suite

A unified reconciliation platform with **fraud-prevention built into every data-ingestion point**. Four modular capabilities share one data layer and one trust/validation layer.

## Architecture

```
Finance Controller Agent
├── Shared Data Layer (synthetic: 60+ records across 6 sources)
├── Shared Trust/Validation Layer (runs at every ingestion point)
├── Module 1: Reconciliation Engine (rule-based + fuzzy matching)
├── Module 2: Settlement Q&A Agent (RAG + LLM/rule-based)
├── Module 3: Forward Cash Forecaster (Holt-Winters on clean data)
└── Module 4: Tax-Line Matcher (GST invoice ↔ filing verification)
```

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Generate synthetic dataset (60+ records with intentional anomalies)
python -m data.generate_synthetic

# Start the FastAPI server
uvicorn server:app --reload --port 8000

# API docs: http://localhost:8000/docs
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Next.js dev server
npm run dev

# Open: http://localhost:3000
```

### 3. Run the Demo

1. Open **http://localhost:3000** — see the Dashboard
2. Go to **Reconciliation** → Click "Run Reconciliation"
3. Go to **Q&A Agent** → Ask questions about the results
4. Go to **Tax Matcher** → Click "Run Tax Matching"
5. Go to **Forecast** → Click "Generate Forecast"

## Shared Trust/Validation Layer

**This is the key differentiator.** Every module routes incoming data through these checks before treating anything as fact:

| Check | What It Does | Fraud Vector Defended |
|---|---|---|
| **Signature Verification** | HMAC-SHA256 on webhook payloads using constant-time comparison | Tampered/forged webhook payloads |
| **Deduplication** | Flags repeated settlement/payment IDs instead of double-counting | Webhook replay attacks |
| **Cross-Field Verification** | Amount + currency + reference must ALL agree (single-field match = suspicious) | Amount-only match accepting tampered records |
| **Canonical Source Enforcement** | Ledger amount is always authoritative; external amounts never override without reconciliation | External amount override / MITM tampering |
| **Exception Logging** | Every failed check → explicit exception with reason code (never silently dropped) | Silent data corruption |

### How Each Module Maps to Trust

- **Module 1 (Reconciliation)**: Runs the full trust pipeline on every record before matching. Three-field exact match first, fuzzy second.
- **Module 2 (Q&A Agent)**: Answers from verified data by default. If a query touches flagged records, the answer **explicitly warns** rather than presenting it as clean fact.
- **Module 3 (Forecaster)**: Trains **only** on EXACT-match, non-exception records. Exception-flagged records are excluded to prevent fraud-contaminated forecasts.
- **Module 4 (Tax Matcher)**: Requires GSTIN + amount + tax to all match. Amount-only matches are **rejected** as suspicious (defends against fake invoices with real amounts but wrong GSTINs).

## Reason Codes

| Code | Meaning |
|---|---|
| `SIG_INVALID` | Webhook signature failed HMAC verification |
| `DUPLICATE_ID` | Repeated ID detected (possible replay attack) |
| `AMOUNT_MISMATCH` | Amount disagrees across sources |
| `CURRENCY_MISMATCH` | Currency disagrees across sources |
| `REF_MISSING` | UTR/reference ID missing |
| `GSTIN_MISMATCH` | GSTIN disagrees between invoice and filing |
| `PARTIAL_MATCH` | Only some fields match (suspicious) |
| `DATE_OUTLIER` | Settlement date far from expected |
| `CANONICAL_OVERRIDE` | External amount tried to override ledger |
| `UNMATCHED` | No match found in any source |
| `TAX_AMOUNT_MISMATCH` | Tax amount disagrees |

## Synthetic Dataset

60+ records with **intentional anomalies** for demo:

- 3 duplicate transaction IDs (webhook replay simulation)
- 4 amount mismatches (rounding/fee errors)
- 3 missing UTR references
- 4 late settlements (5-8 day date shifts)
- 2 currency mismatches (USD/EUR instead of INR)
- 2 tampered GSTINs (valid amount, wrong GSTIN)
- 3 invalid webhook signatures
- 1 tax amount mismatch

## API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/reconcile` | POST | Run reconciliation engine |
| `/api/reconcile/summary` | GET | Latest reconciliation summary |
| `/api/trust/status` | GET | Trust layer stats |
| `/api/exceptions` | GET | All exceptions with reason codes |
| `/api/qa/query` | POST | Natural language Q&A |
| `/api/qa/samples` | GET | Sample queries |
| `/api/tax/match` | POST | GST tax-line matching |
| `/api/forecast` | GET | 7-day cash forecast |
| `/api/data/overview` | GET | Dataset record counts |
| `/api/health` | GET | Health check |

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.10+, FastAPI, pandas |
| Trust | HMAC-SHA256 (stdlib) |
| Matching | thefuzz (Levenshtein), custom two-pass engine |
| Q&A | ChromaDB (vector store), Gemini API (optional) |
| Forecasting | statsmodels (Holt-Winters) |
| Frontend | Next.js 14, React, Recharts |
| Styling | Custom CSS (glassmorphism, dark mode) |

## Tests

```bash
cd backend
python -m pytest tests/ -v
```
>>>>>>> 3dec1ac (Intitial commit: Insovant Finance Controller Platform)
