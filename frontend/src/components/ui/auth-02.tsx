'use client';

import React, { useState } from 'react';

function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z" />
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
      <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z" />
    </svg>
  );
}

function AppleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="#0F172A">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.32c.67-.82 1.13-1.96.99-3.1-.97.04-2.16.65-2.85 1.46-.62.72-1.16 1.88-.99 3 1.08.08 2.19-.54 2.85-1.36z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

interface Auth2Props {
  initialMode?: 'login' | 'signup';
  onClose?: () => void;
  onSuccess?: (email: string) => void;
}

interface Particle {
  id: number;
  text: string;
  dx: string;
  dy: string;
  color: string;
  fontSize: string;
}

export function Auth2({
  initialMode = 'signup',
  onClose,
  onSuccess
}: Auth2Props) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [particles, setParticles] = useState<Particle[]>([]);

  // Google & Apple OAuth Popup States
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [showAppleModal, setShowAppleModal] = useState(false);
  const [googleStep, setGoogleStep] = useState<'select' | 'password' | 'loading'>('select');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [googlePassword, setGooglePassword] = useState('');
  const [selectedGoogleAccount, setSelectedGoogleAccount] = useState<string | null>(null);

  const handleSelectGoogleAccount = (accEmail: string) => {
    setSelectedGoogleAccount(accEmail);
    setGoogleStep('loading');

    setTimeout(() => {
      setShowGoogleModal(false);
      triggerDollarBurst(accEmail);
    }, 1200);
  };

  const triggerDollarBurst = (targetEmail: string) => {
    setLoading(true);
    const symbols = ['💵', '$', '💰', '₹', '💵', '$', '🟢', '✨', '$100', '💵', '💸', '🤑', '$'];
    const colors = ['#10B981', '#059669', '#34D399', '#F59E0B', '#047857', '#10B981', '#6EE7B7'];
    const newParticles: Particle[] = [];

    const totalParticles = 95;
    for (let i = 0; i < totalParticles; i++) {
      const angle = (i / totalParticles) * 360 + (Math.random() * 30 - 15);
      const distance = 350 + Math.random() * 950;
      const rad = (angle * Math.PI) / 180;
      const dx = `${Math.cos(rad) * distance}px`;
      const dy = `${Math.sin(rad) * distance}px`;
      const text = symbols[Math.floor(Math.random() * symbols.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const fontSize = `${2.2 + Math.random() * 3.2}rem`;

      newParticles.push({ id: i, text, dx, dy, color, fontSize });
    }

    setParticles(newParticles);

    setTimeout(() => {
      setLoading(false);
      onSuccess?.(targetEmail);
      onClose?.();
    }, 2900);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please fill in all required fields');
      return;
    }
    triggerDollarBurst(email || 'demo@insovant.ai');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(15, 23, 42, 0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      {/* Dollar Burst Particle Explosion Container */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="dollar-burst-particle"
          style={{
            '--dx': p.dx,
            '--dy': p.dy,
            color: p.color,
            fontSize: p.fontSize,
            textShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
          } as React.CSSProperties}
        >
          {p.text}
        </span>
      ))}
      {/* Watermelon UI Auth-02 Outer Muted Container (Scaled Large) */}
      <div
        style={{
          background: '#F1F5F9',
          borderRadius: '36px',
          padding: '16px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: 'inset 0 0 2px 0.5px rgba(0,0,0,0.05), 0 30px 70px rgba(0,0,0,0.35)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '28px',
              right: '28px',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              fontSize: '1.15rem',
              fontWeight: 800,
              color: '#64748B',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              boxShadow: '0 2px 8px rgba(15,23,42,0.08)'
            }}
          >
            ✕
          </button>
        )}

        {/* Inner Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '28px',
            padding: '44px 38px',
            boxShadow: '0 6px 20px rgba(15, 23, 42, 0.04)'
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#047857', padding: '5px 16px', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 800, marginBottom: '12px' }}>
              <span className="green-dot-pulse"></span> INSOVANT WORKSPACE
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0F172A', lineHeight: '1.18', letterSpacing: '-0.035em', margin: '0 0 8px 0' }}>
              {mode === 'signup' ? 'Create your free account' : 'Log in to your account'}
            </h1>
            <p style={{ color: '#64748B', fontSize: '1.02rem', lineHeight: '1.55', margin: 0 }}>
              {mode === 'signup'
                ? 'Join 500+ CFOs and Controllers streamlining settlement reconciliation.'
                : 'Access your live reconciliation engine, tax matcher & 7-day cash forecaster.'}
            </p>
          </div>

          {/* Social Auth Grid (Google & Apple) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => {
                setShowGoogleModal(true);
                setGoogleStep('select');
                setShowCustomGoogleInput(false);
                setCustomGoogleEmail('');
                setGooglePassword('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                height: '52px',
                borderRadius: '14px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#0F172A',
                fontSize: '1.02rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <GoogleIcon />
              Google
            </button>

            <button
              type="button"
              onClick={() => setShowAppleModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                height: '52px',
                borderRadius: '14px',
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                color: '#0F172A',
                fontSize: '1.02rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <AppleIcon />
              Apple
            </button>
          </div>

          {/* Separator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            <span style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              or continue with email
            </span>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          </div>

          {errorMsg && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '12px 16px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, marginBottom: '20px' }}>
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {mode === 'signup' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>First name</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }}>
                      <UserIcon />
                    </div>
                    <input
                      type="text"
                      placeholder="Alex"
                      value={firstName}
                      onChange={e => setFirstName(e.target.value)}
                      style={{
                        width: '100%',
                        height: '48px',
                        paddingLeft: '44px',
                        paddingRight: '14px',
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '14px',
                        fontSize: '1.02rem',
                        color: '#0F172A',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Last name</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }}>
                      <UserIcon />
                    </div>
                    <input
                      type="text"
                      placeholder="Rivera"
                      value={lastName}
                      onChange={e => setLastName(e.target.value)}
                      style={{
                        width: '100%',
                        height: '48px',
                        paddingLeft: '44px',
                        paddingRight: '14px',
                        background: '#F8FAFC',
                        border: '1px solid #CBD5E1',
                        borderRadius: '14px',
                        fontSize: '1.02rem',
                        color: '#0F172A',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Work email</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }}>
                  <MailIcon />
                </div>
                <input
                  type="email"
                  placeholder="alex@company.io"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    height: '50px',
                    paddingLeft: '44px',
                    paddingRight: '14px',
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '14px',
                    fontSize: '1.02rem',
                    color: '#0F172A',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }}>
                  <LockIcon />
                </div>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={8}
                  style={{
                    width: '100%',
                    height: '50px',
                    paddingLeft: '44px',
                    paddingRight: '14px',
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '14px',
                    fontSize: '1.02rem',
                    color: '#0F172A',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>
                Use at least 8 characters with a mix of letters & numbers.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="primary-glow-btn"
              style={{
                height: '52px',
                width: '100%',
                borderRadius: '14px',
                border: 'none',
                background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                color: '#FFFFFF',
                fontSize: '1.08rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(5, 150, 105, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                marginTop: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ whiteSpace: 'nowrap' }}>{loading ? 'Authenticating...' : mode === 'signup' ? 'Get started for free' : 'Log In to Workspace'}</span>
              <ArrowRightIcon />
            </button>
          </form>

          {/* Toggle Link */}
          <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #F1F5F9', fontSize: '0.96rem', color: '#64748B' }}>
            {mode === 'signup' ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 800, cursor: 'pointer', padding: 0 }}
                >
                  Log in
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  style={{ background: 'none', border: 'none', color: '#059669', fontWeight: 800, cursor: 'pointer', padding: 0 }}
                >
                  Sign up free
                </button>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Google OAuth Modal Overlay */}
      {showGoogleModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 1000000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '440px',
              padding: '36px 32px 32px 32px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3), 0 0 1px rgba(0, 0, 0, 0.2)',
              position: 'relative',
              animation: 'googleModalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowGoogleModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#F1F5F9',
                border: 'none',
                fontSize: '1rem',
                color: '#5F6368',
                cursor: 'pointer',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}
            >
              ✕
            </button>

            {/* Google Logo Header */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center', marginBottom: '14px' }}>
                <GoogleIcon className="w-10 h-10" />
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 600, color: '#202124', margin: '0 0 6px 0', letterSpacing: '-0.01em' }}>
                {mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#5F6368', margin: 0 }}>
                to continue to <strong style={{ color: '#202124', fontWeight: 600 }}>insovant.ai</strong>
              </p>
            </div>

            {/* Step: Select Account */}
            {googleStep === 'select' && (
              <div>
                {!showCustomGoogleInput ? (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                      {/* Account 1 */}
                      <button
                        type="button"
                        onClick={() => handleSelectGoogleAccount('dhruv.sharma@gmail.com')}
                        className="google-account-btn"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid #E0E0E0',
                          background: '#FFFFFF',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#4F46E5', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                          D
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#202124', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            Dhruv Sharma
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#5F6368', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            dhruv.sharma@gmail.com
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', background: '#E8F0FE', color: '#1A73E8', padding: '3px 8px', borderRadius: '99px', fontWeight: 600 }}>Active</span>
                      </button>

                      {/* Account 2 */}
                      <button
                        type="button"
                        onClick={() => handleSelectGoogleAccount('cfo@insovant.ai')}
                        className="google-account-btn"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid #E0E0E0',
                          background: '#FFFFFF',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#059669', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                          I
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#202124', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            Insovant Workspace
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#5F6368', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            cfo@insovant.ai
                          </div>
                        </div>
                      </button>

                      {/* Use another account */}
                      <button
                        type="button"
                        onClick={() => setShowCustomGoogleInput(true)}
                        className="google-account-btn"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px dashed #BDBDBD',
                          background: '#FAFAFA',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F1F3F4', color: '#5F6368', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.3rem', flexShrink: 0 }}>
                          +
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1A73E8' }}>
                          Use another Google account
                        </div>
                      </button>
                    </div>

                    <div style={{ borderTop: '1px solid #F1F3F4', paddingTop: '16px', fontSize: '0.78rem', color: '#70757A', lineHeight: '1.45', textAlign: 'center' }}>
                      To continue, Google will share your name, email address, language preference, and profile picture with Insovant.
                    </div>
                  </>
                ) : (
                  /* Custom Google Email Input */
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (customGoogleEmail) {
                        setGoogleStep('password');
                      }
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
                  >
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#3C4043', marginBottom: '6px' }}>
                        Email or phone
                      </label>
                      <input
                        type="email"
                        autoFocus
                        placeholder="you@gmail.com"
                        value={customGoogleEmail}
                        onChange={(e) => setCustomGoogleEmail(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          height: '48px',
                          padding: '0 14px',
                          borderRadius: '8px',
                          border: '1px solid #1A73E8',
                          outline: 'none',
                          fontSize: '1rem',
                          color: '#202124',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <button
                        type="button"
                        onClick={() => setShowCustomGoogleInput(false)}
                        style={{ background: 'none', border: 'none', color: '#1A73E8', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        style={{
                          background: '#1A73E8',
                          color: '#FFFFFF',
                          border: 'none',
                          padding: '10px 24px',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '0.92rem',
                          cursor: 'pointer',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Step: Password Prompt for custom email */}
            {googleStep === 'password' && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSelectGoogleAccount(customGoogleEmail || 'google-user@insovant.ai');
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                <div style={{ background: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1A73E8', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                    G
                  </div>
                  <span style={{ fontSize: '0.9rem', color: '#202124', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {customGoogleEmail}
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#3C4043', marginBottom: '6px' }}>
                    Enter Google password
                  </label>
                  <input
                    type="password"
                    autoFocus
                    placeholder="••••••••"
                    value={googlePassword}
                    onChange={(e) => setGooglePassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      height: '48px',
                      padding: '0 14px',
                      borderRadius: '8px',
                      border: '1px solid #1A73E8',
                      outline: 'none',
                      fontSize: '1rem',
                      color: '#202124',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setGoogleStep('select')}
                    style={{ background: 'none', border: 'none', color: '#1A73E8', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: '#1A73E8',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '10px 24px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}
                  >
                    Sign in
                  </button>
                </div>
              </form>
            )}

            {/* Step: Loading Authenticating State */}
            {googleStep === 'loading' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div className="google-spinner" style={{ margin: '0 auto 20px auto' }}></div>
                <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#202124', marginBottom: '6px' }}>
                  Connecting Google Account...
                </div>
                <div style={{ fontSize: '0.88rem', color: '#5F6368' }}>
                  Authenticating <strong style={{ color: '#1A73E8' }}>{selectedGoogleAccount}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Apple OAuth Modal Overlay */}
      {showAppleModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 1000000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '420px',
              padding: '36px 32px 32px 32px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.4)',
              position: 'relative',
              textAlign: 'center',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif'
            }}
          >
            <button
              type="button"
              onClick={() => setShowAppleModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: '#F2F2F7',
                border: 'none',
                fontSize: '1rem',
                color: '#8E8E93',
                cursor: 'pointer',
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>

            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <AppleIcon className="w-12 h-12" />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#000000', margin: '0 0 6px 0' }}>
              Sign in with Apple ID
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#8E8E93', margin: '0 0 24px 0' }}>
              Use your Apple ID to sign in to Insovant.
            </p>

            <div style={{ background: '#F2F2F7', padding: '14px', borderRadius: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#000', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                
              </div>
              <div style={{ textAlign: 'left', flex: 1, overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#000' }}>Apple ID Account</div>
                <div style={{ fontSize: '0.82rem', color: '#8E8E93', overflow: 'hidden', textOverflow: 'ellipsis' }}>apple-user@insovant.ai</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAppleModal(false);
                triggerDollarBurst('apple-user@insovant.ai');
              }}
              style={{
                width: '100%',
                height: '48px',
                borderRadius: '12px',
                background: '#000000',
                color: '#FFFFFF',
                fontWeight: 600,
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)'
              }}
            >
              Continue with Touch ID / Passcode
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Auth2;

