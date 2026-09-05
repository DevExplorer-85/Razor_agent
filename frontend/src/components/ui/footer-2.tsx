'use client';

import React from 'react';

function LogoIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#059669" />
      <path d="M10 10H22V14H10V10Z" fill="white" fillOpacity="0.9" />
      <path d="M10 18H18V22H10V18Z" fill="white" fillOpacity="0.7" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z" />
    </svg>
  );
}

interface Footer2Props {
  onTabChange?: (tab: string) => void;
}

export function Footer2({ onTabChange }: Footer2Props) {
  return (
    <footer
      style={{
        background: '#090D16',
        color: '#94A3B8',
        borderTop: '1px solid #1E293B',
        padding: '60px 48px 32px 48px',
        width: '100%',
        marginTop: '60px',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr',
          gap: '48px',
          marginBottom: '48px'
        }}
      >
        {/* Brand & Mission Column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <LogoIcon />
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.03em' }}>
              INSOVANT.AI
            </span>
          </div>
          <p style={{ fontSize: '0.94rem', lineHeight: '1.6', color: '#94A3B8', maxWidth: '340px', margin: '0 0 20px 0' }}>
            Autonomous AI Finance Controller & Ledger Settlement Platform. Automate 3-way reconciliation, GSTR-2B tax verification & cash forecasting.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(5, 150, 105, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              color: '#10B981',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 800
            }}
          >
            <span className="green-dot-pulse" />
            Operational • 99.99% Uptime SLA
          </div>
        </div>

        {/* Column 1: Products */}
        <div>
          <h4 style={{ color: '#FFFFFF', fontSize: '0.98rem', fontWeight: 800, margin: '0 0 18px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Products
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
            <li>
              <button
                onClick={() => onTabChange?.('reconciliation')}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = '#10B981'}
                onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
              >
                Reconciliation Engine
              </button>
            </li>
            <li>
              <button
                onClick={() => onTabChange?.('qa')}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = '#10B981'}
                onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
              >
                Financial Intelligence
              </button>
            </li>
            <li>
              <button
                onClick={() => onTabChange?.('tax')}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = '#10B981'}
                onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
              >
                GSTR-2B Tax Matcher
              </button>
            </li>
            <li>
              <button
                onClick={() => onTabChange?.('forecast')}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = '#10B981'}
                onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
              >
                7-Day Cash Forecaster
              </button>
            </li>
            <li>
              <button
                onClick={() => onTabChange?.('calculator')}
                style={{ background: 'none', border: 'none', color: '#94A3B8', fontSize: '0.9rem', cursor: 'pointer', padding: 0 }}
                onMouseEnter={e => e.currentTarget.style.color = '#10B981'}
                onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
              >
                Gateway MDR Calculator
              </button>
            </li>
          </ul>
        </div>

        {/* Column 2: Resources & Trust */}
        <div>
          <h4 style={{ color: '#FFFFFF', fontSize: '0.98rem', fontWeight: 800, margin: '0 0 18px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Trust & Security
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
            <li><a href="#trust" style={{ color: '#94A3B8', textDecoration: 'none' }}>HMAC SHA-256 Audit</a></li>
            <li><a href="#api" style={{ color: '#94A3B8', textDecoration: 'none' }}>REST API Documentation</a></li>
            <li><a href="#compliance" style={{ color: '#94A3B8', textDecoration: 'none' }}>SOC-2 & RBI Compliance</a></li>
            <li><a href="#status" style={{ color: '#94A3B8', textDecoration: 'none' }}>System Status</a></li>
          </ul>
        </div>

        {/* Column 3: Legal */}
        <div>
          <h4 style={{ color: '#FFFFFF', fontSize: '0.98rem', fontWeight: 800, margin: '0 0 18px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Company
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
            <li><a href="#about" style={{ color: '#94A3B8', textDecoration: 'none' }}>About Insovant</a></li>
            <li><a href="#privacy" style={{ color: '#94A3B8', textDecoration: 'none' }}>Privacy Policy</a></li>
            <li><a href="#terms" style={{ color: '#94A3B8', textDecoration: 'none' }}>Terms of Service</a></li>
            <li><a href="#security" style={{ color: '#94A3B8', textDecoration: 'none' }}>Security Center</a></li>
          </ul>
        </div>
      </div>

      {/* Watermelon UI Footer-2 Bottom Bar */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '28px',
          borderTop: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div suppressHydrationWarning style={{ fontSize: '0.88rem', color: '#64748B' }}>
          © {new Date().getFullYear()} INSOVANT.AI Inc. All rights reserved. Encrypted with 100% Cryptographic Trust.
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#94A3B8' }}>
          <a href="https://twitter.com" target="_blank" rel="noreferrer" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>
            <TwitterIcon />
          </a>
          <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>
            <GithubIcon />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ color: '#94A3B8', transition: 'color 0.2s' }}>
            <LinkedinIcon />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer2;
