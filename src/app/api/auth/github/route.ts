import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  const memberId = searchParams.get('memberId');

  const clientId = process.env.GITHUB_CLIENT_ID;

  // If GitHub OAuth credentials are not set, mock connect for local testing
  // ponytail: mock OAuth handshake when GitHub OAuth Client ID not configured -> live GitHub OAuth
  if (!clientId || clientId === 'your-github-client-id') {
    const callbackUrl = new URL('/api/auth/github/callback', req.url);
    callbackUrl.searchParams.set('mock', 'true');
    if (projectId) callbackUrl.searchParams.set('projectId', projectId);
    if (memberId) callbackUrl.searchParams.set('memberId', memberId);
    return NextResponse.redirect(callbackUrl);
  }

  const state = Buffer.from(JSON.stringify({ projectId, memberId })).toString('base64');
  const scope = 'repo,workflow';
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/github/callback`;

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}&state=${encodeURIComponent(
    state
  )}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return NextResponse.redirect(githubAuthUrl);
}
