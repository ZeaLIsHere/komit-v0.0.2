import { NextResponse } from 'next/server';
import { findUserByGitHubUsername, findUserByEmail, createUser } from '@/lib/data';
import { setSessionCookie } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { username } = await req.json();

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username GitHub wajib diisi' },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().replace(/^@/, '');

    // Fetch user profile from public GitHub API
    const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, {
      headers: {
        'User-Agent': 'Komit-V2-App',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (ghRes.status === 404) {
      return NextResponse.json(
        { error: `Akun GitHub @${cleanUsername} tidak ditemukan di GitHub` },
        { status: 404 }
      );
    }

    if (!ghRes.ok) {
      return NextResponse.json(
        { error: 'Gagal memverifikasi akun ke GitHub API' },
        { status: 500 }
      );
    }

    const ghUser = await ghRes.json();
    const login = ghUser.login as string;
    const name = (ghUser.name as string) || login;
    const email = (ghUser.email as string) || `${login.toLowerCase()}@users.noreply.github.com`;

    // Check if user already exists
    let user =
      (await findUserByGitHubUsername(login)) ||
      (await findUserByEmail(email));

    if (!user) {
      user = await createUser({
        name,
        email,
        github_username: login,
        role: 'customer',
        whatsapp: '',
      });
    }

    const sessionData = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      whatsapp: user.whatsapp,
      githubUsername: login,
    };

    const res = NextResponse.json({ ok: true, user: sessionData });
    setSessionCookie(res, sessionData);
    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal login via GitHub';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
