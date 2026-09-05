'use client';

import { useState } from 'react';

/**
 * Watermelon UI Tabs 23 — Premium Animated Segmented Navigation Bar.
 * Features sliding active indicator, status badges, and Pine Emerald styling.
 */
export function Tabs23({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'reconciliation', label: 'Reconciliation Engine', badge: 'Auto' },
    { id: 'qa', label: 'AI Settlement Q&A', badge: 'Prov' },
    { id: 'tax', label: 'GST Tax Matcher', badge: '2B' },
    { id: 'forecast', label: 'Cash Forecaster', badge: 'Bento' },
    { id: 'calculator', label: 'Gateway MDR Calc', badge: 'Fee' },
  ];

  return (
    <div
      className="watermelon-tabs-23-container"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '20px',
        padding: '6px',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
        gap: '4px',
        maxWidth: '100%',
        overflowX: 'auto',
        marginBottom: '24px'
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '14px',
              border: 'none',
              background: isActive
                ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)'
                : 'transparent',
              color: isActive ? '#FFFFFF' : '#334155',
              fontWeight: isActive ? 800 : 600,
              fontSize: '0.92rem',
              cursor: 'pointer',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isActive ? '0 4px 14px rgba(5, 150, 105, 0.35)' : 'none',
              whiteSpace: 'nowrap'
            }}
          >
            <span>{tab.label}</span>

            {/* Status Pill Badge */}
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '9999px',
                background: isActive ? 'rgba(255, 255, 255, 0.25)' : '#ECFDF5',
                color: isActive ? '#FFFFFF' : '#047857',
                border: isActive ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid #A7F3D0',
                marginLeft: '4px'
              }}
            >
              {tab.badge}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default Tabs23;
