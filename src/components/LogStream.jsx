import React, { useState, useRef, useEffect } from 'react';

const LEVEL_COLORS = {
  ERROR: { bg: '#3d1f1f', text: '#f85149', border: '#6e2e2e' },
  WARN:  { bg: '#2d2515', text: '#e3b341', border: '#5a4620' },
  INFO:  { bg: '#0d2035', text: '#58a6ff', border: '#1f4060' },
  DEBUG: { bg: '#1c1c1c', text: '#8b949e', border: '#30363d' }
};

const LEVEL_ORDER = { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 };

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  } catch { return ''; }
}

export default function LogStream({ logs = [] }) {
  const [filter, setFilter] = useState('ALL');
  const [paused, setPaused] = useState(false);
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  const filtered = filter === 'ALL'
    ? logs
    : logs.filter(l => l.level === filter);

  useEffect(() => {
    if (!paused && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filtered.length, paused]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <span style={styles.title}>Live Logs</span>
        <div style={styles.filters}>
          {['ALL', 'ERROR', 'WARN', 'INFO'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              style={{
                ...styles.filterBtn,
                ...(filter === lvl ? { ...styles.filterActive, color: LEVEL_COLORS[lvl]?.text || '#e6edf3', borderColor: LEVEL_COLORS[lvl]?.border || '#58a6ff' } : {})
              }}
            >
              {lvl}
            </button>
          ))}
        </div>
        <span style={{ ...styles.badge, background: paused ? '#2d2515' : '#0d2035', color: paused ? '#e3b341' : '#3fb950' }}>
          {paused ? 'PAUSED' : 'LIVE'}
        </span>
      </div>

      <div
        ref={containerRef}
        style={styles.logContainer}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {filtered.length === 0 && (
          <div style={styles.empty}>No logs to display</div>
        )}
        {filtered.map((log, i) => {
          const c = LEVEL_COLORS[log.level] || LEVEL_COLORS.INFO;
          return (
            <div key={`${log.id}-${i}`} style={{ ...styles.logLine, borderLeft: `3px solid ${c.border}` }}>
              <span style={styles.time}>{formatTime(log.timestamp)}</span>
              <span style={{ ...styles.level, background: c.bg, color: c.text }}>{log.level}</span>
              <span style={styles.service}>{log.service}</span>
              <span style={styles.message}>{log.message}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
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
    minHeight: 0
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    borderBottom: '1px solid #21262d',
    flexShrink: 0
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e6edf3',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginRight: 8
  },
  filters: {
    display: 'flex',
    gap: 4,
    flex: 1
  },
  filterBtn: {
    background: 'none',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#30363d',
    borderRadius: 4,
    color: '#8b949e',
    cursor: 'pointer',
    fontSize: 11,
    fontWeight: 600,
    padding: '2px 8px',
    letterSpacing: '0.04em'
  },
  filterActive: {
    background: '#0d1117'
  },
  badge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 7px',
    borderRadius: 10,
    letterSpacing: '0.08em'
  },
  logContainer: {
    overflowY: 'auto',
    flex: 1,
    padding: '6px 0',
    fontFamily: "'Cascadia Code', 'Fira Code', 'Consolas', monospace",
    fontSize: 12
  },
  logLine: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    padding: '3px 16px',
    lineHeight: 1.5
  },
  time: {
    color: '#6e7681',
    flexShrink: 0,
    fontSize: 11
  },
  level: {
    flexShrink: 0,
    fontSize: 10,
    fontWeight: 700,
    padding: '1px 5px',
    borderRadius: 3,
    minWidth: 38,
    textAlign: 'center',
    letterSpacing: '0.04em'
  },
  service: {
    color: '#58a6ff',
    flexShrink: 0,
    fontSize: 11,
    minWidth: 70
  },
  message: {
    color: '#c9d1d9',
    flex: 1,
    wordBreak: 'break-all'
  },
  empty: {
    textAlign: 'center',
    color: '#6e7681',
    padding: 32,
    fontSize: 13
  }
};
