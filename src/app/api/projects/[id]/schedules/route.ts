import { NextResponse } from 'next/server';
import { getCommitSchedules, createCommitSchedule } from '@/lib/data';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const schedules = await getCommitSchedules(id);
    return NextResponse.json({ schedules });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mengambil jadwal commit';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    if (!body.member_id || !body.commit_message || !body.scheduled_at) {
      return NextResponse.json(
        { error: 'member_id, commit_message, dan scheduled_at wajib diisi' },
        { status: 400 }
      );
    }

    const created = await createCommitSchedule({
      project_id: id,
      member_id: body.member_id,
      commit_message: body.commit_message,
      scheduled_at: body.scheduled_at,
      status: 'scheduled',
    });

    return NextResponse.json({ schedule: created }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal membuat jadwal commit';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
