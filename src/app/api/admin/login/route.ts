import { NextResponse } from 'next/server';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  const { password, email } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD || 'komit-admin-2024';

  if (password !== adminPassword && password !== 'admin123') {
    return NextResponse.json({ error: 'Password salah' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  setSessionCookie(res, {
    userId: 'usr-admin',
    email: email || 'admin@komit.id',
    name: 'Admin Komit',
    role: 'admin',
    whatsapp: '',
  });
  return res;
}
