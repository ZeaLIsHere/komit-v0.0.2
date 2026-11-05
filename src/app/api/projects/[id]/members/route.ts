import { NextResponse } from 'next/server';
import { getProjectMembers, saveProjectMembers } from '@/lib/data';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const members = await getProjectMembers(id);
    return NextResponse.json({ members });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mengambil data anggota';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { members } = await req.json();

    if (!Array.isArray(members) || members.length === 0) {
      return NextResponse.json({ error: 'Daftar anggota tidak valid' }, { status: 400 });
    }

    const saved = await saveProjectMembers(id, members);
    return NextResponse.json({ members: saved }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menyimpan data anggota';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
