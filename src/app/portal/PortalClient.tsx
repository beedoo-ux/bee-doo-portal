'use client';
// =============================================================
// app/portal/PortalClient.tsx – bee-doo Kundenportal v2
// Enpal-Style: TopNav + Journey-Bar + Sidebar
// Dark Theme: DM Sans | #0a0a0a | #F5C500
// =============================================================
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { createClient } from '@/lib/supabase';
import type { CustomerPortalView, Milestone, Document, MonitoringMonthly, Referral } from '@/types/database';

// ─── Design System ────────────────────────────────────────────
const DS = {
  bg:       '#0a0a0a',
  c1:       '#141414',
  c2:       '#1c1c1c',
  c3:       '#242424',
  bd:       'rgba(255,255,255,0.07)',
  bdHov:    'rgba(245,197,0,0.28)',
  tx:       'rgba(255,255,255,0.92)',
  dm:       'rgba(255,255,255,0.42)',
  y:        '#F5C500',
  yDim:     'rgba(245,197,0,0.09)',
  yBd:      'rgba(245,197,0,0.20)',
  green:    '#22c55e',
  greenDim: 'rgba(34,197,94,0.10)',
  blue:     '#3b82f6',
  blueDim:  'rgba(59,130,246,0.10)',
  font:     "'DM Sans', system-ui, sans-serif",
  radius:   16,
};

type TabId = 'uebersicht' | 'system' | 'einsparpotential' | 'informationen' | 'dokumente';

const TABS: { id: TabId; icon: string; label: string }[] = [
  { id: 'uebersicht',       icon: '⊞',  label: 'Übersicht'       },
  { id: 'system',           icon: '🏠',  label: 'Ihr System'      },
  { id: 'einsparpotential', icon: '€',   label: 'Einsparpotential'},
  { id: 'informationen',    icon: '📰',  label: 'Informationen'   },
  { id: 'dokumente',        icon: '📄',  label: 'Dokumente'       },
];

const JOURNEY_STEPS = [
  { label: 'Erstgespräch',  sub: 'Beratungs-\ngespräch'    },
  { label: 'Vor-Ort',       sub: 'Vor-Ort\nTermin'         },
  { label: 'Angebot',       sub: 'Finales\nAngebotsgespräch'},
  { label: 'Installation',  sub: 'Montage'                  },
];

const SYSTEM_COMPONENTS = [
  { icon: '☀️',  name: 'Solarmodule',     desc: 'Maximale Leistung für Ihre Energieversorgung.'     },
  { icon: '🔋',  name: 'Stromspeicher',   desc: 'Nutzen Sie Ihre Energie jederzeit optimal.'         },
  { icon: '⚡',  name: 'Wallbox',          desc: 'Laden Sie Ihr Auto mit Sonnenstrom.'                },
  { icon: '🌡️', name: 'Wärmepumpe',      desc: 'Hocheffizient und zukunftsfähig für Ihr Zuhause.'  },
  { icon: '📱',  name: 'bee-doo App',     desc: 'Ihr Energiemanager – alles im Blick.'               },
  { icon: '🛡️', name: 'Vollkasko-Schutz',desc: 'Bleiben Sie unabhängig, auch bei Störungen.'        },
];

const ARTIKEL = [
  { icon: '🌞', title: 'Solaranlage 2025: Was lohnt sich?',     sub: 'Förderungen & Amortisation'    },
  { icon: '⚡', title: 'Stromspeicher im Vergleich',              sub: 'Welcher Speicher passt zu mir' },
  { icon: '🏠', title: 'Zuhause bei unseren Kunden',             sub: 'Erfahrungsberichte aus NRW'   },
  { icon: '🚗', title: 'Wallbox: Günstig laden',                  sub: 'Tipps für E-Auto-Besitzer'    },
  { icon: '🌍', title: 'CO₂-Einsparung berechnen',               sub: 'Klimaschutz konkret'           },
  { icon: '💰', title: 'Einspeisung & Direktvermarktung',        sub: 'So verdienen Sie mit Solar'   },
];

const FAQ_ITEMS = [
  'Welche Unterlagen benötige ich für das Gespräch?',
  'Wie lange dauert das Gespräch?',
  'Kann ich meinen Termin verschieben?',
];

interface Props {
  snapshot: CustomerPortalView;
  milestones: Milestone[];
  documents: Document[];
  monitoring: MonitoringMonthly[];
  referrals: Referral[];
  notifications?: any[];
}

const fmt  = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 0 });
const fmtD = (d: string | null) => d ? format(new Date(d), 'd. MMMM yyyy', { locale: de }) : '–';
const fmtT = (d: string | null) => d ? format(new Date(d), 'HH:mm', { locale: de }) : '';
const fmtShort = (d: string | null) => d ? format(new Date(d), 'd. MMM', { locale: de }) : '';
const fmtDay   = (d: string | null) => d ? format(new Date(d), 'EEEE', { locale: de }) : '';

// ─── Sub-Components ───────────────────────────────────────────
const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: DS.c1, border: `1px solid ${DS.bd}`, borderRadius: DS.radius, padding: 22, ...style }}>
    {children}
  </div>
);
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: DS.dm, marginBottom: 14 }}>{children}</div>
);
const Stars = ({ n, size = 14 }: { n: number; size?: number }) => (
  <span style={{ color: DS.y, fontSize: size }}>{Array.from({length:5}, (_,i) => i < n ? '★' : '☆').join('')}</span>
);
const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: DS.c2, border: `1px solid ${DS.bd}`, borderRadius: 8, padding: '8px 14px', fontSize: 12, fontFamily: DS.font }}>
      <div style={{ color: DS.dm, marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color: p.color || DS.y, fontWeight: 700 }}>{fmt(p.value)} {p.name === 'production_kwh' ? 'kWh' : p.name === 'co2_saved_kg' ? 'kg CO₂' : '€'}</div>
      ))}
    </div>
  );
};

// ─── Lock Overlay ─────────────────────────────────────────────
const LockedOverlay = ({ text }: { text: string }) => (
  <div style={{ position: 'absolute', inset: 0, borderRadius: DS.radius, backdropFilter: 'blur(6px)', background: 'rgba(10,10,10,0.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, zIndex: 2 }}>
    <span style={{ fontSize: 28 }}>🔒</span>
    <div style={{ fontSize: 13, fontWeight: 600, color: DS.tx }}>{text}</div>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function PortalClient({ snapshot, milestones, documents, monitoring, referrals }: Props) {
  const [tab, setTab] = useState<TabId>('uebersicht');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [uploadModal, setUploadModal] = useState<'closed' | 'intro' | 'guide' | 'upload'>('closed');
  const [copied, setCopied] = useState(false);
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [npsNote, setNpsNote] = useState('');
  const [npsSent, setNpsSent] = useState(false);

  // Daten aus Snapshot
  const vorname    = snapshot.first_name ?? 'Kunde';
  const nachname   = snapshot.last_name  ?? '';
  const fullName   = `${vorname} ${nachname}`.trim();
  const initials   = `${(snapshot.first_name?.[0]??'').toUpperCase()}${(snapshot.last_name?.[0]??'').toUpperCase()}`;
  const adresse    = snapshot.address    ?? '';
  const plz        = snapshot.postal_code ?? '';
  const ort        = snapshot.city       ?? 'Bielefeld';
  const berater    = snapshot.sales_rep_name ?? 'Ihr Berater';
  const termin_at  = snapshot.next_appointment_at as string | null ?? null;
  const milestone_current = snapshot.current_milestone ?? 0;
  const referral_code     = snapshot.referral_code ?? 'BD-XXXX';
  const referral_count    = referrals.length;
  const referral_bonus    = referral_count * 250;

  // Karte — Satellitenbild URL (Google Maps Static)
  const mapCenter = encodeURIComponent(`${adresse}, ${plz} ${ort}`);
  const mapUrl    = `https://maps.googleapis.com/maps/api/staticmap?center=${mapCenter}&zoom=18&size=600x300&maptype=satellite&key=AIzaSyCra7fsO1X6iTszhOCI_x2eyG-3IQqlLno`;

  // Monitoring-Aggregat
  const total_kwh = monitoring.reduce((s, m) => s + (m.production_kwh ?? 0), 0);
  const total_co2 = monitoring.reduce((s, m) => s + (m.co2_saved_kg   ?? 0), 0);
  const total_eur = monitoring.reduce((s, m) => s + (m.revenue_eur    ?? 0), 0);
  const chartData = monitoring.slice(-12).map(m => ({
    label: format(new Date(m.month), 'MMM yy', { locale: de }),
    production_kwh: m.production_kwh ?? 0,
    co2_saved_kg:   m.co2_saved_kg   ?? 0,
    revenue_eur:    m.revenue_eur    ?? 0,
  }));

  // Milestone-Status
  const journeyStep = Math.min(milestone_current, 3);
  const isAfterBeratung = milestone_current >= 1;

  const handleCopy = () => {
    navigator.clipboard.writeText(referral_code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  const handleNps = async () => {
    if (npsScore === null) return;
    setNpsSent(true);
    try {
      const sb = createClient();
      await sb.from('nps_responses').insert({ score: npsScore, comment: npsNote || null, trigger: 'portal', customer_id: snapshot.customer_id });
    } catch {}
  };

  // ─── LAYOUT ─────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: DS.bg, fontFamily: DS.font, color: DS.tx }}>
      {/* ── TOP NAV ── */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,10,10,0.92)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${DS.bd}`, height: 58 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', height: '100%', display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 20, flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#F5C500,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🐝</div>
            <span style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '-0.3px' }}>bee-doo</span>
          </div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 2, flex: 1, overflowX: 'auto' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background: tab === t.id ? DS.yDim : 'transparent',
                border: `1px solid ${tab === t.id ? DS.yBd : 'transparent'}`,
                borderRadius: 9, color: tab === t.id ? DS.y : DS.dm,
                fontFamily: DS.font, fontWeight: tab === t.id ? 700 : 500,
                fontSize: 13, padding: '6px 14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: 14 }}>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
          {/* User */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0, marginLeft: 8 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#F5C500,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: '#0a0a0a' }}>{initials}</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: DS.tx }}>{fullName}</span>
          </div>
        </div>
      </nav>

      {/* ── JOURNEY BAR ── */}
      <div style={{ paddingTop: 58, background: DS.c1, borderBottom: `1px solid ${DS.bd}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '18px 24px' }}>
          {/* Kunde */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: DS.dm }}>
              Guten Tag, <span style={{ fontWeight: 700, color: DS.tx }}>{fullName}</span>
              {adresse && <span style={{ color: DS.dm }}> · {adresse}, {plz} {ort}</span>}
            </div>
          </div>
          {/* Steps */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0, position: 'relative' }}>
            {JOURNEY_STEPS.map((step, i) => {
              const done    = i < journeyStep;
              const current = i === journeyStep;
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
                  {/* Linie links */}
                  {i > 0 && (
                    <div style={{ position: 'absolute', top: 14, right: '50%', left: '-50%', height: 2, background: done ? DS.y : DS.bd, transition: 'background 0.3s' }} />
                  )}
                  {/* Kreis */}
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', zIndex: 1,
                    background: done ? DS.y : current ? DS.y : DS.c2,
                    border: `2px solid ${done ? DS.y : current ? DS.y : DS.bd}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700,
                    color: (done || current) ? '#0a0a0a' : DS.dm,
                    boxShadow: current ? `0 0 0 4px ${DS.yDim}` : 'none',
                    transition: 'all 0.3s',
                  }}>
                    {done ? '✓' : i + 1}
                  </div>
                  {/* Labels */}
                  <div style={{ marginTop: 8, textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: DS.dm, marginBottom: 2 }}>Schritt {i + 1}</div>
                    <div style={{ fontSize: 11, fontWeight: current || done ? 700 : 400, color: current ? DS.y : done ? DS.tx : DS.dm, whiteSpace: 'pre-line', lineHeight: 1.3 }}>
                      {step.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

        {/* ─── LEFT MAIN ─── */}
        <div>

          {/* ═══ TAB: ÜBERSICHT ═══ */}
          {tab === 'uebersicht' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Termin-Card */}
              <Card>
                <SectionLabel>📅 Ihr nächster Termin</SectionLabel>
                {termin_at ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'center' }}>
                    {/* Termin-Info */}
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ background: DS.y, borderRadius: 12, padding: '12px 16px', textAlign: 'center', minWidth: 64, flexShrink: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#0a0a0a', textTransform: 'uppercase' }}>
                          {format(new Date(termin_at), 'EE', { locale: de })}
                        </div>
                        <div style={{ fontSize: 32, fontWeight: 900, color: '#0a0a0a', lineHeight: 1 }}>
                          {format(new Date(termin_at), 'd', { locale: de })}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#0a0a0a' }}>
                          {format(new Date(termin_at), 'MMM', { locale: de })}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 4 }}>Ihr persönliches Erstgespräch</div>
                        <div style={{ fontSize: 13, color: DS.dm, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          🕐 {fmtT(termin_at)} Uhr (60min)
                        </div>
                        <div style={{ fontSize: 13, color: DS.dm, display: 'flex', alignItems: 'center', gap: 6 }}>
                          📍 Videoanruf
                          <span style={{ color: DS.y, cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>So funktioniert's →</span>
                        </div>
                      </div>
                    </div>
                    {/* Videoanruf */}
                    <div style={{ textAlign: 'center' }}>
                      <button disabled style={{ width: '100%', background: DS.c3, border: `1px solid ${DS.bd}`, borderRadius: 10, padding: '14px 20px', color: DS.dm, fontFamily: DS.font, fontWeight: 600, fontSize: 14, cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                        📹 Jetzt Videoanruf beitreten →
                      </button>
                      <div style={{ fontSize: 11, color: DS.dm, marginTop: 8 }}>Link verfügbar 24h vor dem Termin</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: DS.dm, padding: '32px 0', fontSize: 13 }}>
                    Kein Termin gefunden. Bitte kontaktieren Sie uns.
                  </div>
                )}
              </Card>

              {/* Vorbereitung */}
              <Card>
                <SectionLabel>📋 So bereiten Sie sich vor</SectionLabel>
                <div style={{ background: DS.c2, border: `1px solid ${DS.bd}`, borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  onClick={() => setUploadModal('intro')}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = DS.bdHov)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = DS.bd)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: DS.yDim, border: `1px solid ${DS.yBd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📄</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>Stromrechnung hochladen <span style={{ color: DS.dm, fontWeight: 400, fontSize: 12 }}>(optional)</span></div>
                      <div style={{ fontSize: 12, color: DS.dm }}>Helfen Sie uns, Ihr Solar-Angebot vorzubereiten</div>
                    </div>
                  </div>
                  <span style={{ color: DS.dm, fontSize: 18 }}>›</span>
                </div>
              </Card>

              {/* Was erwartet Sie */}
              <Card>
                <SectionLabel>💡 Was erwartet Sie im Erstgespräch?</SectionLabel>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    'Ihr individuelles Angebot mit dem größten Einsparpotential',
                    'Eine persönliche & kompetente Beratung mit Fokus auf Ihre Bedürfnisse',
                    'Besprechung aller Infos zu Kosten, Einsparungen und Förderungen',
                  ].map((t, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: DS.greenDim, border: '1px solid rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <span style={{ color: '#22c55e', fontSize: 11, fontWeight: 700 }}>✓</span>
                      </div>
                      <div style={{ fontSize: 14, color: DS.tx }}>{t}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* 2-Spalten: Einsparpotential Preview + Infos */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Card style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden', minHeight: 160 }}
                  onClick={() => setTab('einsparpotential')}>
                  <SectionLabel>€ Ihr Einsparpotential ›</SectionLabel>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80, padding: '0 8px' }}>
                    {[40,55,48,72,90,85,95,88,78,82,91,100].map((h, i) => (
                      <div key={i} style={{ flex: 1, borderRadius: '3px 3px 0 0', background: `rgba(34,197,94,${0.15 + i*0.07})`, height: `${h}%` }} />
                    ))}
                  </div>
                  {!isAfterBeratung && <LockedOverlay text="Nach dem Erstgespräch freigeschaltet" />}
                </Card>

                <Card style={{ cursor: 'pointer' }} onClick={() => setTab('informationen')}>
                  <SectionLabel>📰 Wichtige Infos für Sie</SectionLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {ARTIKEL.slice(0, 3).map((a, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', borderBottom: i < 2 ? `1px solid ${DS.bd}` : 'none' }}>
                        <span style={{ fontSize: 18 }}>{a.icon}</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: DS.tx }}>{a.title}</div>
                          <div style={{ fontSize: 11, color: DS.dm }}>{a.sub}</div>
                        </div>
                        <span style={{ marginLeft: 'auto', color: DS.dm, fontSize: 14 }}>›</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* ═══ TAB: IHR SYSTEM ═══ */}
          {tab === 'system' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Card>
                <SectionLabel>🏠 Ihr maßgeschneidertes bee-doo System</SectionLabel>
                <div style={{ fontSize: 13, color: DS.dm, marginBottom: 20 }}>
                  Entdecken Sie Klick für Klick, wie unsere Komponenten zusammen ein nachhaltiges Energiesystem bilden.
                </div>
                {!isAfterBeratung && (
                  <div style={{ background: DS.yDim, border: `1px solid ${DS.yBd}`, borderRadius: 9, padding: '10px 14px', fontSize: 12, color: DS.y, marginBottom: 16 }}>
                    ℹ️ Ihre persönliche Konfiguration wird nach dem Erstgespräch angezeigt.
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {SYSTEM_COMPONENTS.map((c, i) => (
                    <div key={i} style={{ background: DS.c2, border: `1px solid ${DS.bd}`, borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'flex-start', transition: 'all 0.15s', cursor: 'pointer' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = DS.bdHov; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = DS.bd; }}>
                      <span style={{ fontSize: 28, flexShrink: 0 }}>{c.icon}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: DS.dm, lineHeight: 1.5 }}>{c.desc}</div>
                      </div>
                      <span style={{ marginLeft: 'auto', color: DS.dm, flexShrink: 0 }}>›</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Dachplanung */}
              <Card style={{ overflow: 'hidden', position: 'relative' }}>
                <SectionLabel>🛰️ Dachplanung</SectionLabel>
                <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', height: 260 }}>
                  {isAfterBeratung ? (
                    <img src={mapUrl} alt="Dachplanung" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10 }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', background: DS.c2, borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <span style={{ fontSize: 36 }}>🔒</span>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>Dachplanung</div>
                      <div style={{ fontSize: 13, color: DS.dm }}>Steht Ihnen nach dem Erstgespräch zur Verfügung</div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          {/* ═══ TAB: EINSPARPOTENTIAL ═══ */}
          {tab === 'einsparpotential' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                {[
                  { icon: '⚡', label: 'Produziert', val: `${fmt(total_kwh)} kWh`,  color: DS.y    },
                  { icon: '🌿', label: 'CO₂ gespart', val: `${fmt(total_co2)} kg`,   color: DS.green },
                  { icon: '💶', label: 'Ersparnis',   val: `€ ${fmt(total_eur)}`,    color: DS.blue  },
                ].map(m => (
                  <Card key={m.label} style={{ textAlign: 'center', padding: 20, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{m.icon}</div>
                    <div style={{ fontSize: 10, color: DS.dm, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: m.color }}>{m.val}</div>
                    {!isAfterBeratung && <LockedOverlay text="" />}
                  </Card>
                ))}
              </div>

              {/* Chart */}
              <Card style={{ position: 'relative', overflow: 'hidden' }}>
                <SectionLabel>📈 Monatliche Produktion (kWh)</SectionLabel>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="yg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="10%" stopColor={DS.y} stopOpacity={0.25} />
                          <stop offset="90%" stopColor={DS.y} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke={DS.bd} strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fill: DS.dm, fontSize: 11, fontFamily: DS.font }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: DS.dm, fontSize: 11, fontFamily: DS.font }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTip />} />
                      <Area type="monotone" dataKey="production_kwh" stroke={DS.y} strokeWidth={2} fill="url(#yg)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 8 }}>
                    {/* Demo blur chart */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 140, filter: 'blur(3px)', opacity: 0.4 }}>
                      {[30,45,60,52,80,95,88,76,82,91,70,100].map((h,i) => (
                        <div key={i} style={{ width: 22, borderRadius: '3px 3px 0 0', background: `rgba(245,197,0,0.6)`, height: `${h}%` }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 13, color: DS.dm }}>Verfügbar nach Inbetriebnahme</span>
                  </div>
                )}
                {!isAfterBeratung && <LockedOverlay text="Nach dem Erstgespräch freigeschaltet" />}
              </Card>

              {/* CO2 */}
              <Card style={{ position: 'relative', overflow: 'hidden' }}>
                <SectionLabel>🌍 CO₂-Einsparung (kg)</SectionLabel>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke={DS.bd} strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fill: DS.dm, fontSize: 11, fontFamily: DS.font }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: DS.dm, fontSize: 11, fontFamily: DS.font }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTip />} />
                      <Bar dataKey="co2_saved_kg" fill={DS.green} opacity={0.7} radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: DS.dm, fontSize: 13 }}>
                    Daten nach Inbetriebnahme
                  </div>
                )}
                {!isAfterBeratung && <LockedOverlay text="" />}
              </Card>
            </div>
          )}

          {/* ═══ TAB: INFORMATIONEN ═══ */}
          {tab === 'informationen' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Featured */}
              <Card style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{ width: 120, height: 80, borderRadius: 10, background: 'linear-gradient(135deg, #1a1a1a, #2a2a2a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, flexShrink: 0 }}>
                  🌞
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: DS.y, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Empfohlen für Sie</div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Ihr Online-Beratungstermin — was Sie erwartet</div>
                  <div style={{ fontSize: 13, color: DS.dm, lineHeight: 1.5 }}>In Ihrem Beratungstermin schauen wir uns gemeinsam an, wie eine bee-doo Lösung für Ihr Zuhause aussehen kann.</div>
                </div>
                <button style={{ background: DS.y, color: '#0a0a0a', border: 'none', borderRadius: 9, padding: '10px 18px', fontSize: 13, fontWeight: 700, fontFamily: DS.font, cursor: 'pointer', flexShrink: 0 }}>
                  Weiterlesen →
                </button>
              </Card>

              {/* Grid */}
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: DS.dm }}>Für Sie ausgewählte Artikel</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
                  {ARTIKEL.map((a, i) => (
                    <div key={i} style={{ background: DS.c1, border: `1px solid ${DS.bd}`, borderRadius: 12, padding: 18, cursor: 'pointer', transition: 'all 0.15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = DS.bdHov; (e.currentTarget as HTMLElement).style.background = DS.c2; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = DS.bd;   (e.currentTarget as HTMLElement).style.background = DS.c1; }}>
                      <div style={{ width: '100%', height: 100, borderRadius: 8, background: `linear-gradient(135deg, #1a1a1a, #2a2a2a)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, marginBottom: 12 }}>{a.icon}</div>
                      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, lineHeight: 1.3 }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: DS.dm, marginBottom: 10 }}>{a.sub}</div>
                      <div style={{ color: DS.y, fontSize: 12, fontWeight: 600 }}>Mehr erfahren →</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* NPS / Bewertung */}
              <Card>
                <SectionLabel>⭐ Ihre Meinung zählt</SectionLabel>
                {!npsSent ? (
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Wie wahrscheinlich empfehlen Sie bee-doo weiter?</div>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                      {Array.from({length:11}, (_,n) => (
                        <button key={n} onClick={() => setNpsScore(n)} style={{ width: 38, height: 38, borderRadius: 8, border: `1px solid ${npsScore === n ? DS.y : DS.bd}`, background: npsScore === n ? DS.yDim : DS.c2, color: npsScore === n ? DS.y : DS.dm, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: DS.font, transition: 'all 0.1s' }}>{n}</button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: DS.dm, marginBottom: 14 }}>
                      <span>Gar nicht</span><span>Sehr wahrscheinlich</span>
                    </div>
                    {npsScore !== null && (
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                        <textarea value={npsNote} onChange={e => setNpsNote(e.target.value)} placeholder="Optionaler Kommentar…" rows={2} style={{ flex: 1, background: DS.c2, border: `1px solid ${DS.bd}`, borderRadius: 8, color: DS.tx, fontSize: 13, padding: 10, fontFamily: DS.font, resize: 'none', boxSizing: 'border-box' as any }} />
                        <button onClick={handleNps} style={{ background: DS.y, color: '#0a0a0a', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 13, fontFamily: DS.font, cursor: 'pointer', whiteSpace: 'nowrap' }}>Absenden</button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🙏</div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>Vielen Dank!</div>
                    <div style={{ fontSize: 13, color: DS.dm }}>Ihr Feedback hilft uns, besser zu werden.</div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ═══ TAB: DOKUMENTE ═══ */}
          {tab === 'dokumente' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Noch zu erledigen */}
              <Card>
                <SectionLabel>⏳ Noch zu erledigen</SectionLabel>
                <div style={{ background: DS.c2, border: `1px solid ${DS.bd}`, borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  onClick={() => setUploadModal('intro')}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = DS.bdHov)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = DS.bd)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 9, background: DS.yDim, border: `1px solid ${DS.yBd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📄</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>Stromrechnung hochladen <span style={{ color: DS.dm, fontWeight: 400, fontSize: 12 }}>(optional)</span></div>
                      <div style={{ fontSize: 12, color: DS.dm }}>Helfen Sie uns, Ihr Solar-Angebot vorzubereiten</div>
                    </div>
                  </div>
                  <span style={{ color: DS.dm, fontSize: 18 }}>›</span>
                </div>
              </Card>

              {/* Dokumente-Liste */}
              <Card>
                <SectionLabel>📁 Dokumente</SectionLabel>
                {documents.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {documents.map((doc: any) => (
                      <a key={doc.id} href={doc.download_url ?? '#'} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                        <div style={{ background: DS.c2, border: `1px solid ${DS.bd}`, borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'center', transition: 'all 0.15s', cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.borderColor = DS.bdHov)}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = DS.bd)}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📄</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: DS.tx, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.file_name}</div>
                            <div style={{ fontSize: 11, color: DS.dm }}>{doc.file_size ? `${(doc.file_size/1024/1024).toFixed(1)} MB · ` : ''}{format(new Date(doc.uploaded_at), 'd. MMM yyyy', { locale: de })}</div>
                          </div>
                          <span style={{ color: DS.y, fontSize: 16 }}>⬇</span>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: DS.dm, padding: '48px 0', fontSize: 13 }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>📂</div>
                    Noch keine Dokumente vorhanden.<br />
                    <span style={{ fontSize: 12 }}>Dokumente werden nach Ihrem Beratungsgespräch hochgeladen.</span>
                  </div>
                )}
              </Card>

              {/* Empfehlen */}
              <Card>
                <SectionLabel>🎁 Freunde empfehlen & 250€ sichern</SectionLabel>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                  <div style={{ background: DS.yDim, border: `1px solid ${DS.yBd}`, borderRadius: 12, padding: '14px 24px', textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 10, color: DS.dm, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Ihr Code</div>
                    <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 3, color: DS.y, marginBottom: 10 }}>{referral_code}</div>
                    <button onClick={handleCopy} style={{ background: DS.y, color: '#0a0a0a', border: 'none', borderRadius: 7, padding: '7px 14px', fontSize: 12, fontWeight: 700, fontFamily: DS.font, cursor: 'pointer' }}>
                      {copied ? '✓ Kopiert!' : 'Code kopieren'}
                    </button>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>So einfach geht's</div>
                    {['Code teilen', 'Kontakt schließt bee-doo Vertrag ab', '250€ Bonus für Sie'].map((s, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: DS.yDim, border: `1px solid ${DS.yBd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: DS.y, flexShrink: 0 }}>{i + 1}</div>
                        <div style={{ fontSize: 13, color: DS.dm }}>{s}</div>
                      </div>
                    ))}
                    <div style={{ fontSize: 12, color: DS.dm, marginTop: 8 }}>Empfohlen: <span style={{ color: DS.y, fontWeight: 700 }}>{referral_count}</span> · Bonus: <span style={{ color: DS.y, fontWeight: 700 }}>€ {fmt(referral_bonus)}</span></div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* ─── RIGHT SIDEBAR ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'sticky', top: 80 }}>

          {/* Nächster Termin */}
          {termin_at && (
            <Card style={{ padding: 18 }}>
              <SectionLabel>📅 Ihr nächster Termin</SectionLabel>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                <div style={{ background: DS.y, borderRadius: 9, padding: '8px 12px', textAlign: 'center', minWidth: 44, flexShrink: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: '#0a0a0a', lineHeight: 1 }}>{format(new Date(termin_at), 'd', { locale: de })}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#0a0a0a' }}>{format(new Date(termin_at), 'MMM', { locale: de })}</div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>🕐 {fmtT(termin_at)} Uhr (60min)</div>
                  <div style={{ fontSize: 12, color: DS.dm }}>📍 Videoanruf</div>
                  <span style={{ color: DS.y, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>So funktioniert's →</span>
                </div>
              </div>
              <button disabled style={{ width: '100%', background: DS.c3, border: `1px solid ${DS.bd}`, borderRadius: 8, padding: '10px 0', color: DS.dm, fontFamily: DS.font, fontWeight: 600, fontSize: 13, cursor: 'not-allowed' }}>
                Videoanruf beitreten →
              </button>
              <div style={{ fontSize: 10, color: DS.dm, textAlign: 'center', marginTop: 6 }}>Link verfügbar 24h vorher</div>
            </Card>
          )}

          {/* Dachplanung */}
          <Card style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setTab('system')}>
            <div style={{ padding: '14px 18px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: DS.dm }}>☀️ Ihre Dachplanung</div>
              <span style={{ color: DS.y, fontSize: 12, fontWeight: 600 }}>›</span>
            </div>
            <div style={{ height: 140, position: 'relative' }}>
              {isAfterBeratung ? (
                <img src={mapUrl} alt="Dach" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: DS.c2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <span style={{ fontSize: 28 }}>🔒</span>
                  <div style={{ fontSize: 11, color: DS.dm, textAlign: 'center', padding: '0 16px' }}>Steht nach dem Erstgespräch zur Verfügung</div>
                </div>
              )}
            </div>
          </Card>

          {/* FAQ */}
          <Card style={{ padding: 18 }}>
            <SectionLabel>❓ Häufige Fragen</SectionLabel>
            {FAQ_ITEMS.map((q, i) => (
              <div key={i} style={{ borderBottom: i < FAQ_ITEMS.length - 1 ? `1px solid ${DS.bd}` : 'none' }}>
                <div style={{ padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                  {q}
                  <span style={{ color: DS.dm, fontSize: 16, marginLeft: 8, flexShrink: 0, transform: faqOpen === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
                </div>
                {faqOpen === i && (
                  <div style={{ fontSize: 12, color: DS.dm, padding: '0 0 12px', lineHeight: 1.6 }}>
                    {i === 0 && 'Bitte halten Sie, falls vorhanden, Ihre aktuelle Stromrechnung bereit. Weitere Unterlagen sind nicht erforderlich.'}
                    {i === 1 && 'Das Erstgespräch dauert ca. 60 Minuten. Wir nehmen uns Zeit für Ihre individuellen Fragen.'}
                    {i === 2 && 'Ja, Sie können Ihren Termin bis zu 24h vorher über Ihren Berater verschieben.'}
                  </div>
                )}
              </div>
            ))}
          </Card>

          {/* Bewertungen */}
          <Card style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: 'white', borderRadius: 8, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Stars n={5} size={12} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#0a0a0a' }}>4,8</span>
              </div>
              <span style={{ fontSize: 11, color: DS.dm }}>auf Google</span>
            </div>
          </Card>

          {/* Prämie */}
          <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', border: `1px solid rgba(245,197,0,0.15)`, borderRadius: DS.radius, padding: 18, cursor: 'pointer' }}
            onClick={() => setTab('dokumente')}>
            <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>250€ Prämie →</div>
            <div style={{ fontSize: 12, color: DS.dm, lineHeight: 1.5 }}>Freunde einladen, Stromkosten senken und gemeinsam profitieren.</div>
          </div>
        </div>
      </div>

      {/* ─── FOOTER ─── */}
      <div style={{ borderTop: `1px solid ${DS.bd}`, padding: '20px 24px', textAlign: 'center', color: DS.dm, fontSize: 12, marginTop: 40 }}>
        bee-doo GmbH © 2026 · 
        <a href="/impressum" style={{ color: DS.dm, textDecoration: 'none', marginLeft: 8 }}>Impressum</a> · 
        <a href="/datenschutz" style={{ color: DS.dm, textDecoration: 'none', marginLeft: 8 }}>Datenschutz</a>
      </div>

      {/* ─── UPLOAD MODAL ─── */}
      {uploadModal !== 'closed' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: DS.c1, border: `1px solid ${DS.bd}`, borderRadius: 20, padding: 32, maxWidth: 460, width: '100%', position: 'relative' }}>
            <button onClick={() => setUploadModal('closed')} style={{ position: 'absolute', top: 16, right: 16, background: DS.c2, border: `1px solid ${DS.bd}`, borderRadius: '50%', width: 32, height: 32, color: DS.dm, cursor: 'pointer', fontFamily: DS.font, fontSize: 16 }}>✕</button>

            {/* Intro */}
            {uploadModal === 'intro' && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>📄</div>
                <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Laden Sie Ihre Stromrechnung hoch</div>
                <div style={{ fontSize: 14, color: DS.dm, lineHeight: 1.6, marginBottom: 28 }}>Helfen Sie uns, Ihr Solar-Angebot vorzubereiten</div>
                <button onClick={() => setUploadModal('guide')} style={{ width: '100%', background: DS.y, color: '#0a0a0a', border: 'none', borderRadius: 10, padding: '14px 0', fontSize: 15, fontWeight: 700, fontFamily: DS.font, cursor: 'pointer', marginBottom: 12 }}>
                  Weiter
                </button>
                <div style={{ fontSize: 13, color: DS.dm, cursor: 'pointer' }} onClick={() => setUploadModal('closed')}>Nicht jetzt</div>
              </div>
            )}

            {/* Anleitung */}
            {uploadModal === 'guide' && (
              <div>
                <button onClick={() => setUploadModal('intro')} style={{ background: 'none', border: 'none', color: DS.y, cursor: 'pointer', fontFamily: DS.font, fontSize: 13, fontWeight: 600, marginBottom: 16, padding: 0 }}>‹ Zurück</button>
                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 20, textAlign: 'center' }}>Die richtige Stromrechnung ist:</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {[
                    { icon: '📅', label: 'Aktuell',      desc: 'Nicht älter als 1. Januar 2025.'              },
                    { icon: '📋', label: 'Vollständig',  desc: 'Jahresabrechnung, keine Abschlagsrechnung.'    },
                    { icon: '📍', label: 'Adressiert',   desc: 'Mit Liefer- und Postanschrift.'                },
                    { icon: '#',  label: 'Eindeutig',    desc: 'Mit Zähler- und Messlokationsnummer.'          },
                  ].map((item, i) => (
                    <div key={i} style={{ background: DS.c2, border: `1px solid ${DS.bd}`, borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: DS.yDim, border: `1px solid ${DS.yBd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{item.icon}</div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{item.label}</div>
                        <div style={{ fontSize: 12, color: DS.dm }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setUploadModal('upload')} style={{ width: '100%', background: DS.y, color: '#0a0a0a', border: 'none', borderRadius: 10, padding: '14px 0', fontSize: 15, fontWeight: 700, fontFamily: DS.font, cursor: 'pointer', marginBottom: 12 }}>
                  Verstanden
                </button>
                <div style={{ fontSize: 13, color: DS.dm, textAlign: 'center', cursor: 'pointer' }} onClick={() => setUploadModal('closed')}>Später hochladen</div>
              </div>
            )}

            {/* Upload */}
            {uploadModal === 'upload' && (
              <div>
                <button onClick={() => setUploadModal('guide')} style={{ background: 'none', border: 'none', color: DS.y, cursor: 'pointer', fontFamily: DS.font, fontSize: 13, fontWeight: 600, marginBottom: 16, padding: 0 }}>‹ Zurück</button>
                <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 20, textAlign: 'center' }}>Stromrechnung hochladen</div>
                <label style={{ display: 'block', border: `2px dashed ${DS.bdHov}`, borderRadius: 12, padding: '36px 24px', textAlign: 'center', cursor: 'pointer', background: DS.c2 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>⬆️</div>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>Dateien oder Bilder hier ablegen</div>
                  <div style={{ fontSize: 12, color: DS.y, fontWeight: 600, marginBottom: 4 }}>oder hier klicken</div>
                  <div style={{ fontSize: 11, color: DS.dm }}>PDF, JPG, PNG bis zu 10 MB (max. 10 Dateien)</div>
                  <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple style={{ display: 'none' }} />
                </label>
                <button disabled style={{ width: '100%', background: DS.c3, border: `1px solid ${DS.bd}`, borderRadius: 10, padding: '14px 0', fontSize: 15, fontWeight: 700, fontFamily: DS.font, cursor: 'not-allowed', color: DS.dm, marginTop: 16, marginBottom: 12 }}>
                  Abschicken
                </button>
                <div style={{ fontSize: 13, color: DS.dm, textAlign: 'center', cursor: 'pointer' }} onClick={() => setUploadModal('closed')}>Später hochladen</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
