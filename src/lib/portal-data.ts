// =============================================================
// lib/portal-data.ts – Alle Datenbankabfragen für das Portal
// Server-side only (createServerSupabase)
// =============================================================
import { createServerSupabase } from './supabase';
import type { CustomerPortalView, Milestone, Document, MonitoringMonthly, Referral, Notification } from '@/types/database';

// ─── Haupt-Snapshot (via View) ─────────────────────────────────
export async function getPortalSnapshot(): Promise<CustomerPortalView | null> {
  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from('v_customer_portal')
    .select('*')
    .single();

  if (error) { console.error('getPortalSnapshot:', error.message); return null; }
  return data;
}

// ─── Milestones ────────────────────────────────────────────────
export async function getMilestones(projectId: string): Promise<Milestone[]> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from('milestones')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order');
  return data ?? [];
}

// ─── Dokumente (inkl. signed URLs) ────────────────────────────
export async function getDocuments(projectId: string): Promise<Document[]> {
  const supabase = createServerSupabase();
  const { data: docs } = await supabase
    .from('documents')
    .select('*')
    .eq('project_id', projectId)
    .order('uploaded_at', { ascending: false });

  if (!docs?.length) return [];

  // Signed URLs für Download (1h gültig)
  const withUrls = await Promise.all(docs.map(async (doc) => {
    const { data: signed } = await supabase.storage
      .from('project-documents')
      .createSignedUrl(doc.storage_path, 3600);
    return { ...doc, download_url: signed?.signedUrl };
  }));

  return withUrls;
}

// ─── Monitoring (letzte 12 Monate) ────────────────────────────
export async function getMonitoringData(projectId: string): Promise<MonitoringMonthly[]> {
  const supabase = createServerSupabase();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const { data } = await supabase
    .from('monitoring_monthly')
    .select('*')
    .eq('project_id', projectId)
    .gte('month', twelveMonthsAgo.toISOString().substring(0, 10))
    .order('month');
  return data ?? [];
}

// ─── Referrals ─────────────────────────────────────────────────
export async function getReferrals(customerId: string): Promise<Referral[]> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from('referrals')
    .select('*')
    .eq('referrer_id', customerId)
    .order('created_at', { ascending: false });
  return data ?? [];
}

// ─── Notifications ─────────────────────────────────────────────
export async function getNotifications(customerId: string): Promise<Notification[]> {
  const supabase = createServerSupabase();
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('customer_id', customerId)
    .is('read_at', null)
    .order('created_at', { ascending: false })
    .limit(10);
  return data ?? [];
}

// ─── NPS abgeben ───────────────────────────────────────────────
export async function submitNps(customerId: string, score: number, comment?: string) {
  const supabase = createServerSupabase();
  return supabase.from('nps_responses').insert({
    customer_id: customerId,
    score,
    comment: comment ?? null,
    trigger: 'portal',
  });
}

// ─── Notification als gelesen markieren ───────────────────────
export async function markNotificationRead(notificationId: string) {
  const supabase = createServerSupabase();
  return supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId);
}
