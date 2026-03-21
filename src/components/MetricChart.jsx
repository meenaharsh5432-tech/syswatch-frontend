import React, { useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts';

const WINDOW = 60;

function getLineColor(value, thresholds = { warn: 70, crit: 85 }) {
  if (value >= thresholds.crit) return '#f85149';
  if (value >= thresholds.warn) return '#e3b341';
  return '#3fb950';
}

const CustomTooltip = ({ active, payload, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 6, padding: '4px 10px', fontSize: 12 }}>
      <span style={{ color: '#e6edf3' }}>{payload[0].value?.toFixed(1)}{unit}</span>
    </div>
  );
};

export default function MetricChart({ title, data = [], color, unit = '%', thresholds, mini = false }) {
  const windowed = useMemo(() => data.slice(-WINDOW), [data]);
  const current = windowed.length > 0 ? windowed[windowed.length - 1].value : 0;
  const lineColor = color || getLineColor(current, thresholds || { warn: 70, crit: 85 });

  if (mini) {
    return (
      <div style={styles.miniContainer}>
        <div style={styles.miniHeader}>
          <span style={styles.miniTitle}>{title}</span>
          <span style={{ ...styles.miniValue, color: lineColor }}>{current?.toFixed(1)}{unit}</span>
        </div>
        <ResponsiveContainer width="100%" height={40}>
          <LineChart data={windowed} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
            <Line type="monotone" dataKey="value" stroke={lineColor} strokeWidth={1.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.title}>{title}</span>
        <span style={{ ...styles.currentValue, color: lineColor }}>{current?.toFixed(1)}{unit}</span>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={windowed} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <XAxis dataKey="label" hide />
          <YAxis domain={[0, unit === '%' ? 100 : 'auto']} tick={{ fill: '#8b949e', fontSize: 10 }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          {thresholds && <ReferenceLine y={thresholds.warn} stroke="#e3b341" strokeDasharray="3 3" strokeOpacity={0.5} />}
          {thresholds && <ReferenceLine y={thresholds.crit} stroke="#f85149" strokeDasharray="3 3" strokeOpacity={0.5} />}
          <Line
            type="monotone"
            dataKey="value"
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            activeDot={{ r: 3, fill: lineColor }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const styles = {
  container: {
    background: '#161b22',
    border: '1px solid #21262d',
    borderRadius: 8,
    padding: '12px 16px',
    flex: 1
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4
  },
  title: {
    fontSize: 13,
    color: '#8b949e',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  currentValue: {
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums'
  },
  miniContainer: {
    background: '#161b22',
    border: '1px solid #21262d',
    borderRadius: 6,
    padding: '8px 12px',
  },
  miniHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 2
  },
  miniTitle: {
    fontSize: 11,
    color: '#8b949e',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  miniValue: {
    fontSize: 14,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums'
  }
};
