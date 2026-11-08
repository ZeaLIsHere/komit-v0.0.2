import { NextResponse } from 'next/server';
import { IdeaItem } from '@/lib/types';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const niche: string = (body.niche || body.prompt || '').trim();
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];
    const serviceType: string = body.service_type || 'project_joki';

    const latestUserPrompt =
      messages.length > 0 && messages[messages.length - 1].role === 'user'
        ? messages[messages.length - 1].content
        : niche || 'Aplikasi Web & Mobile Mahasiswa IT';

    const groqKey = process.env.GROQ_API_KEY || (process.env.AI_API_KEY?.startsWith('gsk_') ? process.env.AI_API_KEY : '');
    const deepseekKey = process.env.DEEPSEEK_API_KEY;
    const genericAiKey = process.env.AI_API_KEY;

    const systemPrompt = `Kamu adalah Konsultan Ide Proyek Kuliah IT & Joki UAS Senior di platform Komit.
Tugasmu adalah memberikan konsultasi interaktif dan menghasilkan rekomendasi ide proyek aplikasi web/mobile yang orisinal, realistis dikerjakan mahasiswa, dan memiliki "Gimmick Pemikat Dosen" yang membuat dosen penguji UAS terkesima saat sesi demonstrasi.

ATURAN OUTPUT:
Kamu WAJIB mengembalikan respon berupa JSON murni dengan struktur:
{
  "reply": "Respon konsultasi ramah, santun, dan padat (1-2 kalimat pendek). Berikan insight mengapa ide ini kuat di mata dosen.",
  "ideas": [
    {
      "id": "idea-1",
      "title": "Nama Aplikasi Keren & Jelas",
      "description": "Deskripsi solusi problem 1-2 kalimat.",
      "gimmick": "Fitur pemikat nilai unik yang wajib didemokan saat sidang UAS (misal: live radar chart, deteksi OCR, mode presentasi dosen).",
      "techStack": ["Next.js 15", "Tailwind CSS", "PostgreSQL", "FastAPI"]
    },
    {
      "id": "idea-2",
      "title": "...",
      "description": "...",
      "gimmick": "...",
      "techStack": [...]
    },
    {
      "id": "idea-3",
      "title": "...",
      "description": "...",
      "gimmick": "...",
      "techStack": [...]
    }
  ]
}
Hasilkan tepat 3 ide baru yang selaras dengan permintaan terbaru pengguna. Jangan gunakan markdown formatting di luar JSON.`;

    // 1. Try Groq API (High Speed LPU / DeepSeek R1 Distill / Llama 3.3 70B)
    if (groqKey && groqKey !== 'your-groq-api-key') {
      try {
        const groqMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-6),
        ];
        if (messages.length === 0) {
          groqMessages.push({ role: 'user', content: `Niche / Topik: ${latestUserPrompt}` });
        }

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: groqMessages,
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 1500,
          }),
        });

        if (groqRes.ok) {
          const result = await groqRes.json();
          const parsed = JSON.parse(result.choices[0].message.content);
          if (parsed && Array.isArray(parsed.ideas) && parsed.ideas.length > 0) {
            return NextResponse.json({
              reply: parsed.reply || 'Berikut 3 rekomendasi ide terkurasi untuk topik Anda:',
              ideas: parsed.ideas.map((item: IdeaItem, idx: number) => ({
                ...item,
                id: `idea-${Date.now()}-${idx + 1}`,
              })),
            });
          }
        }
      } catch (err) {
        console.warn('Groq API call failed, attempting other providers:', err);
      }
    }

    // 2. Try DeepSeek Direct API
    if (deepseekKey && deepseekKey !== 'your-deepseek-api-key') {
      try {
        const dsMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-6),
        ];
        if (messages.length === 0) {
          dsMessages.push({ role: 'user', content: `Niche / Topik: ${latestUserPrompt}` });
        }

        const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${deepseekKey}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: dsMessages,
            response_format: { type: 'json_object' },
            temperature: 0.7,
          }),
        });

        if (dsRes.ok) {
          const result = await dsRes.json();
          const parsed = JSON.parse(result.choices[0].message.content);
          if (parsed && Array.isArray(parsed.ideas) && parsed.ideas.length > 0) {
            return NextResponse.json({
              reply: parsed.reply || 'Berikut 3 rekomendasi ide terkurasi untuk topik Anda:',
              ideas: parsed.ideas.map((item: IdeaItem, idx: number) => ({
                ...item,
                id: `idea-${Date.now()}-${idx + 1}`,
              })),
            });
          }
        }
      } catch (err) {
        console.warn('DeepSeek API call failed:', err);
      }
    }

    // 3. Try Generic OpenAI Compatible Endpoint
    if (genericAiKey && genericAiKey !== 'your-ai-api-key') {
      try {
        const aiMessages = [
          { role: 'system', content: systemPrompt },
          ...messages.slice(-6),
        ];
        if (messages.length === 0) {
          aiMessages.push({ role: 'user', content: `Niche / Topik: ${latestUserPrompt}` });
        }

        const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${genericAiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: aiMessages,
            response_format: { type: 'json_object' },
            temperature: 0.7,
          }),
        });

        if (aiRes.ok) {
          const result = await aiRes.json();
          const parsed = JSON.parse(result.choices[0].message.content);
          if (parsed && Array.isArray(parsed.ideas) && parsed.ideas.length > 0) {
            return NextResponse.json({
              reply: parsed.reply || 'Berikut 3 rekomendasi ide terkurasi untuk topik Anda:',
              ideas: parsed.ideas.map((item: IdeaItem, idx: number) => ({
                ...item,
                id: `idea-${Date.now()}-${idx + 1}`,
              })),
            });
          }
        }
      } catch (err) {
        console.warn('Generic AI API call failed:', err);
      }
    }

    // 4. Dynamic Semantic Synthesis Engine (Ensures fresh, non-static ideas offline)
    const promptLower = latestUserPrompt.toLowerCase();
    const isMobile = promptLower.includes('mobile') || promptLower.includes('flutter') || promptLower.includes('android');
    const isAi = promptLower.includes('ai') || promptLower.includes('machine learning') || promptLower.includes('cerdas') || promptLower.includes('deepseek');
    const isIoT = promptLower.includes('iot') || promptLower.includes('sensor') || promptLower.includes('hardware');
    const isCommerce = promptLower.includes('toko') || promptLower.includes('kasir') || promptLower.includes('cafe') || promptLower.includes('pos');
    const isHealth = promptLower.includes('sehat') || promptLower.includes('medis') || promptLower.includes('klinik') || promptLower.includes('mental');
    const isAcademic = promptLower.includes('kampus') || promptLower.includes('magang') || promptLower.includes('lab') || promptLower.includes('akademik') || promptLower.includes('kuliah');

    const cleanKeyword = latestUserPrompt
      .replace(/(tolong|buatkan|ganti|ide|aplikasi|lain|lagi|dong|yang|fokus|dengan|untuk|proyek|uas)/gi, '')
      .trim();
    const topicLabel = cleanKeyword.length > 2 ? cleanKeyword.split(' ').slice(0, 3).join(' ') : 'Inovasi Digital';
    const capitalizedTopic = topicLabel.charAt(0).toUpperCase() + topicLabel.slice(1);

    const timeSeed = Date.now();

    const dynamicIdeas: IdeaItem[] = [
      {
        id: `idea-${timeSeed}-1`,
        title: isMobile
          ? `${capitalizedTopic}Go Mobile Companion`
          : isAi
          ? `${capitalizedTopic} Intelligence Engine`
          : isCommerce
          ? `PointPulse ${capitalizedTopic} Checkout Suite`
          : `${capitalizedTopic} Command Hub`,
        description: `Sistem terpadu untuk efisiensi operasional ${capitalizedTopic.toLowerCase()} yang dilengkapi visualisasi metrik performa real-time dan manajemen role bertingkat.`,
        gimmick: 'Dashboard radar chart interaktif dari metrik aktivitas + Fitur ekspor laporan audit komprehensif berformat PDF resmi kampus sekali klik.',
        techStack: isMobile
          ? ['Flutter 3.x', 'Dart', 'FastAPI', 'PostgreSQL']
          : ['Next.js 15', 'Tailwind CSS', 'TypeScript', 'PostgreSQL', 'Chart.js'],
      },
      {
        id: `idea-${timeSeed}-2`,
        title: isHealth
          ? `${capitalizedTopic} Care Monitor & Early Alert`
          : isIoT
          ? `${capitalizedTopic} Telemetry & Anomaly Tracker`
          : `${capitalizedTopic} AutoFlow & Smart Assistant`,
        description: `Platform automasi cerdas yang memecahkan bottleneck pada domain ${capitalizedTopic.toLowerCase()} dengan integrasi notifikasi webhook dan validasi data instan.`,
        gimmick: 'Mode demo presentasi khusus dosen: Tombol injeksi data uji simulasi (1-click fixture) untuk membuktikan keakuratan sistem di depan penguji UAS.',
        techStack: isAi
          ? ['FastAPI / Python', 'Next.js 15', 'Tailwind CSS', 'PostgreSQL', 'Scikit-Learn']
          : ['Next.js 15', 'React 19', 'Supabase / Firebase', 'Tailwind CSS v4'],
      },
      {
        id: `idea-${timeSeed}-3`,
        title: `${capitalizedTopic} Nexus Multi-Role Collaboration`,
        description: `Arsitektur multi-tenant berbasis permission matrix ketat untuk alur review dan persetujuan bertingkat pada skenario ${capitalizedTopic.toLowerCase()}.`,
        gimmick: 'Audit trail berbasis cryptographic hash signature verifier pada setiap transaksi untuk membuktikan integritas data anti-manipulasi.',
        techStack: ['Next.js 15', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'Web Crypto API'],
      },
    ];

    let reply = `Tentu! Saya telah menganalisis topik "${latestUserPrompt}" dan merancang 3 rekomendasi ide yang kuat secara teknis serta memiliki gimmick pemikat dosen penguji UAS:`;
    if (messages.length > 1) {
      reply = `Ide telah diperbarui sesuai arahanmu ("${latestUserPrompt}"). Berikut 3 opsi alternatif dengan pendekatan berbeda yang siap kamu pilih:`;
    }

    return NextResponse.json({
      reply,
      ideas: dynamicIdeas,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menghasilkan ide';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
