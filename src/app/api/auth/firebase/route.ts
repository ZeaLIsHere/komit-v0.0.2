import { NextResponse } from 'next/server';
import { findUserByEmail, createUser } from '@/lib/data';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, name, photoUrl } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email Google wajib disertakan' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const adminEmails = [
      'admin@komit.id',
      (process.env.ADMIN_EMAIL || '').toLowerCase(),
    ].filter(Boolean);

    const isAdmin = adminEmails.includes(cleanEmail);

    // Cari user berdasarkan email
    let user = await findUserByEmail(cleanEmail);

    if (!user) {
      user = await createUser({
        name: name || cleanEmail.split('@')[0],
        email: cleanEmail,
        github_username: '',
        role: isAdmin ? 'admin' : 'customer',
        whatsapp: '',
      });
    } else if (isAdmin && user.role !== 'admin') {
      user.role = 'admin';
    }

    const sessionData = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      whatsapp: user.whatsapp,
      githubUsername: user.github_username || '',
      photoUrl: photoUrl || '',
    };

    const res = NextResponse.json({ ok: true, user: sessionData });
    setSessionCookie(res, sessionData);
    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memproses sesi Firebase';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
