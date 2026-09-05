'use client';

import React, { useState, useRef, useEffect } from 'react';

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

interface DropdownMenu2Props {
  userEmail: string;
  onLogout: () => void;
  onSelectOption?: (option: string) => void;
}

export function DropdownMenu2({
  userEmail,
  onLogout,
  onSelectOption
}: DropdownMenu2Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const initial = (userEmail || 'U').charAt(0).toUpperCase();
  const userName = userEmail.split('@')[0].replace(/[-_.]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Watermelon UI Dropdown Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: isOpen ? '#ECFDF5' : '#FFFFFF',
          border: isOpen ? '1px solid #A7F3D0' : '1px solid #E2E8F0',
          borderRadius: '9999px',
          padding: '4px 14px 4px 5px',
          cursor: 'pointer',
          boxShadow: isOpen ? '0 4px 16px rgba(5, 150, 105, 0.15)' : '0 2px 10px rgba(15, 23, 42, 0.05)',
          transition: 'all 0.2s ease'
        }}
      >
        {/* Avatar Circle */}
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            color: '#FFFFFF',
            fontSize: '0.95rem',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.35)'
          }}
        >
          {initial}
          <span
            style={{
              position: 'absolute',
              bottom: '0px',
              right: '0px',
              width: '9px',
              height: '9px',
              borderRadius: '50%',
              background: '#10B981',
              border: '2px solid #FFFFFF'
            }}
          />
        </div>

        {/* Name & Role */}
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A', lineHeight: '1.2' }}>
            {userName}
          </span>
          <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700 }}>
            Pro Controller
          </span>
        </div>

        <ChevronDownIcon />
      </button>

      {/* Watermelon UI Dropdown-Menu-2 Flyout Card */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '270px',
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.18)',
            padding: '10px',
            zIndex: 99999,
            animation: 'fadeInScale 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards'
          }}
        >
          {/* User Info Header */}
          <div
            style={{
              padding: '12px',
              background: '#F8FAFC',
              borderRadius: '14px',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                color: '#FFFFFF',
                fontSize: '1.05rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              {initial}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 900, color: '#0F172A', truncate: 'true' }}>
                {userName}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {userEmail}
              </div>
            </div>
          </div>

          {/* Menu Items Group */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <button
              onClick={() => { onSelectOption?.('account'); setIsOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: 'none',
                background: 'transparent',
                color: '#334155',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#ECFDF5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0F172A' }}>
                <UserIcon />
                <span>Account Profile</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>⌘P</span>
            </button>

            <button
              onClick={() => { onSelectOption?.('trust'); setIsOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: 'none',
                background: 'transparent',
                color: '#334155',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#ECFDF5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#047857' }}>
                <ShieldCheckIcon />
                <span>Trust Layer Audit</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 800 }}>100%</span>
            </button>

            <button
              onClick={() => { onSelectOption?.('settings'); setIsOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: 'none',
                background: 'transparent',
                color: '#334155',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#ECFDF5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0F172A' }}>
                <SettingsIcon />
                <span>Settings & Security</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>⌘S</span>
            </button>

            <button
              onClick={() => { onSelectOption?.('billing'); setIsOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                border: 'none',
                background: 'transparent',
                color: '#334155',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#ECFDF5'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0F172A' }}>
                <CreditCardIcon />
                <span>Billing & MDR Logs</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>⌘B</span>
            </button>
          </div>

          {/* Separator */}
          <div style={{ height: '1px', background: '#F1F5F9', margin: '6px 0' }} />

          {/* Logout Button */}
          <button
            onClick={() => { setIsOpen(false); onLogout(); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '10px 12px',
              borderRadius: '10px',
              border: 'none',
              background: 'transparent',
              color: '#DC2626',
              fontSize: '0.86rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#DC2626' }}>
              <LogoutIcon />
              <span>Log out</span>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: 700 }}>⌘Q</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default DropdownMenu2;
