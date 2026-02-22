// =============================================================
// middleware.ts – Auth-Guard für alle /portal/* Routen
// =============================================================
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get:    (name) => request.cookies.get(name)?.value,
        set:    (name, value, options: CookieOptions) => {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove: (name, options: CookieOptions) => {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const isPortalRoute = request.nextUrl.pathname.startsWith('/portal');
  const isLoginRoute  = request.nextUrl.pathname === '/login';

  if (isPortalRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isLoginRoute && user) {
    return NextResponse.redirect(new URL('/portal', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/portal/:path*', '/login'],
};
