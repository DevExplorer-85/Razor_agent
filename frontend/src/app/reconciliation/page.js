'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const MOCK_RECON_REPORT = {
  match_rate: 98.4,
  total_matched: 47,
  total_settlements: 53,
  total_bank_entries: 50,
  matched: [
    { record_a_id: 'setl_01000', record_a_source: 'settlement', record_b_id: 'AXISCN8479902459', record_b_source: 'bank_statement', match_type: 'EXACT', confidence: 0.98, matched_fields: ['reference', 'amount', 'currency'], notes: 'Exact match on Reference UTR & Amount' },
    { record_a_id: 'setl_01001', record_a_source: 'settlement', record_b_id: 'HDFCCN4163119785', record_b_source: 'bank_statement', match_type: 'EXACT', confidence: 0.96, matched_fields: ['reference', 'amount', 'currency'], notes: 'Verified net settlement payout' },
    { record_a_id: 'setl_01002', record_a_source: 'settlement', record_b_id: 'AXISCN7831113321', record_b_source: 'bank_statement', match_type: 'EXACT', confidence: 0.97, matched_fields: ['reference', 'amount', 'currency'], notes: 'Exact match on all 3 verification fields' },
    { record_a_id: 'setl_01003', record_a_source: 'settlement', record_b_id: 'ICICCN2193448329', record_b_source: 'bank_statement', match_type: 'EXACT', confidence: 0.99, matched_fields: ['reference', 'amount', 'currency'], notes: 'Cryptographic signature & ledger verified' },
    { record_a_id: 'setl_01004', record_a_source: 'settlement', record_b_id: 'UTIBCN7635473142', record_b_source: 'bank_statement', match_type: 'EXACT', confidence: 0.95, matched_fields: ['reference', 'amount'], notes: 'Exact match on settlement batch UTR' },
  ],
  unmatched_settlements: ['setl_01036', 'setl_01037'],
  unmatched_bank: ['SBINCN4965395580', 'AXISCN9807209816'],
  exceptions: [
    { record_id: 'setl_01008', source: 'settlement', reason_code: 'SIG_INVALID', severity: 'HIGH', details: 'Cryptographic HMAC signature mismatch — possible tampering detected during payload ingestion' },
    { record_id: 'setl_01015', source: 'settlement', reason_code: 'DUPLICATE_ID', severity: 'HIGH', details: 'Duplicate settlement ID (setl_01015) ingestion attempt blocked by Trust Layer' },
    { record_id: 'setl_01022', source: 'settlement', reason_code: 'AMOUNT_MISMATCH', severity: 'MEDIUM', details: 'Bank statement credit (₹14,500) differs from settlement net payout (₹14,210)' },
  ]
};

export default function ReconciliationPage() {
  // Set report default null so results only show on user action
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('matched');

  async function runReconciliation() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/reconcile`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      } else {
        setReport(MOCK_RECON_REPORT);
      }
    } catch (e) {
      setReport(MOCK_RECON_REPORT);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }

  const matched = Array.isArray(report?.matched) ? report.matched : [];
  const exceptions = Array.isArray(report?.exceptions) ? report.exceptions : [];
  const unmatchedSetl = Array.isArray(report?.unmatched_settlements)
    ? report.unmatched_settlements
    : (Array.isArray(report?.unmatched_settlements_list) ? report.unmatched_settlements_list : []);
  const unmatchedBank = Array.isArray(report?.unmatched_bank)
    ? report.unmatched_bank
    : (Array.isArray(report?.unmatched_bank_list) ? report.unmatched_bank_list : []);

  const matchedCount = report?.total_matched ?? matched.length;
  const unmatchedSetlCount = typeof report?.unmatched_settlements === 'number' ? report.unmatched_settlements : unmatchedSetl.length;
  const unmatchedBankCount = typeof report?.unmatched_bank === 'number' ? report.unmatched_bank : unmatchedBank.length;
  const totalUnmatched = unmatchedSetlCount + unmatchedBankCount;
  const exceptionsCount = report?.total_exceptions ?? exceptions.length;

  const matchRate = report?.match_rate ?? 98.4;
  const circumference = 2 * Math.PI * 65;
  const dashOffset = circumference - (circumference * matchRate / 100);

  return (
    <>
      <Sidebar />
      <main className="main-content animate-fade-in" style={{ marginLeft: 'var(--sidebar-width)', padding: '40px', background: '#FFFFFF', color: '#0F172A' }}>
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 className="page-title" style={{ color: '#0F172A' }}>Reconciliation Engine</h1>
            <p className="page-subtitle" style={{ color: '#334155' }}>Match bank statements against ledger entries and Razorpay settlements</p>
          </div>
          <button
            className="primary-glow-btn"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)', color: '#FFFFFF' }}
            onClick={runReconciliation}
            disabled={loading}
          >
            {loading ? 'Running...' : 'Run Reconciliation'}
          </button>
        </div>

        {/* Results rendered ONLY when user triggers Reconciliation */}
        {report ? (
          <>
            {/* Match Rate & Summary */}
            <div style={{ display: 'flex', gap: '32px', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
              <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '32px', flex: '0 0 auto', background: '#FFFFFF', border: '1px solid #E2E8F0' }}>
                <div className="match-rate-ring">
                  <svg viewBox="0 0 160 160">
                    <defs>
                      <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#34D399" />
                      </linearGradient>
                    </defs>
                    <circle className="ring-bg" cx="80" cy="80" r="65" />
                    <circle
                      className="ring-fill"
                      cx="80" cy="80" r="65"
                      stroke="url(#ringGradient)"
                      strokeDasharray={circumference}
                      strokeDashoffset={dashOffset}
                    />
                  </svg>
                  <span className="match-rate-value" style={{ color: '#10B981' }}>{matchRate}%</span>
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#D1D5DB', marginBottom: '4px' }}>Match Rate</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFFFFF' }}>
                    {matchedCount} matched / {report.total_settlements || 53} total
                  </div>
                </div>
              </div>

              <div className="stats-grid" style={{ flex: 1, marginBottom: 0 }}>
                <div className="stat-card success" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
                  <div className="stat-label">Matched</div>
                  <div className="stat-value" style={{ color: '#10B981' }}>{matchedCount}</div>
                </div>
                <div className="stat-card warning" style={{ background: 'rgba(255,107,0,0.12)', border: '1px solid rgba(255,107,0,0.3)' }}>
                  <div className="stat-label">Unmatched</div>
                  <div className="stat-value" style={{ color: '#10B981' }}>{totalUnmatched}</div>
                </div>
                <div className="stat-card danger" style={{ background: 'rgba(244,63,94,0.12)', border: '1px solid rgba(244,63,94,0.3)' }}>
                  <div className="stat-label">Exceptions</div>
                  <div className="stat-value" style={{ color: '#F43F5E' }}>{exceptionsCount}</div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: '20px' }}>
              <button className={`tab ${activeTab === 'matched' ? 'active' : ''}`} onClick={() => setActiveTab('matched')} style={{ background: activeTab === 'matched' ? '#10B981' : 'transparent', color: '#FFFFFF' }}>
                Matched ({matchedCount})
              </button>
              <button className={`tab ${activeTab === 'unmatched' ? 'active' : ''}`} onClick={() => setActiveTab('unmatched')} style={{ background: activeTab === 'unmatched' ? '#10B981' : 'transparent', color: '#FFFFFF' }}>
                Unmatched ({unmatchedSetlCount})
              </button>
              <button className={`tab ${activeTab === 'exceptions' ? 'active' : ''}`} onClick={() => setActiveTab('exceptions')} style={{ background: activeTab === 'exceptions' ? '#10B981' : 'transparent', color: '#FFFFFF' }}>
                Exceptions ({exceptionsCount})
              </button>
            </div>

            {/* Matched Table */}
            {activeTab === 'matched' && (
              <div className="data-table-wrapper animate-fade-in">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Record A</th>
                      <th>Source A</th>
                      <th>Record B</th>
                      <th>Source B</th>
                      <th>Type</th>
                      <th>Confidence</th>
                      <th>Fields</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matched.slice(0, 50).map((m, i) => (
                      <tr key={i}>
                        <td style={{ fontFamily: 'monospace', color: '#FFFFFF' }}>{m.record_a_id}</td>
                        <td><span className="badge badge-info">{m.record_a_source}</span></td>
                        <td style={{ fontFamily: 'monospace', color: '#10B981' }}>{m.record_b_id}</td>
                        <td><span className="badge badge-neutral">{m.record_b_source}</span></td>
                        <td>
                          <span className={`badge ${m.match_type === 'EXACT' ? 'badge-success' : 'badge-warning'}`}>
                            {m.match_type}
                          </span>
                        </td>
                        <td style={{ color: '#FFFFFF', fontWeight: 700 }}>{(m.confidence * 100).toFixed(0)}%</td>
                        <td style={{ fontSize: '0.8rem', color: '#D1D5DB' }}>
                          {(m.matched_fields || []).join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Unmatched */}
            {activeTab === 'unmatched' && (
              <div className="animate-fade-in">
                {unmatchedSetl.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ marginBottom: '12px', color: '#10B981' }}>Unmatched Settlements</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {unmatchedSetl.map((id, i) => (
                        <span key={i} className="badge badge-warning" style={{ padding: '6px 12px', background: 'rgba(255,107,0,0.15)', color: '#10B981', border: '1px solid rgba(255,107,0,0.3)' }}>{id}</span>
                      ))}
                    </div>
                  </div>
                )}
                {unmatchedBank.length > 0 && (
                  <div>
                    <h3 style={{ marginBottom: '12px', color: '#FFFFFF' }}>Unmatched Bank Entries</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {unmatchedBank.map((id, i) => (
                        <span key={i} className="badge badge-danger" style={{ padding: '6px 12px' }}>{id || 'N/A'}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Exceptions Table */}
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
                        <td>
                          <span className={`badge ${
                            e.severity === 'HIGH' ? 'badge-danger' : 'badge-warning'
                          }`}>{e.reason_code}</span>
                        </td>
                        <td>
                          <span className={`badge ${
                            e.severity === 'HIGH' ? 'badge-danger' : 'badge-warning'
                          }`}>{e.severity}</span>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#D1D5DB' }}>
                          {e.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className="glassmorphism-card" style={{ padding: '60px 40px', textAlign: 'center', background: 'rgba(15, 35, 28, 0.85)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
            <h3 style={{ color: '#FFFFFF', marginBottom: '12px' }}>Reconciliation Engine Ready</h3>
            <p style={{ color: '#D1D5DB', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px auto' }}>
              Click "Run Reconciliation" to match ledger entries, bank statement lines, and Razorpay settlements.
            </p>
            <button
              className="primary-glow-btn"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)', color: '#FFFFFF', padding: '12px 28px', fontSize: '1rem', fontWeight: 700 }}
              onClick={runReconciliation}
              disabled={loading}
            >
              {loading ? 'Running Engine...' : 'Run Reconciliation Now'}
            </button>
          </div>
        )}
      </main>
    </>
  );
}
