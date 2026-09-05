'use client';

import React, { useState } from 'react';

function ChevronDownIcon({ isOpen }: { isOpen?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke={isOpen ? "#059669" : "#64748B"}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        flexShrink: 0,
        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform 0.2s ease, stroke 0.2s ease'
      }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

interface Features2Props {
  badge?: string;
  title?: string;
  subtitle?: string;
  onGetStarted?: () => void;
}

export default function Features2({
  badge = 'Autonomous Financial Insights',
  title = 'Turn raw settlement feeds into clear CFO decisions',
  subtitle = 'Analyze 3-way reconciliation patterns, audit GSTR-2B tax line compliance, and forecast 7-day liquidity positions with 100% cryptographic trust.',
  onGetStarted
}: Features2Props) {
  const [activeAccordion, setActiveAccordion] = useState<string | null>('item-1');

  return (
    <section style={{ width: '100%', padding: '60px 48px', maxWidth: '100%', margin: '0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '60px', alignItems: 'center', width: '100%' }}>
        
        {/* Left Copy & Accordion Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', padding: '6px 18px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', width: 'fit-content' }}>
            <span className="green-dot-pulse"></span>
            {badge}
          </div>

          {/* Heading */}
          <h2 style={{ fontSize: '2.8rem', fontWeight: 900, color: '#0F172A', lineHeight: '1.15', letterSpacing: '-0.035em', margin: 0 }}>
            Turn raw settlement feeds into{' '}
            <span style={{ fontStyle: 'italic', color: '#059669', fontFamily: 'var(--font-tempting), Georgia, serif' }}>
              clear CFO decisions
            </span>
          </h2>

          {/* Subtitle */}
          <p style={{ color: '#475569', fontSize: '1.1rem', lineHeight: '1.65', margin: 0 }}>
            {subtitle}
          </p>

          {/* Accordion Questions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '4px' }}>
            {/* Accordion Item 1 */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                border: '1px solid #E2E8F0',
                padding: '18px 24px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)'
              }}
              onClick={() => setActiveAccordion(activeAccordion === 'item-1' ? null : 'item-1')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, color: '#0F172A', fontSize: '1.02rem' }}>
                <span>What reconciliation insights can I track?</span>
                <ChevronDownIcon isOpen={activeAccordion === 'item-1'} />
              </div>
              {activeAccordion === 'item-1' && (
                <div style={{ marginTop: '12px', color: '#475569', fontSize: '0.92rem', lineHeight: '1.55', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                  Track 3-way matching between bank feeds, Razorpay settlements, and ledger entries. Instant visibility into unverified batches, MDR fee deductions, and Section 194J/194C TDS tax withholding.
                </div>
              )}
            </div>

            {/* Accordion Item 2 */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '18px',
                border: '1px solid #E2E8F0',
                padding: '18px 24px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.03)'
              }}
              onClick={() => setActiveAccordion(activeAccordion === 'item-2' ? null : 'item-2')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, color: '#0F172A', fontSize: '1.02rem' }}>
                <span>Does the AI agent verify in real-time?</span>
                <ChevronDownIcon isOpen={activeAccordion === 'item-2'} />
              </div>
              {activeAccordion === 'item-2' && (
                <div style={{ marginTop: '12px', color: '#475569', fontSize: '0.92rem', lineHeight: '1.55', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                  Yes, all Razorpay settlement feeds, GSTR-2B filings, and Holt-Winters cash forecasts update in real-time with HMAC SHA-256 cryptographic signature audit trails.
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div style={{ marginTop: '8px' }}>
            <button
              className="primary-glow-btn"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                color: '#FFFFFF',
                padding: '16px 34px',
                borderRadius: '16px',
                fontSize: '1.02rem',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(5, 150, 105, 0.32)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
              onClick={onGetStarted}
            >
              <span style={{ whiteSpace: 'nowrap' }}>Get Started Free</span>
              <ArrowRightIcon />
            </button>
          </div>
        </div>

        {/* Right Glassmorphic Dashboard Stack (Fills Full Height & Width) */}
        <div style={{
          position: 'relative',
          width: '100%',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #ECFDF5 100%)',
          borderRadius: '28px',
          padding: '44px 36px',
          border: '1px solid #CBD5E1',
          boxShadow: 'inset 0 2px 8px rgba(255,255,255,0.9), 0 20px 48px rgba(15, 23, 42, 0.06)',
          minHeight: '430px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '460px', height: '360px' }}>
            
            {/* Card 1: Top Left Match Rate Card */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '280px',
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '20px',
              padding: '22px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 16px 36px rgba(15, 23, 42, 0.09)',
              zIndex: 10
            }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Reconciliation Match Rate
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#0F172A', lineHeight: 1, marginBottom: '12px' }}>
                98.4<span style={{ fontSize: '1.25rem', color: '#059669' }}>%</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <span style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                  47 Verified
                </span>
                <span style={{ background: '#E0F2FE', border: '1px solid #BAE6FD', color: '#0369A1', padding: '3px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                  53 Batches
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                Efficiency Gain: <strong style={{ color: '#059669' }}>+18% this sprint</strong>
              </div>
            </div>

            {/* Card 2: Middle Right Activity Breakdown */}
            <div style={{
              position: 'absolute',
              top: '95px',
              right: 0,
              width: '270px',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '20px',
              padding: '22px',
              border: '1px solid #A7F3D0',
              boxShadow: '0 18px 40px rgba(5, 150, 105, 0.15)',
              zIndex: 20
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                Reconciled Ledger Credit
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0F172A', marginBottom: '12px' }}>
                ₹45,820,000
              </div>
              <div style={{ display: 'flex', height: '7px', width: '100%', gap: '4px', borderRadius: '9999px', overflow: 'hidden', marginBottom: '12px' }}>
                <div style={{ width: '50%', background: '#10B981' }} />
                <div style={{ width: '35%', background: '#3B82F6' }} />
                <div style={{ width: '15%', background: '#F59E0B' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748B' }}>
                <span style={{ color: '#047857', fontWeight: 700 }}>● HDFC</span>
                <span style={{ color: '#1E40AF', fontWeight: 700 }}>● ICICI</span>
                <span style={{ color: '#B45309', fontWeight: 700 }}>● Axis</span>
              </div>
            </div>

            {/* Card 3: Bottom Left Security Trust Summary */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: '28px',
              width: '270px',
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '20px',
              padding: '18px 20px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 14px 32px rgba(15, 23, 42, 0.09)',
              zIndex: 15
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A' }}>Cryptographic Shield</span>
                <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 800 }}>LIVE</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '10px' }}>
                HMAC SHA-256 Signature verified on all payloads.
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                  0 Vulnerabilities
                </span>
                <span style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 800 }}>
                  GSTR-2B Verified
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
