'use client';

import React from 'react';

// SVG Icon Components for zero missing dependency issues
function BoltIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function RocketIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.71 1.1-1.46 1.5-2.25L4.5 16.5z" />
      <path d="M15 9l-6 6" />
      <path d="M9 15l-1.5-1.5c-1.1-1.1-1.1-2.9 0-4l7.1-7.1c1.1-1.1 2.9-1.1 4 0l.5.5c1.1 1.1 1.1 2.9 0 4L12 14" />
    </svg>
  );
}

function ShieldAltIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

const statsData = [
  {
    icon: BoltIcon,
    pillBg: '#FEF3C7',
    pillText: '#D97706',
    glowColor: 'rgba(245,158,11,0.12)',
    accentGradient: 'linear-gradient(180deg, #F59E0B 0%, #EA580C 100%)',
    label: 'Settlement Match Rate',
    metric: '98.4%',
    subLabel: '47 Verified / 53 Batches',
    description: 'Autonomous 3-way reconciliation matching bank feeds against Razorpay settlements and double-entry ledger entries with zero human error.'
  },
  {
    icon: RocketIcon,
    pillBg: '#E0F2FE',
    pillText: '#0284C7',
    glowColor: 'rgba(6,182,212,0.12)',
    accentGradient: 'linear-gradient(180deg, #06B6D4 0%, #2563EB 100%)',
    label: 'Reconciled Net Credit',
    metric: '₹45.8M',
    subLabel: 'Verified Bank Credit',
    description: 'Full volume verified across Axis, HDFC, and ICICI nodal bank settlement deposits with automated MDR fee and GST tax math.'
  },
  {
    icon: ShieldAltIcon,
    pillBg: '#ECFDF5',
    pillText: '#059669',
    glowColor: 'rgba(16,185,129,0.12)',
    accentGradient: 'linear-gradient(180deg, #10B981 0%, #0D9488 100%)',
    label: 'Cryptographic Security',
    metric: '100%',
    subLabel: 'HMAC SHA-256 Verified',
    description: 'Zero-override security architecture blocking duplicate replay attacks and auditing GSTR-2B tax filing discrepancies automatically.'
  }
];

export default function Stats2() {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        .stat-card-v2 {
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 24px;
          position: relative;
          overflow: hidden;
        }
        .stat-card-v2:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
          border-color: #CBD5E1;
        }
        .stat-card-v2:hover .accent-bar-v2 {
          height: 100% !important;
          top: 0 !important;
        }
        .accent-bar-v2 {
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .stat-card-v2:hover .card-glow-v2 {
          opacity: 1;
        }
        .card-glow-v2 {
          transition: opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .stat-card-v2:hover .metric-value-v2 {
          animation: float 3s ease-in-out infinite;
        }
        .stat-card-v2:hover .pill-badge-v2 {
          transform: scale(1.03);
        }
        .pill-badge-v2 {
          transition: all 0.3s ease;
        }
      `}</style>

      <section style={{ width: '100%', padding: '60px 48px 40px 48px', maxWidth: '100%', margin: '0' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', padding: '4px 14px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 800, marginBottom: '12px' }}>
            <span className="green-dot-pulse"></span> ENTERPRISE AUDIT METRICS
          </div>
          <h2 style={{ color: '#0F172A', fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 12px 0', lineHeight: '1.15' }}>
            Built for Controllers Who Demand{' '}
            <span style={{ fontStyle: 'italic', color: '#059669', fontFamily: 'var(--font-tempting), Georgia, serif' }}>
              Absolute Precision
            </span>
          </h2>

          <p style={{ color: '#475569', fontSize: '1.1rem', maxWidth: '620px', margin: '0 auto' }}>
            Eliminate manual spreadsheet matching and tax leakage with zero-override autonomous financial intelligence.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {statsData.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="stat-card-v2">
                {/* Glow Radial Layer */}
                <div
                  className="card-glow-v2"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    pointerEvents: 'none',
                    background: `radial-gradient(500px circle at 50% 0%, ${stat.glowColor}, transparent 70%)`
                  }}
                />

                {/* Left Accent Gradient Bar */}
                <div
                  className="accent-bar-v2"
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '25%',
                    height: '50%',
                    width: '4px',
                    borderRadius: '0 4px 4px 0',
                    background: stat.accentGradient
                  }}
                />

                <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
                  {/* Badge */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span
                      className="pill-badge-v2"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderRadius: '9999px',
                        padding: '6px 14px',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        background: stat.pillBg,
                        color: stat.pillText
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      {stat.label}
                    </span>
                  </div>

                  {/* Big Metric Value */}
                  <div style={{ marginTop: '24px', marginBottom: '8px' }}>
                    <span className="metric-value-v2" style={{ display: 'inline-block', fontSize: '3.6rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.04em', lineHeight: 1 }}>
                      {stat.metric}
                    </span>
                  </div>

                  {/* SubLabel */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                    <div style={{ width: '28px', height: '2px', borderRadius: '9999px', background: stat.accentGradient }} />
                    <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#0F172A' }}>
                      {stat.subLabel}
                    </p>
                  </div>

                  {/* Description */}
                  <p style={{ margin: 0, fontSize: '0.92rem', color: '#475569', lineHeight: '1.6' }}>
                    {stat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
