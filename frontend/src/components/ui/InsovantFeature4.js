'use client';

import { useState } from 'react';

/**
 * Watermelon UI Feature-4 Layout Component for Insovant AI Finance Controller.
 * Features 3 interactive high-impact feature cards with live metrics, Pine Emerald badges,
 * and high-contrast light mode styling.
 */
export function InsovantFeature4() {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      id: 'stream',
      title: 'Live Settlement Activity Stream',
      subtitle: 'Real-Time Ingestion & UTR Matching',
      desc: 'Track Razorpay payout events and Axis/HDFC bank statement feeds in real time, catching UTR mismatches, missing credits, and fee anomalies instantly.',
      badge: 'Real-Time Stream',
      metric: '98.4% Match Rate',
      detail: '₹45,820,000 Volume Reconciled',
      highlightColor: '#059669',
      bgTint: '#ECFDF5',
      borderTint: '#A7F3D0',
    },
    {
      id: 'tax',
      title: 'Automated GSTR-2B Tax Segments',
      subtitle: '3-Field Fraud Verification',
      desc: 'Verify vendor GSTINs, invoice line amounts, and Input Tax Credit (ITC) eligibility with automated fake invoice quarantine and GSTR-2B government feed matching.',
      badge: 'GSTR-2B Verified',
      metric: '42 Matches Verified',
      detail: '3 GSTIN Mismatches Quarantined',
      highlightColor: '#047857',
      bgTint: '#F0FDF4',
      borderTint: '#BBF7D0',
    },
    {
      id: 'trust',
      title: 'Cryptographic Trust & Momentum Score',
      subtitle: 'Zero-Override Signature Ledger',
      desc: 'Monitor financial ledger integrity with immutable HMAC SHA-256 signatures, blocking duplicate payload replay attacks and unauthorized ledger edits.',
      badge: 'Zero Override',
      metric: '100% Signature Score',
      detail: '0 Vulnerabilities Flagged',
      highlightColor: '#059669',
      bgTint: '#ECFDF5',
      borderTint: '#A7F3D0',
    },
  ];

  return (
    <section
      className="watermelon-feature-4-section"
      style={{
        width: '100%',
        padding: '60px 48px',
        maxWidth: '100%',
        background: '#FFFFFF',
        position: 'relative'
      }}
    >
      {/* Section Header */}
      <div style={{ maxWidth: '850px', marginBottom: '48px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            color: '#047857',
            padding: '6px 16px',
            borderRadius: '9999px',
            fontSize: '0.88rem',
            fontWeight: 800,
            marginBottom: '16px'
          }}
        >
          <span>Watermelon UI Feature-4 Architecture</span>
        </div>

        <h2
          style={{
            fontSize: '2.6rem',
            fontWeight: 900,
            color: '#0F172A',
            lineHeight: '1.2',
            letterSpacing: '-0.02em',
            margin: '0 0 16px 0'
          }}
        >
          Understand Faster, Act Smarter with Insovant AI
        </h2>

        <p
          style={{
            fontSize: '1.15rem',
            color: '#334155',
            lineHeight: '1.6',
            margin: 0
          }}
        >
          Get absolute clarity on Razorpay settlements, uncover duplicate anomalies, and automate corporate financial control with zero-override trust security.
        </p>
      </div>

      {/* Feature-4 Grid: 3 Interactive Columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '28px'
        }}
      >
        {features.map((item, index) => (
          <div
            key={item.id}
            onClick={() => setActiveFeature(index)}
            className="feature-4-card"
            style={{
              background: '#FFFFFF',
              border: activeFeature === index ? `2px solid ${item.highlightColor}` : '1px solid #E2E8F0',
              borderRadius: '24px',
              padding: '32px 28px',
              boxShadow: activeFeature === index
                ? '0 12px 32px rgba(5, 150, 105, 0.14)'
                : '0 4px 16px rgba(15, 23, 42, 0.04)',
              cursor: 'pointer',
              transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              justify: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div>
              {/* Card Top Pill & Metric */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span
                  style={{
                    background: item.bgTint,
                    border: `1px solid ${item.borderTint}`,
                    color: item.highlightColor,
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    padding: '4px 12px',
                    borderRadius: '12px'
                  }}
                >
                  {item.badge}
                </span>

                <span style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 700 }}>
                  Feature 0{index + 1}
                </span>
              </div>

              {/* Title & Description */}
              <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', margin: '0 0 8px 0' }}>
                {item.title}
              </h3>

              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: item.highlightColor, marginBottom: '14px' }}>
                {item.subtitle}
              </div>

              <p style={{ fontSize: '0.96rem', color: '#475569', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                {item.desc}
              </p>
            </div>

            {/* Bottom Metric Preview Box */}
            <div
              style={{
                background: item.bgTint,
                border: `1px solid ${item.borderTint}`,
                borderRadius: '16px',
                padding: '16px',
                marginTop: '12px'
              }}
            >
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: item.highlightColor }}>
                {item.metric}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 600, marginTop: '2px' }}>
                {item.detail}
              </div>
            </div>

          </div>
        ))}
      </div>
    </section>
  );
}

export default InsovantFeature4;
