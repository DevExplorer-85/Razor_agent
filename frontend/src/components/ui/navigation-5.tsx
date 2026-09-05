'use client';

import { useState } from 'react';
import DropdownMenu2 from '@/components/ui/dropdown-menu-2';

// Sleek Modern Finance Brand Logo (No checkmark tick)
function LogoIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#059669" />
      <path d="M10 10H22V14H10V10Z" fill="white" fillOpacity="0.9" />
      <path d="M10 18H18V22H10V18Z" fill="white" fillOpacity="0.7" />
    </svg>
  );
}

function ChevronDownIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ArrowRightIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function BotIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8.01" y2="16" strokeWidth="3" />
      <line x1="16" y1="16" x2="16.01" y2="16" strokeWidth="3" />
    </svg>
  );
}

function TrendingUpIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  );
}

function CalculatorIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="8" y1="6" x2="16" y2="6" />
      <line x1="8" y1="10" x2="8.01" y2="10" strokeWidth="3" />
      <line x1="12" y1="10" x2="12.01" y2="10" strokeWidth="3" />
      <line x1="16" y1="10" x2="16.01" y2="10" strokeWidth="3" />
      <line x1="8" y1="14" x2="8.01" y2="14" strokeWidth="3" />
      <line x1="12" y1="14" x2="12.01" y2="14" strokeWidth="3" />
      <line x1="16" y1="14" x2="16.01" y2="14" strokeWidth="3" />
      <line x1="8" y1="18" x2="8.01" y2="18" strokeWidth="3" />
      <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" />
      <line x1="16" y1="18" x2="16.01" y2="18" strokeWidth="3" />
    </svg>
  );
}

interface Navigation5Props {
  brandName?: string;
  onTabChange?: (tab: string) => void;
  userEmail?: string | null;
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onLogout?: () => void;
}

export default function Navigation5({
  brandName = 'INSOVANT.AI',
  onTabChange,
  userEmail = null,
  onLoginClick,
  onSignupClick,
  onLogout
}: Navigation5Props) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const productFeatures = [
    {
      title: 'Reconciliation Engine',
      desc: 'Automated 3-way matching between bank feeds, settlements & double-entry ledger.',
      tabId: 'reconciliation',
      icon: ShieldCheckIcon
    },
    {
      title: 'Financial Intelligence',
      desc: 'Senior CFO AI agent for custom MDR math, burn rate, and TDS tax compliance.',
      tabId: 'qa',
      icon: BotIcon
    },
    {
      title: 'GSTR-2B Tax Matcher',
      desc: 'Three-field invoice verification with automated fake billing detection.',
      tabId: 'tax',
      icon: ShieldCheckIcon
    },
    {
      title: '7-Day Cash Forecaster',
      desc: 'Holt-Winters exponential smoothing model excluding fraud-tainted records.',
      tabId: 'forecast',
      icon: TrendingUpIcon
    },
    {
      title: 'Gateway MDR Calculator',
      desc: 'Calculates net credit for any gross volume post 2.0% MDR and 18% GST.',
      tabId: 'calculator',
      icon: CalculatorIcon
    }
  ];

  return (
    <header style={{
      position: 'sticky',
      top: '16px',
      zIndex: 9999,
      maxWidth: '1280px',
      margin: '0 auto 24px auto',
      padding: '0 20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.86)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderRadius: '9999px',
        border: '1px solid rgba(255, 255, 255, 0.85)',
        boxShadow: 'inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 2px 0 rgba(15, 23, 42, 0.05), 0 16px 40px -10px rgba(15, 23, 42, 0.12)',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative'
      }}>
        {/* Brand Logo & Name */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={() => onTabChange && onTabChange('overview')}
        >
          <LogoIcon className="w-7 h-7" />
          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em', whiteSpace: 'nowrap' }}>
            {brandName}
          </span>
        </div>

        {/* Center Mega-Menu Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Overview (ONLY for unauthenticated visitors) */}
          {!userEmail && (
            <button
              className="nav-pill-hover"
              onClick={() => onTabChange && onTabChange('overview')}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                border: 'none',
                background: 'transparent',
                fontSize: '0.92rem',
                fontWeight: 700,
                color: '#334155',
                cursor: 'pointer'
              }}
            >
              Overview
            </button>
          )}

          {/* Products Dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setActiveMenu('products')}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button
              className="nav-pill-hover"
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                border: 'none',
                background: activeMenu === 'products' ? '#ECFDF5' : 'transparent',
                fontSize: '0.92rem',
                fontWeight: 700,
                color: activeMenu === 'products' ? '#059669' : '#0F172A',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ whiteSpace: 'nowrap' }}>Products</span>
              <ChevronDownIcon className="w-4 h-4 text-slate-500" />
            </button>

            {/* Products Mega-Menu Overlay */}
            {activeMenu === 'products' && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                paddingTop: '12px',
                width: '680px',
                zIndex: 10000
              }}>
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '24px',
                  padding: '24px',
                  boxShadow: '0 20px 50px rgba(15, 23, 42, 0.18)',
                  border: '1px solid #CBD5E1',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px'
                }}>
                  {productFeatures.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => { onTabChange && onTabChange(item.tabId); setActiveMenu(null); }}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          gap: '14px',
                          alignItems: 'flex-start'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#ECFDF5'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '12px',
                          background: '#ECFDF5',
                          border: '1px solid #A7F3D0',
                          color: '#047857',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginBottom: '2px' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: '1.4' }}>
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Quick Direct Tabs */}
          <button
            className="nav-pill-hover"
            onClick={() => onTabChange && onTabChange('reconciliation')}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              border: 'none',
              background: 'transparent',
              fontSize: '0.92rem',
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            Reconciliation
          </button>

          <button
            className="nav-pill-hover"
            onClick={() => onTabChange && onTabChange('qa')}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              border: 'none',
              background: 'transparent',
              fontSize: '0.92rem',
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer'
            }}
          >
            Intelligence
          </button>
        </nav>

        {/* Right Auth Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {userEmail ? (
            <DropdownMenu2
              userEmail={userEmail}
              onLogout={onLogout || (() => {})}
              onSelectOption={(option) => {
                if (option === 'trust') onTabChange?.('reconciliation');
                else if (option === 'billing') onTabChange?.('calculator');
              }}
            />
          ) : (
            <>
              <button
                className="nav-pill-hover"
                onClick={onLoginClick}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  color: '#0F172A',
                  cursor: 'pointer',
                  padding: '6px 16px',
                  borderRadius: '9999px'
                }}
              >
                Log in
              </button>

              <button
                onClick={onSignupClick}
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '9999px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>Get Started</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
