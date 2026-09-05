'use client';

import React from 'react';

// Try importing motion/react or framer-motion, with safe fallback wrapper
let motion: any;
try {
  motion = require('motion/react').motion;
} catch (e1) {
  try {
    motion = require('framer-motion').motion;
  } catch (e2) {
    // Fallback if motion library is not present
    motion = {
      div: (props: any) => <div {...filterProps(props)} />,
      nav: (props: any) => <nav {...filterProps(props)} />,
      h1: (props: any) => <h1 {...filterProps(props)} />,
      p: (props: any) => <p {...filterProps(props)} />,
      img: (props: any) => <img {...filterProps(props)} />
    };
  }
}

function filterProps(props: any) {
  const { initial, animate, whileInView, viewport, variants, transition, ...rest } = props;
  return rest;
}

// SVG Icon Components for maximum portability & zero missing dependency issues
function LogoIcon({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill="#059669" />
      <path d="M10 10H22V14H10V10Z" fill="white" fillOpacity="0.9" />
      <path d="M10 18H18V22H10V18Z" fill="white" fillOpacity="0.7" />
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

function ShieldCheckIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function AudioLinesIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 10v4" />
      <path d="M6 6v12" />
      <path d="M10 3v18" />
      <path d="M14 8v8" />
      <path d="M18 5v14" />
      <path d="M22 10v4" />
    </svg>
  );
}

function Globe2Icon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

interface NavLink {
  label: string;
  href: string;
  tabId?: string;
}

interface FeatureItem {
  title: string;
  description: string;
  icon: 'audio' | 'shield' | 'globe';
}

interface Hero22Props {
  brandName?: string;
  navLinks?: NavLink[];
  headingLine1?: string;
  headingLine2Prefix?: string;
  headingHighlight?: string;
  description?: string;
  primaryCtaLabel?: string;
  primaryCtaAction?: () => void;
  secondaryCtaLabel?: string;
  secondaryCtaAction?: () => void;
  loginLabel?: string;
  onLoginClick?: () => void;
  signupLabel?: string;
  onSignupClick?: () => void;
  onTabChange?: (tab: string) => void;
  features?: FeatureItem[];
  backgroundImage?: string;
  userEmail?: string | null;
  onLogout?: () => void;
  showTopNav?: boolean;
}

const navLinksDefault: NavLink[] = [
  { label: 'Platform Features', href: '#features', tabId: 'features' },
  { label: 'Reconciliation', href: '#reconciliation', tabId: 'reconciliation' },
  { label: 'Intelligence', href: '#qa', tabId: 'qa' },
  { label: 'GSTR-2B Tax Matcher', href: '#tax', tabId: 'tax' },
  { label: 'Cash Forecaster', href: '#forecast', tabId: 'forecast' },
];

const featuresDefault: FeatureItem[] = [
  { title: '98.4% Match Accuracy', description: 'Automated Settlement Verification', icon: 'shield' },
  { title: 'Zero Override', description: 'HMAC Cryptographic Security', icon: 'audio' },
  { title: 'GSTR-2B Verified', description: '3-Field Tax Fraud Protection', icon: 'globe' },
];

const iconMap = {
  audio: AudioLinesIcon,
  shield: ShieldCheckIcon,
  globe: Globe2Icon,
};

const sectionVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.13,
      delayChildren: 0.1,
    },
  },
};

const navVariants = {
  hidden: { opacity: 0, y: -20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 22, mass: 0.9 },
  },
};

const copyVariants = {
  hidden: { opacity: 0, scale: 0.94, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 200, damping: 26, mass: 1 },
  },
};

const featureRowVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
      delayChildren: 0.12,
    },
  },
};

const featureVariants = {
  hidden: { opacity: 0, y: 22, rotateX: 18, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 240, damping: 28, mass: 0.8 },
  },
};

export default function Hero22({
  brandName = 'INSOVANT.AI',
  navLinks = navLinksDefault,
  headingLine1 = 'Autonomous AI Finance',
  headingLine2Prefix = 'Controller &',
  headingHighlight = 'Reconciliation',
  description = 'Match bank statement feeds against Razorpay payouts, audit GSTR-2B tax filings with 3-field fraud protection, and forecast cash positions with 100% cryptographic trust security.',
  primaryCtaLabel = 'Get Started Free',
  primaryCtaAction,
  secondaryCtaLabel = 'Launch Interactive Demo',
  secondaryCtaAction,
  loginLabel = 'Log in',
  onLoginClick,
  signupLabel = 'Get Started',
  onSignupClick,
  onTabChange,
  features = featuresDefault,
  userEmail = null,
  onLogout,
  showTopNav = false
}: Hero22Props) {
  return (
    <section
      className="hero-22-section"
      style={{
        position: 'relative',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.12)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        borderRadius: '32px',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        padding: '36px 48px 48px 48px',
        boxShadow: '0 12px 40px rgba(5, 150, 105, 0.04)',
        marginBottom: '40px',
        overflow: 'hidden'
      }}
    >
      {/* Ambient Radial Lighting Glow */}
      <div
        style={{
          position: 'absolute',
          top: '-120px',
          right: '-100px',
          width: '550px',
          height: '550px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(255, 255, 255, 0) 70%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />

      <motion.div
        style={{ position: 'relative', zIndex: 2 }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.34 }}
        variants={sectionVariants}
      >
        {/* Startup Top Navigation Header (Optional) */}
        {showTopNav && (
          <motion.nav
            variants={navVariants}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              marginBottom: '56px'
            }}
          >
            {/* Brand Logo & Name */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
              onClick={() => onTabChange && onTabChange('overview')}
            >
              <LogoIcon className="w-8 h-8 text-emerald-600" />
              <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.03em' }}>
                {brandName}
              </span>
            </div>

            {/* Navigation Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="hidden lg:flex">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => onTabChange && link.tabId && onTabChange(link.tabId)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease'
                  }}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* Auth Action Buttons (Log in & Sign up) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {userEmail ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#047857', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '6px 14px', borderRadius: '9999px' }}>
                    👤 {userEmail}
                  </span>
                  <button
                    onClick={onLogout}
                    style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#334155', padding: '6px 14px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={onLoginClick}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: '#0F172A',
                      cursor: 'pointer',
                      padding: '8px 16px'
                    }}
                  >
                    {loginLabel}
                  </button>

                  <button
                    onClick={onSignupClick}
                    style={{
                      background: '#059669',
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '10px 22px',
                      borderRadius: '10px',
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.15), inset 0 -2px 6px rgba(0,0,0,0.15)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {signupLabel}
                  </button>
                </>
              )}
            </div>
          </motion.nav>
        )}

        {/* Startup Hero Copy Container */}
        <div style={{ maxWidth: '820px', marginBottom: '56px' }}>
          <div>
            <motion.h1
              variants={copyVariants}
              style={{
                fontSize: '3.8rem',
                fontWeight: 900,
                lineHeight: '1.1',
                color: '#0F172A',
                letterSpacing: '-0.04em',
                margin: '0 0 24px 0'
              }}
            >
              <span style={{ display: 'block' }}>{headingLine1}</span>
              <span style={{ display: 'block' }}>
                {headingLine2Prefix}{' '}
                <span style={{ fontStyle: 'italic', color: '#059669', fontFamily: 'var(--font-tempting), Georgia, serif' }}>
                  {headingHighlight}
                </span>
              </span>
            </motion.h1>

            <motion.p
              variants={copyVariants}
              style={{
                fontSize: '1.2rem',
                color: '#334155',
                lineHeight: '1.65',
                fontWeight: 500,
                maxWidth: '680px',
                margin: '0 0 36px 0'
              }}
            >
              {description}
            </motion.p>

            <motion.div
              variants={copyVariants}
              style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}
            >
              <button
                className="primary-glow-btn"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
                  color: '#FFFFFF',
                  padding: '14px 28px',
                  borderRadius: '14px',
                  fontSize: '0.98rem',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 6px 20px rgba(5, 150, 105, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap'
                }}
                onClick={primaryCtaAction}
              >
                <span style={{ whiteSpace: 'nowrap' }}>{primaryCtaLabel}</span>
                <ArrowRightIcon />
              </button>

              <button
                className="secondary-outline-btn"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  color: '#0F172A',
                  padding: '16px 28px',
                  borderRadius: '16px',
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
                onClick={secondaryCtaAction}
              >
                {secondaryCtaLabel}
              </button>
            </motion.div>
          </div>
        </div>

        {/* Bottom Feature Badges */}
        <motion.div
          variants={featureRowVariants}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '32px',
            borderTop: '1px solid #E2E8F0',
            paddingTop: '28px'
          }}
        >
          {features.map((feature) => {
            const Icon = iconMap[feature.icon] || ShieldCheckIcon;
            return (
              <motion.div
                key={feature.title}
                variants={featureVariants}
                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#047857',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
                    {feature.title}
                  </div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>
                    {feature.description}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}
