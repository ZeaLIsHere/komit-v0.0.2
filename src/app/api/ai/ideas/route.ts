import { NextResponse } from 'next/server';
import { IdeaItem } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { niche } = await req.json();

    if (!niche || typeof niche !== 'string') {
      return NextResponse.json({ error: 'Niche atau topik mata kuliah wajib diisi' }, { status: 400 });
    }

    const apiKey = process.env.AI_API_KEY;

    // If external AI API key is configured, call OpenAI/Groq compatible endpoint
    if (apiKey && apiKey !== 'your-ai-api-key') {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content:
                  'Kamu adalah konsultan proyek kuliah IT senior. Hasilkan tepat 3 ide proyek aplikasi web/mobile yang memikat dosen penguji UAS. Format JSON murni array objek: [{"id": "idea-1", "title": "Nama App", "description": "Penjelasan ringkas", "gimmick": "Gimmick Pemikat Dosen (fitur unik untuk demo)", "techStack": ["Next.js", "PostgreSQL", ...]}]',
              },
              {
                role: 'user',
                content: `Niche / Topik: ${niche}`,
              },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          const content = JSON.parse(result.choices[0].message.content);
          const ideas = Array.isArray(content) ? content : content.ideas || Object.values(content)[0];
          return NextResponse.json({ ideas });
        }
      } catch (err) {
        console.warn('AI API call failed, falling back to local generator', err);
      }
    }

    // High quality deterministic fallback generator
    const cleanNiche = niche.trim();
    const fallbackIdeas: IdeaItem[] = [
      {
        id: `idea-${Date.now()}-1`,
        title: `${cleanNiche.split(' ')[0] || 'Smart'}Pulse Dashboard & Real-Time Analytics`,
        description: `Sistem manajemen komprehensif untuk ${cleanNiche} dengan visualisasi metrik performa dan audit log otomatis.`,
        gimmick: 'Visualisasi grafik interaktif real-time dengan WebSockets + Ekspor laporan rekapitulasi audit otomatis berformat PDF resmi kampus.',
        techStack: ['Next.js 15', 'Tailwind CSS', 'TypeScript', 'PostgreSQL', 'Chart.js'],
      },
      {
        id: `idea-${Date.now()}-2`,
        title: `${cleanNiche.split(' ')[0] || 'Auto'}Track Automated Assistant & Tracker`,
        description: `Platform automasi cerdas yang memecahkan bottleneck pada ${cleanNiche} menggunakan machine learning sederhana dan OCR.`,
        gimmick: 'Simulasi deteksi anomali data otomatis + Fitur mode demo presentasi cepat untuk dosen dengan satu tombol pengisian data uji (test fixture).',
        techStack: ['FastAPI / Python', 'React', 'Tailwind CSS', 'SQLite', 'Scikit-Learn'],
      },
      {
        id: `idea-${Date.now()}-3`,
        title: `${cleanNiche.split(' ')[0] || 'Nexus'}Collab Role-Based Workflow System`,
        description: `Sistem multi-tenant untuk kolaborasi terstruktur pada ranah ${cleanNiche} dilengkapi approval flow bertingkat.`,
        gimmick: 'Matrix hak akses hierarkis (Superadmin, Reviewer, User) + Notifikasi webhook instan dan integrasi signature digital hash verifier.',
        techStack: ['Next.js 15', 'Node.js', 'Prisma / Supabase', 'Tailwind CSS v4'],
      },
    ];

    return NextResponse.json({ ideas: fallbackIdeas });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menghasilkan ide';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
