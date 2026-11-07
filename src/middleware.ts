import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function parseSession(cookieValue?: string) {
  if (!cookieValue) return null;
  try {
    const parts = cookieValue.split('.');
    if (parts.length !== 2) return null;
    let b64 = parts[0].replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const jsonStr = atob(b64);
    const data = JSON.parse(jsonStr);
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;
    return data;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const sessionCookie = req.cookies.get('komit_session')?.value;
  const adminLegacy = req.cookies.get('admin_session')?.value;
  const session = parseSession(sessionCookie);

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const isAdmin = (session && session.role === 'admin') || adminLegacy === 'authenticated';
    if (!isAdmin) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect customer routes (/order, /my-projects)
  if (pathname === '/order' || pathname.startsWith('/my-projects')) {
    if (!session && adminLegacy !== 'authenticated') {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/order', '/my-projects/:path*'],
};
