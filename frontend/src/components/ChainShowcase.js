'use client';

import { useState } from 'react';

const ECOSYSTEM_INTEGRATIONS = [
  {
    id: 'razorpay',
    name: 'Razorpay Settlements',
    symbol: 'RAZORPAY',
    category: 'gateways',
    color: '#0C2340',
    volume: '₹120M Reconciled',
    records: '45,200+ Payouts',
    tag: 'PAYMENT GATEWAY',
  },
  {
    id: 'banking',
    name: 'HDFC & ICICI Bank Feeds',
    symbol: 'MT940 / CSV',
    category: 'banking',
    color: '#004B87',
    volume: '₹85M Matched',
    records: '18,400+ Entries',
    tag: 'CORE BANKING',
  },
  {
    id: 'gstin',
    name: 'GSTR-2B Tax Portal',
    symbol: 'GSTIN',
    category: 'banking',
    color: '#D97706',
    volume: '100% Verified',
    records: '3-Field Match Engine',
    tag: 'TAX AUTHORITY',
  },
  {
    id: 'tally',
    name: 'Tally Prime & ERP Ledger',
    symbol: 'TALLY / ZOHO',
    category: 'banking',
    color: '#059669',
    volume: '₹210M Ledger',
    records: '12,400 Items',
    tag: 'ERP SYSTEM',
  },
  {
    id: 'stripe',
    name: 'Stripe & PayPal Global',
    symbol: 'STRIPE / FX',
    category: 'gateways',
    color: '#6366F1',
    volume: '$1.4M Processed',
    records: 'FX Auto-Convert',
    tag: 'GLOBAL GATEWAY',
  },
  {
    id: 'chromadb',
    name: 'ChromaDB Trust Vault',
    symbol: 'VECTOR DB',
    category: 'trust',
    color: '#EC4899',
    volume: '38,000 Embeddings',
    records: 'RAG Provenance',
    tag: 'AI TRUST VAULT',
  },
];

export default function ChainShowcase() {
  const [activeTab, setActiveTab] = useState('all');

  const filteredIntegrations = ECOSYSTEM_INTEGRATIONS.filter((item) => {
    if (activeTab === 'all') return true;
    return item.category === activeTab;
  });

  return (
    <div className="chain-showcase-container">
      <div className="section-title-wrapper">
        <span className="section-badge">Unified Integration Suite</span>
        <h2>Explore Insovant Ecosystem</h2>
        <p>Seamlessly ingest data across payment gateways, core banking feeds, ERP ledgers, and tax compliance portals.</p>
      </div>

      <div className="chain-tabs">
        <button
          className={`chain-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Integrations
        </button>
        <button
          className={`chain-tab-btn ${activeTab === 'gateways' ? 'active' : ''}`}
          onClick={() => setActiveTab('gateways')}
        >
          Payment Gateways
        </button>
        <button
          className={`chain-tab-btn ${activeTab === 'banking' ? 'active' : ''}`}
          onClick={() => setActiveTab('banking')}
        >
          Banking & Tax ERP
        </button>
      </div>

      <div className="chain-grid">
        {filteredIntegrations.map((item) => (
          <div key={item.id} className="chain-card glassmorphism-card" style={{ background: 'rgba(18, 20, 26, 0.85)', border: '1px solid rgba(255, 107, 0, 0.25)' }}>
            <div className="chain-card-header">
              <span className="chain-tag" style={{ background: 'rgba(255, 107, 0, 0.2)', color: '#10B981', fontWeight: '700' }}>{item.tag}</span>
            </div>
            <h3 style={{ color: '#FFFFFF', marginTop: '12px' }}>{item.name}</h3>
            <p className="chain-symbol" style={{ color: '#10B981', fontWeight: 600 }}>{item.symbol}</p>

            <div className="chain-stats-row">
              <div>
                <span className="stat-lbl">Volume Reconciled</span>
                <span className="stat-val" style={{ color: '#FFFFFF' }}>{item.volume}</span>
              </div>
              <div>
                <span className="stat-lbl">Sync Status</span>
                <span className="stat-val" style={{ color: '#10B981' }}>{item.records}</span>
              </div>
            </div>

            <div className="chain-card-footer">
              <span className="connect-link" style={{ color: '#10B981' }}>Live Auto-Sync Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
