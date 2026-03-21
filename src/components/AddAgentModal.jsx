import React, { useState, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function AddAgentModal({ onClose, onCreated, getToken }) {
  const [name, setName] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) { setError('Server name is required'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ name: name.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to create agent');
        if (data.error === 'upgrade_required') setError(data.message + ' Go to /billing to upgrade.');
      } else {
        setResult(data);
        onCreated?.(data.agent);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function copyCommand() {
    navigator.clipboard.writeText(result.installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.header}>
          <span style={s.title}>{result ? 'Install Agent' : 'Add Server'}</span>
          <button onClick={onClose} style={s.closeBtn}>✕</button>
        </div>

        {!result ? (
          <form onSubmit={handleCreate} style={s.form}>
            <label style={s.label}>Server Name</label>
            <input
              ref={inputRef}
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. prod-web-01"
              style={s.input}
            />
            {error && <div style={s.error}>{error}</div>}
            <div style={s.formActions}>
              <button type="button" onClick={onClose} style={s.cancelBtn}>Cancel</button>
              <button type="submit" disabled={loading} style={s.createBtn}>
                {loading ? 'Creating...' : 'Create Agent'}
              </button>
            </div>
          </form>
        ) : (
          <div style={s.success}>
            <div style={s.successIcon}>✓</div>
            <div style={s.successText}>Agent <strong>{result.agent.name}</strong> created!</div>
            <p style={s.instructions}>
              Run this command on your Linux server to install the monitoring agent:
            </p>
            <div style={s.commandWrap}>
              <code style={s.command}>{result.installCommand}</code>
              <button onClick={copyCommand} style={s.copyBtn}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <div style={s.warning}>
              ⚠ Save this command — the API key will not be shown again.
            </div>
            <div style={s.requirements}>
              <div style={s.reqTitle}>Requirements</div>
              <div style={s.reqItem}>• Ubuntu 20.04+ / Debian 11+ / RHEL 8+</div>
              <div style={s.reqItem}>• Root access (sudo)</div>
              <div style={s.reqItem}>• Internet access to reach your backend</div>
            </div>
            <button onClick={onClose} style={s.doneBtn}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  overlay: { alignItems: 'center', background: 'rgba(0,0,0,0.7)', bottom: 0, display: 'flex', justifyContent: 'center', left: 0, padding: 20, position: 'fixed', right: 0, top: 0, zIndex: 1000 },
  modal: { background: '#161b22', border: '1px solid #30363d', borderRadius: 12, maxWidth: 520, padding: '24px', width: '100%' },
  header: { alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: 20 },
  title: { fontSize: 16, fontWeight: 700, color: '#e6edf3' },
  closeBtn: { background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 16 },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  label: { color: '#c9d1d9', fontSize: 13, fontWeight: 500 },
  input: { background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', fontSize: 14, outline: 'none', padding: '10px 12px', width: '100%', boxSizing: 'border-box' },
  error: { background: '#3d1212', border: '1px solid #6e2020', borderRadius: 6, color: '#f85149', fontSize: 12, padding: '8px 12px' },
  formActions: { display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 },
  cancelBtn: { background: 'none', border: '1px solid #30363d', borderRadius: 6, color: '#c9d1d9', cursor: 'pointer', fontSize: 13, padding: '8px 16px' },
  createBtn: { background: '#1f6feb', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: '8px 20px' },
  success: { display: 'flex', flexDirection: 'column', gap: 12 },
  successIcon: { background: '#0f3320', border: '1px solid #1a4d2e', borderRadius: '50%', color: '#3fb950', display: 'inline-block', fontSize: 16, fontWeight: 700, padding: '6px 12px', textAlign: 'center', width: 'fit-content' },
  successText: { color: '#e6edf3', fontSize: 15 },
  instructions: { color: '#8b949e', fontSize: 13, margin: 0 },
  commandWrap: { alignItems: 'stretch', background: '#0d1117', border: '1px solid #30363d', borderRadius: 6, display: 'flex', overflow: 'hidden' },
  command: { color: '#3fb950', flex: 1, fontFamily: 'monospace', fontSize: 11, overflowX: 'auto', padding: '10px 12px', whiteSpace: 'nowrap' },
  copyBtn: { background: '#21262d', border: 'none', borderLeft: '1px solid #30363d', color: '#e6edf3', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '0 14px', whiteSpace: 'nowrap' },
  warning: { background: '#2d2515', border: '1px solid #5a4620', borderRadius: 6, color: '#e3b341', fontSize: 12, padding: '8px 12px' },
  requirements: { background: '#0d1117', border: '1px solid #21262d', borderRadius: 6, padding: '12px 14px' },
  reqTitle: { color: '#8b949e', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', marginBottom: 6, textTransform: 'uppercase' },
  reqItem: { color: '#8b949e', fontSize: 12, marginBottom: 4 },
  doneBtn: { background: '#1f6feb', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: '10px 0', width: '100%' }
};
