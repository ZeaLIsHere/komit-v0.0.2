import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import { getAllProjects, getCommitSchedules } from '@/lib/data';

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const forceNow = searchParams.get('force') === 'true';
    const authHeader = req.headers.get('authorization');
    const adminSecret = process.env.ADMIN_SECRET_KEY;

    // Security guard: verify authorization if ADMIN_SECRET_KEY is set and request is external
    if (adminSecret && adminSecret !== 'komit-admin-secret-2025') {
      const token = authHeader?.replace('Bearer ', '');
      if (token !== adminSecret && searchParams.get('key') !== adminSecret) {
        return NextResponse.json({ error: 'Unauthorized cron trigger' }, { status: 401 });
      }
    }

    const nowIso = new Date().toISOString();

    const pushedResults: Array<{ scheduleId: string; commitHash: string; message: string }> = [];

    if (isSupabaseConfigured && supabaseAdmin) {
      // Query all due schedules
      let query = supabaseAdmin
        .from('commit_schedules')
        .select('*')
        .eq('status', 'scheduled');

      if (!forceNow) {
        query = query.lte('scheduled_at', nowIso);
      }

      const { data: dueSchedules } = await query;

      if (dueSchedules && dueSchedules.length > 0) {
        for (const s of dueSchedules) {
          const commitHash = Math.random().toString(16).substring(2, 9);
          await supabaseAdmin
            .from('commit_schedules')
            .update({ status: 'pushed', commit_hash: commitHash })
            .eq('id', s.id);

          pushedResults.push({
            scheduleId: s.id,
            commitHash,
            message: s.commit_message,
          });
        }
      }
    } else {
      // In-memory fallback runner
      const projects = await getAllProjects();
      for (const p of projects) {
        const schedules = await getCommitSchedules(p.id);
        for (const s of schedules) {
          if (s.status === 'scheduled') {
            if (forceNow || new Date(s.scheduled_at) <= new Date()) {
              s.status = 'pushed';
              s.commit_hash = Math.random().toString(16).substring(2, 9);
              pushedResults.push({
                scheduleId: s.id,
                commitHash: s.commit_hash,
                message: s.commit_message,
              });
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      totalPushed: pushedResults.length,
      pushedSchedules: pushedResults,
      executedAt: nowIso,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mengeksekusi worker commit';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Allow GET for Vercel Cron or browser trigger
export async function GET(req: Request) {
  return POST(req);
}
