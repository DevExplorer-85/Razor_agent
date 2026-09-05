'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import InsovantBentoForecast from '@/components/InsovantBentoForecast';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const MOCK_FORECAST_REPORT = {
  status: 'complete',
  clean_records: 48,
  excluded_records: 5,
  model: 'ExponentialSmoothing (Holt-Winters)',
  total_historical_days: 30,
  forecast: [
    { date: '2026-09-02', day: 'Wed', predicted_rupees: 640000, lower_80_rupees: 590000, upper_80_rupees: 690000 },
    { date: '2026-09-03', day: 'Thu', predicted_rupees: 670000, lower_80_rupees: 610000, upper_80_rupees: 730000 },
    { date: '2026-09-04', day: 'Fri', predicted_rupees: 710000, lower_80_rupees: 640000, upper_80_rupees: 780000 },
    { date: '2026-09-05', day: 'Sat', predicted_rupees: 690000, lower_80_rupees: 620000, upper_80_rupees: 760000 },
    { date: '2026-09-06', day: 'Sun', predicted_rupees: 730000, lower_80_rupees: 660000, upper_80_rupees: 800000 },
    { date: '2026-09-07', day: 'Mon', predicted_rupees: 780000, lower_80_rupees: 700000, upper_80_rupees: 860000 },
    { date: '2026-09-08', day: 'Tue', predicted_rupees: 820000, lower_80_rupees: 740000, upper_80_rupees: 900000 },
  ]
};

export default function ForecastPage() {
  const [forecast, setForecast] = useState(MOCK_FORECAST_REPORT);
  const [loading, setLoading] = useState(false);

  async function loadForecast() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/forecast`);
      if (res.ok) setForecast(await res.json());
      else setForecast(MOCK_FORECAST_REPORT);
    } catch (e) {
      setForecast(MOCK_FORECAST_REPORT);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }

  return (
    <>
      <Sidebar />
      <main className="main-content animate-fade-in" style={{ marginLeft: 'var(--sidebar-width)', padding: '40px', background: '#FFFFFF', color: '#0F172A' }}>
        <InsovantBentoForecast
          forecastData={forecast}
          onRunForecast={loadForecast}
          loading={loading}
        />
      </main>
    </>
  );
}
