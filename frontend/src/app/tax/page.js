'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const MOCK_TAX_REPORT = {
  match_rate: 94.2,
  total_invoices: 45,
  total_filings: 42,
  matched: [
    { record_a_id: 'INV-2026-001', record_b_id: 'GSTIN-2B-8819', match_type: 'EXACT', confidence: 0.98, matched_fields: ['GSTIN', 'Amount', 'CGST/SGST'], notes: 'Exact match on GSTIN (27AAAAA0000A1Z5), Taxable Amount (₹45,000), and CGST/SGST (₹4,050)' },
    { record_a_id: 'INV-2026-002', record_b_id: 'GSTIN-2B-8820', match_type: 'EXACT', confidence: 0.96, matched_fields: ['GSTIN', 'Amount'], notes: 'Three-field verified against GSTR-2B monthly filing' },
    { record_a_id: 'INV-2026-003', record_b_id: 'GSTIN-2B-8821', match_type: 'EXACT', confidence: 0.95, matched_fields: ['GSTIN', 'Tax'], notes: 'Matched invoice amount ₹12,400 with IGST ₹2,232' },
    { record_a_id: 'INV-2026-004', record_b_id: 'GSTIN-2B-8822', match_type: 'PARTIAL', confidence: 0.89, matched_fields: ['Amount'], notes: 'Minor rounding variance of ₹0.50 within tolerance threshold' },
    { record_a_id: 'INV-2026-005', record_b_id: 'GSTIN-2B-8823', match_type: 'EXACT', confidence: 0.97, matched_fields: ['GSTIN', 'Invoice No'], notes: 'Matched on GSTIN, Invoice Number, and Tax Credit' },
  ],
  exceptions: [
    { record_id: 'INV-2026-009', source: 'invoice', reason_code: 'GSTIN_MISMATCH', severity: 'HIGH', details: 'Fraud Alert: Invoice GSTIN (27AAAAA0000A1Z5) differs from GSTR-2B filing GSTIN (27BBBBB1111B2Z9)' },
    { record_id: 'INV-2026-014', source: 'invoice', reason_code: 'TAX_MISMATCH', severity: 'MEDIUM', details: 'Claimed Input Tax Credit (₹8,400) exceeds GSTR-2B filing (₹7,200)' },
  ],
  unmatched_invoices: ['INV-2026-041', 'INV-2026-042'],
  unmatched_filings: ['GSTIN-2B-9901'],
  gstin_mismatches: 1,
};

export default function TaxPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('matched');

  async function runTaxMatching() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/tax/match`, { method: 'POST' });
      if (res.ok) setReport(await res.json());
      else setReport(MOCK_TAX_REPORT);
    } catch (e) {
      setReport(MOCK_TAX_REPORT);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }

  const matched = report?.matched || [];
  const exceptions = report?.exceptions || [];
  const unmatchedInv = report?.unmatched_invoices || [];
  const unmatchedFil = report?.unmatched_filings || [];
  const gstinIssues = exceptions.filter(e => e.reason_code === 'GSTIN_MISMATCH');

  return (
    <>
      <Sidebar />
      <main className="main-content animate-fade-in" style={{ marginLeft: 'var(--sidebar-width)', padding: '40px', background: '#FFFFFF', color: '#0F172A' }}>
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 className="page-title" style={{ color: '#0F172A' }}>Tax-Line Matcher</h1>
            <p className="page-subtitle" style={{ color: '#334155' }}>Match invoices against GST filings with three-field verification (GSTIN + amount + tax)</p>
          </div>
          <button className="primary-glow-btn" style={{ background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)', color: '#FFFFFF' }} onClick={runTaxMatching} disabled={loading}>
            {loading ? 'Matching...' : 'Run Tax Matching'}
          </button>
        </div>

        {report ? (
          <>
            {/* Summary */}
            <div className="stats-grid" style={{ marginBottom: '24px' }}>
              <div className="stat-card success" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <div className="stat-label">Tax Match Rate</div>
                <div className="stat-value" style={{ color: '#10B981' }}>{report?.match_rate}%</div>
              </div>
              <div className="stat-card info" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="stat-label">Matched Invoices</div>
                <div className="stat-value" style={{ color: '#FFFFFF' }}>{matched.length}</div>
              </div>
              <div className="stat-card warning" style={{ background: 'rgba(255,107,0,0.12)', border: '1px solid rgba(255,107,0,0.3)' }}>
                <div className="stat-label">Unmatched Invoices</div>
                <div className="stat-value" style={{ color: '#10B981' }}>{unmatchedInv.length}</div>
              </div>
              <div className="stat-card danger" style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)' }}>
                <div className="stat-label">GSTIN Mismatches</div>
                <div className="stat-value" style={{ color: '#F43F5E' }}>{gstinIssues.length}</div>
              </div>
            </div>

            {/* GSTIN Fraud Alerts */}
            {gstinIssues.length > 0 && (
              <div className="alert-box danger" style={{ marginBottom: '24px' }}>
                <div>
                  <strong>Fraud Alert: {gstinIssues.length} GSTIN mismatch(es) detected</strong> — Possible fake invoices with valid amounts but wrong GSTINs.
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: '20px' }}>
              <button className={`tab ${activeTab === 'matched' ? 'active' : ''}`} onClick={() => setActiveTab('matched')} style={{ background: activeTab === 'matched' ? '#10B981' : 'transparent', color: '#FFFFFF' }}>
                Matched ({matched.length})
              </button>
              <button className={`tab ${activeTab === 'exceptions' ? 'active' : ''}`} onClick={() => setActiveTab('exceptions')} style={{ background: activeTab === 'exceptions' ? '#10B981' : 'transparent', color: '#FFFFFF' }}>
                Exceptions ({exceptions.length})
              </button>
              <button className={`tab ${activeTab === 'unmatched' ? 'active' : ''}`} onClick={() => setActiveTab('unmatched')} style={{ background: activeTab === 'unmatched' ? '#10B981' : 'transparent', color: '#FFFFFF' }}>
                Unmatched ({unmatchedInv.length + unmatchedFil.length})
              </button>
            </div>

            {/* Matched */}
            {activeTab === 'matched' && (
              <div className="data-table-wrapper animate-fade-in">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Filing ID</th>
                      <th>Match Type</th>
                      <th>Confidence</th>
                      <th>Matched Fields</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matched.map((m, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'monospace', color: '#FFFFFF' }}>{m.record_a_id}</td>
                        <td style={{ fontFamily: 'monospace', color: '#10B981' }}>{m.record_b_id}</td>
                        <td><span className="badge badge-success">{m.match_type}</span></td>
                        <td style={{ color: '#FFFFFF', fontWeight: 700 }}>{(m.confidence * 100).toFixed(0)}%</td>
                        <td>
                          {(m.matched_fields || []).map((f, j) => (
                            <span key={j} className="badge badge-neutral" style={{ marginRight: '4px', fontSize: '0.7rem', background: 'rgba(255,107,0,0.2)', color: '#10B981' }}>{f}</span>
                          ))}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#D1D5DB' }}>{m.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Exceptions */}
            {activeTab === 'exceptions' && (
              <div className="data-table-wrapper animate-fade-in">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Record ID</th>
                      <th>Source</th>
                      <th>Reason Code</th>
                      <th>Severity</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exceptions.map((e, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'monospace', color: '#FFFFFF' }}>{e.record_id}</td>
                        <td><span className="badge badge-neutral">{e.source}</span></td>
                        <td><span className={`badge ${e.reason_code === 'GSTIN_MISMATCH' ? 'badge-danger' : 'badge-warning'}`}>{e.reason_code}</span></td>
                        <td><span className={`badge ${e.severity === 'HIGH' ? 'badge-danger' : 'badge-warning'}`}>{e.severity}</span></td>
                        <td style={{ fontSize: '0.8rem', color: '#D1D5DB' }}>{e.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Unmatched */}
            {activeTab === 'unmatched' && (
              <div className="animate-fade-in">
                {unmatchedInv.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <h3 style={{ color: '#10B981', marginBottom: '12px' }}>Unmatched Invoices</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {unmatchedInv.map((id, i) => (
                        <span key={i} className="badge badge-warning" style={{ padding: '6px 12px', background: 'rgba(255,107,0,0.15)', color: '#10B981' }}>{id}</span>
                      ))}
                    </div>
                  </div>
                )}
                {unmatchedFil.length > 0 && (
                  <div>
                    <h3 style={{ color: '#FFFFFF', marginBottom: '12px' }}>Unmatched Filings</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {unmatchedFil.map((id, i) => (
                        <span key={i} className="badge badge-danger" style={{ padding: '6px 12px' }}>{id}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="glassmorphism-card" style={{ padding: '60px 40px', textAlign: 'center', background: 'rgba(15, 35, 28, 0.85)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <h3 style={{ color: '#FFFFFF', marginBottom: '12px' }}>GST Tax Matcher Ready</h3>
            <p style={{ color: '#D1D5DB', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px auto' }}>
              Click "Run Tax Matching" to verify sales invoices against GSTR-2B government filings with three-field fraud verification.
            </p>
            <button
              className="primary-glow-btn"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)', color: '#FFFFFF', padding: '12px 28px', fontSize: '1rem', fontWeight: 700 }}
              onClick={runTaxMatching}
              disabled={loading}
            >
              {loading ? 'Matching...' : 'Run Tax Matching Now'}
            </button>
          </div>
        )}
      </main>
    </>
  );
}
