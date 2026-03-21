import React from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

const FEATURES = [
  { icon: '📡', title: 'Real-Time Metrics', desc: 'CPU, memory, disk, and network — updated every 5 seconds via Server-Sent Events.' },
  { icon: '🤖', title: 'AI Anomaly Detection', desc: 'Claude analyzes your system and returns severity, findings, and recommended actions.' },
  { icon: '🖥️', title: 'Multi-Server Monitoring', desc: 'Deploy lightweight agents on any Linux server. Monitor everything from one dashboard.' },
  { icon: '🐳', title: 'Docker Monitoring', desc: 'Track container CPU, memory usage and status — running or stopped.' },
  { icon: '📋', title: 'Live Log Streaming', desc: 'Real-time log feed with level filtering. Pause on hover, auto-scroll to latest.' },
  { icon: '🔔', title: 'Instant Alerts', desc: 'Get notified when metrics cross thresholds. Never miss a critical event.' },
];

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    color: '#3fb950',
    features: ['1 server agent', '24-hour metric history', 'Live metrics & logs', 'Docker monitoring', 'No AI analysis'],
    cta: 'Get Started Free',
    highlight: false
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    color: '#58a6ff',
    features: ['Unlimited agents', '30-day metric history', 'Live metrics & logs', 'Docker monitoring', 'AI anomaly analysis', 'Priority support'],
    cta: 'Start Pro',
    highlight: true
  }
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={s.page}>
      {/* NAV */}
      <nav style={s.nav} className="land-nav">
        <div style={s.navBrand}>
          <span style={{ color: '#58a6ff', fontSize: 22 }}>⬡</span>
          <span style={s.navTitle}>SysWatch AI</span>
        </div>
        <div style={s.navRight}>
          <button onClick={() => navigate('/login')} style={s.navBtn}>Sign in</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={s.hero} className="land-hero">
        <div style={s.heroContent}>
          <div style={s.heroBadge}>Powered by Claude claude-sonnet-4-20250514</div>
          <h1 style={s.heroTitle} className="land-hero-title">
            Monitor your servers<br />
            <span style={{ color: '#58a6ff' }}>in real time with AI</span>
          </h1>
          <p style={s.heroSub} className="land-hero-sub">
            Deploy a lightweight agent on any Linux server. Get live metrics, log streaming,
            Docker container stats, and AI-powered anomaly analysis — all in one dashboard.
          </p>
          <div style={s.heroCtas}>
            <button onClick={() => navigate('/login')} style={s.ctaPrimary}>Get Started Free →</button>
            <button onClick={() => navigate('/dashboard')} style={s.ctaSecondary}>View Demo</button>
          </div>
        </div>

        <div style={s.heroVisual} className="land-hero-visual">
          <div style={s.terminalWrap}>
            <div style={s.terminalBar}>
              <span style={{ background: '#f85149', width: 10, height: 10, borderRadius: '50%', display: 'inline-block' }} />
              <span style={{ background: '#e3b341', width: 10, height: 10, borderRadius: '50%', display: 'inline-block', margin: '0 6px' }} />
              <span style={{ background: '#3fb950', width: 10, height: 10, borderRadius: '50%', display: 'inline-block' }} />
              <span style={{ color: '#8b949e', fontSize: 12, marginLeft: 12 }}>syswatch-agent</span>
            </div>
            <div style={s.terminalBody}>
              <div style={s.termLine}><span style={{ color: '#3fb950' }}>$</span> curl -sSL syswatch.app/install.sh | bash</div>
              <div style={{ ...s.termLine, color: '#8b949e' }}>[SysWatch] Installing agent...</div>
              <div style={{ ...s.termLine, color: '#8b949e' }}>[SysWatch] Node.js v20.11.0 detected</div>
              <div style={{ ...s.termLine, color: '#3fb950' }}>[SysWatch] ✓ Agent started!</div>
              <div style={{ ...s.termLine, color: '#58a6ff' }}>[agent] Reporting to dashboard every 5s</div>
              <div style={s.termCursor}>▌</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={s.section} className="land-section">
        <h2 style={s.sectionTitle}>Everything you need</h2>
        <div style={s.featureGrid}>
          {FEATURES.map(f => (
            <div key={f.title} style={s.featureCard}>
              <div style={s.featureIcon}>{f.icon}</div>
              <div style={s.featureTitle}>{f.title}</div>
              <div style={s.featureDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section style={{ ...s.section, background: '#0d1117' }} className="land-section">
        <h2 style={s.sectionTitle}>Simple pricing</h2>
        <div style={s.pricingGrid}>
          {PLANS.map(plan => (
            <div key={plan.name} style={{ ...s.planCard, borderColor: plan.highlight ? plan.color : '#21262d' }}>
              {plan.highlight && <div style={{ ...s.planBadge, background: plan.color }}>MOST POPULAR</div>}
              <div style={s.planName}>{plan.name}</div>
              <div style={s.planPrice}>
                <span style={{ ...s.planAmount, color: plan.color }}>{plan.price}</span>
                <span style={s.planPeriod}>/{plan.period}</span>
              </div>
              <ul style={s.planFeatures}>
                {plan.features.map(f => (
                  <li key={f} style={{ ...s.planFeature, opacity: f.startsWith('No ') ? 0.4 : 1 }}>
                    <span style={{ color: f.startsWith('No ') ? '#6e7681' : plan.color, marginRight: 8 }}>
                      {f.startsWith('No ') ? '✗' : '✓'}
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/login')}
                style={{ ...s.planBtn, background: plan.highlight ? plan.color : 'transparent', borderColor: plan.color, color: plan.highlight ? '#0d1117' : plan.color }}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={s.footer} className="land-footer">
        <span style={{ color: '#58a6ff' }}>⬡ SysWatch AI</span>
        <span style={{ color: '#6e7681', marginLeft: 16 }}>Built with Fastify, React, and Claude</span>
      </footer>
    </div>
  );
}

const s = {
  page: { background: '#0d1117', color: '#e6edf3', minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" },
  nav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 48px', borderBottom: '1px solid #21262d', position: 'sticky', top: 0, background: '#0d1117', zIndex: 100 },
  navBrand: { display: 'flex', alignItems: 'center', gap: 8 },
  navTitle: { fontSize: 18, fontWeight: 700 },
  navRight: { display: 'flex', gap: 12 },
  navBtn: { background: 'none', border: '1px solid #30363d', borderRadius: 6, color: '#e6edf3', cursor: 'pointer', fontSize: 14, padding: '6px 16px' },
  hero: { display: 'flex', alignItems: 'center', gap: 64, padding: '80px 48px', maxWidth: 1200, margin: '0 auto' },
  heroContent: { flex: 1 },
  heroBadge: { display: 'inline-block', background: '#0d2035', border: '1px solid #1f4060', borderRadius: 20, color: '#58a6ff', fontSize: 12, fontWeight: 600, marginBottom: 20, padding: '4px 12px' },
  heroTitle: { fontSize: 52, fontWeight: 800, lineHeight: 1.15, margin: '0 0 20px', letterSpacing: '-0.02em' },
  heroSub: { color: '#8b949e', fontSize: 18, lineHeight: 1.6, maxWidth: 500, marginBottom: 32 },
  heroCtas: { display: 'flex', gap: 12 },
  ctaPrimary: { background: '#1f6feb', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 600, padding: '12px 28px' },
  ctaSecondary: { background: 'none', border: '1px solid #30363d', borderRadius: 8, color: '#c9d1d9', cursor: 'pointer', fontSize: 15, padding: '12px 24px' },
  heroVisual: { flex: 1, display: 'flex', justifyContent: 'center' },
  terminalWrap: { background: '#161b22', border: '1px solid #30363d', borderRadius: 10, overflow: 'hidden', width: '100%', maxWidth: 480 },
  terminalBar: { background: '#21262d', padding: '10px 16px', display: 'flex', alignItems: 'center' },
  terminalBody: { padding: '20px 24px', fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8 },
  termLine: { color: '#c9d1d9' },
  termCursor: { color: '#58a6ff', animation: 'blink 1s infinite' },
  section: { padding: '80px 48px', background: '#161b22' },
  sectionTitle: { textAlign: 'center', fontSize: 32, fontWeight: 700, marginBottom: 48 },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 1100, margin: '0 auto' },
  featureCard: { background: '#0d1117', border: '1px solid #21262d', borderRadius: 10, padding: '24px 28px' },
  featureIcon: { fontSize: 28, marginBottom: 12 },
  featureTitle: { fontSize: 16, fontWeight: 600, marginBottom: 8 },
  featureDesc: { color: '#8b949e', fontSize: 14, lineHeight: 1.6 },
  pricingGrid: { display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 800, margin: '0 auto' },
  planCard: { background: '#161b22', border: '1px solid', borderRadius: 12, flex: '0 0 320px', padding: '32px 28px', position: 'relative' },
  planBadge: { position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', borderRadius: 10, color: '#0d1117', fontSize: 10, fontWeight: 800, padding: '3px 12px', letterSpacing: '0.08em' },
  planName: { fontSize: 20, fontWeight: 700, marginBottom: 8 },
  planPrice: { marginBottom: 24 },
  planAmount: { fontSize: 40, fontWeight: 800 },
  planPeriod: { color: '#8b949e', fontSize: 14 },
  planFeatures: { listStyle: 'none', marginBottom: 28, padding: 0 },
  planFeature: { fontSize: 14, color: '#c9d1d9', marginBottom: 10, display: 'flex', alignItems: 'center' },
  planBtn: { borderRadius: 8, borderWidth: 1, borderStyle: 'solid', cursor: 'pointer', fontSize: 15, fontWeight: 600, padding: '12px 0', width: '100%' },
  footer: { borderTop: '1px solid #21262d', color: '#8b949e', fontSize: 13, padding: '24px 48px', textAlign: 'center' }
};
