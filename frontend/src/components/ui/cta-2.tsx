'use client';

import React from 'react';

function ArrowRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function StarIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="#F59E0B" stroke="#F59E0B" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

interface Avatar {
  initials: string;
  bg: string;
}

const DEFAULT_AVATARS: Avatar[] = [
  { initials: 'RK', bg: '#059669' },
  { initials: 'AS', bg: '#2563EB' },
  { initials: 'MP', bg: '#7C3AED' },
  { initials: 'DB', bg: '#D97706' },
];

interface CTA2Props {
  badge?: string;
  headingLine1?: string;
  headingHighlight?: string;
  subtext?: string;
  primaryCtaLabel?: string;
  primaryCtaAction?: () => void;
  secondaryCtaLabel?: string;
  secondaryCtaAction?: () => void;
  socialLabel?: string;
}

export default function CTA2({
  badge = 'Trusted by 500+ Enterprise Controllers',
  headingLine1 = 'Reconcile ledger settlements with',
  headingHighlight = '100% cryptographic trust.',
  subtext = 'Stop stitching together manual bank CSV exports and Razorpay logs. Automate settlement matching, GSTR-2B tax verification, and liquidity forecasting in one unified platform.',
  primaryCtaLabel = 'Get Started Free',
  primaryCtaAction,
  secondaryCtaLabel = 'Schedule CFO Demo',
  secondaryCtaAction,
  socialLabel = 'Loved by 500+ CFOs, Controllers & Audit Teams'
}: CTA2Props) {
  return (
    <section
      style={{
        position: 'relative',
        width: '100%',
        padding: '100px 32px',
        maxWidth: '100%',
        margin: '60px 0 0 0',
        borderRadius: 0,
        background: 'linear-gradient(135deg, #ECFDF5 0%, #FFFFFF 50%, #F1F5F9 100%)',
        borderTop: '1px solid #A7F3D0',
        borderBottom: '1px solid #E2E8F0',
        boxShadow: 'inset 0 10px 30px rgba(5, 150, 105, 0.04)',
        overflow: 'hidden',
        textAlign: 'center'
      }}
    >
      {/* Background Dotted Matrix Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(5, 150, 105, 0.12) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none'
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '940px', margin: '0 auto' }}>
        {/* Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#FFFFFF',
            border: '1px solid #A7F3D0',
            color: '#047857',
            padding: '6px 18px',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.1)'
          }}>
            <span className="green-dot-pulse"></span>
            {badge}
          </span>
        </div>

        {/* Heading */}
        <h2 style={{
          fontSize: '3.6rem',
          fontWeight: 900,
          color: '#0F172A',
          lineHeight: '1.1',
          letterSpacing: '-0.04em',
          marginBottom: '20px'
        }}>
          {headingLine1}{' '}
          <span style={{ fontStyle: 'italic', color: '#059669', fontFamily: 'var(--font-tempting), Georgia, serif' }}>
            {headingHighlight}
          </span>
        </h2>

        {/* Subtext */}
        <p style={{
          fontSize: '1.22rem',
          color: '#334155',
          lineHeight: '1.65',
          fontWeight: 500,
          maxWidth: '740px',
          margin: '0 auto 40px auto'
        }}>
          {subtext}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '14px', marginBottom: '32px' }}>
          <button
            className="primary-glow-btn"
            style={{
              background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
              color: '#FFFFFF',
              padding: '14px 28px',
              borderRadius: '14px',
              fontSize: '0.96rem',
              fontWeight: 800,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 5px 16px rgba(5, 150, 105, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              whiteSpace: 'nowrap'
            }}
            onClick={primaryCtaAction}
          >
            <span>{primaryCtaLabel}</span>
            <ArrowRightIcon />
          </button>

          {secondaryCtaLabel && (
            <button
              className="secondary-outline-btn"
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#0F172A',
                padding: '14px 24px',
                borderRadius: '14px',
                fontSize: '0.96rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(15, 23, 42, 0.05)',
                whiteSpace: 'nowrap'
              }}
              onClick={secondaryCtaAction}
            >
              {secondaryCtaLabel}
            </button>
          )}
        </div>

        {/* Social Proof Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '0.88rem', color: '#475569' }}>
          {/* Avatar Stack */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {DEFAULT_AVATARS.map((av, idx) => (
              <div
                key={idx}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '9999px',
                  background: av.bg,
                  color: '#FFFFFF',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #FFFFFF',
                  marginLeft: idx === 0 ? 0 : '-8px'
                }}
              >
                {av.initials}
              </div>
            ))}
          </div>

          {/* Star Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} className="w-4 h-4" />
            ))}
          </div>

          <span style={{ fontWeight: 700, color: '#0F172A' }}>
            {socialLabel}
          </span>
        </div>
      </div>
    </section>
  );
}
