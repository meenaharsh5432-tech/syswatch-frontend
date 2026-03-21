import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const error = params.get('error');

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const errorDetail = params.get('message');
  const errorMessages = {
    auth_failed: `Authentication failed: ${errorDetail || 'Please try again.'}`,
    oauth_not_configured: 'Google OAuth is not configured on this server.',
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.logo}>
          <span style={{ color: '#58a6ff', fontSize: 32 }}>⬡</span>
        </div>
        <h1 style={s.title}>SysWatch AI</h1>
        <p style={s.subtitle}>Sign in to monitor your servers</p>

        {error && (
          <div style={s.errorBox}>{errorMessages[error] || 'An error occurred. Please try again.'}</div>
        )}

        <button onClick={handleGoogleLogin} style={s.googleBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: 10 }}>
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p style={s.terms}>
          By signing in, you agree to our Terms of Service.
          <br />
          Free plan: 1 agent, 24h history.
        </p>
      </div>

      <button onClick={() => navigate('/')} style={s.backBtn}>← Back to home</button>
    </div>
  );
}

const s = {
  page: { alignItems: 'center', background: '#0d1117', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '100vh', padding: 24 },
  card: { background: '#161b22', border: '1px solid #21262d', borderRadius: 12, maxWidth: 380, padding: '40px 36px', textAlign: 'center', width: '100%' },
  logo: { marginBottom: 8 },
  title: { fontSize: 22, fontWeight: 700, margin: '0 0 6px' },
  subtitle: { color: '#8b949e', fontSize: 14, margin: '0 0 28px' },
  errorBox: { background: '#3d1212', border: '1px solid #6e2020', borderRadius: 6, color: '#f85149', fontSize: 13, marginBottom: 20, padding: '10px 14px', textAlign: 'left' },
  googleBtn: { alignItems: 'center', background: '#fff', border: 'none', borderRadius: 8, color: '#24292f', cursor: 'pointer', display: 'flex', fontSize: 15, fontWeight: 600, justifyContent: 'center', padding: '12px 0', width: '100%' },
  terms: { color: '#6e7681', fontSize: 12, lineHeight: 1.6, marginTop: 20 },
  backBtn: { background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 13, marginTop: 24 }
};
