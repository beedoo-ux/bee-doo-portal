'use client';
// =============================================================
// app/login/page.tsx – Magic Link Login
// =============================================================
import { useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    setLoading(false);
    if (error) { setError(error.message); return; }
    setSent(true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#08080E',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'DM Sans', sans-serif",
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(245,166,35,0.08) 0%, transparent 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: 400, padding: '0 24px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            width: 56, height: 56, background: 'linear-gradient(135deg, #F5A623, #E8941A)',
            borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto 16px', boxShadow: '0 0 30px rgba(245,166,35,0.3)',
          }}>☀️</div>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#E8E8F2' }}>
            bee<span style={{ color: '#F5A623' }}>-doo</span> Portal
          </div>
          <div style={{ color: '#6B6B80', fontSize: 14, marginTop: 6 }}>Ihr persönlicher Zugang</div>
        </div>

        {!sent ? (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 13, color: '#9292A0', marginBottom: 8 }}>
                E-Mail-Adresse
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="max@mustermann.de"
                style={{
                  width: '100%', padding: '14px 16px',
                  background: '#18181F', border: '1px solid #242430',
                  borderRadius: 12, color: '#E8E8F2', fontSize: 15,
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = '#F5A623')}
                onBlur={e  => (e.target.style.borderColor = '#242430')}
              />
            </div>

            {error && (
              <div style={{ color: '#FF6B6B', fontSize: 13, marginBottom: 12, padding: '10px 14px', background: 'rgba(255,107,107,0.08)', borderRadius: 8 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              style={{
                width: '100%', padding: '14px',
                background: loading ? '#6B6B80' : 'linear-gradient(135deg, #F5A623, #E8941A)',
                border: 'none', borderRadius: 12,
                color: '#08080E', fontSize: 15, fontWeight: 700,
                fontFamily: "'DM Sans', sans-serif", cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s', marginTop: 8,
              }}
            >
              {loading ? 'Wird gesendet…' : 'Magic Link anfordern ✨'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 12, color: '#6B6B80', marginTop: 20, lineHeight: 1.6 }}>
              Kein Passwort nötig. Wir senden Ihnen einen sicheren Login-Link per E-Mail.
            </p>
          </form>
        ) : (
          <div style={{
            background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.2)',
            borderRadius: 16, padding: 32, textAlign: 'center',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
            <div style={{ fontSize: 20, fontFamily: "'DM Serif Display', serif", color: '#E8E8F2', marginBottom: 8 }}>
              Link verschickt!
            </div>
            <div style={{ color: '#9292A0', fontSize: 14, lineHeight: 1.7 }}>
              Bitte prüfen Sie Ihre E-Mail <strong style={{ color: '#E8E8F2' }}>{email}</strong> und klicken Sie auf den Login-Link.
            </div>
            <button
              onClick={() => setSent(false)}
              style={{ marginTop: 20, background: 'transparent', border: '1px solid #242430', color: '#9292A0', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}
            >
              Andere E-Mail verwenden
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
