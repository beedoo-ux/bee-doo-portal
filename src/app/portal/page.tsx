// =============================================================
// app/portal/page.tsx – Server Component (Datenladen)
// =============================================================
import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase-server';
import {
  getPortalSnapshot,
  getMilestones,
  getDocuments,
  getMonitoringData,
  getReferrals,
  getNotifications,
} from '@/lib/portal-data';
import PortalClient from './PortalClient';

export default async function PortalPage() {
  // Auth-Check (Middleware macht das auch, aber hier als Fallback)
  const supabase = createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Alle Daten parallel laden
  const snapshot = await getPortalSnapshot();
  if (!snapshot || !snapshot.project_id) {
    return (
      <div style={{ minHeight: '100vh', background: '#08080E', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B6B80', fontFamily: 'DM Sans, sans-serif' }}>
        Kein Projekt gefunden. Bitte kontaktieren Sie bee-doo.
      </div>
    );
  }

  const [milestones, documents, monitoring, referrals, notifications] = await Promise.all([
    getMilestones(snapshot.project_id),
    getDocuments(snapshot.project_id),
    getMonitoringData(snapshot.project_id),
    getReferrals(snapshot.customer_id),
    getNotifications(snapshot.customer_id),
  ]);

  return (
    <PortalClient
      snapshot={snapshot}
      milestones={milestones}
      documents={documents}
      monitoring={monitoring}
      referrals={referrals}
      notifications={notifications}
    />
  );
}

export const dynamic = 'force-dynamic';
