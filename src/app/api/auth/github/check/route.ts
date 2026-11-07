import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ exists: false, error: 'Username kosong' }, { status: 400 });
    }

    const cleanUsername = username.trim().replace(/^@/, '');
    if (!cleanUsername) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, {
      headers: {
        'User-Agent': 'Komit-V2-App',
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (ghRes.status === 200) {
      const data = await ghRes.json();
      return NextResponse.json({
        exists: true,
        username: data.login,
        name: data.name || data.login,
        avatar_url: data.avatar_url,
      });
    }

    if (ghRes.status === 404) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({ exists: false, error: 'GitHub API error' }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal cek akun GitHub';
    return NextResponse.json({ exists: false, error: message }, { status: 500 });
  }
}
