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

  // Handle mock/fallback OAuth flow (when live GitHub OAuth credentials not configured)
  if (isMock && memberId) {
    let finalUsername = searchParams.get('username') || '';
    if (!finalUsername && projectId) {
      const existingMembers = await getProjectMembers(projectId);
      const target = existingMembers.find((m) => m.id === memberId);
      if (target?.github_username) {
        finalUsername = target.github_username;
      }
    }
    if (!finalUsername) {
      finalUsername = `user-${memberId.slice(0, 6)}`;
    }

    await updateProjectMember(memberId, {
      is_connected: true,
      github_username: finalUsername,
      github_email: `${finalUsername.toLowerCase()}@users.noreply.github.com`,
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
    } else {
      // General user login via GitHub OAuth
      const { findUserByGitHubUsername, findUserByEmail, createUser } = await import('@/lib/data');
      const { setSessionCookie } = await import('@/lib/auth');
      
      const login = userData.login;
      const email = userData.email || `${login.toLowerCase()}@users.noreply.github.com`;
      const name = userData.name || login;
      
      const adminUsernames = ['admin', (process.env.ADMIN_GITHUB_USERNAME || '').toLowerCase()].filter(Boolean);
      const isAdmin = adminUsernames.includes(login.toLowerCase());

      let user = (await findUserByGitHubUsername(login)) || (await findUserByEmail(email));
      if (!user) {
        user = await createUser({
          name,
          email,
          github_username: login,
          role: isAdmin ? 'admin' : 'customer',
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

      const redirectRes = NextResponse.redirect(new URL('/my-projects', req.url));
      setSessionCookie(redirectRes, sessionData);
      return redirectRes;
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
