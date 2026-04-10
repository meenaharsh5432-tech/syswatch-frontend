import React, { useState, useCallback, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';
const MAX_HISTORY = 5;

// claude-sonnet-4 pricing ($/token)
const PRICE_INPUT  = 3  / 1_000_000;
const PRICE_OUTPUT = 15 / 1_000_000;

function calcCost(inputTokens, outputTokens) {
  return ((inputTokens * PRICE_INPUT) + (outputTokens * PRICE_OUTPUT)).toFixed(5);
}

const SEV = {
  normal:   { bg: '#0f3320', text: '#3fb950', border: '#1a4d2e', label: 'NORMAL' },
  warning:  { bg: '#2d2515', text: '#e3b341', border: '#5a4620', label: 'WARNING' },
  critical: { bg: '#3d1212', text: '#f85149', border: '#6e2020', label: 'CRITICAL' }
};

function Dots() {
  return (
    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 5, height: 5, borderRadius: '50%', background: '#58a6ff',
          animation: `aipulse 1.2s ${i * 0.2}s infinite ease-in-out`
        }} />
      ))}
      <style>{`@keyframes aipulse{0%,80%,100%{opacity:.2}40%{opacity:1}}`}</style>
    </span>
  );
}

function UsagePill({ usage }) {
  if (!usage) return null;
  const cost = calcCost(usage.inputTokens, usage.outputTokens);
  return (
    <div style={s.usagePill}>
      <span style={s.usageItem} title="Input tokens">↑{usage.inputTokens}</span>
      <span style={s.usageDot}>·</span>
      <span style={s.usageItem} title="Output tokens">↓{usage.outputTokens}</span>
      <span style={s.usageDot}>·</span>
      <span style={s.usageItem} title="Latency">{usage.latencyMs}ms</span>
      <span style={s.usageDot}>·</span>
      <span style={{ ...s.usageItem, color: '#e3b341' }} title="Estimated cost">${cost}</span>
    </div>
  );
}

function AnalysisCard({ result, isCurrent }) {
  const sv = SEV[result.analysis.severity] || SEV.normal;
  return (
    <div style={{ ...s.card, borderColor: isCurrent ? sv.border : '#21262d', opacity: isCurrent ? 1 : 0.6 }}>
      <div style={s.cardHeader}>
        <span style={{ ...s.sevBadge, background: sv.bg, color: sv.text }}>{sv.label}</span>
        <span style={s.cardTime}>{new Date(result.timestamp).toLocaleTimeString()}</span>
      </div>
      <div style={s.headline}>{result.analysis.headline}</div>

      {result.analysis.findings?.length > 0 && (
        <div style={s.section}>
          <div style={s.sectionLabel}>Findings</div>
          {result.analysis.findings.map((f, i) => (
            <div key={i} style={s.finding}><span style={{ color: sv.text, marginRight: 6 }}>›</span>{f}</div>
          ))}
        </div>
      )}
      {result.analysis.prediction && (
        <div style={s.section}>
          <div style={s.sectionLabel}>Prediction</div>
          <div style={s.bodyText}>{result.analysis.prediction}</div>
        </div>
      )}
      {result.analysis.action && (
        <div style={{ ...s.section, marginBottom: 0 }}>
          <div style={s.sectionLabel}>Recommended Action</div>
          <div style={{ ...s.bodyText, background: '#0d1117', padding: '6px 10px', borderRadius: 4, borderLeft: `3px solid ${sv.text}` }}>
            {result.analysis.action}
          </div>
        </div>
      )}
      <UsagePill usage={result.usage} />
    </div>
  );
}

function StatsBar({ stats }) {
  if (!stats || stats.totalCalls === 0) return null;
  return (
    <div style={s.statsBar}>
      <div style={s.statItem}>
        <span style={s.statVal}>{stats.totalCalls}</span>
        <span style={s.statLbl}>calls</span>
      </div>
      <div style={s.statDivider} />
      <div style={s.statItem}>
        <span style={s.statVal}>{(stats.totalInput + stats.totalOutput).toLocaleString()}</span>
        <span style={s.statLbl}>tokens</span>
      </div>
      <div style={s.statDivider} />
      <div style={s.statItem}>
        <span style={s.statVal}>{stats.avgLatencyMs}ms</span>
        <span style={s.statLbl}>avg latency</span>
      </div>
      <div style={s.statDivider} />
      <div style={s.statItem}>
        <span style={{ ...s.statVal, color: '#e3b341' }}>${stats.estimatedCostUsd}</span>
        <span style={s.statLbl}>est. cost</span>
      </div>
    </div>
  );
}

// ─── Chat Tab ──────────────────────────────────────────────────────────────
function ChatTab({ agentId, getToken }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { role: 'user', content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setLoading(true);
    setError(null);
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (getToken) { const t = getToken(); if (t) headers['Authorization'] = `Bearer ${t}`; }
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages: next, agentId: agentId ?? undefined })
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.content,
        usage: data.usage
      }]);
    } catch (err) {
      setError(err.message);
      // remove optimistic user message on failure
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }

  function onKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div style={s.chatWrapper}>
      <div style={s.chatIntro}>
        Live system metrics are injected automatically. Ask anything.
      </div>

      <div style={s.chatMessages}>
        {messages.length === 0 && !loading && (
          <div style={s.chatEmpty}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>💬</div>
            <div>Ask about your server</div>
            <div style={{ fontSize: 11, marginTop: 4, color: '#6e7681' }}>
              e.g. "Why is CPU spiking?" · "Is memory usage normal?"
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ ...s.chatBubble, ...(m.role === 'user' ? s.chatUser : s.chatAssistant) }}>
            <div style={s.chatBubbleLabel}>{m.role === 'user' ? 'You' : 'AI'}</div>
            <div style={s.chatBubbleText}>{m.content}</div>
            {m.usage && <UsagePill usage={m.usage} />}
          </div>
        ))}
        {loading && (
          <div style={{ ...s.chatBubble, ...s.chatAssistant }}>
            <div style={s.chatBubbleLabel}>AI</div>
            <Dots />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <div style={s.error}>{error}</div>}

      <div style={s.chatInputRow}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Ask about your system… (Enter to send)"
          rows={2}
          style={s.chatInput}
          disabled={loading}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={{
          ...s.sendBtn,
          opacity: (loading || !input.trim()) ? 0.4 : 1,
          cursor: (loading || !input.trim()) ? 'not-allowed' : 'pointer'
        }}>
          {loading ? <Dots /> : '➤'}
        </button>
      </div>
    </div>
  );
}

// ─── Main Panel ────────────────────────────────────────────────────────────
export default function AIPanel({ disabled = false, agentId = null, getToken = null }) {
  const [tab, setTab] = useState('analyze');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const headers = {};
      if (getToken) { const t = getToken(); if (t) headers['Authorization'] = `Bearer ${t}`; }
      const res = await fetch(`${API_URL}/api/ai/stats`, { headers });
      if (res.ok) setStats(await res.json());
    } catch { /* silent */ }
  }, [getToken]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

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
      fetchStats();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [agentId, getToken, fetchStats]);

  return (
    <div style={s.wrapper}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <div style={s.title}>AI Analysis</div>
          <div style={s.subtitle}>Powered by Claude Sonnet</div>
        </div>
        {tab === 'analyze' && (
          <button
            onClick={analyze}
            disabled={loading || disabled}
            style={{ ...s.analyzeBtn, opacity: (loading || disabled) ? 0.5 : 1, cursor: (loading || disabled) ? 'not-allowed' : 'pointer' }}
          >
            {loading ? <><Dots /><span style={{ marginLeft: 8 }}>Analyzing</span></> : 'Analyze'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={s.tabs}>
        {['analyze', 'chat'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ ...s.tab, ...(tab === t ? s.tabActive : {}) }}>
            {t === 'analyze' ? '🔍 Analyze' : '💬 Chat'}
          </button>
        ))}
      </div>

      {/* LLM Stats bar */}
      <StatsBar stats={stats} />

      {error && <div style={s.error}>{error}</div>}

      {/* Tab content */}
      {tab === 'analyze' ? (
        <div style={s.content}>
          {history.length === 0 && !loading && (
            <div style={s.empty}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🤖</div>
              <div>Click "Analyze" to get AI insights</div>
              <div style={{ fontSize: 11, marginTop: 4, color: '#6e7681' }}>
                Analyzes CPU, memory, disk, network, and logs
              </div>
            </div>
          )}
          {history.map((result, i) => (
            <AnalysisCard key={result.timestamp} result={result} isCurrent={i === 0} />
          ))}
        </div>
      ) : (
        <ChatTab agentId={agentId} getToken={getToken} />
      )}
    </div>
  );
}

const s = {
  wrapper: { background: '#161b22', border: '1px solid #21262d', borderRadius: 8, display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, minHeight: 0 },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #21262d', gap: 10, flexShrink: 0 },
  title: { fontSize: 12, fontWeight: 700, color: '#e6edf3', textTransform: 'uppercase', letterSpacing: '0.05em' },
  subtitle: { fontSize: 10, color: '#6e7681', marginTop: 2 },
  analyzeBtn: { background: 'linear-gradient(135deg,#1f6feb,#1158c7)', border: 'none', borderRadius: 6, color: '#fff', display: 'flex', alignItems: 'center', fontSize: 11, fontWeight: 600, padding: '6px 12px', whiteSpace: 'nowrap', boxShadow: '0 1px 3px rgba(0,0,0,.3)' },
  tabs: { display: 'flex', borderBottom: '1px solid #21262d', flexShrink: 0 },
  tab: { flex: 1, background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 11, fontWeight: 600, padding: '7px 0', letterSpacing: '0.03em' },
  tabActive: { color: '#58a6ff', borderBottom: '2px solid #58a6ff' },
  statsBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-around', background: '#0d1117', borderBottom: '1px solid #21262d', padding: '6px 10px', flexShrink: 0 },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 },
  statVal: { fontSize: 12, fontWeight: 700, color: '#c9d1d9', fontVariantNumeric: 'tabular-nums' },
  statLbl: { fontSize: 9, color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.06em' },
  statDivider: { width: 1, height: 24, background: '#21262d' },
  error: { background: '#3d1212', border: '1px solid #6e2020', borderRadius: 4, color: '#f85149', fontSize: 11, margin: '6px 10px', padding: '6px 10px', flexShrink: 0 },
  content: { overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 },
  empty: { textAlign: 'center', color: '#8b949e', padding: '28px 16px', fontSize: 12 },
  card: { background: '#0d1117', border: '1px solid', borderRadius: 6, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 0 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  sevBadge: { fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10, letterSpacing: '0.08em' },
  cardTime: { fontSize: 10, color: '#6e7681' },
  headline: { fontSize: 13, fontWeight: 600, color: '#e6edf3', marginBottom: 8, lineHeight: 1.4 },
  section: { marginBottom: 8 },
  sectionLabel: { fontSize: 9, fontWeight: 700, color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3 },
  finding: { fontSize: 11, color: '#c9d1d9', marginBottom: 3, lineHeight: 1.5 },
  bodyText: { fontSize: 11, color: '#c9d1d9', lineHeight: 1.5 },
  usagePill: { display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, paddingTop: 6, borderTop: '1px solid #21262d' },
  usageItem: { fontSize: 10, color: '#6e7681', fontVariantNumeric: 'tabular-nums' },
  usageDot: { fontSize: 9, color: '#30363d' },
  // chat
  chatWrapper: { display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' },
  chatIntro: { fontSize: 10, color: '#6e7681', padding: '5px 12px', borderBottom: '1px solid #21262d', flexShrink: 0 },
  chatMessages: { flex: 1, overflowY: 'auto', padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: 8 },
  chatEmpty: { textAlign: 'center', color: '#8b949e', padding: '24px 12px', fontSize: 12 },
  chatBubble: { padding: '8px 10px', borderRadius: 6, maxWidth: '100%' },
  chatUser: { background: '#1c2a3a', border: '1px solid #1f4060', alignSelf: 'flex-end' },
  chatAssistant: { background: '#161b22', border: '1px solid #21262d', alignSelf: 'flex-start' },
  chatBubbleLabel: { fontSize: 9, fontWeight: 700, color: '#6e7681', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 },
  chatBubbleText: { fontSize: 12, color: '#c9d1d9', lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
  chatInputRow: { display: 'flex', gap: 6, padding: '8px 10px', borderTop: '1px solid #21262d', flexShrink: 0, alignItems: 'flex-end' },
  chatInput: { flex: 1, background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 12, padding: '7px 10px', resize: 'none', outline: 'none', fontFamily: 'inherit', lineHeight: 1.4 },
  sendBtn: { background: 'linear-gradient(135deg,#1f6feb,#1158c7)', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 14, padding: '0 12px', height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }
};
