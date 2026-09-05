"""
FastAPI Backend — Finance Controller Agent

REST API serving all four modules:
  - Reconciliation Engine
  - Settlement Q&A Agent
  - Tax-Line Matcher
  - Cash Forecaster

All responses are structured JSON. CORS enabled for Next.js dev server.
Auto-generated Swagger docs at /docs.
"""
from __future__ import annotations
import sys
import json
import os
from pathlib import Path
from contextlib import asynccontextmanager

backend_dir = Path(__file__).resolve().parent
project_root = backend_dir.parent
for p in (str(project_root), str(backend_dir)):
    if p not in sys.path:
        sys.path.insert(0, p)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

try:
    from backend.config import DATA_DIR, OUTPUT_DIR, RECONCILIATION_OUTPUT
    from backend.engine.reconciler import ReconciliationEngine, load_json, load_csv
    from backend.qa.agent import SettlementQAAgent
    from backend.tax.gst_matcher import TaxLineMatcher
    from backend.forecast.forecaster import CashForecaster
    from backend.database import init_db, get_db_stats, get_table_records, insert_record
    from backend.seed_db import seed_database
except ImportError:
    from config import DATA_DIR, OUTPUT_DIR, RECONCILIATION_OUTPUT
    from engine.reconciler import ReconciliationEngine, load_json, load_csv
    from qa.agent import SettlementQAAgent
    from tax.gst_matcher import TaxLineMatcher
    from forecast.forecaster import CashForecaster
    from database import init_db, get_db_stats, get_table_records, insert_record
    from seed_db import seed_database



# ---------------------------------------------------------------------------
# App State (singleton instances)
# ---------------------------------------------------------------------------
class AppState:
    engine: ReconciliationEngine | None = None
    qa_agent: SettlementQAAgent | None = None
    tax_matcher: TaxLineMatcher | None = None
    forecaster: CashForecaster | None = None
    last_recon_report: dict | None = None
    last_tax_report: dict | None = None
    last_forecast: dict | None = None


state = AppState()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and modules on startup."""
    try:
        init_db()
        seed_database()
    except Exception as e:
        print(f"[Warning] Database initialization error: {e}")
    state.qa_agent = SettlementQAAgent()
    yield


app = FastAPI(
    title="Finance Controller Agent",
    description="Razorpay Reconciliation Suite — Unified API for reconciliation, Q&A, tax matching, and cash forecasting.",
    version="1.0.0",
    lifespan=lifespan,
)

# Dynamic CORS configuration for development and production hosting
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
else:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "Insovant.ai Finance Controller Agent API",
        "docs_url": "/docs"
    }


# ---------------------------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------------------------
class QueryRequest(BaseModel):
    query: str
    n_context: Optional[int] = 10


class ReconcileRequest(BaseModel):
    force_refresh: Optional[bool] = False


class DbInsertRequest(BaseModel):
    table_name: str
    record: dict


# ---------------------------------------------------------------------------
# Routes — Database CRUD & Health
# ---------------------------------------------------------------------------
@app.get("/api/db/stats")
async def db_stats():
    """Get SQLite database stats, table counts, and health."""
    try:
        return get_db_stats()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/db/table/{table_name}")
async def db_table(table_name: str, limit: int = 50, offset: int = 0):
    """Get paginated records from a database table."""
    try:
        records = get_table_records(table_name, limit=limit, offset=offset)
        return {"status": "ok", "table": table_name, "count": len(records), "records": records}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/db/insert")
async def db_insert(req: DbInsertRequest):
    """Insert or replace a record in a database table."""
    try:
        res = insert_record(req.table_name, req.record)
        return res
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/db/reseed")
async def db_reseed():
    """Reset and reseed database from data files."""
    try:
        res = seed_database(force_reseed=True)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Routes — Data Overview
# ---------------------------------------------------------------------------
@app.get("/api/data/overview")
async def data_overview():
    """Get dataset overview (record counts per source)."""
    try:
        settlements = load_json(DATA_DIR / "razorpay_settlements.json")
        payments = load_json(DATA_DIR / "razorpay_payments.json")
        bank = load_csv(DATA_DIR / "bank_statements.csv")
        ledger = load_csv(DATA_DIR / "ledger_entries.csv")
        invoices = load_csv(DATA_DIR / "invoices.csv")
        gst = load_csv(DATA_DIR / "gst_filings.csv")

        return {
            "status": "ok",
            "sources": {
                "settlements": len(settlements),
                "payments": len(payments),
                "bank_statements": len(bank),
                "ledger_entries": len(ledger),
                "invoices": len(invoices),
                "gst_filings": len(gst),
            },
            "total_records": (
                len(settlements) + len(payments) + len(bank)
                + len(ledger) + len(invoices) + len(gst)
            ),
        }
    except FileNotFoundError as e:
        raise HTTPException(
            status_code=404,
            detail=f"Data files not found. Run generate_synthetic.py first. Error: {str(e)}"
        )


# ---------------------------------------------------------------------------
# Routes — Reconciliation Engine (Module 1)
# ---------------------------------------------------------------------------
@app.post("/api/reconcile")
async def run_reconciliation(req: ReconcileRequest = ReconcileRequest()):
    """Run the reconciliation engine and return the full report."""
    try:
        state.engine = ReconciliationEngine()
        report = state.engine.run()
        state.last_recon_report = report.to_dict()

        # Re-index for Q&A
        if state.qa_agent:
            state.qa_agent._indexed = False

        return state.last_recon_report
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"Data files not found: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/reconcile/summary")
async def reconciliation_summary():
    """Get the latest reconciliation summary."""
    if state.last_recon_report is None:
        # Try loading from file
        if RECONCILIATION_OUTPUT.exists():
            with open(RECONCILIATION_OUTPUT, "r") as f:
                state.last_recon_report = json.load(f)
        else:
            raise HTTPException(
                status_code=404,
                detail="No reconciliation report available. Run /api/reconcile first."
            )

    report = state.last_recon_report
    return {
        "match_rate": report.get("match_rate", 0),
        "total_matched": len(report.get("matched", [])),
        "total_settlements": report.get("total_settlements", 0),
        "total_bank_entries": report.get("total_bank_entries", 0),
        "unmatched_settlements": len(report.get("unmatched_settlements", [])),
        "unmatched_bank": len(report.get("unmatched_bank", [])),
        "total_exceptions": len(report.get("exceptions", [])),
        "trust_summary": report.get("trust_summary", {}),
        "matched": report.get("matched", []),
        "exceptions": report.get("exceptions", []),
        "unmatched_settlements_list": report.get("unmatched_settlements", []),
        "unmatched_bank_list": report.get("unmatched_bank", []),
    }


# ---------------------------------------------------------------------------
# Routes — Trust Layer
# ---------------------------------------------------------------------------
@app.get("/api/trust/status")
async def trust_status():
    """Get trust layer stats."""
    if state.last_recon_report is None:
        if RECONCILIATION_OUTPUT.exists():
            with open(RECONCILIATION_OUTPUT, "r") as f:
                state.last_recon_report = json.load(f)
        else:
            return {"status": "no_data", "message": "Run reconciliation first"}

    return {
        "status": "ok",
        "trust_summary": state.last_recon_report.get("trust_summary", {}),
    }


@app.get("/api/exceptions")
async def list_exceptions():
    """List all exceptions with reason codes."""
    if state.last_recon_report is None:
        if RECONCILIATION_OUTPUT.exists():
            with open(RECONCILIATION_OUTPUT, "r") as f:
                state.last_recon_report = json.load(f)
        else:
            raise HTTPException(status_code=404, detail="No reconciliation data. Run /api/reconcile first.")

    exceptions = state.last_recon_report.get("exceptions", [])

    # Group by reason code
    by_reason = {}
    for exc in exceptions:
        rc = exc.get("reason_code", "UNKNOWN")
        by_reason.setdefault(rc, []).append(exc)

    return {
        "total": len(exceptions),
        "by_reason_code": {k: len(v) for k, v in by_reason.items()},
        "exceptions": exceptions,
    }


# ---------------------------------------------------------------------------
# Routes — Q&A Agent (Module 2)
# ---------------------------------------------------------------------------
@app.post("/api/qa/query")
async def qa_query(req: QueryRequest):
    """Answer a natural language query about reconciliation data."""
    if not state.qa_agent:
        state.qa_agent = SettlementQAAgent()

    try:
        result = state.qa_agent.query(req.query, n_context=req.n_context or 10)
        return result
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="No reconciliation report available. Run /api/reconcile first."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/qa/samples")
async def qa_samples():
    """Get sample queries for the UI."""
    if not state.qa_agent:
        state.qa_agent = SettlementQAAgent()
    return {"queries": state.qa_agent.get_sample_queries()}


@app.get("/api/qa/logs")
async def qa_logs():
    """Get Q&A query logs for auditability."""
    if not state.qa_agent:
        return {"logs": []}
    return {"logs": state.qa_agent.get_query_logs()}


# ---------------------------------------------------------------------------
# Routes — Tax-Line Matcher (Module 4)
# ---------------------------------------------------------------------------
@app.post("/api/tax/match")
async def run_tax_matching():
    """Run GST tax-line matching."""
    try:
        state.tax_matcher = TaxLineMatcher()
        report = state.tax_matcher.run()
        state.last_tax_report = report.to_dict()
        return state.last_tax_report
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=f"Data files not found: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/tax/summary")
async def tax_summary():
    """Get latest tax matching summary."""
    if state.last_tax_report is None:
        tax_output = OUTPUT_DIR / "tax_match_report.json"
        if tax_output.exists():
            with open(tax_output, "r") as f:
                state.last_tax_report = json.load(f)
        else:
            raise HTTPException(status_code=404, detail="No tax report. Run /api/tax/match first.")

    report = state.last_tax_report
    return {
        "match_rate": report.get("match_rate", 0),
        "total_matched": len(report.get("matched", [])),
        "total_invoices": report.get("total_invoices", 0),
        "total_filings": report.get("total_filings", 0),
        "unmatched_invoices": len(report.get("unmatched_invoices", [])),
        "unmatched_filings": len(report.get("unmatched_filings", [])),
        "total_exceptions": len(report.get("exceptions", [])),
        "gstin_mismatches": len([
            e for e in report.get("exceptions", [])
            if e.get("reason_code") == "GSTIN_MISMATCH"
        ]),
    }


# ---------------------------------------------------------------------------
# Routes — Cash Forecaster (Module 3)
# ---------------------------------------------------------------------------
@app.get("/api/forecast")
async def get_forecast():
    """Get 7-day cash forecast."""
    try:
        state.forecaster = CashForecaster()
        result = state.forecaster.run()
        state.last_forecast = result
        return result
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="No reconciliation report. Run /api/reconcile first."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "Finance Controller Agent"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("backend.server:app", host="0.0.0.0", port=port, reload=False)
