// =============================================================
// app/api/trustpilot/route.ts
// Lädt bee-doo Reviews von Trustpilot und cached sie in Supabase
// Öffentlicher GET-Endpoint für das Portal
// =============================================================
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createServerSupabase } from '@/lib/supabase-server';

const TP_API_KEY       = process.env.TRUSTPILOT_API_KEY!;
const TP_BUSINESS_ID   = process.env.TRUSTPILOT_BUSINESS_UNIT_ID!;
// Business Unit ID findest du unter:
// https://www.trustpilot.com/review/bee-doo.de → URL enthält die ID
// Oder: GET https://api.trustpilot.com/v1/business-units/find?name=bee-doo.de

// ─── Trustpilot API: Reviews holen ────────────────────────────
async function fetchTrustpilotReviews(minStars: number = 4, perPage: number = 20) {
  const params = new URLSearchParams({
    stars:   [5, 4, 3, 2, 1].filter(s => s >= minStars).join(','),
    orderBy: 'createdat.desc',
    perPage: String(perPage),
    language: 'de',
  });

  const res = await fetch(
    `https://api.trustpilot.com/v1/business-units/${TP_BUSINESS_ID}/reviews?${params}`,
    {
      headers: { apikey: TP_API_KEY },
      next: { revalidate: 3600 }, // 1h Cache auf Next.js Ebene
    }
  );

  if (!res.ok) throw new Error(`Trustpilot API ${res.status}: ${await res.text()}`);
  return res.json();
}

// ─── GET: Reviews aus Cache (Supabase) oder live ──────────────
export async function GET(request: NextRequest) {
  const supabase = createServerSupabase();
  const { searchParams } = new URL(request.url);
  const minStars  = parseInt(searchParams.get('minStars') ?? '4');
  const limit     = parseInt(searchParams.get('limit') ?? '6');
  const forceSync = searchParams.get('sync') === '1';

  // Aus Cache laden (letzte 24h)
  if (!forceSync) {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: cached } = await supabase
      .from('trustpilot_reviews')
      .select('*')
      .gte('stars', minStars)
      .eq('is_visible', true)
      .gte('cached_at', cutoff)
      .order('created_at_tp', { ascending: false })
      .limit(limit);

    if (cached && cached.length > 0) {
      return NextResponse.json({ reviews: cached, source: 'cache' });
    }
  }

  // Falls kein API Key konfiguriert → Demo-Daten
  if (!TP_API_KEY || !TP_BUSINESS_ID) {
    return NextResponse.json({ reviews: DEMO_REVIEWS.filter(r => r.stars >= minStars).slice(0, limit), source: 'demo' });
  }

  // Live von Trustpilot
  try {
    const data = await fetchTrustpilotReviews(minStars, limit + 10);

    const reviews = (data.reviews ?? []).map((r: any) => ({
      id:              r.id,
      stars:           r.stars,
      title:           r.title,
      text:            r.text,
      author_name:     r.consumer?.displayName ?? 'Anonym',
      author_location: r.consumer?.countryCode ?? null,
      created_at_tp:   r.createdAt,
      response:        r.companyReply?.text ?? null,
      cached_at:       new Date().toISOString(),
      is_visible:      true,
    }));

    // In Supabase cachen (upsert)
    if (reviews.length > 0) {
      await supabase.from('trustpilot_reviews').upsert(reviews, { onConflict: 'id' });
    }

    return NextResponse.json({
      reviews: reviews.filter((r: any) => r.stars >= minStars).slice(0, limit),
      source: 'api',
      totalFromTP: data.totalNumberOfReviews,
    });

  } catch (err: any) {
    console.error('Trustpilot fetch error:', err.message);
    // Fallback auf Cache (auch ältere)
    const { data: fallback } = await supabase
      .from('trustpilot_reviews')
      .select('*')
      .gte('stars', minStars)
      .eq('is_visible', true)
      .order('created_at_tp', { ascending: false })
      .limit(limit);

    return NextResponse.json({
      reviews: fallback ?? DEMO_REVIEWS,
      source: 'fallback',
      error: err.message,
    });
  }
}

// ─── Demo-Daten (solange kein API Key konfiguriert) ───────────
const DEMO_REVIEWS = [
  {
    id: 'demo-1',
    stars: 5,
    title: 'Rundum perfekter Service!',
    text: 'Von der Beratung bis zur Inbetriebnahme war alles top. Das Team hat sich wirklich Zeit genommen, alles verständlich erklärt und der Installationstermin wurde exakt eingehalten. Unsere Anlage läuft seit 3 Monaten einwandfrei. Volle Empfehlung!',
    author_name: 'Thomas K.',
    author_location: 'Bielefeld',
    created_at_tp: new Date(Date.now() - 7 * 86400000).toISOString(),
    response: 'Vielen Dank, Thomas! Wir freuen uns riesig über Ihr Feedback und wünschen weiterhin viel Sonnenstrom! ☀️',
    cached_at: new Date().toISOString(),
    is_visible: true,
  },
  {
    id: 'demo-2',
    stars: 5,
    title: 'Schnell, zuverlässig, kompetent',
    text: 'Ich war skeptisch bei so einem großen Projekt, aber bee-doo hat meine Erwartungen übertroffen. Die Monteure waren pünktlich, sauber und haben alles sorgfältig erklärt. Das Kunden-Portal ist sehr übersichtlich. Super Preis-Leistungs-Verhältnis.',
    author_name: 'Sabine M.',
    author_location: 'Gütersloh',
    created_at_tp: new Date(Date.now() - 14 * 86400000).toISOString(),
    response: null,
    cached_at: new Date().toISOString(),
    is_visible: true,
  },
  {
    id: 'demo-3',
    stars: 5,
    title: 'Bestes Unternehmen für Solaranlagen',
    text: 'Nachdem ich drei Angebote verglichen habe, war bee-doo das überzeugendste. Transparente Preise, kompetente Beratung und eine reibungslose Installation. Die Anlage produziert sogar mehr als prognostiziert. Sehr zu empfehlen!',
    author_name: 'Michael R.',
    author_location: 'Herford',
    created_at_tp: new Date(Date.now() - 21 * 86400000).toISOString(),
    response: 'Toll, das freut uns sehr, Michael! Schön, dass die Anlage so gut läuft. ☀️',
    cached_at: new Date().toISOString(),
    is_visible: true,
  },
  {
    id: 'demo-4',
    stars: 5,
    title: 'Professionell von Anfang bis Ende',
    text: 'Top Beratung, faire Preise und ein sehr freundliches Installationsteam. Alles wurde genau so umgesetzt wie besprochen. Das Online-Portal macht es einfach, den Ertrag zu verfolgen. Ich würde bee-doo jederzeit weiterempfehlen.',
    author_name: 'Andrea L.',
    author_location: 'Detmold',
    created_at_tp: new Date(Date.now() - 30 * 86400000).toISOString(),
    response: null,
    cached_at: new Date().toISOString(),
    is_visible: true,
  },
  {
    id: 'demo-5',
    stars: 5,
    title: 'Unkompliziert und schnell!',
    text: 'Innerhalb von 6 Wochen vom ersten Gespräch bis zur fertigen Anlage – das hatte ich so nicht erwartet. Das Team kommuniziert transparent und hält was es verspricht. Sehr empfehlenswert!',
    author_name: 'Klaus W.',
    author_location: 'Minden',
    created_at_tp: new Date(Date.now() - 45 * 86400000).toISOString(),
    response: 'Herzlichen Dank, Klaus! Effizienz ist uns sehr wichtig. Viel Spaß mit Ihrer Anlage! 🌞',
    cached_at: new Date().toISOString(),
    is_visible: true,
  },
  {
    id: 'demo-6',
    stars: 4,
    title: 'Sehr guter Gesamteindruck',
    text: 'Die Beratung war sehr kompetent und die Installation lief reibungslos. Kleinere Kommunikationsprobleme bei der Terminabsprache, aber insgesamt sehr zufrieden. Die Anlage funktioniert einwandfrei.',
    author_name: 'Petra B.',
    author_location: 'Paderborn',
    created_at_tp: new Date(Date.now() - 60 * 86400000).toISOString(),
    response: 'Danke für Ihr offenes Feedback, Petra! Wir arbeiten ständig an unserer Kommunikation.',
    cached_at: new Date().toISOString(),
    is_visible: true,
  },
];
