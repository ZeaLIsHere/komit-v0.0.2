import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = getSessionFromRequest(req);
    return NextResponse.json({ user: session });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal membaca sesi';
    return NextResponse.json({ error: message, user: null }, { status: 500 });
  }
}
