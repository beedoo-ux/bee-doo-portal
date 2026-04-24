'use client';
// =============================================================
// PortalDemo.tsx – bee-doo Kundenportal Demo
// Testkunde: Thomas Berger | Paderborn | 9,8 kWp Anlage
// Design: DM Sans | #0a0a0a | #F5C500
// =============================================================
import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  ClipboardList, FileText, Zap, Gift, MessageCircle,
  Phone, MessageSquare, Bell, CheckCircle2, Handshake, Plug,
  Wrench, PartyPopper, ShieldCheck, Lock, Award,
  User, Mail, Clock, Headphones, Check,
  Package, Sun, Battery, Cpu, MapPin
} from 'lucide-react';

// ─── Design System ────────────────────────────────────────────
const DS = {
  bg:      '#F7F8FB',       // hell: warmweißer Canvas
  c1:      '#FFFFFF',       // Card-Hintergrund
  c2:      '#F3F4F7',       // subtle Hover/Secondary
  bd:      'rgba(15,23,42,0.08)', // weiche Trennlinien
  tx:      '#0F172A',       // Text primary (fast schwarz, angenehm)
  dm:      '#64748B',       // Text dimmed (slate-500)
  y:       '#F5C500',       // bee-doo Gold (Akzent)
  yDim:    'rgba(245,197,0,0.12)',
  yBd:     'rgba(245,197,0,0.35)',
  green:   '#10B981',       // frischer Mint-Green
  greenDim:'rgba(16,185,129,0.10)',
  blue:    '#3B82F6',       // primary Blue
  blueDim: 'rgba(59,130,246,0.10)',
  font:    "'Inter', system-ui, -apple-system, sans-serif",
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
  { id: 1, label: 'Beratung & Angebot',    done: true,  date: '03.11.2024',    Icon: Handshake },
  { id: 2, label: 'Vertrag unterzeichnet', done: true,  date: '08.11.2024',    Icon: ClipboardList },
  { id: 3, label: 'Netzanmeldung',         done: true,  date: '19.11.2024',    Icon: Plug },
  { id: 4, label: 'Genehmigung erhalten',  done: true,  date: '14.01.2025',    Icon: CheckCircle2 },
  { id: 5, label: 'Installation',          done: false, date: '28.02.2025',    Icon: Wrench, active: true },
  { id: 6, label: 'Inbetriebnahme',        done: false, date: 'Ca. März 2025', Icon: Zap },
  { id: 7, label: 'Abnahme & Übergabe',    done: false, date: 'Ca. März 2025', Icon: PartyPopper },
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
  { id: 'status',     Icon: ClipboardList, label: 'Projektstatus' },
  { id: 'system',     Icon: Package,       label: 'Ihr System'    },
  { id: 'dokumente',  Icon: FileText,      label: 'Dokumente'     },
  { id: 'monitoring', Icon: Zap,           label: 'Monitoring'    },
  { id: 'referral',   Icon: Gift,          label: 'Empfehlen'     },
  { id: 'support',    Icon: MessageCircle, label: 'Support'       },
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
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, borderBottom: `1px dashed rgba(15,23,42,0.08)`, paddingBottom: 6 }}>
      <span style={{ fontSize: 12, color: '#64748B' }}>{label}</span>
      <span style={{ fontSize: 13, color: '#0F172A', fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

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

        {/* Milestones – Modern Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MILESTONES.map((m, i) => {
            const isLast = i === MILESTONES.length - 1;
            return (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                borderRadius: 12,
                background: m.active ? `${DS.blue}12` : m.done ? DS.c2 : 'transparent',
                border: `1.5px solid ${m.active ? `${DS.blue}40` : m.done ? DS.bd : `${DS.bd}60`}`,
                transition: 'all 0.3s',
              }}>
                {/* Step Number / Check */}
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: m.done ? `${DS.y}15` : m.active ? `${DS.blue}15` : `${DS.bd}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: m.done ? 16 : 14,
                  fontWeight: 800,
                  color: m.done ? DS.y : m.active ? DS.blue : DS.dm,
                }}>
                  {m.done ? <Check size={20} strokeWidth={3} /> : <m.Icon size={18} strokeWidth={1.9} />}
                </div>
                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: m.active ? 700 : m.done ? 600 : 500, color: m.done ? DS.tx : m.active ? DS.blue : DS.dm }}>
                      {m.label}
                    </span>
                    {m.active && <span style={{ background: `${DS.blue}20`, color: DS.blue, padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, letterSpacing: 0.5 }}>AKTUELL</span>}
                  </div>
                  <div style={{ fontSize: 12, color: DS.dm, marginTop: 2 }}>{m.date}</div>
                </div>
                {/* Status indicator */}
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: m.done ? DS.green : m.active ? DS.blue : `${DS.dm}40`,
                  boxShadow: m.active ? `0 0 8px ${DS.blue}60` : m.done ? `0 0 6px ${DS.green}40` : 'none',
                }} />
              </div>
            );
          })}
        </div>
      </Card>

      {/* Satellite + Address */}
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 0 }}>
          <div style={{ position: 'relative', minHeight: 280, background: '#e5e7eb' }}>
            <iframe
              src="https://maps.google.com/maps?q=Detmolder+Str.+112,+33100+Paderborn&t=k&z=19&ie=UTF8&iwloc=&output=embed"
              loading="lazy"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              title="Satellitenansicht Ihrer Installationsadresse"
            />
          </div>
          <div style={{ padding: '24px 24px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: DS.dm, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              <MapPin size={14} strokeWidth={2.1} color={DS.y} /> Installationsadresse
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: DS.tx, lineHeight: 1.35 }}>{PROJECT.address}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
              <InfoRow label="Ausrichtung" value="Süd-Süd-West · 12° Dachneigung" />
              <InfoRow label="Dachfläche" value="84 m² (nutzbar: 58 m²)" />
              <InfoRow label="Gebäude" value="Einfamilienhaus · Baujahr 1998" />
              <InfoRow label="Anfahrt Montage-Team" value="ca. 25 Min ab Zentrallager" />
            </div>
          </div>
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
              <span style={{ color: d.ready ? DS.y : DS.dm, display: 'inline-flex' }}>{d.ready ? <FileText size={20} strokeWidth={1.75} /> : <Clock size={20} strokeWidth={1.75} />}</span>
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
              <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 3 }}>{sales} {sales === 1 ? 'Empfehlung' : 'Empfehlungen'} abgeschlossen</div>
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
                {sales >= 4 ? 'MAXIMALBONUS ERREICHT' : `NÄCHSTER BONUS`}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Award size={18} strokeWidth={2.2} color={sales >= 4 ? DS.green : DS.y} />
                <span style={{ fontSize: 22, fontWeight: 900, color: DS.y }}>{nextPraemie.toLocaleString('de-DE')}€</span>
              </div>
              {sales >= 4
                ? <div style={{ fontSize: 11, color: DS.green, marginTop: 1, fontWeight: 700 }}>Jede weitere Empfehlung = 1.000 €</div>
                : <div style={{ fontSize: 11, color: DS.dm, marginTop: 1 }}>Empfehlung #{sales + 1} bringt&apos;s!</div>
              }
            </div>
            <div style={{ flex: 1, padding: '10px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
              <div style={{ fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 3 }}>OFFENE EMPFEHLUNGEN</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Gift size={18} strokeWidth={2.2} color={DS.green} />
                <span style={{ fontSize: 22, fontWeight: 900, color: DS.green }}>{pending}</span>
                <span style={{ fontSize: 12, color: DS.dm }}>Leads</span>
              </div>
              {pending > 0
                ? <div style={{ fontSize: 11, color: DS.green, marginTop: 1, fontWeight: 600 }}>= bis zu {(() => { let s = 0; for (let i = 1; i <= pending; i++) s += getPraemie(sales + i); return s.toLocaleString('de-DE'); })()}€</div>
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
          <button onClick={() => { const t = `Hallo! Ich habe meine Solaranlage mit bee-doo installiert und bin begeistert! ☀️\n\nWenn du auch Interesse hast:\n${CUSTOMER.referral_link}\n\nFür jeden Abschluss gibt's Prämien! 🪙`; window.open(`https://wa.me/?text=${encodeURIComponent(t)}`); }} style={{ flex: 1, padding: '12px 16px', borderRadius: 10, background: '#25D366', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: DS.font, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <MessageSquare size={16} strokeWidth={2.2} /> Per WhatsApp teilen
          </button>
          <button onClick={() => { window.location.href = `mailto:?subject=bee-doo Solar – Empfehlung&body=${encodeURIComponent(`Hallo,\n\nich kann bee-doo Solar wirklich empfehlen!\n\nHier kannst du ein kostenloses Angebot anfragen:\n${CUSTOMER.referral_link}\n\nViele Grüße`)}`; }} style={{ flex: 1, padding: '12px 16px', borderRadius: 10, background: DS.c2, color: DS.tx, border: `1px solid ${DS.bd}`, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: DS.font, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Mail size={16} strokeWidth={2.2} /> Per E-Mail teilen
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

function SystemTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card>
        <SectionTitle>Ihr System in Paderborn</SectionTitle>
        <p style={{ color: DS.dm, fontSize: 14, marginTop: -8, marginBottom: 20, lineHeight: 1.6 }}>
          Premium-Hardware von Weltmarktführern — auf Wunsch komplett bei bee-doo geplant und installiert.
          Alle Komponenten bilden ein aufeinander abgestimmtes Gesamtsystem.
        </p>

        {/* Produkt-Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          <ProductCard
            img="/products/aiko-modul.webp"
            Icon={Sun}
            kicker="Photovoltaik-Module"
            title="AIKO Neostar 2S+"
            specs={[
              ['Anzahl', '24 Module'],
              ['Leistung pro Modul', '480 Wp'],
              ['Gesamtleistung', '9,8 kWp'],
              ['Produktgarantie', '30 Jahre'],
              ['Wirkungsgrad', '23,8 %'],
              ['Optik', 'Vollschwarz (Full-Black)'],
            ]}
          />
          <ProductCard
            img="/products/fox-speicher.webp"
            Icon={Battery}
            kicker="Batteriespeicher"
            title="FOX ESS Energy Cube 10"
            specs={[
              ['Nutzbare Kapazität', '10,0 kWh'],
              ['Zelltechnologie', 'LFP (lithium-eisen-phosphat)'],
              ['Ladezyklen', '> 6.000'],
              ['Garantie', '10 Jahre / 12.000 Zyklen'],
              ['Notstromfähig', 'Ja (Black-Start)'],
              ['Erweiterbar', 'Ja, modular bis 40 kWh'],
            ]}
          />
          <ProductCard
            img="/products/montage.webp"
            Icon={Cpu}
            kicker="Montagesystem"
            title="Aluminium-Ziegelsystem"
            specs={[
              ['Schienenmaterial', 'Eloxiertes Aluminium'],
              ['Haken', 'Edelstahl V2A'],
              ['Windlast-zertifiziert', 'bis Zone 4'],
              ['Rücklagenfrei auf Ziegel', 'Ja'],
              ['Montagezeit', '1 Arbeitstag'],
              ['Meisterbetrieb-Installation', 'Ja, von bee-doo Partner'],
            ]}
          />
          <ProductCard
            img="/products/waermepumpe.webp"
            Icon={Zap}
            kicker="Optional: Wärmepumpe"
            title="Tecalor Luft-Wasser-WP"
            specs={[
              ['Modell', 'Tecalor THZ 304 Eco'],
              ['Heizleistung', 'bis 10 kW'],
              ['SCOP', '4,7 (sehr hoch)'],
              ['Schallpegel außen', '52 dB(A)'],
              ['Kompatibel mit PV', 'Ja, direkt steuerbar'],
              ['Status', 'Interesse hinterlegt'],
            ]}
          />
        </div>
      </Card>

      {/* Montage-Galerie Teaser */}
      <Card>
        <SectionTitle>So sieht Ihre Montage aus</SectionTitle>
        <p style={{ color: DS.dm, fontSize: 13, marginTop: -8, marginBottom: 16 }}>
          Beispielbilder aus vergleichbaren Paderborner Projekten. Am Montagetag bekommen Sie eigene Fotos in diese Galerie.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          <GalleryTile img="/products/energiehaus.webp" label="Komplett-System (Anlage + Speicher + Wallbox)" />
          <GalleryTile img="/products/montage.webp"     label="Montage-Tag: 1 Arbeitstag inkl. Gerüst" />
        </div>
      </Card>
    </div>
  );
}

function ProductCard({
  img, Icon, kicker, title, specs,
}: {
  img: string;
  Icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
  kicker: string;
  title: string;
  specs: [string, string][];
}) {
  return (
    <div style={{
      background: DS.c2,
      border: `1px solid ${DS.bd}`,
      borderRadius: 12,
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Bild-Hero */}
      <div style={{
        aspectRatio: '16/10',
        background: `#FFFFFF url(${img}) center/contain no-repeat`,
        borderBottom: `1px solid ${DS.bd}`,
      }} />
      {/* Text */}
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Icon size={14} strokeWidth={2.1} color={DS.y} />
          <span style={{ fontSize: 11, fontWeight: 700, color: DS.dm, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {kicker}
          </span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: DS.tx, marginBottom: 12 }}>{title}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {specs.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, gap: 8 }}>
              <span style={{ color: DS.dm }}>{k}</span>
              <span style={{ color: DS.tx, fontWeight: 500, textAlign: 'right' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GalleryTile({ img, label }: { img: string; label: string }) {
  return (
    <div style={{
      aspectRatio: '16/9',
      background: `#0a0a0a url(${img}) center/cover no-repeat`,
      borderRadius: 10,
      border: `1px solid ${DS.bd}`,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        padding: '10px 14px',
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.65) 100%)',
        color: '#fff',
        fontSize: 12,
        fontWeight: 500,
      }}>
        {label}
      </div>
    </div>
  );
}

function SupportTab() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Card>
        <SectionTitle>Ihr persönlicher Ansprechpartner</SectionTitle>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '8px 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: DS.yDim, border: `2px solid ${DS.yBd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: DS.y }}>
            <User size={30} strokeWidth={1.75} />
          </div>
          <div>
            <div style={{ color: DS.tx, fontWeight: 700, fontSize: 17 }}>Kevin Schreiber</div>
            <div style={{ color: DS.dm, fontSize: 13 }}>Ihr Projektberater bei bee-doo</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
              <a href="tel:+495251987654" style={{ background: DS.yDim, color: DS.y, border: `1px solid ${DS.yBd}`, padding: '7px 14px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Phone size={14} strokeWidth={2.1} /> Anrufen
              </a>
              <a href="mailto:k.schreiber@bee-doo.de" style={{ background: DS.c2, color: DS.tx, border: `1px solid ${DS.bd}`, padding: '7px 14px', borderRadius: 8, textDecoration: 'none', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Mail size={14} strokeWidth={2} /> E-Mail
              </a>
              <a href="https://wa.me/49525198765" style={{ background: 'rgba(37,211,102,0.1)', color: '#25d366', border: '1px solid rgba(37,211,102,0.3)', padding: '7px 14px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <MessageSquare size={14} strokeWidth={2.1} /> WhatsApp
              </a>
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <Card>
          <div style={{ color: DS.y, marginBottom: 10 }}><Headphones size={24} strokeWidth={1.75} /></div>
          <div style={{ fontWeight: 600, color: DS.tx, marginBottom: 4 }}>Service Hotline</div>
          <div style={{ color: DS.dm, fontSize: 13, marginBottom: 12 }}>Mo–Fr, 8:00–18:00 Uhr</div>
          <a href="tel:+4952519876540" style={{ color: DS.y, textDecoration: 'none', fontWeight: 700 }}>0525 1987654-0</a>
        </Card>
        <Card>
          <div style={{ color: DS.y, marginBottom: 10 }}><Wrench size={24} strokeWidth={1.75} /></div>
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

      {/* Video-Testimonials — echte Kunden erzählen */}
      <Card>
        <SectionTitle>Kunden erzählen ihre Geschichte</SectionTitle>
        <p style={{ color: DS.dm, fontSize: 13, marginTop: -8, marginBottom: 16 }}>
          Drei bee-doo Kunden, drei Projekte, drei ehrliche Meinungen. Klicken Sie rein — die Videos starten nicht automatisch.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <TestimonialVideo
            guid="34d3ccc5-2797-4d33-9957-53716d2baa50"
            name="Carolin Mack"
            place="Borchen"
            teaser="Vom Termin bis zur Inbetriebnahme — alles aus einer Hand."
          />
          <TestimonialVideo
            guid="e766b81a-0366-42b0-a41d-aeb70f5b55a5"
            name="Roland Jaesch"
            place="Hameln"
            teaser="Beratung war transparent, Preis fair, Montage sauber."
          />
          <TestimonialVideo
            guid="eae68877-ba02-4563-85ce-a5181b2df17c"
            name="Barbara Knost"
            place="Nordrhein-Westfalen"
            teaser="Kein Verkaufsdruck, stattdessen echtes Zuhören."
          />
        </div>
      </Card>
    </div>
  );
}

function TestimonialVideo({ guid, name, place, teaser }: { guid: string; name: string; place: string; teaser: string }) {
  const src = `https://iframe.mediadelivery.net/embed/626851/${guid}?autoplay=false&preload=true&responsive=true`;
  return (
    <div style={{
      background: DS.c2,
      border: `1px solid ${DS.bd}`,
      borderRadius: 12,
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000' }}>
        <iframe
          src={src}
          loading="lazy"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
          title={`Kundenstimme ${name}`}
        />
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: DS.tx }}>{name}</span>
          <span style={{ fontSize: 12, color: DS.dm }}>· {place}</span>
        </div>
        <p style={{ margin: 0, fontSize: 12.5, color: DS.dm, lineHeight: 1.5 }}>&bdquo;{teaser}&ldquo;</p>
      </div>
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
        
        * { box-sizing: border-box; }
        body { margin: 0; background: ${DS.bg}; }
        details summary::-webkit-details-marker { display: none; }
      `}</style>

      <div style={{ minHeight: '100vh', background: DS.bg, fontFamily: DS.font, color: DS.tx }}>
        {/* Header */}
        <header style={{ background: DS.c1, borderBottom: `1px solid ${DS.bd}`, position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src="/bee-doo-Logo.svg" alt="bee-doo" style={{ height: 32, width: 'auto', display: 'block' }} />
              <span style={{ color: DS.bd, fontSize: 20, margin: '0 4px' }}>|</span>
              <span style={{ color: DS.dm, fontSize: 14, fontWeight: 500, letterSpacing: '0.3px' }}>Kundenportal</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Demo Badge */}
              <span style={{ background: DS.c2, color: DS.dm, padding: '5px 12px', borderRadius: 6, fontSize: 11, fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', border: `1px solid ${DS.bd}` }}>
                Demo
              </span>
              {/* Notifications */}
              <div style={{ position: 'relative', cursor: 'pointer' }}>
                <Bell size={20} strokeWidth={1.75} color={'rgba(15,23,42,0.6)'} />
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
            <span style={{ fontSize: 18 }}>●</span>
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
                  <t.Icon size={18} strokeWidth={tab === t.id ? 2.2 : 1.75} />
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
                <a href="tel:+4952519876" style={{ flex: 1, background: DS.yDim, color: DS.y, border: `1px solid ${DS.yBd}`, borderRadius: 8, padding: '9px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }} aria-label="Anrufen"><Phone size={17} strokeWidth={2} /></a>
                <a href="https://wa.me/4952519876" style={{ flex: 1, background: 'rgba(37,211,102,0.1)', color: '#25d366', border: '1px solid rgba(37,211,102,0.2)', borderRadius: 8, padding: '9px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }} aria-label="WhatsApp"><MessageSquare size={17} strokeWidth={2} /></a>
              </div>
            </Card>
          </aside>

          {/* Content */}
          <main>
            {tab === 'status'     && <StatusTab />}
            {tab === 'system'     && <SystemTab />}
            {tab === 'dokumente'  && <DokumenteTab />}
            {tab === 'monitoring' && <MonitoringTab />}
            {tab === 'referral'   && <ReferralTab />}
            {tab === 'support'    && <SupportTab />}
          </main>
        </div>

        {/* Trust-Footer: Sicherheitsmerkmale + Zertifikate */}
        <div style={{ maxWidth: 1280, margin: '32px auto 0', padding: '24px 24px 40px' }}>
          <div style={{
            background: DS.c1,
            border: `1px solid ${DS.bd}`,
            borderRadius: 12,
            padding: '20px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
          }}>
            <TrustBadge Icon={Lock}        title="256-Bit SSL"          subtitle="Verschlüsselte Verbindung" />
            <TrustBadge Icon={ShieldCheck} title="DSGVO-konform"         subtitle="Ihre Daten sicher in DE" />
            <TrustBadge Icon={Award}       title="Meisterbetrieb"        subtitle="HWK-geprüft und zertifiziert" />
            <TrustBadge Icon={CheckCircle2} title="Handelsblatt"         subtitle="Top-Solaranbieter 2024" />
          </div>
          <div style={{
            textAlign: 'center',
            fontSize: 11,
            color: DS.dm,
            marginTop: 14,
            letterSpacing: 0.3,
          }}>
            bee-doo GmbH &middot; Detmolder Str. 112 &middot; 33100 Paderborn &middot; HRB 19348 &middot; USt-ID: DE356789012
          </div>
        </div>
      </div>
    </>
  );
}

function TrustBadge({ Icon, title, subtitle }: { Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; title: string; subtitle: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: `${DS.y}18`,
        color: DS.y,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={20} strokeWidth={1.9} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: DS.tx, lineHeight: 1.2 }}>{title}</div>
        <div style={{ fontSize: 11, color: DS.dm, marginTop: 2, lineHeight: 1.3 }}>{subtitle}</div>
      </div>
    </div>
  );
}
