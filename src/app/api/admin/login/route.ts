import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD || 'komit-admin-2024';

  if (password !== adminPassword) {
    return NextResponse.json({ error: 'Password salah' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_session', 'authenticated', {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 8, // 8 jam
    sameSite: 'lax',
  });
  return res;
}
