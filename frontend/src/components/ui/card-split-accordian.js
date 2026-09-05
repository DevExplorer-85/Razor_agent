'use client';

import { useState } from "react";

export function CardSplitAccordian() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      onClick={() => setIsOpen(!isOpen)}
      style={{
        padding: '20px 24px',
        borderRadius: '18px',
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        cursor: 'pointer',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)',
        transition: 'all 0.25s ease',
        marginBottom: '16px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
          Insovant Interactive Audit Breakdown
        </h3>
        <span style={{ fontSize: '1.2rem', color: '#059669', fontWeight: 800, transition: 'transform 0.2s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          ▼
        </span>
      </div>

      {isOpen && (
        <p style={{ marginTop: '14px', fontSize: '0.98rem', color: '#334155', lineHeight: '1.6', animation: 'fadeIn 0.25s ease' }}>
          This is a smooth expanding accordion component. All reconciliation exceptions, HMAC signature logs, and 7-day cash forecasts are verified in real-time with zero-override trust layer integrity.
        </p>
      )}
    </div>
  );
}

export default CardSplitAccordian;
