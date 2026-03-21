import React from 'react';

function formatMem(mb, limitMb) {
  if (!limitMb) return `${mb?.toFixed(0)} MB`;
  return `${mb?.toFixed(0)} / ${limitMb?.toFixed(0)} MB`;
}

function usagePct(mb, limitMb) {
  if (!limitMb || limitMb === 0) return 0;
  return Math.min((mb / limitMb) * 100, 100);
}

function MiniBar({ pct, color }) {
  return (
    <div style={{ background: '#21262d', borderRadius: 3, height: 4, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s' }} />
    </div>
  );
}

export default function ContainerList({ containers = [] }) {
  if (containers.length === 0) {
    return (
      <div style={styles.wrapper}>
        <div style={styles.header}><span style={styles.title}>Docker Containers</span></div>
        <div style={styles.empty}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🐳</div>
          <div>Docker unavailable</div>
          <div style={{ fontSize: 11, marginTop: 4, color: '#6e7681' }}>No socket or no containers found</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <span style={styles.title}>Docker Containers</span>
        <span style={styles.count}>{containers.length}</span>
      </div>
      <div style={styles.list}>
        {containers.map((c) => {
          const running = c.status === 'running';
          const cpuColor = c.cpu_percent > 85 ? '#f85149' : c.cpu_percent > 70 ? '#e3b341' : '#3fb950';
          const memPct = usagePct(c.memory_mb, c.memory_limit_mb);
          const memColor = memPct > 85 ? '#f85149' : memPct > 70 ? '#e3b341' : '#58a6ff';

          return (
            <div key={c.id} style={{ ...styles.card, borderColor: running ? '#1f6035' : '#5a1f1f' }}>
              <div style={styles.cardTop}>
                <div style={styles.cardLeft}>
                  <div style={styles.dot(running)} />
                  <div>
                    <div style={styles.containerName}>{c.name}</div>
                    <div style={styles.containerImage}>{c.image}</div>
                  </div>
                </div>
                <span style={{ ...styles.statusBadge, background: running ? '#0f3320' : '#3d1212', color: running ? '#3fb950' : '#f85149' }}>
                  {c.status}
                </span>
              </div>

              {running && (
                <div style={styles.stats}>
                  <div style={styles.statBlock}>
                    <div style={styles.statLabel}>CPU</div>
                    <div style={{ ...styles.statValue, color: cpuColor }}>{c.cpu_percent?.toFixed(1)}%</div>
                    <MiniBar pct={Math.min(c.cpu_percent, 100)} color={cpuColor} />
                  </div>
                  <div style={styles.statBlock}>
                    <div style={styles.statLabel}>MEM</div>
                    <div style={{ ...styles.statValue, color: memColor }}>{formatMem(c.memory_mb, c.memory_limit_mb)}</div>
                    <MiniBar pct={memPct} color={memColor} />
                  </div>
                </div>
              )}

              <div style={styles.idBadge}>{c.id}</div>
            </div>
          );
        })}
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
    padding: '10px 16px',
    borderBottom: '1px solid #21262d'
  },
  title: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e6edf3',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  count: {
    background: '#21262d',
    color: '#8b949e',
    fontSize: 11,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 10
  },
  list: {
    overflowY: 'auto',
    padding: 12,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    flex: 1
  },
  card: {
    background: '#0d1117',
    border: '1px solid',
    borderRadius: 6,
    padding: '10px 12px',
    transition: 'border-color 0.3s'
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    minWidth: 0,
    gap: 8
  },
  cardLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    minWidth: 0,
    flex: 1,
    overflow: 'hidden'
  },
  dot: (running) => ({
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: running ? '#3fb950' : '#f85149',
    marginTop: 4,
    flexShrink: 0,
    boxShadow: running ? '0 0 6px #3fb95066' : '0 0 6px #f8514966'
  }),
  containerName: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e6edf3',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  containerImage: {
    fontSize: 11,
    color: '#6e7681',
    marginTop: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  statusBadge: {
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 10,
    letterSpacing: '0.06em',
    textTransform: 'uppercase'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginBottom: 6
  },
  statBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3
  },
  statLabel: {
    fontSize: 10,
    color: '#6e7681',
    fontWeight: 600,
    letterSpacing: '0.06em'
  },
  statValue: {
    fontSize: 12,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums'
  },
  idBadge: {
    fontSize: 10,
    color: '#6e7681',
    fontFamily: 'monospace',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  empty: {
    textAlign: 'center',
    color: '#8b949e',
    padding: 32,
    fontSize: 13
  }
};
