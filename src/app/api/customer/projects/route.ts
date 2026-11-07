import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { getUserProjects, getAllProjects } from '@/lib/data';

export async function GET(req: Request) {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role === 'admin') {
      const all = await getAllProjects();
      return NextResponse.json({ projects: all });
    }

    const projects = await getUserProjects(session.userId);
    // If none found by id, try by email
    if (projects.length === 0) {
      const byEmail = await getUserProjects(session.email);
      return NextResponse.json({ projects: byEmail });
    }

    return NextResponse.json({ projects });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memuat proyek';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
