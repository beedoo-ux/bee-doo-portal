'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const DS = {
  bg: '#0a0a0a', c1: '#141414', c2: '#1a1a1a',
  bd: 'rgba(255,255,255,0.06)', tx: 'rgba(255,255,255,0.92)',
  dm: 'rgba(255,255,255,0.55)', y: '#F5C500', yD: '#D4A800',
  yDim: 'rgba(245,197,0,0.10)', yBd: 'rgba(245,197,0,0.28)',
  green: '#22c55e', blue: '#5b6cff',
  font: "'DM Sans', system-ui, sans-serif",
};

function WelcomeInner() {
  const sp = useSearchParams();
  const email = sp.get('e') || '';
  const sessionId = sp.get('s') || '';
  const firstName = email ? (email.split('@')[0].split(/[._-]/)[0] || '').charAt(0).toUpperCase() + (email.split('@')[0].split(/[._-]/)[0] || '').slice(1) : '';

  // Termin: nächster Werktag 14:00 Uhr als Mock bis Portal Supabase-Lookup macht
  const [termin, setTermin] = useState<{ day: string; date: string; time: string; countdown: string } | null>(null);
  const [step, setStep] = useState<'greeting' | 'magic-sent'>('greeting');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + (d.getDay() === 5 ? 3 : d.getDay() === 6 ? 2 : 1));
    d.setHours(14, 0, 0, 0);
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

    const tick = () => {
      const now = new Date();
      const diff = d.getTime() - now.getTime();
      if (diff <= 0) { setTermin({ day: days[d.getDay()], date: `${d.getDate()}. ${months[d.getMonth()]}`, time: '14:00', countdown: 'Jetzt!' }); return; }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const dd = Math.floor(h / 24);
      const countdown = dd > 0 ? `in ${dd} Tag${dd > 1 ? 'en' : ''}, ${h % 24}h` : `in ${h}h ${m}m`;
      setTermin({ day: days[d.getDay()], date: `${d.getDate()}. ${months[d.getMonth()]}`, time: '14:00', countdown });
    };
    tick();
    const iv = setInterval(tick, 60_000);
    return () => clearInterval(iv);
  }, []);

  const sendMagicLink = async () => {
    if (!email) { alert('Bitte kehren Sie zum Solarrechner zurück und tragen Ihre E-Mail ein.'); return; }
    setLoading(true);
    // Supabase-Client hier würde Magic-Link triggern. Stub:
    try {
      await fetch('https://tools.bee-doo.de/api/wizard-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'portal-welcome-magic-request', session_id: sessionId, email }),
      }).catch(() => {});
      await new Promise((r) => setTimeout(r, 800));
      setStep('magic-sent');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: `radial-gradient(ellipse at top, rgba(245,197,0,0.08), transparent 60%), ${DS.bg}`, color: DS.tx, fontFamily: DS.font, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 14, borderBottom: `1px solid ${DS.bd}` }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: DS.y, letterSpacing: '-0.02em' }}>bee<span style={{ color: DS.tx }}>-doo</span>.</div>
        <span style={{ color: DS.dm, fontSize: 13 }}>Kundenportal</span>
      </header>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
        <div style={{ width: '100%', maxWidth: 560 }}>
          {step === 'greeting' ? (
            <>
              {/* Confetti-artiges Hero */}
              <div style={{ textAlign: 'center', marginBottom: 32 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 92, height: 92, borderRadius: '50%', background: `linear-gradient(135deg, ${DS.y}, ${DS.yD})`, marginBottom: 20, boxShadow: `0 16px 40px rgba(245,197,0,0.35)`, animation: 'pulse 2.2s ease-in-out infinite' }}>
                  <span style={{ fontSize: 44 }}>☀️</span>
                </div>
                <h1 style={{ fontSize: 32, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.03em' }}>
                  {firstName ? `Willkommen, ${firstName}!` : 'Willkommen!'}
                </h1>
                <p style={{ color: DS.dm, fontSize: 16, lineHeight: 1.5, margin: 0 }}>
                  Ihre Anfrage ist angekommen. Ihr persönliches bee-doo Kundenportal wird vorbereitet.
                </p>
              </div>

              {/* Termin-Card */}
              {termin && (
                <div style={{ background: `linear-gradient(135deg, ${DS.blue}, #4453d9)`, borderRadius: 18, padding: 24, marginBottom: 20, color: '#fff', boxShadow: `0 12px 32px rgba(91,108,255,0.25)` }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.85, marginBottom: 8 }}>Ihr Expertengespräch</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 700 }}>{termin.day}, {termin.date}</div>
                      <div style={{ fontSize: 15, opacity: 0.9, marginTop: 4 }}>{termin.time} Uhr · Videoanruf</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 }}>Startet</div>
                      <div style={{ fontSize: 18, fontWeight: 700, marginTop: 2 }}>{termin.countdown}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status-Preview */}
              <div style={{ background: DS.c1, border: `1px solid ${DS.bd}`, borderRadius: 14, padding: '20px 24px', marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: DS.dm, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 14 }}>Ihr Fahrplan</div>
                {[
                  { ok: true, l: 'Anfrage eingereicht', s: 'Heute' },
                  { ok: true, l: 'Beratungstermin gebucht', s: termin?.date || '—' },
                  { ok: false, l: 'Dachplanung & Angebot', s: 'Im Gespräch' },
                  { ok: false, l: 'Vertragsabschluss', s: 'Nach Angebotsfreigabe' },
                  { ok: false, l: 'Installation & Inbetriebnahme', s: 'Ca. 4–6 Wochen' },
                ].map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < 4 ? `1px solid ${DS.bd}` : 'none' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: r.ok ? DS.green : DS.c2, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      {r.ok ? '✓' : i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, color: r.ok ? DS.tx : DS.dm, fontWeight: r.ok ? 600 : 500 }}>{r.l}</div>
                      <div style={{ fontSize: 12, color: DS.dm, marginTop: 2 }}>{r.s}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button onClick={sendMagicLink} disabled={loading || !email} style={{ width: '100%', padding: '16px 28px', borderRadius: 100, background: email ? `linear-gradient(135deg, ${DS.y}, ${DS.yD})` : DS.c2, color: email ? DS.bg : DS.dm, border: 'none', fontSize: 15, fontWeight: 700, cursor: email && !loading ? 'pointer' : 'not-allowed', fontFamily: DS.font, transition: 'all 0.15s', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Link wird gesendet…' : email ? `✉️ Login-Link an ${email} senden` : '⚠️ E-Mail fehlt – bitte Formular erneut absenden'}
              </button>

              {/* Fallback */}
              <a href="/demo" style={{ display: 'block', textAlign: 'center', marginTop: 14, color: DS.dm, fontSize: 13, textDecoration: 'none' }}>
                oder direkt zum Demo-Portal →
              </a>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 92, height: 92, borderRadius: '50%', background: DS.green, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, color: '#fff', marginBottom: 20, boxShadow: `0 16px 40px rgba(34,197,94,0.35)` }}>✓</div>
              <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px', letterSpacing: '-0.02em' }}>Link ist unterwegs!</h1>
              <p style={{ color: DS.dm, fontSize: 15, lineHeight: 1.5, marginBottom: 24 }}>
                Wir haben Ihnen einen Login-Link an<br /><strong style={{ color: DS.tx }}>{email}</strong><br />gesendet. Bitte prüfen Sie Ihr Postfach (ggf. auch Spam).
              </p>
              <div style={{ background: DS.c1, border: `1px solid ${DS.bd}`, borderRadius: 12, padding: '16px 20px', fontSize: 13, color: DS.dm, marginBottom: 24 }}>
                <div style={{ color: DS.tx, fontWeight: 600, marginBottom: 6 }}>💡 Übrigens</div>
                Ihr Berater <strong style={{ color: DS.tx }}>Nils Horn</strong> bereitet bereits Ihre Dachplanung vor. Bis zum Termin können Sie im Portal Ihre Daten ergänzen und unsere Produkte kennenlernen.
              </div>
              <a href="/demo" style={{ display: 'inline-block', padding: '14px 32px', borderRadius: 100, background: DS.c2, color: DS.tx, textDecoration: 'none', fontWeight: 600, fontSize: 14, border: `1px solid ${DS.bd}` }}>
                Demo-Portal ansehen →
              </a>
            </div>
          )}
        </div>
      </main>

      <footer style={{ padding: '20px 32px', borderTop: `1px solid ${DS.bd}`, color: DS.dm, fontSize: 12, textAlign: 'center' }}>
        bee-doo GmbH · Am Stadtholz 39, 33609 Bielefeld · <a href="tel:+4908002233664" style={{ color: DS.y, textDecoration: 'none' }}>0800 22 33 664</a> (kostenlose Hotline)
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 16px 40px rgba(245,197,0,0.35); }
          50% { transform: scale(1.04); box-shadow: 0 20px 50px rgba(245,197,0,0.5); }
        }
      `}</style>
    </div>
  );
}

export default function WelcomePage() {
  return <Suspense fallback={<div style={{ background: DS.bg, color: DS.tx, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Lädt…</div>}><WelcomeInner /></Suspense>;
}
