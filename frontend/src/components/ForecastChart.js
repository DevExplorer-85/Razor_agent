'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';

export default function ForecastChart({ data }) {
  if (!data) return null;

  const historical = (data.historical || []).map(h => ({
    date: h.date,
    actual: h.amount_rupees,
    type: 'historical',
  }));

  const forecastData = (data.forecast || []).map(f => ({
    date: f.date,
    predicted: f.predicted_rupees,
    lower: f.lower_80_rupees,
    upper: f.upper_80_rupees,
    type: 'forecast',
  }));

  // Bridge: last historical + first forecast
  const bridgePoint = historical.length > 0 ? {
    date: historical[historical.length - 1].date,
    actual: historical[historical.length - 1].actual,
    predicted: historical[historical.length - 1].actual,
    lower: historical[historical.length - 1].actual,
    upper: historical[historical.length - 1].actual,
    type: 'bridge',
  } : null;

  const chartData = [
    ...historical,
    ...(bridgePoint ? [bridgePoint] : []),
    ...forecastData,
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        background: 'rgba(17, 24, 39, 0.95)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '0.8rem',
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ fontWeight: 600, marginBottom: '6px', color: '#f1f5f9' }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color, marginBottom: '2px' }}>
            {p.name}: ₹{Number(p.value).toLocaleString('en-IN')}
          </div>
        ))}
      </div>
    );
  };

  // Find the dividing line date
  const dividerDate = bridgePoint?.date;

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCI" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(148,163,184,0.1)' }}
            tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />

          {dividerDate && (
            <ReferenceLine
              x={dividerDate}
              stroke="rgba(148,163,184,0.3)"
              strokeDasharray="5 5"
              label={{ value: 'Forecast →', fill: '#64748b', fontSize: 11, position: 'top' }}
            />
          )}

          {/* Confidence Band */}
          <Area
            type="monotone"
            dataKey="upper"
            stroke="none"
            fill="url(#colorCI)"
            fillOpacity={1}
          />
          <Area
            type="monotone"
            dataKey="lower"
            stroke="none"
            fill="var(--bg-primary)"
            fillOpacity={1}
          />

          {/* Historical */}
          <Area
            type="monotone"
            dataKey="actual"
            stroke="#10b981"
            fill="url(#colorActual)"
            strokeWidth={2}
            dot={false}
            name="Actual"
          />

          {/* Predicted */}
          <Area
            type="monotone"
            dataKey="predicted"
            stroke="#6366f1"
            fill="url(#colorPredicted)"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={false}
            name="Predicted"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
