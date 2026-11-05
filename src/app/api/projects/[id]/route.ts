import { NextResponse } from 'next/server';
import { getProject, updateProject } from '@/lib/data';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const project = await getProject(id);
    if (!project) {
      return NextResponse.json({ error: 'Proyek tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ project });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mengambil data proyek';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateProject(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Proyek tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ project: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal memperbarui proyek';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
