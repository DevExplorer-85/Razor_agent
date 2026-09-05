'use client';

import { useState } from 'react';

interface Hero35Props {
  onRunReconciliation?: () => void;
  onAskAgent?: () => void;
  reconLoading?: boolean;
}

/**
 * Watermelon UI Hero-35 Layout component tailored for Insovant AI Finance Controller.
 * Features word-by-word cascade typography, stat metrics row, right-side CTA group,
 * and high-contrast Pine Emerald aesthetics.
 */
export function Hero35({ onRunReconciliation, onAskAgent, reconLoading }: Hero35Props) {
  const titleWords = ["Autonomous", "AI", "Finance", "Controller", "&", "Reconciliation"];

  return (
    <section
      className="hero-35-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        paddingTop: '60px',
        paddingBottom: '40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 2
      }}
    >
      {/* Top Header Badge */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#047857',
            padding: '8px 20px',
            borderRadius: '9999px',
            fontSize: '0.92rem',
            fontWeight: 800
          }}
        >
          <span className="green-dot-pulse"></span>
          <span>Insovant AI Finance Controller • Autonomous Financial Intelligence</span>
        </div>
      </div>

      {/* Main Content Layout: Left Title & Stats + Right Description & CTAs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '48px',
          alignItems: 'flex-start'
        }}
      >
        {/* Left Column: Cascading Title & Stats Row */}
        <div style={{ perspective: '800px' }}>
          <h1
            style={{
              fontSize: '3.6rem',
              fontWeight: 900,
              lineHeight: '1.15',
              color: '#0F172A',
              letterSpacing: '-0.03em',
              margin: '0 0 36px 0'
            }}
          >
            {titleWords.map((word, i) => (
              <span
                key={i}
                style={{
                  display: 'inline-block',
                  marginRight: '0.25em',
                  color: word === 'Finance' || word === 'Controller' ? '#059669' : '#0F172A'
                }}
              >
                {word}
              </span>
            ))}
          </h1>

          {/* Stats Row */}
          <div style={{ display: 'flex', gap: '32px', borderTop: '1px solid #E2E8F0', paddingTop: '24px' }}>
            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#059669' }}>98.4%</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Match Accuracy
              </div>
            </div>

            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0F172A' }}>₹45.8M+</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Reconciled Ledger
              </div>
            </div>

            <div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#059669' }}>0 Override</div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Trust Security
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Body Paragraph & Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingTop: '12px' }}>
          <p
            style={{
              fontSize: '1.12rem',
              color: '#334155',
              lineHeight: '1.65',
              fontWeight: 500,
              margin: 0
            }}
          >
            Match bank statements against Razorpay settlements, verify GSTR-2B tax filings, forecast cash positions with fraud-tainted data exclusion, and audit transactions with 100% cryptographic trust security.
          </p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <button
              className="primary-glow-btn"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                color: '#FFFFFF',
                padding: '14px 28px',
                borderRadius: '16px',
                fontSize: '1.05rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(5, 150, 105, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onClick={onRunReconciliation}
              disabled={reconLoading}
            >
              <span>{reconLoading ? 'Running Engine...' : 'Run Reconciliation Engine'}</span>
              <span style={{ fontSize: '1.2rem' }}>→</span>
            </button>

            <button
              className="secondary-outline-btn"
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#0F172A',
                padding: '14px 24px',
                borderRadius: '16px',
                fontSize: '1.05rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              onClick={onAskAgent}
            >
              Ask AI Settlement Agent
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Hero35;
