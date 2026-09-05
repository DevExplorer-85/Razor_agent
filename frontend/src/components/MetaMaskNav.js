'use client';

import { useState } from 'react';
import { Tabs23 } from '@/components/ui/tabs-23';

export default function MetaMaskNav({ activeTab, onTabChange }) {
  const [sessionActive, setSessionActive] = useState(true);

  return (
    <header className="metamask-navbar glassmorphism-header" style={{
      background: 'rgba(255, 255, 255, 0.96)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid #E2E8F0',
      boxShadow: '0 2px 16px rgba(15, 23, 42, 0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="nav-container" style={{ padding: '12px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand Logo */}
        <div className="nav-brand" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => onTabChange && onTabChange('overview')}>
          <span className="brand-text" style={{ color: '#0F172A', fontWeight: '900', fontSize: '1.45rem', letterSpacing: '-0.03em' }}>INSOVANT</span>
          <span className="brand-dot" style={{
            color: '#059669',
            fontWeight: '800',
            fontSize: '0.9rem',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            padding: '2px 8px',
            borderRadius: '6px'
          }}>.AI</span>
        </div>

        {/* Watermelon UI Tabs 23 Segmented Navigation Bar */}
        <div style={{ marginBottom: 0 }}>
          <Tabs23 activeTab={activeTab} onTabChange={onTabChange} />
        </div>

        {/* Right System Status Actions */}
        <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="status-pill" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#047857',
            padding: '6px 14px',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: '700'
          }}>
            <span className="green-dot-pulse"></span>
            <span>Controller Live</span>
          </div>

          <button
            className="secondary-outline-btn"
            style={{
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#0F172A',
              padding: '6px 16px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}
            onClick={() => onTabChange && onTabChange('reconciliation')}
          >
            Audit Log
          </button>
        </div>

      </div>
    </header>
  );
}
