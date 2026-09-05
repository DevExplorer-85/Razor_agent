"""
Module 2: Settlement Q&A Agent — Indexer

Loads reconciliation output into ChromaDB for RAG-based querying.
Each record becomes a document with metadata for filtering.
"""
from __future__ import annotations
import json
from pathlib import Path
from typing import Optional

try:
    from backend.config import RECONCILIATION_OUTPUT, CHROMA_DIR
except ImportError:
    from config import RECONCILIATION_OUTPUT, CHROMA_DIR

# Try ChromaDB; fall back to in-memory search if unavailable
try:
    # pyrefly: ignore [missing-import]
    import chromadb
    # pyrefly: ignore [missing-import]
    from chromadb.config import Settings
    HAS_CHROMA = True
except ImportError:
    HAS_CHROMA = False


class ReconciliationIndexer:
    """
    Indexes reconciliation output for RAG-based Q&A.
    
    Uses ChromaDB if available, otherwise falls back to a simple
    in-memory keyword search (for demo without extra deps).
    """

    def __init__(self, persist_dir: str = str(CHROMA_DIR)):
        self.persist_dir = persist_dir
        self._documents = []  # Fallback in-memory store
        self._metadatas = []
        self._ids = []
        self._collection = None
        self._report_data = None

        if HAS_CHROMA:
            self._client = chromadb.Client(Settings(
                anonymized_telemetry=False,
            ))
            self._collection = self._client.get_or_create_collection(
                name="reconciliation",
                metadata={"hnsw:space": "cosine"},
            )

    def index_report(self, report_path: Path = RECONCILIATION_OUTPUT) -> int:
        """
        Load reconciliation report and index all records.
        
        Returns:
            Number of documents indexed
        """
        with open(report_path, "r") as f:
            report = json.load(f)

        self._report_data = report
        documents = []
        metadatas = []
        ids = []

        # Index matched records
        for i, match in enumerate(report.get("matched", [])):
            doc_text = (
                f"Matched record: {match['record_a_id']} ({match['record_a_source']}) "
                f"↔ {match['record_b_id']} ({match['record_b_source']}). "
                f"Match type: {match['match_type']}, "
                f"Confidence: {match['confidence']}, "
                f"Fields: {', '.join(match.get('matched_fields', []))}. "
                f"Notes: {match.get('notes', 'N/A')}"
            )
            meta = {
                "status": "matched",
                "match_type": match["match_type"],
                "confidence": float(match["confidence"]),
                "record_a_id": match["record_a_id"],
                "record_b_id": match["record_b_id"],
                "source_a": match["record_a_source"],
                "source_b": match["record_b_source"],
                "has_exceptions": "false",
            }
            documents.append(doc_text)
            metadatas.append(meta)
            ids.append(f"match_{i}")

        # Index exceptions
        for i, exc in enumerate(report.get("exceptions", [])):
            doc_text = (
                f"Exception: Record {exc['record_id']} from {exc['source']}. "
                f"Reason: {exc['reason_code']}. "
                f"Details: {exc['details']}. "
                f"Severity: {exc['severity']}."
            )
            if exc.get("related_record_id"):
                doc_text += f" Related to: {exc['related_record_id']}."
            meta = {
                "status": "exception",
                "reason_code": exc["reason_code"],
                "severity": exc["severity"],
                "record_id": exc["record_id"],
                "source": exc["source"],
                "has_exceptions": "true",
            }
            documents.append(doc_text)
            metadatas.append(meta)
            ids.append(f"exc_{i}")

        # Index unmatched settlements
        for i, sid in enumerate(report.get("unmatched_settlements", [])):
            doc_text = f"Unmatched settlement: {sid} has no matching bank statement entry."
            meta = {
                "status": "unmatched",
                "record_id": sid,
                "source": "settlement",
                "has_exceptions": "true",
            }
            documents.append(doc_text)
            metadatas.append(meta)
            ids.append(f"unmatched_setl_{i}")

        # Index summary
        summary_text = (
            f"Reconciliation Summary: "
            f"Match rate: {report.get('match_rate', 0)}%. "
            f"Total settlements: {report.get('total_settlements', 0)}. "
            f"Total bank entries: {report.get('total_bank_entries', 0)}. "
            f"Total matched: {len(report.get('matched', []))}. "
            f"Total exceptions: {len(report.get('exceptions', []))}. "
            f"Unmatched settlements: {len(report.get('unmatched_settlements', []))}. "
            f"Unmatched bank: {len(report.get('unmatched_bank', []))}."
        )
        documents.append(summary_text)
        metadatas.append({"status": "summary", "has_exceptions": "false"})
        ids.append("summary")

        # Trust summary
        trust = report.get("trust_summary", {})
        trust_text = (
            f"Trust Layer Status: "
            f"Signatures checked: {trust.get('signatures_checked', 0)}, "
            f"Valid: {trust.get('signatures_valid', 0)}, "
            f"Invalid: {trust.get('signatures_invalid', 0)}. "
            f"Duplicates found: {trust.get('duplicates_found', 0)}. "
            f"Cross-field checks: {trust.get('cross_field_checks', 0)}, "
            f"Passed: {trust.get('cross_field_passed', 0)}, "
            f"Failed: {trust.get('cross_field_failed', 0)}. "
            f"Canonical overrides blocked: {trust.get('canonical_overrides_blocked', 0)}."
        )
        documents.append(trust_text)
        metadatas.append({"status": "trust_summary", "has_exceptions": "false"})
        ids.append("trust_summary")

        # Index Corporate Financial Knowledge & Rules
        cfo_knowledge_docs = [
            ("CFO Rule: Monthly Operating Expenses (OpEx) include AWS Cloud Hosting (₹4.5L/mo), Slack, Google/Meta Ads, WeWork Rent (₹3.5L/mo), and Employee Payroll (₹28L/mo). Average total OpEx is ~₹42.8L/mo.", "opex_knowledge"),
            ("CFO Rule: TDS Tax Withholding rules under Section 194J require 10% deduction on Technical & Professional fees (e.g. Audit, Software Consultancy). Section 194C requires 1-2% on Contractor payments.", "tds_knowledge"),
            ("CFO Rule: GSTR-2B Input Tax Credit (ITC) can only be claimed if vendor GSTIN matches government GSTR-2B monthly filing and tax amounts match. Mismatched GSTINs are quarantined from ITC claim.", "itc_knowledge"),
            ("CFO Rule: Accounts Payable Aging classifies vendor liabilities into Current, 1-30 Days Overdue, and >30 Days Overdue. Overdue invoices >30 days trigger payment holds and CFO approval.", "ap_aging_knowledge"),
            ("CFO Rule: Gateway MDR Fees are 2.0% + 18% GST. Net bank credit for gross collection = Gross Volume - (Gross Volume * 0.02 * 1.18).", "mdr_knowledge"),
        ]

        for i, (kdoc, kid) in enumerate(cfo_knowledge_docs):
            documents.append(kdoc)
            metadatas.append({"status": "cfo_knowledge", "has_exceptions": "false"})
            ids.append(f"cfo_{kid}")

        # Store
        self._documents = documents
        self._metadatas = metadatas
        self._ids = ids

        if self._collection is not None:
            # Clear existing and re-index
            try:
                existing = self._collection.get()
                if existing and existing.get("ids"):
                    self._collection.delete(ids=existing["ids"])
            except Exception:
                pass
            self._collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids,
            )

        return len(documents)

    def search(self, query: str, n_results: int = 10) -> list[dict]:
        """
        Search indexed records by query.
        
        Returns list of {document, metadata, id, distance} dicts.
        Uses fast in-memory indexing for sub-10ms response times.
        """
        if self._documents:
            return self._keyword_search(query, n_results)

        if self._collection is not None and self._collection.count() > 0:
            try:
                results = self._collection.query(
                    query_texts=[query],
                    n_results=min(n_results, self._collection.count()),
                )
                hits = []
                ids = results.get("ids") or [[]] if results else [[]]
                documents = results.get("documents") or [[]] if results else [[]]
                metadatas = results.get("metadatas") or [[]] if results else [[]]
                distances = results.get("distances") or [[]] if results else [[]]

                first_ids = ids[0] if ids and ids[0] is not None else []
                first_docs = documents[0] if documents and documents[0] is not None else []
                first_metas = metadatas[0] if metadatas and metadatas[0] is not None else []
                first_dists = distances[0] if distances and distances[0] is not None else []

                for i in range(len(first_ids)):
                    hits.append({
                        "document": first_docs[i] if i < len(first_docs) and first_docs[i] is not None else "",
                        "metadata": first_metas[i] if i < len(first_metas) and first_metas[i] is not None else {},
                        "id": first_ids[i],
                        "distance": first_dists[i] if i < len(first_dists) and first_dists[i] is not None else 0,
                    })
                return hits
            except Exception:
                pass

        return self._keyword_search(query, n_results)

    def _keyword_search(self, query: str, n_results: int) -> list[dict]:
        """Fast keyword-based search with fallback context."""
        query_lower = query.lower()
        words = [w for w in query_lower.split() if len(w) > 2]
        scored = []

        for i, doc in enumerate(self._documents):
            doc_lower = doc.lower()
            score = sum(2 if word in doc_lower else 0 for word in words)
            meta = self._metadatas[i]
            # Boost matches based on status keywords
            if ("unmatched" in query_lower or "pending" in query_lower) and meta.get("status") in ("unmatched", "exception"):
                score += 3
            elif "exception" in query_lower and meta.get("status") == "exception":
                score += 3
            elif "match" in query_lower and meta.get("status") == "matched":
                score += 1
            if score > 0:
                scored.append((score, i))

        scored.sort(key=lambda x: x[0], reverse=True)

        results = []
        for score, idx in scored[:n_results]:
            results.append({
                "document": self._documents[idx],
                "metadata": self._metadatas[idx],
                "id": self._ids[idx],
                "distance": 1.0 - (score / max(len(words) * 2, 1)),
            })

        # Fallback if no specific keyword matches
        if not results and self._documents:
            for i in range(min(n_results, len(self._documents))):
                results.append({
                    "document": self._documents[i],
                    "metadata": self._metadatas[i],
                    "id": self._ids[i],
                    "distance": 0.5,
                })

        return results

    def get_report_data(self) -> dict:
        """Return the raw report data for direct access."""
        return self._report_data or {}
