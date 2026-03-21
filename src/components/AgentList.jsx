import React, { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

const STATUS_COLORS = {
  online:   { dot: '#3fb950', bg: '#0f3320', text: 'online' },
  degraded: { dot: '#e3b341', bg: '#2d2515', text: 'degraded' },
  offline:  { dot: '#f85149', bg: '#3d1212', text: 'offline' }
};

export default function AgentList({ selectedId, onSelect, getToken }) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/agents`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) setAgents(await res.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [getToken]);

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 15000); // refresh status every 15s
    return () => clearInterval(interval);
  }, [fetchAgents]);

  if (loading) return (
    <div style={s.wrapper}>
      <div style={s.header}><span style={s.title}>Servers</span></div>
      <div style={s.empty}>Loading...</div>
    </div>
  );

  return (
    <div style={s.wrapper}>
      <div style={s.header}>
        <span style={s.title}>Servers</span>
        <span style={s.count}>{agents.length}</span>
      </div>

      {/* Local machine option */}
      <button
        onClick={() => onSelect(null)}
        style={{ ...s.agentBtn, ...(selectedId === null ? s.agentSelected : {}) }}
      >
        <span style={{ ...s.dot, background: '#3fb950' }} />
        <div style={s.agentInfo}>
          <div style={s.agentName}>Local Machine</div>
          <div style={s.agentMeta}>this server</div>
        </div>
      </button>

      {agents.length > 0 && <div style={s.divider} />}

      {agents.map(agent => {
        const sc = STATUS_COLORS[agent.status] || STATUS_COLORS.offline;
        return (
          <button
            key={agent.id}
            onClick={() => onSelect(agent.id)}
            style={{ ...s.agentBtn, ...(selectedId === agent.id ? s.agentSelected : {}) }}
          >
            <span style={{ ...s.dot, background: sc.dot, boxShadow: agent.status === 'online' ? `0 0 6px ${sc.dot}66` : 'none' }} />
            <div style={s.agentInfo}>
              <div style={s.agentName}>{agent.name}</div>
              <div style={s.agentMeta}>{agent.status}</div>
            </div>
          </button>
        );
      })}

      {agents.length === 0 && (
        <div style={s.empty}>No remote agents yet.<br />Add one with the button above.</div>
      )}
    </div>
  );
}

const s = {
  wrapper: { display: 'flex', flexDirection: 'column' },
  header: { alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: 8, padding: '0 2px' },
  title: { color: '#6e7681', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' },
  count: { background: '#21262d', borderRadius: 8, color: '#8b949e', fontSize: 10, fontWeight: 700, padding: '1px 6px' },
  agentBtn: { alignItems: 'center', background: 'none', border: '1px solid transparent', borderRadius: 6, cursor: 'pointer', display: 'flex', gap: 10, padding: '8px 10px', textAlign: 'left', width: '100%', color: 'inherit' },
  agentSelected: { background: '#161b22', borderColor: '#30363d' },
  dot: { borderRadius: '50%', flexShrink: 0, height: 8, width: 8 },
  agentInfo: { flex: 1, minWidth: 0 },
  agentName: { color: '#e6edf3', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  agentMeta: { color: '#6e7681', fontSize: 11, marginTop: 1 },
  divider: { borderTop: '1px solid #21262d', margin: '6px 0' },
  empty: { color: '#6e7681', fontSize: 12, lineHeight: 1.5, padding: '12px 10px', textAlign: 'center' }
};
