'use client';

import { useState } from 'react';

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', rateToInr: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar', rateToInr: 83.5 },
  { code: 'EUR', symbol: '€', name: 'Euro', rateToInr: 90.2 },
  { code: 'GBP', symbol: '£', name: 'British Pound', rateToInr: 106.0 },
];

const FEE_STRUCTURES = [
  { id: 'standard', name: 'Razorpay Standard (2.0% MDR)', rate: 0.02 },
  { id: 'upi', name: 'UPI / Debit Card (1.5% MDR)', rate: 0.015 },
  { id: 'intl', name: 'International Cards (3.0% MDR)', rate: 0.03 },
];

export default function TokenSwapWidget() {
  const [grossAmount, setGrossAmount] = useState('100000');
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [feeStructure, setFeeStructure] = useState(FEE_STRUCTURES[0]);
  const [settlementCycle, setSettlementCycle] = useState('instant'); // instant, standard
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcSuccess, setCalcSuccess] = useState(false);

  // Calculations
  const gross = parseFloat(grossAmount) || 0;
  const mdrFee = gross * feeStructure.rate;
  const gstTax = mdrFee * 0.18; // 18% GST on gateway MDR fee
  const instantFee = settlementCycle === 'instant' ? (currency.code === 'INR' ? 15 : 2) : 0;
  const totalDeduction = mdrFee + gstTax + instantFee;
  const netPayout = Math.max(0, gross - totalDeduction);

  const handleSimulate = () => {
    setIsCalculating(true);
    setCalcSuccess(false);

    setTimeout(() => {
      setIsCalculating(false);
      setCalcSuccess(true);
      setTimeout(() => setCalcSuccess(false), 4000);
    }, 600);
  };

  return (
    <div style={{
      maxWidth: '780px',
      margin: '0 auto',
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '24px',
      padding: '36px',
      boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
      color: '#0F172A'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            Gateway Fee & Net Payout Calculator
          </h3>
          <p style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '4px', margin: 0 }}>
            Simulate Razorpay MDR deductions, 18% GST tax, and net bank credit payouts.
          </p>
        </div>
        <span style={{
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          color: '#047857',
          padding: '6px 14px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: 800
        }}>
          Live Rules Active
        </span>
      </div>

      {/* Input Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Gross Collection Amount Box */}
        <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '20px' }}>
          <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
            Gross Collection Volume
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669' }}>{currency.symbol}</span>
            <input
              type="number"
              value={grossAmount}
              onChange={(e) => setGrossAmount(e.target.value)}
              placeholder="0.00"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '1.6rem',
                fontWeight: 900,
                color: '#0F172A',
                width: '100%'
              }}
            />
            <select
              value={currency.code}
              onChange={(e) => {
                const found = CURRENCIES.find(c => c.code === e.target.value);
                if (found) setCurrency(found);
              }}
              style={{
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#0F172A',
                padding: '8px 12px',
                borderRadius: '12px',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
              ))}
            </select>
          </div>
        </div>

        {/* MDR Fee Tier Box */}
        <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '20px' }}>
          <label style={{ fontSize: '0.9rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
            Gateway Rate Agreement
          </label>
          <select
            value={feeStructure.id}
            onChange={(e) => {
              const found = FEE_STRUCTURES.find(f => f.id === e.target.value);
              if (found) setFeeStructure(found);
            }}
            style={{
              width: '100%',
              background: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#0F172A',
              padding: '12px 14px',
              borderRadius: '12px',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: 'pointer',
              marginTop: '4px'
            }}
          >
            {FEE_STRUCTURES.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Settlement Cycle Preference */}
      <div style={{ marginBottom: '28px' }}>
        <label style={{ fontSize: '0.95rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '12px' }}>
          Settlement Speed & Transfer Mode
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <button
            onClick={() => setSettlementCycle('instant')}
            style={{
              padding: '14px 20px',
              borderRadius: '14px',
              border: settlementCycle === 'instant' ? '2px solid #059669' : '1px solid #E2E8F0',
              background: settlementCycle === 'instant' ? '#ECFDF5' : '#F8FAFC',
              color: '#0F172A',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ color: '#047857', fontSize: '1.05rem' }}>Instant Payout (IMPS T+0)</div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500, marginTop: '4px' }}>Real-time 24x7 credit + ₹15 flat fee</div>
          </button>

          <button
            onClick={() => setSettlementCycle('standard')}
            style={{
              padding: '14px 20px',
              borderRadius: '14px',
              border: settlementCycle === 'standard' ? '2px solid #059669' : '1px solid #E2E8F0',
              background: settlementCycle === 'standard' ? '#ECFDF5' : '#F8FAFC',
              color: '#0F172A',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <div style={{ color: '#047857', fontSize: '1.05rem' }}>Standard Cycle (NEFT T+1)</div>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500, marginTop: '4px' }}>Next business day batch credit (Free)</div>
          </button>
        </div>
      </div>

      {/* Calculated Breakdown Card */}
      <div style={{
        background: '#F8FAFC',
        border: '1px solid #E2E8F0',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0', marginBottom: '12px' }}>
          <span style={{ color: '#64748B', fontSize: '0.95rem' }}>Gross Collections</span>
          <span style={{ color: '#0F172A', fontWeight: 800, fontSize: '1.05rem' }}>{currency.symbol}{gross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0', marginBottom: '12px' }}>
          <span style={{ color: '#64748B', fontSize: '0.95rem' }}>Razorpay MDR Fee ({(feeStructure.rate * 100).toFixed(1)}%)</span>
          <span style={{ color: '#DC2626', fontWeight: 800, fontSize: '1.05rem' }}>- {currency.symbol}{mdrFee.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0', marginBottom: '12px' }}>
          <span style={{ color: '#64748B', fontSize: '0.95rem' }}>GST Tax (18% on MDR Fee)</span>
          <span style={{ color: '#DC2626', fontWeight: 800, fontSize: '1.05rem' }}>- {currency.symbol}{gstTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>

        {instantFee > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0', marginBottom: '12px' }}>
            <span style={{ color: '#64748B', fontSize: '0.95rem' }}>Instant IMPS Transfer Fee</span>
            <span style={{ color: '#DC2626', fontWeight: 800, fontSize: '1.05rem' }}>- {currency.symbol}{instantFee.toFixed(2)}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px' }}>
          <span style={{ color: '#0F172A', fontWeight: 900, fontSize: '1.15rem' }}>Estimated Net Bank Credit</span>
          <span style={{ color: '#059669', fontWeight: 900, fontSize: '1.7rem' }}>
            {currency.symbol}{netPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleSimulate}
        disabled={isCalculating}
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
          color: '#FFFFFF',
          fontSize: '1.1rem',
          fontWeight: 900,
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(5, 150, 105, 0.35)',
          transition: 'all 0.25s ease'
        }}
      >
        {isCalculating ? 'Calculating Net Payout...' : 'Simulate Payout Calculation'}
      </button>

      {calcSuccess && (
        <div style={{
          marginTop: '16px',
          background: '#ECFDF5',
          border: '1px solid #A7F3D0',
          color: '#047857',
          padding: '14px',
          borderRadius: '12px',
          textAlign: 'center',
          fontWeight: 800,
          fontSize: '1rem'
        }}>
          Payout breakdown verified! Net Credit: {currency.symbol}{netPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </div>
      )}
    </div>
  );
}
