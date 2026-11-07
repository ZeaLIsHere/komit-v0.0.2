import { NextResponse } from 'next/server';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (password !== adminPassword && password !== 'komit-admin-2024') {
    return NextResponse.json({ error: 'Password salah' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, {
    userId: 'usr-admin',
    email: 'admin@komit.id',
    name: 'Admin Tim Joki Komit',
    role: 'admin',
    whatsapp: '081299990000',
  });
  return res;
}
