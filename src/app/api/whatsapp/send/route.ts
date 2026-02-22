// =============================================================
// app/api/whatsapp/send/route.ts
// WhatsApp Notifications via Twilio
// Wird aufgerufen wenn sich ein Milestone-Status ändert
// =============================================================
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';

const TWILIO_SID       = process.env.TWILIO_ACCOUNT_SID!;   // AC7a13...
const TWILIO_AUTH      = process.env.TWILIO_AUTH_TOKEN!;     // d962c4...
const TWILIO_WA_FROM   = process.env.TWILIO_WHATSAPP_FROM!; // whatsapp:+14155238886 (Twilio Sandbox) oder eure verifizierte Nummer

// ─── WhatsApp Message Templates ───────────────────────────────
const TEMPLATES: Record<string, (name: string, detail?: string) => string> = {
  consultation: (name) =>
    `☀️ *Hallo ${name}!*\n\nVielen Dank für Ihr Beratungsgespräch mit bee-doo. Wir freuen uns auf Ihr Projekt!\n\nBei Fragen: 0521 9876 543\nIhr Portal: https://portal.bee-doo.de`,

  contract: (name) =>
    `📋 *Hallo ${name}!*\n\nIhr Vertrag ist eingegangen – herzlichen Glückwunsch! Wir starten jetzt mit der Planung Ihrer Solaranlage.\n\nDokumente jetzt im Portal ansehen:\n👉 https://portal.bee-doo.de`,

  grid_application: (name) =>
    `📡 *Status-Update für ${name}*\n\nIhre *Netzanmeldung* wurde eingereicht. Der Netzbetreiber bestätigt in der Regel innerhalb von 2-4 Wochen.\n\nSie werden automatisch informiert. Ihr Portal:\n👉 https://portal.bee-doo.de`,

  installation: (name, date) =>
    `🔧 *Installationstermin bestätigt!*\n\nHallo ${name}, Ihr Installationsteam kommt am *${date}* ab 08:00 Uhr zu Ihnen.\n\n✅ Bitte stellen Sie sicher, dass das Dach zugänglich ist.\n\nFragen? 0521 9876 543\n👉 https://portal.bee-doo.de`,

  commissioning: (name) =>
    `⚡ *Ihre Anlage ist in Betrieb!*\n\nHallo ${name}, Ihre Solaranlage wurde erfolgreich in Betrieb genommen. Ab sofort produziert Sie sauberen Strom!\n\n☀️ Monitoring jetzt im Portal:\n👉 https://portal.bee-doo.de`,

  feed_in: (name) =>
    `💶 *Einspeisung bestätigt!*\n\nHallo ${name}, der Netzbetreiber hat Ihre Einspeisung bestätigt. Die *Einspeisevergütung* startet jetzt automatisch.\n\n📊 Alle Details im Portal:\n👉 https://portal.bee-doo.de`,

  document_ready: (name, docName) =>
    `📄 *Neues Dokument verfügbar*\n\nHallo ${name}, \"${docName}\" wurde in Ihrem Portal hochgeladen.\n\n👉 https://portal.bee-doo.de`,

  appointment_reminder: (name, date) =>
    `⏰ *Terminerinnerung für morgen*\n\nHallo ${name}, Ihr Installationsteam kommt *morgen, ${date}* ab 08:00 Uhr.\n\nBitte halten Sie den Dachbereich zugänglich.\n\nFragen? 0521 9876 543`,
};

// ─── Twilio API Call ──────────────────────────────────────────
async function sendWhatsApp(to: string, body: string): Promise<{ sid: string } | { error: string }> {
  const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to.startsWith('+') ? to : '+49' + to.replace(/^0/, '')}`;

  const credentials = Buffer.from(`${TWILIO_SID}:${TWILIO_AUTH}`).toString('base64');

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type':  'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      From: TWILIO_WA_FROM,
      To:   formattedTo,
      Body: body,
    }).toString(),
  });

  const data = await res.json();
  if (!res.ok) return { error: data.message ?? 'Twilio error' };
  return { sid: data.sid };
}

// ─── Route Handler ────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { customerId, trigger, milestoneKey, detail } = await request.json();

    if (!customerId || !trigger) {
      return NextResponse.json({ error: 'customerId und trigger erforderlich' }, { status: 400 });
    }

    const supabase = createServerSupabase();

    // Kundendaten laden
    const { data: customer, error: cErr } = await supabase
      .from('customers')
      .select('id, first_name, phone, customer_number')
      .eq('id', customerId)
      .single();

    if (cErr || !customer?.phone) {
      return NextResponse.json({ error: 'Kunde nicht gefunden oder keine Telefonnummer' }, { status: 404 });
    }

    // Message zusammenbauen
    const templateFn = TEMPLATES[milestoneKey ?? trigger] ?? TEMPLATES['commissioning'];
    const message = templateFn(customer.first_name, detail);

    // WhatsApp senden
    const result = await sendWhatsApp(customer.phone, message);

    // Log in DB
    await supabase.from('whatsapp_notifications').insert({
      customer_id:   customer.id,
      phone:         customer.phone,
      message,
      trigger,
      milestone_key: milestoneKey ?? null,
      twilio_sid:    'sid' in result ? result.sid : null,
      status:        'sid' in result ? 'sent' : 'failed',
      sent_at:       'sid' in result ? new Date().toISOString() : null,
      error:         'error' in result ? result.error : null,
    });

    if ('error' in result) {
      return NextResponse.json({ success: false, error: result.error }, { status: 502 });
    }

    return NextResponse.json({ success: true, sid: result.sid, to: customer.phone });

  } catch (err: any) {
    console.error('WhatsApp send error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─── Bulk: Appointment Reminders (täglich via Cron) ───────────
export async function GET(request: NextRequest) {
  // Nur intern / via Vercel Cron (mit Secret absichern)
  const secret = request.headers.get('x-cron-secret');
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerSupabase();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().substring(0, 10);

  // Alle Projekte mit Installation morgen
  const { data: projects } = await supabase
    .from('projects')
    .select('id, customer_id, installation_date, customers(first_name, phone)')
    .eq('installation_date', tomorrowStr);

  let sent = 0;
  for (const p of projects ?? []) {
    const customer = (p as any).customers;
    if (!customer?.phone) continue;

    const dateFormatted = new Date(tomorrowStr).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long' });
    const message = TEMPLATES['appointment_reminder'](customer.first_name, dateFormatted);

    const result = await sendWhatsApp(customer.phone, message);

    await supabase.from('whatsapp_notifications').insert({
      customer_id: p.customer_id,
      project_id:  p.id,
      phone:       customer.phone,
      message,
      trigger:     'appointment_reminder',
      twilio_sid:  'sid' in result ? result.sid : null,
      status:      'sid' in result ? 'sent' : 'failed',
      sent_at:     'sid' in result ? new Date().toISOString() : null,
      error:       'error' in result ? result.error : null,
    });

    if ('sid' in result) sent++;
  }

  return NextResponse.json({ success: true, sent, total: projects?.length ?? 0 });
}
