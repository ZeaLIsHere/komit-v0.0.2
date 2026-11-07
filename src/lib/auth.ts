import crypto from 'crypto';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserRole } from './types';

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  whatsapp?: string;
  githubUsername?: string;
  exp: number;
}

const AUTH_SECRET = process.env.AUTH_SECRET || 'komit-v2-super-secret-key-2024';
const COOKIE_NAME = 'komit_session';

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export function createSessionToken(payload: Omit<SessionData, 'exp'>): string {
  const exp = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 hari
  const data: SessionData = { ...payload, exp };
  const payloadEncoded = base64UrlEncode(JSON.stringify(data));
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payloadEncoded)
    .digest('base64url');
  return `${payloadEncoded}.${signature}`;
}

export function verifySessionToken(token: string): SessionData | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payloadEncoded, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(payloadEncoded)
      .digest('base64url');

    if (signature !== expectedSig) return null;

    const data: SessionData = JSON.parse(base64UrlDecode(payloadEncoded));
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }
    return data;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(req: Request | NextRequest): SessionData | null {
  let cookieHeader = '';
  if ('cookies' in req && typeof req.cookies.get === 'function') {
    const cookie = req.cookies.get(COOKIE_NAME);
    if (cookie) return verifySessionToken(cookie.value);
  } else {
    cookieHeader = req.headers.get('cookie') || '';
  }

  if (cookieHeader) {
    const match = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${COOKIE_NAME}=`));
    if (match) {
      const token = match.split('=')[1];
      return verifySessionToken(decodeURIComponent(token));
    }
  }

  return null;
}

export function setSessionCookie(res: NextResponse, session: Omit<SessionData, 'exp'>): void {
  const token = createSessionToken(session);
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    path: '/',
    maxAge: 7 * 24 * 60 * 60,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  // If role is admin, also set legacy admin_session for backwards compatibility
  if (session.role === 'admin') {
    res.cookies.set('admin_session', 'authenticated', {
      httpOnly: true,
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }
}

export function clearSessionCookies(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
  res.cookies.set('admin_session', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });
}
