import { NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/data';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email/username dan password wajib diisi' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const adminEnvPass = process.env.ADMIN_PASSWORD || 'admin123';

    // Direct check for admin login
    if (
      normalizedEmail === 'admin' ||
      normalizedEmail === 'admin@komit.id' ||
      role === 'admin'
    ) {
      if (
        (normalizedEmail === 'admin' || normalizedEmail === 'admin@komit.id') &&
        (password === 'admin123' || password === 'komit-admin-2024' || password === adminEnvPass)
      ) {
        const adminUser = {
          userId: 'usr-admin',
          email: 'admin@komit.id',
          name: 'Admin Tim Joki Komit',
          role: 'admin' as const,
          whatsapp: '081299990000',
        };

        const res = NextResponse.json({ ok: true, user: adminUser });
        setSessionCookie(res, adminUser);
        return res;
      }

      if (role === 'admin') {
        return NextResponse.json(
          { error: 'Kredensial admin salah. Gunakan admin@komit.id / admin123' },
          { status: 401 }
        );
      }
    }

    // Customer login lookup
    const user = await findUserByEmail(normalizedEmail);
    if (!user) {
      return NextResponse.json(
        { error: 'Akun tidak ditemukan. Silakan daftar akun baru.' },
        { status: 404 }
      );
    }

    if (user.password && user.password !== password) {
      return NextResponse.json({ error: 'Password salah' }, { status: 401 });
    }

    const sessionData = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      whatsapp: user.whatsapp,
    };

    const res = NextResponse.json({ ok: true, user: sessionData });
    setSessionCookie(res, sessionData);
    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memproses login';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
