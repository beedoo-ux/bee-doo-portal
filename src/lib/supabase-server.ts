import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const createServerSupabase = () => {
  const cookieStore = cookies();
  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      get: (name: string) => cookieStore.get(name)?.value,
      set: () => {},
      remove: () => {},
    },
  });
};
