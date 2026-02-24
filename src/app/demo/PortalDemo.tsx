'use client';
// =============================================================
// PortalDemo.tsx – bee-doo Kundenportal Demo
// Testkunde: Thomas Berger | Paderborn | 9,8 kWp Anlage
// Design: DM Sans | #0c1222 | #FDE154
// =============================================================
import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

// ─── Design System ────────────────────────────────────────────
const DS = {
  bg:      '#0c1222',
  c1:      '#151d30',
  c2:      '#1c2640',
  bd:      '#263354',
  tx:      '#e1e7ef',
  dm:      '#5c6b8a',
  y:       '#FDE154',
  yDim:    'rgba(253,225,84,0.10)',
  yBd:     'rgba(253,225,84,0.22)',
  green:   '#22c55e',
  greenDim:'rgba(34,197,94,0.10)',
  blue:    '#3b82f6',
  blueDim: 'rgba(59,130,246,0.10)',
  font:    "'DM Sans', system-ui, sans-serif",
};

// ─── Demo Daten ───────────────────────────────────────────────
const CUSTOMER = {
  name: 'Thomas Berger',
  email: 'thomas.berger@example.de',
  phone: '+49 5251 123456',
  address: 'Detmolder Str. 112, 33100 Paderborn',
  referral_code: 'BERGER2024',
  referral_link: 'https://portal.bee-doo.de/ref/BERGER2024',
};

const PROJECT = {
  id: 'PRJ-2024-0847',
  status: 'installation',
  kwp: 9.8,
  module_count: 24,
  battery_kwh: 10.0,
  installer: 'Energietechnik Müller GmbH',
  consultant: 'Kevin Schreiber',
  contract_date: '2024-11-03',
  planned_installation: '2025-02-28',
  address: 'Detmolder Str. 112, 33100 Paderborn',
};

const MILESTONES = [
  { id: 1, label: 'Beratung & Angebot',    done: true,  date: '03.11.2024', icon: '🤝' },
  { id: 2, label: 'Vertrag unterzeichnet', done: true,  date: '08.11.2024', icon: '📋' },
  { id: 3, label: 'Netzanmeldung',         done: true,  date: '19.11.2024', icon: '🔌' },
  { id: 4, label: 'Genehmigung erhalten',  done: true,  date: '14.01.2025', icon: '✅' },
  { id: 5, label: 'Installation',          done: false, date: '28.02.2025', icon: '🔧', active: true },
  { id: 6, label: 'Inbetriebnahme',        done: false, date: 'Ca. März 2025', icon: '⚡' },
  { id: 7, label: 'Abnahme & Übergabe',    done: false, date: 'Ca. März 2025', icon: '🎉' },
];

const DOCUMENTS = [
  { id: 1, name: 'Kaufvertrag Photovoltaikanlage',   date: '08.11.2024', category: 'Vertrag',    size: '1,2 MB', ready: true  },
  { id: 2, name: 'Angebot & Leistungsbeschreibung',  date: '03.11.2024', category: 'Angebot',    size: '0,8 MB', ready: true  },
  { id: 3, name: 'Netzanschlussantrag EAK',          date: '19.11.2024', category: 'Behörde',    size: '0,6 MB', ready: true  },
  { id: 4, name: 'Genehmigung Netzanschluss',        date: '14.01.2025', category: 'Behörde',    size: '0,4 MB', ready: true  },
  { id: 5, name: 'Installationsprotokoll',           date: '—',          category: 'Technik',    size: '—',      ready: false },
  { id: 6, name: 'Übergabeprotokoll & Garantien',    date: '—',          category: 'Übergabe',   size: '—',      ready: false },
  { id: 7, name: 'Einspeisevertrag Stadtwerke',      date: '—',          category: 'Vertrag',    size: '—',      ready: false },
];

const MONITORING = [
  { month: 'Aug 24', kwh: 0,   savings: 0 },
  { month: 'Sep 24', kwh: 0,   savings: 0 },
  { month: 'Okt 24', kwh: 0,   savings: 0 },
  { month: 'Nov 24', kwh: 0,   savings: 0 },
  { month: 'Dez 24', kwh: 0,   savings: 0 },
  { month: 'Jan 25', kwh: 0,   savings: 0 },
  { month: 'Feb 25', kwh: 142, savings: 42 },  // Testdaten nach Installation
  { month: 'Mär 25', kwh: 620, savings: 186 },
];

const FORECAST = [
  { month: 'Apr', kwh: 890  },
  { month: 'Mai', kwh: 1050 },
  { month: 'Jun', kwh: 1120 },
  { month: 'Jul', kwh: 1080 },
  { month: 'Aug', kwh: 1040 },
  { month: 'Sep', kwh: 820  },
  { month: 'Okt', kwh: 540  },
  { month: 'Nov', kwh: 280  },
  { month: 'Dez', kwh: 160  },
];

const REFERRALS = [
  { name: 'Klaus Hoffmann',  status: 'abgeschlossen', bonus: '700 €', date: '12.01.2025' },
  { name: 'Sabine Kröger',   status: 'in Beratung',   bonus: '—',     date: '03.02.2025' },
];

const TABS = [
  { id: 'status',    icon: '📋', label: 'Projektstatus' },
  { id: 'dokumente', icon: '📄', label: 'Dokumente'      },
  { id: 'monitoring',icon: '⚡', label: 'Monitoring'     },
  { id: 'referral',  icon: '🎁', label: 'Empfehlen'      },
  { id: 'support',   icon: '💬', label: 'Support'        },
] as const;
type TabId = typeof TABS[number]['id'];

// ─── Helper ───────────────────────────────────────────────────
const statusMap: Record<string, { label: string; color: string; bg: string }> = {
  neu:          { label: 'Neu',             color: DS.dm,    bg: `rgba(92,107,138,0.15)` },
  genehmigung:  { label: 'Genehmigung',     color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  installation: { label: 'Installation',    color: DS.blue,  bg: DS.blueDim },
  inbetrieb:    { label: 'Inbetrieb',       color: DS.green, bg: DS.greenDim },
  abgeschlossen:{ label: 'Abgeschlossen',   color: DS.y,     bg: DS.yDim },
};

// ─── Sub-Components ───────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: DS.c1, border: `1px solid ${DS.bd}`, borderRadius: 12, padding: '20px 24px', ...style }}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: DS.dm, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
      {children}
    </h2>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────
function StatusTab() {
  const st = statusMap[PROJECT.status];
  const done = MILESTONES.filter(m => m.done).length;
  const pct = Math.round((done / MILESTONES.length) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Anlagengröße', value: `${PROJECT.kwp} kWp`, sub: `${PROJECT.module_count} Module` },
          { label: 'Batteriespeicher', value: `${PROJECT.battery_kwh} kWh`, sub: 'LFP-Technologie' },
          { label: 'Fortschritt', value: `${pct} %`, sub: `${done} / ${MILESTONES.length} Schritte` },
        ].map(c => (
          <Card key={c.label}>
            <div style={{ color: DS.dm, fontSize: 12, marginBottom: 6 }}>{c.label}</div>
            <div style={{ color: DS.y, fontSize: 26, fontWeight: 700 }}>{c.value}</div>
            <div style={{ color: DS.dm, fontSize: 12, marginTop: 4 }}>{c.sub}</div>
          </Card>
        ))}
      </div>

      {/* Progress Bar */}
      <Card>
        <SectionTitle>Projektstatus</SectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <span style={{ background: st.bg, color: st.color, padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
            {st.label}
          </span>
          <span style={{ color: DS.dm, fontSize: 13 }}>Geplante Installation: {PROJECT.planned_installation}</span>
        </div>
        <div style={{ background: DS.bd, borderRadius: 4, height: 6, marginBottom: 28 }}>
          <div style={{ background: DS.y, height: '100%', borderRadius: 4, width: `${pct}%`, transition: 'width 0.6s ease' }} />
        </div>

        {/* Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {MILESTONES.map((m, i) => (
            <div key={m.id} style={{ display: 'flex', gap: 16, position: 'relative' }}>
              {/* Line */}
              {i < MILESTONES.length - 1 && (
                <div style={{ position: 'absolute', left: 19, top: 40, width: 2, height: 'calc(100% - 8px)', background: m.done ? DS.y : DS.bd }} />
              )}
              {/* Icon */}
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: m.done ? DS.yDim : (m.active ? DS.blueDim : DS.c2),
                border: `2px solid ${m.done ? DS.y : (m.active ? DS.blue : DS.bd)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, zIndex: 1,
              }}>
                {m.done ? '✓' : m.icon}
              </div>
              <div style={{ padding: '8px 0 20px' }}>
                <div style={{ fontWeight: m.active ? 700 : 500, color: m.done ? DS.y : (m.active ? DS.blue : DS.tx), fontSize: 14 }}>
                  {m.label}
                  {m.active && <span style={{ marginLeft: 8, background: DS.blueDim, color: DS.blue, padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>Aktuell</span>}
                </div>
                <div style={{ color: DS.dm, fontSize: 12, marginTop: 2 }}>{m.date}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Project Details */}
      <Card>
        <SectionTitle>Projektdetails</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
          {[
            ['Auftragsnummer', PROJECT.id],
            ['Installateur', PROJECT.installer],
            ['Berater', PROJECT.consultant],
            ['Vertragsabschluss', PROJECT.contract_date],
            ['Installationsadresse', PROJECT.address],
            ['Leistung', `${PROJECT.kwp} kWp (${PROJECT.module_count} Module)`],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: '10px 0', borderBottom: `1px solid ${DS.bd}` }}>
              <div style={{ color: DS.dm, fontSize: 12, marginBottom: 3 }}>{k}</div>
              <div style={{ color: DS.tx, fontSize: 14 }}>{v}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function DokumenteTab() {
  const catColors: Record<string, string> = {
    Vertrag: '#818cf8', Angebot: DS.y, Behörde: DS.green, Technik: DS.blue, Übergabe: '#f472b6',
  };
  return (
    <Card>
      <SectionTitle>Ihre Dokumente</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {DOCUMENTS.map(d => (
          <div key={d.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px', borderRadius: 8,
            background: d.ready ? DS.c2 : 'transparent',
            border: `1px solid ${d.ready ? DS.bd : 'transparent'}`,
            opacity: d.ready ? 1 : 0.5,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 22 }}>{d.ready ? '📄' : '🕐'}</span>
              <div>
                <div style={{ color: DS.tx, fontSize: 14, fontWeight: 500 }}>{d.name}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <span style={{ background: `${catColors[d.category]}22`, color: catColors[d.category], padding: '1px 8px', borderRadius: 10, fontSize: 11 }}>{d.category}</span>
                  {d.date !== '—' && <span style={{ color: DS.dm, fontSize: 11 }}>{d.date}</span>}
                  {d.size !== '—' && <span style={{ color: DS.dm, fontSize: 11 }}>{d.size}</span>}
                </div>
              </div>
            </div>
            {d.ready ? (
              <button style={{ background: DS.yDim, color: DS.y, border: `1px solid ${DS.yBd}`, padding: '6px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                ↓ Download
              </button>
            ) : (
              <span style={{ color: DS.dm, fontSize: 12 }}>Noch nicht verfügbar</span>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}

function MonitoringTab() {
  const totalKwh = MONITORING.reduce((s, m) => s + m.kwh, 0);
  const totalSavings = MONITORING.reduce((s, m) => s + m.savings, 0);
  const co2 = Math.round(totalKwh * 0.474);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Erzeugte Energie',  value: `${totalKwh} kWh`,  sub: 'seit Installation',       color: DS.y    },
          { label: 'Ersparnisse',        value: `${totalSavings} €`, sub: 'Stromkosten gespart',    color: DS.green },
          { label: 'CO₂ gespart',        value: `${co2} kg`,         sub: `≈ ${Math.round(co2/21)} Bäume/Jahr`, color: DS.blue },
        ].map(c => (
          <Card key={c.label}>
            <div style={{ color: DS.dm, fontSize: 12, marginBottom: 6 }}>{c.label}</div>
            <div style={{ color: c.color, fontSize: 26, fontWeight: 700 }}>{c.value}</div>
            <div style={{ color: DS.dm, fontSize: 12, marginTop: 4 }}>{c.sub}</div>
          </Card>
        ))}
      </div>

      <Card>
        <SectionTitle>Erzeugung (kWh / Monat)</SectionTitle>
        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={MONITORING} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={DS.bd} />
              <XAxis dataKey="month" tick={{ fill: DS.dm, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: DS.dm, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: DS.c2, border: `1px solid ${DS.bd}`, borderRadius: 8, color: DS.tx }} />
              <Bar dataKey="kwh" name="kWh" fill={DS.y} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <SectionTitle>Jahresprognose (kWh)</SectionTitle>
        <div style={{ color: DS.dm, fontSize: 13, marginBottom: 12 }}>Basierend auf 9,8 kWp und Standort Paderborn — Gesamtprognose: <span style={{ color: DS.y }}>~9.200 kWh/Jahr</span></div>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={FORECAST} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={DS.y} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={DS.y} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={DS.bd} />
              <XAxis dataKey="month" tick={{ fill: DS.dm, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: DS.dm, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: DS.c2, border: `1px solid ${DS.bd}`, borderRadius: 8, color: DS.tx }} />
              <Area type="monotone" dataKey="kwh" name="kWh" stroke={DS.y} fill="url(#areaGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function ReferralTab() {
  const [copied, setCopied] = useState(false);
  const getPraemie = (n: number) => n <= 0 ? 0 : n === 1 ? 700 : n === 2 ? 800 : n === 3 ? 900 : 1000;
  const getTotalPraemie = (s: number) => { let t = 0; for (let i = 1; i <= s; i++) t += getPraemie(i); return t; };

  const sales = REFERRALS.filter(r => r.status === 'abgeschlossen').length;
  const pending = REFERRALS.filter(r => r.status !== 'abgeschlossen').length;
  const earned = getTotalPraemie(sales);
  const nextPraemie = getPraemie(sales + 1);

  const copyLink = () => {
    navigator.clipboard.writeText(CUSTOMER.referral_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const coins = [
    { betrag: 700, label: '1-UP', emoji: '🍄' },
    { betrag: 800, label: 'STAR', emoji: '⭐' },
    { betrag: 900, label: 'FIRE', emoji: '🔥' },
    { betrag: 1000, label: '∞ GOLD', emoji: '👑' },
  ];
  const positions = [5, 18, 41, 63, 86];
  const marioX = positions[Math.min(sales, 4)];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <style>{`
        @keyframes mJump {
          0%,100% { transform: translateY(0) scaleX(-1); }
          10% { transform: translateY(-3px) scaleX(-1); }
          35% { transform: translateY(-36px) scaleX(-1); }
          55% { transform: translateY(-30px) scaleX(-1); }
          85% { transform: translateY(-2px) scaleX(-1); }
        }
        @keyframes mBounce {
          0%,100% { transform: translateY(0) scaleX(-1); }
          50% { transform: translateY(-8px) scaleX(-1); }
        }
        @keyframes cSpin {
          0% { transform: rotateY(0deg) scale(1); }
          50% { transform: rotateY(180deg) scale(1.08); }
          100% { transform: rotateY(360deg) scale(1); }
        }
        @keyframes cGlow {
          0%,100% { box-shadow: 0 0 6px rgba(253,225,84,0.3); }
          50% { box-shadow: 0 0 22px rgba(253,225,84,0.7), 0 0 44px rgba(253,225,84,0.3); }
        }
        @keyframes spk {
          0%,100% { opacity: 0; transform: scale(0) translateY(0); }
          50% { opacity: 1; transform: scale(1) translateY(-12px); }
        }
        @keyframes gndMove {
          from { background-position: 0 0; }
          to { background-position: -48px 0; }
        }
        @keyframes cloudDrift {
          0% { transform: translateX(0); }
          100% { transform: translateX(-200px); }
        }
        @keyframes popUp {
          0% { opacity: 0; transform: translateY(0) scale(0.5); }
          30% { opacity: 1; transform: translateY(-22px) scale(1.15); }
          100% { opacity: 0; transform: translateY(-40px) scale(0.7); }
        }
        .m-jump { animation: mJump 1.1s cubic-bezier(0.36,0,0.66,1) infinite; }
        .m-idle { animation: mBounce 1.8s ease infinite; }
        .c-spin { animation: cSpin 2.2s linear infinite; }
        .c-glow { animation: cGlow 2s ease infinite; }
        .c-sparkle { animation: spk 1.6s ease infinite; }
        .score-pop { animation: popUp 2.2s ease-out forwards; }
      `}</style>

      {/* ── MARIO COIN COLLECTOR ── */}
      <Card style={{ padding: 0, overflow: 'hidden', border: `2px solid ${DS.yBd}` }}>
        <div style={{ borderRadius: 12, background: 'linear-gradient(180deg, #0b1428 0%, #101e35 50%, #0a1222 100%)' }}>
          {/* Score Header */}
          <div style={{ padding: '16px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 3 }}>🪙 × {sales} COINS</div>
              <div style={{ fontSize: 38, fontWeight: 900, color: DS.y, fontFamily: "'DM Sans', monospace", textShadow: `0 0 20px rgba(253,225,84,0.35), 0 2px 0 #b8860b`, marginTop: 2 }}>
                {earned.toLocaleString('de-DE')}€
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 3 }}>WORLD</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: sales >= 4 ? DS.green : '#fff', fontFamily: "'DM Sans', monospace", textShadow: `0 0 12px ${sales >= 4 ? 'rgba(34,197,94,0.4)' : 'rgba(253,225,84,0.3)'}` }}>
                {sales >= 4 ? '★-★' : `1-${Math.min(sales + 1, 4)}`}
              </div>
            </div>
          </div>

          {/* Game World */}
          <div style={{ position: 'relative', height: 160, margin: '0 8px', overflow: 'hidden' }}>
            {/* Clouds */}
            <div style={{ position: 'absolute', top: 4, left: '12%', fontSize: 18, opacity: 0.07, animation: 'cloudDrift 25s linear infinite' }}>☁️</div>
            <div style={{ position: 'absolute', top: 14, left: '55%', fontSize: 13, opacity: 0.05, animation: 'cloudDrift 35s linear infinite 5s' }}>☁️</div>
            <div style={{ position: 'absolute', top: 2, left: '80%', fontSize: 15, opacity: 0.06, animation: 'cloudDrift 30s linear infinite 12s' }}>☁️</div>

            {/* Ground */}
            <div style={{ position: 'absolute', bottom: 0, left: -4, right: -4, height: 22, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, #2d1a00 0px, #3a2200 12px, #2d1a00 24px)', animation: 'gndMove 2.5s linear infinite' }} />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, rgba(34,197,94,0.5), rgba(34,197,94,0.25), rgba(34,197,94,0.5))' }} />
            </div>

            {/* Track */}
            <div style={{ position: 'absolute', bottom: 22, left: 36, right: 36, height: 4, borderRadius: 2 }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }} />
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${(Math.min(sales, 4) / 4) * 100}%`, background: `linear-gradient(90deg, ${DS.y}, ${DS.green})`, borderRadius: 2, transition: 'width 1.5s cubic-bezier(0.22,1,0.36,1)', boxShadow: `0 0 8px rgba(253,225,84,0.5)` }} />
            </div>

            {/* Mario */}
            <div style={{ position: 'absolute', bottom: 26, left: `${marioX}%`, transition: 'left 1.2s cubic-bezier(0.22,1,0.36,1)', zIndex: 15, marginLeft: -16 }}>
              <div className={sales > 0 ? 'm-jump' : 'm-idle'} style={{ fontSize: 32, lineHeight: 1, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.6))' }}>
                🏃
              </div>
              {sales > 0 && (
                <div className="score-pop" style={{ position: 'absolute', top: -14, left: '50%', marginLeft: -20, width: 40, textAlign: 'center', fontSize: 14, fontWeight: 900, color: DS.y, textShadow: '0 1px 4px rgba(0,0,0,0.9)', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                  +{getPraemie(sales)}€
                </div>
              )}
            </div>

            {/* Coins */}
            <div style={{ position: 'absolute', bottom: 18, left: 10, right: 10, display: 'flex', justifyContent: 'space-around' }}>
              {coins.map((c, i) => {
                const collected = sales > i;
                const current = sales === i;
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 72, zIndex: 8, position: 'relative' }}>
                    {collected && (
                      <>
                        <div className="c-sparkle" style={{ position: 'absolute', top: -10, left: 8, fontSize: 11 }}>✨</div>
                        <div className="c-sparkle" style={{ position: 'absolute', top: -7, right: 10, fontSize: 9, animationDelay: '0.7s' }}>✨</div>
                      </>
                    )}
                    <div className={current ? 'c-spin c-glow' : ''} style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: collected
                        ? 'linear-gradient(145deg, #FFD700, #FF9F00, #FFD700)'
                        : current
                          ? `linear-gradient(145deg, rgba(253,225,84,0.45), rgba(253,225,84,0.18))`
                          : 'rgba(255,255,255,0.04)',
                      border: `3px solid ${collected ? '#FFD700' : current ? 'rgba(253,225,84,0.7)' : 'rgba(255,255,255,0.08)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: collected
                        ? '0 5px 22px rgba(255,215,0,0.5), inset 0 -4px 8px rgba(180,120,0,0.3), inset 0 4px 8px rgba(255,250,205,0.3)'
                        : 'none',
                      position: 'relative', transition: 'all 0.6s',
                    }}>
                      {collected
                        ? <span style={{ fontSize: 26 }}>{c.emoji}</span>
                        : current
                          ? <span style={{ fontSize: 26 }}>❓</span>
                          : <span style={{ fontSize: 24, opacity: 0.15, filter: 'grayscale(1)' }}>🪙</span>
                      }
                      {collected && (
                        <div style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: DS.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#fff', border: '2px solid #0b1428', boxShadow: `0 2px 8px rgba(34,197,94,0.7)` }}>✓</div>
                      )}
                    </div>
                    <div style={{ marginTop: 6, textAlign: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 900, color: collected ? DS.green : current ? DS.y : 'rgba(255,255,255,0.2)', textShadow: collected ? `0 0 6px rgba(34,197,94,0.3)` : 'none' }}>
                        {c.betrag.toLocaleString('de-DE')}€
                      </div>
                      <div style={{ fontSize: 7, fontWeight: 800, color: collected ? 'rgba(34,197,94,0.6)' : current ? 'rgba(253,225,84,0.5)' : 'rgba(255,255,255,0.15)', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                        {c.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom: Next + Pipeline */}
          <div style={{ padding: '10px 16px 14px', display: 'flex', gap: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'rgba(253,225,84,0.06)', border: '1px solid rgba(253,225,84,0.12)' }}>
              <div style={{ fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 3 }}>
                {sales >= 4 ? '🔥 MAX LEVEL' : '❓ NÄCHSTE MÜNZE'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 18 }}>{sales >= 4 ? '👑' : '🪙'}</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: DS.y }}>{nextPraemie.toLocaleString('de-DE')}€</span>
              </div>
              {sales >= 4
                ? <div style={{ fontSize: 11, color: DS.green, marginTop: 1, fontWeight: 700 }}>Jeder Sale = 1.000€! 🔥</div>
                : <div style={{ fontSize: 11, color: DS.dm, marginTop: 1 }}>Empfehlung #{sales + 1} bringt&apos;s!</div>
              }
            </div>
            <div style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
              <div style={{ fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 3 }}>💎 IN DER PIPELINE</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 18 }}>💎</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: DS.green }}>{pending}</span>
                <span style={{ fontSize: 12, color: DS.dm }}>Leads</span>
              </div>
              {pending > 0
                ? <div style={{ fontSize: 11, color: DS.green, marginTop: 1, fontWeight: 600 }}>= bis zu {(() => { let s = 0; for (let i = 1; i <= pending; i++) s += getPraemie(sales + i); return s.toLocaleString('de-DE'); })()}€ 💰</div>
                : <div style={{ fontSize: 11, color: DS.dm, marginTop: 1 }}>Teilen Sie Ihren Link!</div>
              }
            </div>
          </div>
        </div>
      </Card>

      {/* ── LINK TEILEN ── */}
      <Card>
        <SectionTitle>Ihren Link teilen</SectionTitle>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ color: DS.dm, fontSize: 12, marginBottom: 6 }}>Ihr persönlicher Empfehlungslink</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, background: DS.c2, border: `1px solid ${DS.bd}`, borderRadius: 8, padding: '10px 14px', fontSize: 13, color: DS.tx, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {CUSTOMER.referral_link}
              </div>
              <button onClick={copyLink} style={{ background: DS.y, color: DS.bg, border: 'none', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', fontFamily: DS.font }}>
                {copied ? '✓ Kopiert!' : 'Kopieren'}
              </button>
            </div>
          </div>
          <div>
            <div style={{ color: DS.dm, fontSize: 12, marginBottom: 6 }}>Ihr Code</div>
            <div style={{ background: DS.c2, border: `1px solid ${DS.yBd}`, borderRadius: 8, padding: '10px 20px', color: DS.y, fontWeight: 700, fontSize: 16, letterSpacing: '0.1em' }}>
              {CUSTOMER.referral_code}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
          <button onClick={() => { const t = `Hallo! Ich habe meine Solaranlage mit bee-doo installiert und bin begeistert! ☀️\n\nWenn du auch Interesse hast:\n${CUSTOMER.referral_link}\n\nFür jeden Abschluss gibt's Prämien! 🪙`; window.open(`https://wa.me/?text=${encodeURIComponent(t)}`); }} style={{ flex: 1, padding: '12px 16px', borderRadius: 10, background: '#25D366', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: DS.font }}>
            💬 Per WhatsApp teilen
          </button>
          <button onClick={() => { window.location.href = `mailto:?subject=bee-doo Solar – Empfehlung&body=${encodeURIComponent(`Hallo,\n\nich kann bee-doo Solar wirklich empfehlen!\n\nHier kannst du ein kostenloses Angebot anfragen:\n${CUSTOMER.referral_link}\n\nViele Grüße`)}`; }} style={{ flex: 1, padding: '12px 16px', borderRadius: 10, background: DS.c2, color: DS.tx, border: `1px solid ${DS.bd}`, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: DS.font }}>
            ✉️ Per E-Mail teilen
          </button>
        </div>
      </Card>

      {/* ── MEINE EMPFEHLUNGEN ── */}
      <Card>
        <SectionTitle>Meine Empfehlungen</SectionTitle>
        {REFERRALS.length === 0 ? (
          <p style={{ color: DS.dm, textAlign: 'center', padding: 24 }}>Noch keine Empfehlungen — teilen Sie Ihren Link!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {REFERRALS.map((r, i) => {
              const isSale = r.status === 'abgeschlossen';
              const saleNr = REFERRALS.filter((x, j) => j <= i && x.status === 'abgeschlossen').length;
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: DS.c2, borderRadius: 10, border: `1px solid ${isSale ? 'rgba(34,197,94,0.2)' : DS.bd}` }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: isSale ? 'linear-gradient(145deg, #FFD700, #FF9F00)' : DS.yDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isSale ? 20 : 16, boxShadow: isSale ? '0 3px 12px rgba(255,215,0,0.3)' : 'none' }}>
                      {isSale ? coins[Math.min(saleNr - 1, 3)].emoji : r.name[0]}
                    </div>
                    <div>
                      <div style={{ color: DS.tx, fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                      <div style={{ color: DS.dm, fontSize: 12 }}>Empfohlen am {r.date}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      background: isSale ? DS.greenDim : DS.blueDim,
                      color: isSale ? DS.green : DS.blue,
                      padding: '4px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                    }}>
                      {isSale ? '✓ Sale' : '◌ In Beratung'}
                    </span>
                    {isSale && <div style={{ color: DS.green, fontWeight: 800, fontSize: 16, marginTop: 4 }}>{getPraemie(saleNr).toLocaleString('de-DE')}€</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function SupportTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card>
        <SectionTitle>Ihr persönlicher Ansprechpartner</SectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '8px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: DS.yDim, border: `2px solid ${DS.yBd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
            👤
          </div>
          <div>
            <div style={{ color: DS.tx, fontWeight: 700, fontSize: 17 }}>Kevin Schreiber</div>
            <div style={{ color: DS.dm, fontSize: 13 }}>Ihr Projektberater bei bee-doo</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
              <a href="tel:+495251987654" style={{ background: DS.yDim, color: DS.y, border: `1px solid ${DS.yBd}`, padding: '6px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                📞 Anrufen
              </a>
              <a href="mailto:k.schreiber@bee-doo.de" style={{ background: DS.c2, color: DS.tx, border: `1px solid ${DS.bd}`, padding: '6px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 13 }}>
                ✉️ E-Mail
              </a>
              <a href="https://wa.me/49525198765" style={{ background: 'rgba(37,211,102,0.1)', color: '#25d366', border: '1px solid rgba(37,211,102,0.3)', padding: '6px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ fontSize: 24, marginBottom: 8 }}>📞</div>
          <div style={{ fontWeight: 600, color: DS.tx, marginBottom: 4 }}>Service Hotline</div>
          <div style={{ color: DS.dm, fontSize: 13, marginBottom: 12 }}>Mo–Fr, 8:00–18:00 Uhr</div>
          <a href="tel:+4952519876540" style={{ color: DS.y, textDecoration: 'none', fontWeight: 700 }}>0525 1987654-0</a>
        </Card>
        <Card>
          <div style={{ fontSize: 24, marginBottom: 8 }}>🔧</div>
          <div style={{ fontWeight: 600, color: DS.tx, marginBottom: 4 }}>Technischer Support</div>
          <div style={{ color: DS.dm, fontSize: 13, marginBottom: 12 }}>Bei Störungen & Fragen</div>
          <a href="mailto:technik@bee-doo.de" style={{ color: DS.y, textDecoration: 'none', fontWeight: 700 }}>technik@bee-doo.de</a>
        </Card>
      </div>

      <Card>
        <SectionTitle>Häufige Fragen</SectionTitle>
        {[
          { q: 'Wann startet die Installation?', a: 'Ihre Installation ist für den 28.02.2025 geplant. Das Montageteam meldet sich 2-3 Tage vorher telefonisch.' },
          { q: 'Wie funktioniert das Monitoring?', a: 'Nach der Inbetriebnahme können Sie hier in Echtzeit Ihre Erzeugung, Eigenverbrauch und Einspeisung verfolgen.' },
          { q: 'Wann erhalte ich meine Dokumente?', a: 'Installationsprotokoll und Übergabedokumente werden nach der Inbetriebnahme hochgeladen und sind dann hier downloadbar.' },
          { q: 'Wie erhalte ich meinen Empfehlungsbonus?', a: 'Der Bonus von 500 € wird nach erfolgreicher Installation der empfohlenen Anlage per Überweisung ausgezahlt.' },
        ].map((f, i) => (
          <details key={i} style={{ borderBottom: `1px solid ${DS.bd}`, padding: '12px 0' }}>
            <summary style={{ cursor: 'pointer', color: DS.tx, fontWeight: 500, listStyle: 'none', display: 'flex', justifyContent: 'space-between' }}>
              {f.q} <span style={{ color: DS.dm }}>›</span>
            </summary>
            <p style={{ color: DS.dm, fontSize: 14, marginTop: 8, marginBottom: 0, lineHeight: 1.6 }}>{f.a}</p>
          </details>
        ))}
      </Card>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function PortalDemo() {
  const [tab, setTab] = useState<TabId>('status');

  const notifCount = 2;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: ${DS.bg}; }
        details summary::-webkit-details-marker { display: none; }
      `}</style>

      <div style={{ minHeight: '100vh', background: DS.bg, fontFamily: DS.font, color: DS.tx }}>
        {/* Header */}
        <header style={{ background: DS.c1, borderBottom: `1px solid ${DS.bd}`, position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ background: DS.y, borderRadius: 8, padding: '4px 10px', fontWeight: 800, fontSize: 17, color: DS.bg, letterSpacing: '-0.5px' }}>
                bee-doo
              </div>
              <span style={{ color: DS.bd, fontSize: 20 }}>|</span>
              <span style={{ color: DS.dm, fontSize: 14 }}>Kundenportal</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Demo Badge */}
              <span style={{ background: 'rgba(251,113,133,0.15)', color: '#fb7185', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                🎭 Demo-Modus
              </span>
              {/* Notifications */}
              <div style={{ position: 'relative', cursor: 'pointer' }}>
                <div style={{ fontSize: 20 }}>🔔</div>
                {notifCount > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
                    {notifCount}
                  </span>
                )}
              </div>
              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: DS.yDim, border: `2px solid ${DS.yBd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: DS.y }}>
                  TB
                </div>
                <div style={{ lineHeight: 1.3 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{CUSTOMER.name}</div>
                  <div style={{ fontSize: 11, color: DS.dm }}>Paderborn</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Notifications Banner */}
        <div style={{ background: 'rgba(59,130,246,0.08)', borderBottom: `1px solid rgba(59,130,246,0.2)`, padding: '10px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>📢</span>
            <span style={{ color: DS.tx, fontSize: 13 }}>
              <strong style={{ color: DS.blue }}>Neu:</strong> Ihr Installationstermin ist bestätigt — 28. Februar 2025. Das Montageteam kontaktiert Sie 2 Tage vorher.
            </span>
          </div>
        </div>

        {/* Main Layout */}
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24 }}>
          {/* Sidebar */}
          <aside>
            {/* Project Card */}
            <Card style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 24 }}>☀️</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{PROJECT.kwp} kWp Anlage</div>
                  <div style={{ color: DS.dm, fontSize: 12 }}>Paderborn</div>
                </div>
              </div>
              {/* Mini progress */}
              <div style={{ background: DS.bd, borderRadius: 4, height: 4, marginBottom: 6 }}>
                <div style={{ background: DS.y, height: '100%', borderRadius: 4, width: '57%' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: DS.dm }}>
                <span>Fortschritt</span><span style={{ color: DS.y }}>4/7 Schritte</span>
              </div>
            </Card>

            {/* Navigation */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {TABS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: tab === t.id ? DS.yDim : 'transparent',
                    color: tab === t.id ? DS.y : DS.dm,
                    fontFamily: DS.font, fontWeight: tab === t.id ? 600 : 400,
                    fontSize: 14, textAlign: 'left', width: '100%',
                    borderLeft: tab === t.id ? `3px solid ${DS.y}` : '3px solid transparent',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </nav>

            {/* Quick Contact */}
            <Card style={{ marginTop: 16 }}>
              <div style={{ fontSize: 13, color: DS.dm, marginBottom: 8 }}>Schnellkontakt</div>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Kevin Schreiber</div>
              <div style={{ color: DS.dm, fontSize: 12 }}>Ihr Berater</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <a href="tel:+4952519876" style={{ flex: 1, background: DS.yDim, color: DS.y, border: `1px solid ${DS.yBd}`, borderRadius: 8, padding: '7px 0', textAlign: 'center', textDecoration: 'none', fontSize: 18 }}>📞</a>
                <a href="https://wa.me/4952519876" style={{ flex: 1, background: 'rgba(37,211,102,0.1)', color: '#25d366', border: '1px solid rgba(37,211,102,0.2)', borderRadius: 8, padding: '7px 0', textAlign: 'center', textDecoration: 'none', fontSize: 18 }}>💬</a>
              </div>
            </Card>
          </aside>

          {/* Content */}
          <main>
            {tab === 'status'     && <StatusTab />}
            {tab === 'dokumente'  && <DokumenteTab />}
            {tab === 'monitoring' && <MonitoringTab />}
            {tab === 'referral'   && <ReferralTab />}
            {tab === 'support'    && <SupportTab />}
          </main>
        </div>
      </div>
    </>
  );
}

