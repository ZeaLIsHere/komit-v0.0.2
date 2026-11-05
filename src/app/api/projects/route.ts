import { NextResponse } from 'next/server';
import { createProject, getAllProjects } from '@/lib/data';

export async function GET() {
  try {
    const projects = await getAllProjects();
    return NextResponse.json({ projects });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal mengambil data proyek';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.buyer_name || !body.buyer_whatsapp) {
      return NextResponse.json(
        { error: 'Nama dan nomor WhatsApp wajib diisi' },
        { status: 400 }
      );
    }

    const memberCount = Math.max(1, Math.min(8, Number(body.member_count) || 1));
    const totalPrice = memberCount * 50000;

    const newProject = await createProject({
      buyer_name: body.buyer_name,
      buyer_whatsapp: body.buyer_whatsapp,
      service_type: body.service_type || 'project_joki',
      package_type: body.package_type || 'full',
      member_count: memberCount,
      total_price: totalPrice,
      payment_proof_url: body.payment_proof_url || null,
      payment_status: 'pending',
      status: 'waiting_payment',
    });

    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal membuat pesanan';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
