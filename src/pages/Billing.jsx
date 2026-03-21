import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || '';

const PLAN_FEATURES = {
  free: [
    { label: '1 server agent', ok: true },
    { label: '24-hour metric history', ok: true },
    { label: 'Live metrics & logs', ok: true },
    { label: 'Docker monitoring', ok: true },
    { label: 'AI anomaly analysis', ok: false },
    { label: 'Unlimited agents', ok: false },
    { label: '30-day history', ok: false },
  ],
  pro: [
    { label: 'Unlimited agents', ok: true },
    { label: '30-day metric history', ok: true },
    { label: 'Live metrics & logs', ok: true },
    { label: 'Docker monitoring', ok: true },
    { label: 'AI anomaly analysis', ok: true },
    { label: 'Priority support', ok: true },
  ]
};

export default function Billing() {
  const navigate = useNavigate();
  const { user, getToken, refreshUser } = useAuth();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState('');
  const [status, setStatus] = useState(null);

  const success = params.get('success');
  const canceled = params.get('canceled');

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchStatus();
    if (success) refreshUser();
  }, [user]);

  async function fetchStatus() {
    try {
      const res = await fetch(`${API_URL}/api/billing/status`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (res.ok) setStatus(await res.json());
    } catch { /* ignore */ }
  }

  async function handleUpgrade() {
    setLoading('upgrade');
    try {
      const res = await fetch(`${API_URL}/api/billing/checkout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.message || 'Failed to create checkout session');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading('');
    }
  }

  async function handlePortal() {
    setLoading('portal');
    try {
      const res = await fetch(`${API_URL}/api/billing/portal`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.message || 'Failed to open billing portal');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading('');
    }
  }

  const plan = user?.plan || 'free';
  const features = PLAN_FEATURES[plan] || PLAN_FEATURES.free;

  return (
    <div style={s.page} className="bill-page">
      <div style={s.header}>
        <button onClick={() => navigate('/dashboard')} style={s.backBtn}>← Dashboard</button>
        <h1 style={s.title}>Billing & Plan</h1>
      </div>

      {success && <div style={s.successBanner}>✓ Upgrade successful! Your Pro plan is now active.</div>}
      {canceled && <div style={s.warnBanner}>Checkout was canceled. Your plan was not changed.</div>}

      <div style={s.content}>
        {/* Current plan */}
        <div style={s.card}>
          <div style={s.cardTitle}>Current Plan</div>
          <div style={s.planBadge(plan)}>
            {plan.toUpperCase()}
          </div>
          <div style={s.planDesc}>
            {plan === 'free'
              ? '1 agent · 24-hour history · No AI analysis'
              : 'Unlimited agents · 30-day history · AI analysis enabled'}
          </div>

          <div style={s.featureList}>
            {features.map(f => (
              <div key={f.label} style={{ ...s.featureRow, opacity: f.ok ? 1 : 0.4 }}>
                <span style={{ color: f.ok ? '#3fb950' : '#f85149', marginRight: 10, fontWeight: 700 }}>
                  {f.ok ? '✓' : '✗'}
                </span>
                {f.label}
              </div>
            ))}
          </div>

          <div style={s.actions}>
            {plan === 'free' && (
              <button onClick={handleUpgrade} disabled={loading === 'upgrade'} style={s.upgradeBtn}>
                {loading === 'upgrade' ? 'Redirecting...' : 'Upgrade to Pro — $9/month'}
              </button>
            )}
            {plan === 'pro' && status?.hasSubscription && (
              <button onClick={handlePortal} disabled={loading === 'portal'} style={s.manageBtn}>
                {loading === 'portal' ? 'Redirecting...' : 'Manage Subscription'}
              </button>
            )}
          </div>
        </div>

        {/* Usage */}
        <div style={s.card}>
          <div style={s.cardTitle}>Account</div>
          <div style={s.usageRow}>
            <span style={s.usageLabel}>Email</span>
            <span style={s.usageValue}>{user?.email}</span>
          </div>
          <div style={s.usageRow}>
            <span style={s.usageLabel}>Plan</span>
            <span style={{ ...s.usageValue, color: plan === 'pro' ? '#58a6ff' : '#3fb950' }}>{plan.toUpperCase()}</span>
          </div>
          <div style={s.usageRow}>
            <span style={s.usageLabel}>History limit</span>
            <span style={s.usageValue}>{plan === 'pro' ? '30 days' : '24 hours'}</span>
          </div>
          <div style={s.usageRow}>
            <span style={s.usageLabel}>AI analysis</span>
            <span style={{ ...s.usageValue, color: plan === 'pro' ? '#3fb950' : '#f85149' }}>
              {plan === 'pro' ? 'Enabled' : 'Requires Pro'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { background: '#0d1117', color: '#e6edf3', minHeight: '100vh', padding: '32px 40px' },
  header: { alignItems: 'center', display: 'flex', gap: 20, marginBottom: 24 },
  backBtn: { background: 'none', border: 'none', color: '#58a6ff', cursor: 'pointer', fontSize: 14 },
  title: { fontSize: 22, fontWeight: 700, margin: 0 },
  successBanner: { background: '#0f3320', border: '1px solid #1a4d2e', borderRadius: 8, color: '#3fb950', fontSize: 14, marginBottom: 20, padding: '12px 16px' },
  warnBanner: { background: '#2d2515', border: '1px solid #5a4620', borderRadius: 8, color: '#e3b341', fontSize: 14, marginBottom: 20, padding: '12px 16px' },
  content: { display: 'grid', gap: 20, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', maxWidth: 900 },
  card: { background: '#161b22', border: '1px solid #21262d', borderRadius: 10, padding: '24px 28px' },
  cardTitle: { color: '#8b949e', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 16, textTransform: 'uppercase' },
  planBadge: (plan) => ({
    display: 'inline-block',
    background: plan === 'pro' ? '#0d2035' : '#0f3320',
    border: `1px solid ${plan === 'pro' ? '#1f4060' : '#1a4d2e'}`,
    borderRadius: 6,
    color: plan === 'pro' ? '#58a6ff' : '#3fb950',
    fontSize: 13,
    fontWeight: 700,
    marginBottom: 8,
    padding: '4px 12px'
  }),
  planDesc: { color: '#8b949e', fontSize: 13, marginBottom: 20 },
  featureList: { marginBottom: 20 },
  featureRow: { color: '#c9d1d9', display: 'flex', alignItems: 'center', fontSize: 14, marginBottom: 8 },
  actions: { display: 'flex', flexDirection: 'column', gap: 10 },
  upgradeBtn: { background: 'linear-gradient(135deg, #1f6feb, #1158c7)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600, padding: '12px 0', width: '100%' },
  manageBtn: { background: 'none', border: '1px solid #30363d', borderRadius: 8, color: '#c9d1d9', cursor: 'pointer', fontSize: 14, padding: '12px 0', width: '100%' },
  usageRow: { borderBottom: '1px solid #21262d', display: 'flex', justifyContent: 'space-between', padding: '10px 0' },
  usageLabel: { color: '#8b949e', fontSize: 13 },
  usageValue: { color: '#e6edf3', fontSize: 13, fontWeight: 600 }
};
