import { NextResponse } from 'next/server';
import { createProject, getAllProjects, saveProjectMembers } from '@/lib/data';
import { getSessionFromRequest } from '@/lib/auth';

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

    if (!body.payment_proof_url) {
      return NextResponse.json(
        { error: 'Tolong berikan bukti pembayaran terlebih dahulu sebelum melanjutkan' },
        { status: 400 }
      );
    }

    const memberCount = Math.max(1, Math.min(8, Number(body.member_count) || 1));
    const totalPrice = body.total_price ? Number(body.total_price) : memberCount * 50000;

    const session = getSessionFromRequest(req);
    const customerId = session?.userId || body.customer_id || null;
    const buyerEmail = session?.email || body.buyer_email || null;

    const newProject = await createProject({
      customer_id: customerId,
      buyer_email: buyerEmail,
      buyer_name: body.buyer_name,
      buyer_whatsapp: body.buyer_whatsapp,
      github_email: body.github_email?.trim() || null,
      github_password: body.github_password?.trim() || null,
      doc_topic: body.doc_topic?.trim() || null,
      doc_details: body.doc_details?.trim() || null,
      service_type: body.service_type || 'project_joki',
      package_type: body.package_type || 'full',
      member_count: memberCount,
      total_price: totalPrice,
      payment_proof_url: body.payment_proof_url || null,
      payment_status: 'pending',
      status: 'waiting_payment',
    });

    if (Array.isArray(body.members) && body.members.length > 0) {
      try {
        await saveProjectMembers(newProject.id, body.members.slice(0, memberCount));
      } catch (e) {
        console.error('Failed to save initial members:', e);
      }
    }

    return NextResponse.json({ project: newProject }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal membuat pesanan';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
