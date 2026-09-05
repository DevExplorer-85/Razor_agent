'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', desc: 'Insovant Hub' },
  { href: '/reconciliation', label: 'Reconciliation', desc: 'Match Engine' },
  { href: '/qa', label: 'Q&A Agent', desc: 'AI Assistant' },
  { href: '/tax', label: 'Tax Matcher', desc: 'GST Matching' },
  { href: '/forecast', label: 'Forecast', desc: 'Cash Forecast' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed',
      top: 0,
      left: 0,
      background: '#FFFFFF',
      borderRight: '1px solid #E2E8F0',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 100,
      padding: '24px 0',
      boxShadow: '2px 0 12px rgba(15, 23, 42, 0.04)',
    }}>
      {/* Logo */}
      <div style={{
        padding: '0 24px 24px',
        borderBottom: '1px solid #E2E8F0',
        marginBottom: '16px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '4px',
        }}>
          <div>
            <h1 style={{
              fontSize: '1.2rem',
              fontWeight: 900,
              color: '#0F172A',
              letterSpacing: '-0.02em',
            }}>
              INSOVANT <span style={{ color: '#059669' }}>.AI</span>
            </h1>
            <p style={{
              fontSize: '0.7rem',
              color: '#64748B',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>Autonomous Finance Agent</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '0 12px' }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                textDecoration: 'none',
                marginBottom: '6px',
                transition: 'all 0.2s ease',
                background: isActive ? 'linear-gradient(135deg, #059669 0%, #10B981 100%)' : '#F8FAFC',
                color: isActive ? '#FFFFFF' : '#334155',
                border: isActive ? '1px solid #059669' : '1px solid #E2E8F0',
                boxShadow: isActive ? '0 4px 12px rgba(5, 150, 105, 0.3)' : 'none',
              }}
            >
              <div>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 800 : 600,
                }}>{item.label}</div>
                <div style={{
                  fontSize: '0.7rem',
                  opacity: 0.9,
                  marginTop: '1px',
                }}>{item.desc}</div>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '16px 24px',
        borderTop: '1px solid #E2E8F0',
        fontSize: '0.75rem',
        color: '#64748B',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', fontWeight: 700 }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#059669',
            boxShadow: '0 0 8px #059669',
            display: 'inline-block',
          }}></span>
          Trust Layer Active
        </div>
      </div>
    </aside>
  );
}
