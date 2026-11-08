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

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    const headers: Record<string, string> = {
      'User-Agent': 'Komit-V2-App',
      Accept: 'application/vnd.github.v3+json',
    };

    // Use Basic Auth with OAuth Client ID & Secret for high rate limits (5,000 req/hr)
    if (clientId && clientSecret && clientId !== 'your-github-client-id') {
      const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      headers['Authorization'] = `Basic ${basic}`;
    }

    const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(cleanUsername)}`, {
      headers,
    });

    if (ghRes.status === 200) {
      const data = await ghRes.json();
      return NextResponse.json({
        exists: true,
        username: data.login,
        name: data.name || data.login,
        avatar_url: data.avatar_url,
        html_url: data.html_url,
        bio: data.bio || null,
        public_repos: data.public_repos || 0,
      });
    }

    if (ghRes.status === 404) {
      return NextResponse.json({ exists: false, error: 'User tidak ditemukan' });
    }

    return NextResponse.json({ exists: false, error: 'GitHub API status: ' + ghRes.status }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal verifikasi akun GitHub';
    return NextResponse.json({ exists: false, error: message }, { status: 500 });
  }
}
