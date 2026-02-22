// =============================================================
// lib/supabase.ts – Client-Instanzen für Next.js App Router
// =============================================================
import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// ─── Browser (Client Components) ──────────────────────────────
export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON);
}

// ─── Server (Server Components, Route Handlers, Middleware) ───
export function createServerSupabase() {
  const cookieStore = cookies();
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      get:    (name) => cookieStore.get(name)?.value,
      set:    (name, value, options) => { try { cookieStore.set({ name, value, ...options }); } catch {} },
      remove: (name, options)        => { try { cookieStore.set({ name, value: '', ...options }); } catch {} },
    },
  });
}
