import { NextResponse } from 'next/server';
import { updateProjectMember, getProjectMembers, updateProject } from '@/lib/data';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const isMock = searchParams.get('mock') === 'true';

  let projectId = searchParams.get('projectId');
  let memberId = searchParams.get('memberId');

  // Parse state if present
  if (state) {
    try {
      const parsed = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
      if (parsed.projectId) projectId = parsed.projectId;
      if (parsed.memberId) memberId = parsed.memberId;
    } catch {
      // ignore state parse errors
    }
  }

  // Handle mock OAuth flow (for testing without live GitHub credentials)
  if (isMock && memberId) {
    await updateProjectMember(memberId, {
      is_connected: true,
      github_username: `member-${memberId.slice(0, 5)}`,
      github_email: `member-${memberId.slice(0, 5)}@student.ac.id`,
    });

    if (projectId) {
      const members = await getProjectMembers(projectId);
      const allConnected = members.length > 0 && members.every((m) => m.id === memberId || m.is_connected);
      if (allConnected) {
        await updateProject(projectId, { status: 'in_progress' });
      }
      return NextResponse.redirect(new URL(`/project/${projectId}?oauth=connected`, req.url));
    }

    return NextResponse.redirect(new URL('/', req.url));
  }

  // Live GitHub OAuth Token Exchange
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!code || !clientId || !clientSecret) {
    return NextResponse.json({ error: 'Parameter OAuth tidak valid' }, { status: 400 });
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return NextResponse.json({ error: 'Gagal mendapatkan token akses dari GitHub' }, { status: 400 });
    }

    // Fetch GitHub User Profile
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'Komit-V2-App',
      },
    });

    const userData = await userRes.json();

    if (memberId) {
      // Save token securely on server side
      await updateProjectMember(memberId, {
        github_username: userData.login,
        github_email: userData.email || `${userData.login}@users.noreply.github.com`,
        github_access_token: accessToken,
        is_connected: true,
      });
    }

    // Check if all members in the project are connected
    if (projectId) {
      const members = await getProjectMembers(projectId);
      const allConnected = members.length > 0 && members.every((m) => m.is_connected);
      if (allConnected) {
        await updateProject(projectId, { status: 'in_progress' });
      }
      return NextResponse.redirect(new URL(`/project/${projectId}?oauth=connected`, req.url));
    }

    return NextResponse.redirect(new URL('/', req.url));
  } catch (error) {
    console.error('GitHub OAuth callback failed:', error);
    return NextResponse.redirect(new URL(`/?oauth_error=failed`, req.url));
  }
}
