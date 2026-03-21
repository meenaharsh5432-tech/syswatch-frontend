import React, { useState, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';
const MAX_HISTORY = 5;

const SEVERITY_STYLES = {
  normal:   { bg: '#0f3320', text: '#3fb950', border: '#1a4d2e', label: 'NORMAL' },
  warning:  { bg: '#2d2515', text: '#e3b341', border: '#5a4620', label: 'WARNING' },
  critical: { bg: '#3d1212', text: '#f85149', border: '#6e2020', label: 'CRITICAL' }
};

function Dots() {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span
          key={i}
          style={{
            width: 6, height: 6, borderRadius: '50%', background: '#58a6ff',
            animation: `pulse 1.2s ${i * 0.2}s infinite ease-in-out`
          }}
        />
      ))}
      <style>{`@keyframes pulse { 0%,80%,100%{opacity:.2} 40%{opacity:1} }`}</style>
    </span>
  );
}

function AnalysisCard({ result, isCurrent }) {
  const s = SEVERITY_STYLES[result.analysis.severity] || SEVERITY_STYLES.normal;
  return (
    <div style={{ ...styles.card, borderColor: isCurrent ? s.border : '#21262d', opacity: isCurrent ? 1 : 0.6 }}>
      <div style={styles.cardHeader}>
        <span style={{ ...styles.severityBadge, background: s.bg, color: s.text }}>{s.label}</span>
        <span style={styles.cardTime}>{new Date(result.timestamp).toLocaleTimeString()}</span>
      </div>
      <div style={styles.headline}>{result.analysis.headline}</div>

      {result.analysis.findings?.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionLabel}>Findings</div>
          {result.analysis.findings.map((f, i) => (
            <div key={i} style={styles.finding}>
              <span style={{ color: s.text, marginRight: 6 }}>›</span>{f}
            </div>
          ))}
        </div>
      )}

      {result.analysis.prediction && (
        <div style={styles.section}>
          <div style={styles.sectionLabel}>Prediction</div>
          <div style={styles.bodyText}>{result.analysis.prediction}</div>
        </div>
      )}

      {result.analysis.action && (
        <div style={{ ...styles.section, marginBottom: 0 }}>
          <div style={styles.sectionLabel}>Recommended Action</div>
          <div style={{ ...styles.bodyText, background: '#0d1117', padding: '6px 10px', borderRadius: 4, borderLeft: `3px solid ${s.text}` }}>
            {result.analysis.action}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AIPanel({ disabled = false, agentId = null, getToken = null }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const analyze = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (getToken) { const t = getToken(); if (t) headers['Authorization'] = `Bearer ${t}`; }
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers,
        body: JSON.stringify(agentId ? { agentId } : {})
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setHistory(prev => [data, ...prev].slice(0, MAX_HISTORY));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>AI Analysis</div>
          <div style={styles.subtitle}>Powered by Claude claude-sonnet-4-20250514</div>
        </div>
        <button
          onClick={analyze}
          disabled={loading || disabled}
          title="Analyze system"
          style={{ ...styles.analyzeBtn, opacity: (loading || disabled) ? 0.5 : 1, cursor: (loading || disabled) ? 'not-allowed' : 'pointer' }}
        >
          {loading ? <><Dots /> <span style={{ marginLeft: 8 }}>Analyzing</span></> : 'Analyze System'}
        </button>
      </div>

      {error && (
        <div style={styles.error}>{error}</div>
      )}

      <div style={styles.content}>
        {history.length === 0 && !loading && (
          <div style={styles.empty}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
            <div>Click "Analyze System" to get AI insights</div>
            <div style={{ fontSize: 11, marginTop: 4, color: '#6e7681' }}>Analyzes CPU, memory, disk, network, and logs</div>
          </div>
        )}

        {history.map((result, i) => (
          <AnalysisCard key={result.timestamp} result={result} isCurrent={i === 0} />
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    background: '#161b22',
    border: '1px solid #21262d',
    borderRadius: 8,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flex: 1,
    minHeight: 0
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid #21262d',
    gap: 12
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e6edf3',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  subtitle: {
    fontSize: 10,
    color: '#6e7681',
    marginTop: 2
  },
  analyzeBtn: {
    background: 'linear-gradient(135deg, #1f6feb, #1158c7)',
    border: 'none',
    borderRadius: 6,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    fontSize: 12,
    fontWeight: 600,
    padding: '7px 16px',
    whiteSpace: 'nowrap',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
  },
  error: {
    background: '#3d1212',
    border: '1px solid #6e2020',
    borderRadius: 4,
    color: '#f85149',
    fontSize: 12,
    margin: '8px 12px',
    padding: '8px 12px'
  },
  content: {
    overflowY: 'auto',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    flex: 1
  },
  empty: {
    textAlign: 'center',
    color: '#8b949e',
    padding: 32,
    fontSize: 13
  },
  card: {
    background: '#0d1117',
    border: '1px solid',
    borderRadius: 6,
    padding: '12px 14px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  severityBadge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '3px 9px',
    borderRadius: 10,
    letterSpacing: '0.08em'
  },
  cardTime: {
    fontSize: 11,
    color: '#6e7681'
  },
  headline: {
    fontSize: 14,
    fontWeight: 600,
    color: '#e6edf3',
    marginBottom: 10,
    lineHeight: 1.4
  },
  section: {
    marginBottom: 10
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: '#6e7681',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 4
  },
  finding: {
    fontSize: 12,
    color: '#c9d1d9',
    marginBottom: 4,
    lineHeight: 1.5
  },
  bodyText: {
    fontSize: 12,
    color: '#c9d1d9',
    lineHeight: 1.5
  }
};
