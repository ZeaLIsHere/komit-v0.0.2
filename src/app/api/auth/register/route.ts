import { NextResponse } from 'next/server';
import { findUserByEmail, createUser } from '@/lib/data';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { name, email, whatsapp, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama lengkap, email, dan password wajib diisi' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Check existing
    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Silakan login langsung.' },
        { status: 409 }
      );
    }

    const newUser = await createUser({
      name: String(name).trim(),
      email: normalizedEmail,
      whatsapp: whatsapp ? String(whatsapp).trim() : '',
      role: 'customer',
      password: String(password),
    });

    const sessionData = {
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      whatsapp: newUser.whatsapp,
    };

    const res = NextResponse.json({ ok: true, user: sessionData }, { status: 201 });
    setSessionCookie(res, sessionData);
    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mendaftar';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
