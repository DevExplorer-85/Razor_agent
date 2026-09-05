'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function DashboardView({ onSwitchToMetaMask }) {
  const [dataOverview, setDataOverview] = useState(null);
  const [trustStatus, setTrustStatus] = useState(null);
  const [reconSummary, setReconSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [dataRes, trustRes, reconRes] = await Promise.allSettled([
        fetch(`${API}/api/data/overview`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API}/api/trust/status`).then((r) => (r.ok ? r.json() : null)),
        fetch(`${API}/api/reconcile/summary`).then((r) => (r.ok ? r.json() : null)),
      ]);
      if (dataRes.status === 'fulfilled' && dataRes.value) setDataOverview(dataRes.value);
      if (trustRes.status === 'fulfilled' && trustRes.value) setTrustStatus(trustRes.value);
      if (reconRes.status === 'fulfilled' && reconRes.value) setReconSummary(reconRes.value);
    } catch (e) {
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const trustData = trustStatus?.trust_summary || {};

  return (
    <>
      <Sidebar />
      <main className="main-content animate-fade-in" style={{ background: '#FFFFFF', minHeight: '100vh', color: '#0F172A' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 className="page-title" style={{ color: '#0F172A' }}>Finance Controller Dashboard</h1>
            <p className="page-subtitle" style={{ color: '#475569' }}>
              Unified Razorpay reconciliation platform with fraud-prevention at every layer
            </p>
          </div>
          <button
            onClick={onSwitchToMetaMask}
            className="primary-glow-btn"
            style={{ padding: '10px 20px', cursor: 'pointer', background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)', color: '#FFFFFF', border: 'none' }}
          >
            Open Insovant Landing Page
          </button>
        </div>

        {/* Trust Layer Health */}
        <div className="section-header">
          <h2 style={{ color: '#0F172A' }}>Trust Layer Health</h2>
        </div>

        <div className="stats-grid" style={{ marginBottom: '28px' }}>
          <div className="stat-card success" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
            <div className="stat-label" style={{ color: '#047857' }}>Signatures Valid</div>
            <div className="stat-value" style={{ color: '#0F172A' }}>{trustData.signatures_valid ?? '--'}</div>
          </div>
          <div className="stat-card warning" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
            <div className="stat-label" style={{ color: '#047857' }}>Duplicates Caught</div>
            <div className="stat-value" style={{ color: '#0F172A' }}>{trustData.duplicates_found ?? '--'}</div>
          </div>
          <div className="stat-card danger" style={{ background: '#FEE2E2', border: '1px solid #FCA5A5' }}>
            <div className="stat-label" style={{ color: '#991B1B' }}>Exceptions Flagged</div>
            <div className="stat-value" style={{ color: '#0F172A' }}>{trustData.total_exceptions ?? '--'}</div>
          </div>
          <div className="stat-card info" style={{ background: '#F8FAFC', border: '1px solid #CBD5E1' }}>
            <div className="stat-label" style={{ color: '#475569' }}>Overrides Blocked</div>
            <div className="stat-value" style={{ color: '#0F172A' }}>{trustData.canonical_overrides_blocked ?? 0}</div>
          </div>
        </div>
      </main>
    </>
  );
}
