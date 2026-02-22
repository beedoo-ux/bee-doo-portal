'use client';
// =============================================================
// app/portal/PortalClient.tsx – bee-doo Design System
// Font: DM Sans | BG: #0c1222 | Akzent: #FDE154
// =============================================================
import { useState, useEffect, useTransition } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { createClient } from '@/lib/supabase';
import type { CustomerPortalView, Milestone, Document, MonitoringMonthly, Referral } from '@/types/database';

// ─── bee-doo Design System ────────────────────────────────────
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

const TABS = [
  { id: 'status',     icon: '📋', label: 'Projektstatus'      },
  { id: 'dokumente',  icon: '📄', label: 'Dokumente'           },
  { id: 'monitoring', icon: '⚡', label: 'Monitoring'          },
  { id: 'bewertungen',icon: '⭐', label: 'Bewertungen'         },
  { id: 'referral',   icon: '🎁', label: 'Empfehlen & Sparen'  },
] as const;
type TabId = typeof TABS[number]['id'];

interface TrustpilotReview {
  id: string; stars: number; title: string | null; text: string;
  author_name: string; author_location: string | null;
  created_at_tp: string; response: string | null;
}

interface Props {
  snapshot: CustomerPortalView; milestones: Milestone[];
  documents: Document[]; monitoring: MonitoringMonthly[]; referrals: Referral[];
}

const fmt  = (n: number) => n.toLocaleString('de-DE', { maximumFractionDigits: 0 });
const fmtD = (d: string | null) => d ? format(new Date(d), 'd. MMM yyyy', { locale: de }) : '–';

const Card = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div style={{ background: DS.c1, border: `1px solid ${DS.bd}`, borderRadius: 12, padding: 24, ...style }}>{children}</div>
);
const Label = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase', color: DS.dm, marginBottom: 14 }}>{children}</div>
);
const Stars = ({ n, size = 15 }: { n: number; size?: number }) => (
  <div style={{ display: 'flex', gap: 1 }}>
    {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: size, color: i <= n ? DS.y : DS.bd }}>★</span>)}
  </div>
);
const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: DS.c2, border: `1px solid ${DS.bd}`, borderRadius: 8, padding: '8px 14px', fontSize: 13, fontFamily: DS.font }}>
      <div style={{ color: DS.dm, marginBottom: 4 }}>{label}</div>
      {payload.map((p: any) => <div key={p.name} style={{ color: p.color, fontWeight: 600 }}>{fmt(p.value)} {p.name === 'production_kwh' ? 'kWh' : 'kg CO₂'}</div>)}
    </div>
  );
};

// =============================================================
export default function PortalClient({ snapshot, milestones, documents, monitoring, referrals }: Props) {
  const [tab, setTab]           = useState<TabId>('status');
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [npsNote, setNpsNote]   = useState('');
  const [npsSent, setNpsSent]   = useState(false);
  const [copied, setCopied]     = useState(false);
  const [reviews, setReviews]   = useState<TrustpilotReview[]>([]);
  const [revLoading, setRL]     = useState(false);
  const [revSource, setRS]      = useState('');
  const [, startTransition]     = useTransition();
  const supabase = createClient();

  const { first_name, referral_code, total_kwh, total_co2_kg, total_revenue_eur, referral_count, referral_bonus_total } = snapshot;
  const doneCount   = milestones.filter(m => m.status === 'done').length;
  const activeMs    = milestones.find(m => m.status === 'active');
  const progressPct = Math.round((doneCount / Math.max(milestones.length, 1)) * 100);
  const chartData   = monitoring.map(m => ({
    label: format(new Date(m.month), 'MMM yy', { locale: de }),
    production_kwh: m.production_kwh, co2_saved_kg: m.co2_saved_kg,
  }));

  useEffect(() => {
    if (tab !== 'bewertungen' || reviews.length) return;
    setRL(true);
    fetch('/api/trustpilot?minStars=4&limit=6')
      .then(r => r.json()).then(d => { setReviews(d.reviews ?? []); setRS(d.source); })
      .catch(() => {}).finally(() => setRL(false));
  }, [tab]);

  const handleLogout = () => startTransition(async () => { await supabase.auth.signOut(); window.location.href = '/login'; });
  const handleNps = async () => {
    if (npsScore === null) return;
    await supabase.from('nps_responses').insert({ customer_id: snapshot.customer_id, score: npsScore, comment: npsNote || null, trigger: 'portal' });
    setNpsSent(true);
  };
  const handleCopy = () => { navigator.clipboard.writeText(referral_code); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      <div style={{ minHeight: '100vh', background: DS.bg, color: DS.tx, fontFamily: DS.font }}>

        {/* HEADER */}
        <header style={{ position: 'sticky', top: 0, zIndex: 100, background: `${DS.bg}f0`, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${DS.bd}`, height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ background: DS.y, borderRadius: 7, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>☀️</div>
            <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.3px' }}>bee<span style={{ color: DS.y }}>-doo</span></span>
            <span style={{ fontSize: 12, color: DS.dm }}>Portal</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: DS.dm }}>{snapshot.first_name} {snapshot.last_name}</span>
            <button onClick={handleLogout} style={{ background: 'transparent', border: `1px solid ${DS.bd}`, borderRadius: 7, color: DS.dm, fontSize: 12, padding: '5px 12px', cursor: 'pointer', fontFamily: DS.font }}>Abmelden</button>
          </div>
        </header>

        <div style={{ maxWidth: 1140, margin: '0 auto', padding: '36px 22px 80px' }}>

          {/* HERO */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 5 }}>
              Hallo, <span style={{ color: DS.y }}>{first_name}</span> ☀️
            </h1>
            <p style={{ color: DS.dm, fontSize: 13, marginBottom: 20 }}>Auftrag #{snapshot.project_number} · {snapshot.capacity_kwp} kWp · {snapshot.zip} {snapshot.city}</p>

            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 28 }}>
              {activeMs && <Chip color="y" dot>{activeMs.title}</Chip>}
              {snapshot.installation_date && <Chip color="g" dot>Installation: {fmtD(snapshot.installation_date)}</Chip>}
              <Chip color="b">{documents.length} Dokumente</Chip>
              <Chip color="y" pointer onClick={() => window.open('https://de.trustpilot.com/review/bee-doo.de', '_blank')}>⭐ Uns bewerten</Chip>
            </div>

            <div style={{ display: 'flex', gap: 3, background: DS.c1, border: `1px solid ${DS.bd}`, borderRadius: 11, padding: 3, overflowX: 'auto' }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, minWidth: 100, padding: '8px 10px', borderRadius: 8, border: `1px solid ${tab === t.id ? DS.bd : 'transparent'}`, background: tab === t.id ? DS.c2 : 'transparent', color: tab === t.id ? DS.tx : DS.dm, fontSize: 12, fontWeight: 600, fontFamily: DS.font, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, whiteSpace: 'nowrap', transition: 'all 0.12s' }}>
                  <span style={{ color: tab === t.id ? DS.y : 'inherit' }}>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>
          </div>

          {/* TAB: STATUS */}
          {tab === 'status' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}>
              <Card>
                <Label>Projektfortschritt</Label>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{progressPct} %</div>
                  <div style={{ fontSize: 12, color: DS.dm }}>Schritt {doneCount}/{milestones.length}</div>
                </div>
                <div style={{ height: 5, background: DS.c2, borderRadius: 100, overflow: 'hidden', marginBottom: 28 }}>
                  <div style={{ height: '100%', width: `${progressPct}%`, background: DS.y, borderRadius: 100, boxShadow: `0 0 8px ${DS.yBd}` }} />
                </div>
                {milestones.map((ms, i) => (
                  <div key={ms.id} style={{ display: 'flex', gap: 14, paddingBottom: i < milestones.length - 1 ? 22 : 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 30, flexShrink: 0 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, border: '2px solid', background: ms.status === 'done' ? DS.greenDim : ms.status === 'active' ? DS.yDim : DS.c2, borderColor: ms.status === 'done' ? DS.green : ms.status === 'active' ? DS.y : DS.bd, zIndex: 1 }}>
                        {ms.status === 'done' ? '✓' : ms.status === 'active' ? '→' : ''}
                      </div>
                      {i < milestones.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 18, margin: '2px 0', background: ms.status === 'done' ? `${DS.green}40` : ms.status === 'active' ? `${DS.y}28` : DS.bd }} />}
                    </div>
                    <div style={{ paddingTop: 4, flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2, color: ms.status === 'active' ? DS.y : ms.status === 'done' ? DS.tx : DS.dm }}>{ms.title}</div>
                      <div style={{ fontSize: 11, color: DS.dm }}>{ms.done_date ? fmtD(ms.done_date) : ms.planned_date ? `geplant: ${fmtD(ms.planned_date)}` : ''}</div>
                      {ms.note && ms.status !== 'pending' && <div style={{ fontSize: 12, color: `${DS.tx}99`, lineHeight: 1.5, marginTop: 3 }}>{ms.note}</div>}
                    </div>
                  </div>
                ))}
              </Card>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ background: DS.greenDim, border: '1px solid rgba(34,197,94,0.18)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 22 }}>💬</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: DS.green }}>WhatsApp-Benachrichtigungen aktiv</div>
                    <div style={{ fontSize: 12, color: DS.dm }}>Sie werden automatisch bei jedem Status-Update informiert.</div>
                  </div>
                </div>
                {snapshot.installation_date && (
                  <Card>
                    <Label>Nächster Termin</Label>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                      <div style={{ background: DS.yDim, border: `1px solid ${DS.yBd}`, borderRadius: 10, padding: '10px 14px', textAlign: 'center', minWidth: 56, flexShrink: 0 }}>
                        <div style={{ fontSize: 10, color: DS.dm, textTransform: 'uppercase', letterSpacing: 1 }}>{format(new Date(snapshot.installation_date), 'MMM', { locale: de })}</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: DS.y, lineHeight: 1 }}>{format(new Date(snapshot.installation_date), 'd')}</div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, marginBottom: 2 }}>Installation</div>
                        <div style={{ fontSize: 12, color: DS.dm }}>08:00 – ca. 16:00 Uhr</div>
                      </div>
                    </div>
                    <div style={{ height: 1, background: DS.bd, margin: '12px 0' }} />
                    <div style={{ fontSize: 12, color: DS.dm }}>Fragen: <span style={{ color: DS.y }}>0521 9876 543</span></div>
                  </Card>
                )}
                <Card>
                  <Label>Ihre Anlage</Label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {[['Leistung', snapshot.capacity_kwp ? `${snapshot.capacity_kwp} kWp` : '–'], ['Speicher', snapshot.storage_kwh ? `${snapshot.storage_kwh} kWh` : '–'], ['Module', snapshot.module_count ? `${snapshot.module_count} Stück` : '–'], ['Wechselrichter', snapshot.inverter_model ?? '–'], ['Ausrichtung', snapshot.orientation ?? '–'], ['Jahresprognose', snapshot.annual_yield_kwh ? `${fmt(snapshot.annual_yield_kwh)} kWh` : '–']].map(([l, v]) => (
                      <div key={l}>
                        <div style={{ fontSize: 10, color: DS.dm, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 }}>{l}</div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB: DOKUMENTE */}
          {tab === 'dokumente' && (
            <div>
              <SectionTitle>Dokumente <Badge>{documents.length}</Badge></SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {documents.map(doc => (
                  <a key={doc.id} href={doc.download_url ?? '#'} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                    <div style={{ background: DS.c1, border: `1px solid ${DS.bd}`, borderRadius: 10, padding: 14, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'border-color 0.12s' }} onMouseEnter={e => (e.currentTarget.style.borderColor = DS.yBd)} onMouseLeave={e => (e.currentTarget.style.borderColor = DS.bd)}>
                      <div style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>📄</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: DS.tx, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.file_name}</div>
                        <div style={{ fontSize: 11, color: DS.dm }}>{doc.file_size ? `${(doc.file_size/1024/1024).toFixed(1)} MB · ` : ''}{format(new Date(doc.uploaded_at), 'd. MMM yyyy', { locale: de })}</div>
                      </div>
                      <span style={{ color: DS.y }}>⬇</span>
                    </div>
                  </a>
                ))}
                {!documents.length && <div style={{ gridColumn: 'span 2', textAlign: 'center', color: DS.dm, padding: 48, fontSize: 13 }}>Dokumente werden nach Installation hochgeladen.</div>}
              </div>
            </div>
          )}

          {/* TAB: MONITORING */}
          {tab === 'monitoring' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 14 }}>
                {[{ icon: '⚡', label: 'Produziert', val: `${fmt(total_kwh)} kWh`, color: DS.y }, { icon: '🌿', label: 'CO₂ gespart', val: `${fmt(total_co2_kg)} kg`, color: DS.green }, { icon: '💶', label: 'Ersparnis', val: `€ ${fmt(total_revenue_eur)}`, color: DS.blue }].map(m => (
                  <Card key={m.label} style={{ padding: 18 }}>
                    <div style={{ fontSize: 20, marginBottom: 8 }}>{m.icon}</div>
                    <div style={{ fontSize: 10, color: DS.dm, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: m.color }}>{m.val}</div>
                  </Card>
                ))}
              </div>
              {chartData.length > 0 ? (
                <>
                  <Card style={{ marginBottom: 12 }}>
                    <Label>Monatliche Produktion (kWh)</Label>
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <defs><linearGradient id="yg" x1="0" y1="0" x2="0" y2="1"><stop offset="10%" stopColor={DS.y} stopOpacity={0.22} /><stop offset="90%" stopColor={DS.y} stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid stroke={DS.bd} strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={{ fill: DS.dm, fontSize: 11, fontFamily: DS.font }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: DS.dm, fontSize: 11, fontFamily: DS.font }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTip />} />
                        <Area type="monotone" dataKey="production_kwh" stroke={DS.y} strokeWidth={2} fill="url(#yg)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Card>
                  <Card>
                    <Label>CO₂-Einsparung (kg)</Label>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke={DS.bd} strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={{ fill: DS.dm, fontSize: 11, fontFamily: DS.font }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: DS.dm, fontSize: 11, fontFamily: DS.font }} axisLine={false} tickLine={false} />
                        <Tooltip content={<ChartTip />} />
                        <Bar dataKey="co2_saved_kg" fill={DS.green} opacity={0.75} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                </>
              ) : <Card style={{ textAlign: 'center', color: DS.dm, padding: 48, fontSize: 13 }}>Monitoring-Daten stehen nach der Inbetriebnahme zur Verfügung.</Card>}
            </div>
          )}

          {/* TAB: BEWERTUNGEN */}
          {tab === 'bewertungen' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
                <div>
                  <SectionTitle>Was unsere Kunden sagen</SectionTitle>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: -12 }}>
                    <Stars n={5} size={18} />
                    <span style={{ fontSize: 20, fontWeight: 800 }}>4,8</span>
                    <span style={{ fontSize: 12, color: DS.dm }}>· Trustpilot{revSource === 'demo' ? ' (Beispiel)' : ''}</span>
                  </div>
                </div>
                <a href="https://de.trustpilot.com/review/bee-doo.de" target="_blank" rel="noreferrer"
                  style={{ background: DS.y, color: DS.bg, borderRadius: 9, padding: '9px 18px', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>
                  ⭐ Bewertung schreiben
                </a>
              </div>

              {/* CTA */}
              <div style={{ background: DS.yDim, border: `1px solid ${DS.yBd}`, borderRadius: 10, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 24 }}>🙏</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>Helfen Sie anderen Hausbesitzern!</div>
                  <div style={{ fontSize: 12, color: DS.dm }}>Teilen Sie Ihre Erfahrung auf Trustpilot.{' '}
                    <a href="https://de.trustpilot.com/review/bee-doo.de" target="_blank" rel="noreferrer" style={{ color: DS.y, textDecoration: 'none', fontWeight: 700 }}>Jetzt bewerten →</a>
                  </div>
                </div>
              </div>

              {revLoading ? (
                <div style={{ textAlign: 'center', color: DS.dm, padding: 48 }}>Lade Bewertungen…</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {reviews.map(r => (
                    <div key={r.id} style={{ background: DS.c1, border: `1px solid ${DS.bd}`, borderRadius: 12, padding: 20, transition: 'border-color 0.12s' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = DS.yBd)} onMouseLeave={e => (e.currentTarget.style.borderColor = DS.bd)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <Stars n={r.stars} />
                        <span style={{ fontSize: 11, color: DS.dm }}>{format(new Date(r.created_at_tp), 'MMM yyyy', { locale: de })}</span>
                      </div>
                      {r.title && <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>{r.title}</div>}
                      <div style={{ fontSize: 13, color: `${DS.tx}cc`, lineHeight: 1.6, marginBottom: 12 }}>
                        {r.text.length > 200 ? r.text.substring(0, 200) + '…' : r.text}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 10, borderTop: `1px solid ${DS.bd}` }}>
                        <div style={{ width: 26, height: 26, borderRadius: '50%', background: DS.c2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: DS.y, flexShrink: 0 }}>{r.author_name.charAt(0)}</div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{r.author_name}</div>
                          {r.author_location && <div style={{ fontSize: 10, color: DS.dm }}>{r.author_location}</div>}
                        </div>
                      </div>
                      {r.response && (
                        <div style={{ marginTop: 10, background: DS.c2, borderRadius: 8, padding: '9px 12px', borderLeft: `3px solid ${DS.y}` }}>
                          <div style={{ fontSize: 10, color: DS.y, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>bee-doo antwortet</div>
                          <div style={{ fontSize: 12, color: DS.dm, lineHeight: 1.5 }}>{r.response.length > 130 ? r.response.substring(0, 130) + '…' : r.response}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: DS.dm }}>
                Bewertungen von{' '}
                <a href="https://de.trustpilot.com/review/bee-doo.de" target="_blank" rel="noreferrer" style={{ color: '#00b67a', fontWeight: 700, textDecoration: 'none' }}>★ Trustpilot</a>
                {' '}· Nur verifizierte Käufer · mind. 4 Sterne
              </div>
            </div>
          )}

          {/* TAB: REFERRAL */}
          {tab === 'referral' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}>
              <div>
                <SectionTitle>Freunde empfehlen</SectionTitle>
                <div style={{ background: DS.yDim, border: `1px solid ${DS.yBd}`, borderRadius: 14, padding: 26, textAlign: 'center', marginBottom: 12 }}>
                  <div style={{ fontSize: 10, color: DS.dm, textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 10 }}>Ihr persönlicher Code</div>
                  <div style={{ fontSize: 36, fontWeight: 900, letterSpacing: 4, color: DS.y, marginBottom: 14 }}>{referral_code}</div>
                  <button onClick={handleCopy} style={{ background: DS.y, color: DS.bg, border: 'none', borderRadius: 9, padding: '9px 22px', fontSize: 13, fontWeight: 700, fontFamily: DS.font, cursor: 'pointer' }}>{copied ? '✓ Kopiert!' : 'Code kopieren'}</button>
                </div>
                <Card>
                  <div style={{ fontWeight: 700, marginBottom: 14 }}>So funktioniert's</div>
                  {['Code weitergeben', 'Kontakt schließt bee-doo Vertrag ab', '€ 250 Bonus für Sie – automatisch'].map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < 2 ? 10 : 0, alignItems: 'flex-start' }}>
                      <div style={{ width: 22, height: 22, borderRadius: '50%', background: DS.yDim, border: `1px solid ${DS.yBd}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: DS.y, flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ fontSize: 13, color: DS.dm, paddingTop: 2 }}>{s}</div>
                    </div>
                  ))}
                  <div style={{ height: 1, background: DS.bd, margin: '14px 0' }} />
                  <div style={{ fontSize: 12, color: DS.dm }}>Empfohlen: <span style={{ color: DS.y, fontWeight: 700 }}>{referral_count}</span> · Bonus: <span style={{ color: DS.y, fontWeight: 700 }}>€ {fmt(referral_bonus_total)}</span></div>
                </Card>
              </div>
              <div>
                <SectionTitle>Ihre Meinung</SectionTitle>
                {!npsSent ? (
                  <Card style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Wie wahrscheinlich empfehlen Sie bee-doo?</div>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 7 }}>
                      {Array.from({ length: 11 }, (_, n) => (
                        <button key={n} onClick={() => setNpsScore(n)} style={{ flex: 1, aspectRatio: '1', borderRadius: 6, border: `1px solid ${npsScore === n ? DS.y : DS.bd}`, background: npsScore === n ? DS.yDim : DS.c2, color: npsScore === n ? DS.y : DS.dm, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: DS.font, transition: 'all 0.1s' }}>{n}</button>
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: DS.dm, marginBottom: 14 }}><span>Gar nicht</span><span>Sehr wahrscheinlich</span></div>
                    {npsScore !== null && (
                      <>
                        <textarea value={npsNote} onChange={e => setNpsNote(e.target.value)} placeholder="Optionaler Kommentar…" rows={3} style={{ width: '100%', background: DS.c2, border: `1px solid ${DS.bd}`, borderRadius: 7, color: DS.tx, fontSize: 13, padding: 10, fontFamily: DS.font, resize: 'vertical', marginBottom: 10, boxSizing: 'border-box' }} />
                        <button onClick={handleNps} style={{ background: DS.y, color: DS.bg, border: 'none', borderRadius: 8, padding: '9px 18px', fontWeight: 700, fontSize: 13, fontFamily: DS.font, cursor: 'pointer' }}>Absenden</button>
                      </>
                    )}
                  </Card>
                ) : (
                  <Card style={{ textAlign: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>🙏</div>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>Vielen Dank!</div>
                    <div style={{ fontSize: 13, color: DS.dm }}>Ihr Feedback hilft uns, besser zu werden.</div>
                  </Card>
                )}
                <SectionTitle style={{ marginTop: 6 }}>Das könnte Sie interessieren</SectionTitle>
                {[{ icon: '🔋', name: 'Batteriespeicher-Upgrade', desc: 'Kapazität auf 20 kWh erweitern' }, { icon: '🚗', name: 'Wallbox', desc: 'Laden mit eigenem Sonnenstrom' }, { icon: '🌡️', name: 'Wärmepumpe', desc: 'Heizen & kühlen mit Solarstrom' }].map(u => (
                  <div key={u.name} style={{ background: DS.c1, border: `1px solid ${DS.bd}`, borderRadius: 9, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', marginBottom: 8, transition: 'all 0.12s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = DS.yBd; (e.currentTarget as HTMLElement).style.background = DS.c2; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = DS.bd; (e.currentTarget as HTMLElement).style.background = DS.c1; }}>
                    <span style={{ fontSize: 24 }}>{u.icon}</span>
                    <div><div style={{ fontWeight: 600, fontSize: 13, marginBottom: 1 }}>{u.name}</div><div style={{ fontSize: 12, color: DS.dm }}>{u.desc}</div></div>
                    <div style={{ marginLeft: 'auto', color: DS.dm }}>→</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SectionTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, ...style }}>{children}</div>;
}
function Badge({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: DS.yDim, color: DS.y, border: `1px solid ${DS.yBd}` }}>{children}</span>;
}
function Chip({ children, color, dot, pointer, onClick }: { children: React.ReactNode; color: 'y'|'g'|'b'; dot?: boolean; pointer?: boolean; onClick?: () => void }) {
  const c = { y: { bg: DS.yDim, bd: DS.yBd, tx: DS.y }, g: { bg: DS.greenDim, bd: 'rgba(34,197,94,0.18)', tx: DS.green }, b: { bg: DS.blueDim, bd: 'rgba(59,130,246,0.18)', tx: DS.blue } }[color];
  return (
    <div onClick={onClick} style={{ padding: '4px 11px', borderRadius: 100, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5, border: `1px solid ${c.bd}`, background: c.bg, color: c.tx, cursor: pointer ? 'pointer' : 'default' }}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />}
      {children}
    </div>
  );
}
