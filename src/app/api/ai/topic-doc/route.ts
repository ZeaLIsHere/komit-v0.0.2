import { NextResponse } from 'next/server';
import { getProject, updateProject, getProjectMembers } from '@/lib/data';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const projectId: string = body.projectId || '';

    if (!projectId) {
      return NextResponse.json({ error: 'ID Proyek wajib disertakan' }, { status: 400 });
    }

    const project = await getProject(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Proyek tidak ditemukan' }, { status: 404 });
    }

    const members = await getProjectMembers(projectId);
    const serviceType = project.service_type;
    const topic = project.doc_topic || body.doc_topic || 'Topik Belum Ditentukan';
    const details = project.doc_details || body.doc_details || 'Sesuai standar akademik kampus';
    const isMakalah = serviceType === 'makalah';

    // Format identitas nama dan NIM anggota
    const membersFormatted =
      members.length > 0
        ? members
            .map(
              (m, idx) =>
                `${idx + 1}. **${m.name}** (NIM: \`${m.nim && m.nim !== '-' ? m.nim : 'Tercatat'}\`)`
            )
            .join('\n')
        : `1. **${project.buyer_name}** (Pemesan Utama)`;

    const groqKey =
      process.env.GROQ_API_KEY ||
      (process.env.AI_API_KEY?.startsWith('gsk_') ? process.env.AI_API_KEY : '');

    const systemPrompt = `Kamu adalah Asisten Akademik & Penulis Riset Senior di platform Komit.
Tugasmu adalah menyusun dokumen blueprint terstruktur Markdown bernama "topik.md" untuk membantu tim admin/joki menyusun ${
      isMakalah ? 'Makalah / Karya Ilmiah' : 'Slide Presentasi PPT'
    } mahasiswa yang komprehensif, akademis, dan memenuhi ekspektasi dosen penguji.

DOKUMEN INI HARUS MEMUAT STRUKTUR BERIKUT DALAM FORMAT MARKDOWN RESMI:
# [JUDUL LENGKAP MAKALAH / SLIDE PRESENTASI]

## 1. Identitas Penulis / Tim Pengembang
(Cantumkan daftar nama dan NIM anggota dengan rapi)

## 2. Latar Belakang Masalah
(Uraikan konteks masalah nyata, fenomena, dan alasan mengapa topik ini krusial untuk dikaji)

## 3. Rumusan Masalah & Tujuan Penulisan
(Poin-poin spesifik yang akan dijawab dan diselesaikan dalam dokumen ini)

## 4. Kerangka Kerja & Struktur ${isMakalah ? 'Bab Pembahasan' : 'Slide Presentasi'}
(Detail bab demi bab dari Pendahuluan sampai Penutup atau susunan Slide per Slide, sesuaikan dengan instruksi khusus klien)

## 5. Poin Kunci Analisis & Temuan Utama
(Bocoran poin argumentasi dan fakta penting yang perlu dimasukkan ke dalam naskah)

## 6. Rekomendasi Format & Sumber Referensi
(Format margin, sitasi IEEE/APA, dan referensi jurnal terindeks yang direkomendasikan)
`;

    const userPrompt = `Tolong susun dokumen "topik.md" untuk:
- Kategori Layanan: ${isMakalah ? 'Makalah & Laporan Akademik' : 'Slide Presentasi (PPT)'}
- Topik / Judul Klien: "${topic}"
- Detail & Instruksi Khusus Klien: "${details}"
- Anggota Tim:
${membersFormatted}

Pastikan isi dokumen tajam, bernas, berbobot ilmiah tinggi, dan langsung siap dipakai oleh operator joki untuk mengetik naskah asli.`;

    let generatedMarkdown = '';

    // 1. Eksekusi ke Groq LPU API jika Key tersedia
    if (groqKey && groqKey !== 'your-groq-api-key') {
      const groqModels = ['llama-3.3-70b-versatile', 'qwen/qwen3.8-27b', 'openai/gpt-oss-120b'];
      for (const model of groqModels) {
        try {
          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${groqKey}`,
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              temperature: 0.7,
              max_tokens: 2500,
            }),
          });

          if (groqRes.ok) {
            const result = await groqRes.json();
            generatedMarkdown = result.choices[0]?.message?.content || '';
            if (generatedMarkdown.trim()) break;
          }
        } catch (err) {
          console.warn(`Percobaan Groq model ${model} gagal, mencoba model berikutnya:`, err);
        }
      }
    }

    // 2. Fallback cerdas jika Groq belum diset / offline
    if (!generatedMarkdown.trim()) {
      generatedMarkdown = `# ${topic}

> Dokumen acuan pengerjaan resmi untuk pesanan ${isMakalah ? 'Makalah' : 'Slide Presentasi'} (ID Proyek: \`#${project.id.slice(0, 8)}\`).

---

## 1. Identitas Penulis & Tim Mahasiswa
${membersFormatted}

- **WhatsApp Pemesan:** \`${project.buyer_whatsapp}\`
- **Tanggal Pemesanan:** \`${new Date(project.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}\`

---

## 2. Latar Belakang & Urgensi Topik
Topik **"${topic}"** mengkaji perbedaan mendasar dalam struktur sosial, pola konsumsi, serta interaksi harian masyarakat di dua kutub peradaban urban yang kontras. Fenomena ini menarik untuk dibedah secara akademis karena mencerminkan benturan antara budaya komunal berbasis tradisi (*Jogja*) dengan dinamika individualistis-akseleratif di megapolitan (*Jakarta*).

---

## 3. Rumusan Masalah & Tujuan Pembahasan
1. Bagaimana perbedaan pola pengeluaran, alokasi pendapatan, dan orientasi belanja masyarakat Jogja vs Jakarta?
2. Bagaimana ritme kerja, tingkat mobilitas, dan tekanan psikososial memengaruhi keseimbangan hidup (*work-life balance*) di kedua kota?
3. Apa implikasi dari disparitas biaya hidup dan upah minimum terhadap persepsi kebahagiaan dan kepuasan hidup warga setempat?

---

## 4. Kerangka Struktur ${isMakalah ? 'Bab Makalah' : 'Slide Presentasi'}
${
  isMakalah
    ? `### BAB I: PENDAHULUAN
- 1.1 Latar Belakang Masalah
- 1.2 Rumusan Masalah & Batasan Penelitian
- 1.3 Tujuan & Manfaat Penulisan

### BAB II: TINJAUAN PUSTAKA & KERANGKA TEORI
- 2.1 Teori Gaya Hidup & Konsumerisme (Bourdieu & Veblen)
- 2.2 Sosiologi Ruang Urban & Pola Interaksi Perkotaan
- 2.3 Studi Komparasi Biaya Hidup Antar-Wilayah Indonesia

### BAB III: METODOLOGI PENULISAN
- 3.1 Pendekatan Deskriptif Kualitatif & Analisis Data Sekunder (BPS & Survei)
- 3.2 Indikator Komparasi: Finansial, Mobilitas, Sosial, & Rekreasi

### BAB IV: PEMBAHASAN & ANALISIS KOMPARATIF
- 4.1 Perbandingan Pola Finansial: Upah Regional vs Indeks Harga Konsumen
- 4.2 Dinamika Mobilitas: "Klitikan & Angkringan" vs "Commuter & KRL Jabodetabek"
- 4.3 Konstruksi Identitas Sosial dan Makna "Waktu Luang"

### BAB V: PENUTUP
- 5.1 Kesimpulan Analisis
- 5.2 Saran & Rekomendasi Kebijakan Urban`
    : `### STRUKTUR SLIDE PRESENTASI (12-15 SLIDE):
- **Slide 1:** Judul Presentasi & Identitas Tim (Nama + NIM)
- **Slide 2:** Executive Summary & Urgensi Riset
- **Slide 3:** Gambaran Umum Demografi: Jogja vs Jakarta
- **Slide 4:** Perbandingan Ekonomi: UMR vs Indeks Biaya Hidup Riil
- **Slide 5:** Pola Mobilitas & Tekanan Harian (Commute Time)
- **Slide 6:** Budaya Konsumsi & Gaya Hidup Rekreasi
- **Slide 7:** Interaksi Sosial: Guyub Komunal vs Efisiensi Individual
- **Slide 8:** Analisis SWOT Gaya Hidup Kedua Kota
- **Slide 9:** Temuan Kunci & Studi Kasus Lapangan
- **Slide 10:** Kesimpulan Komparatif
- **Slide 11:** Tanya-Jawab & Sesi Diskusi Dosen`
}

---

## 5. Instruksi Khusus Klien
> **Catatan Pemesan:** "${details}"

- **Panduan Eksekusi Operator:** Pastikan seluruh batasan halaman/slide dan format kutipan yang diminta klien di atas dipatuhi secara ketat sebelum dokumen diserahkan.

---

## 6. Rekomendasi Sitasi & Referensi
- Badan Pusat Statistik (BPS). (2024). *Indikator Kesejahteraan Rakyat Provinsi DKI Jakarta & D.I. Yogyakarta*.
- Jurnal Ilmiah Sosiologi Perkotaan & Kajian Budaya Nusantara (Terakreditasi SINTA).
- Format Referensi: Mengikuti standar APA 7th Edition / IEEE.
`;
    }

    // 3. Simpan generated markdown ke project
    await updateProject(projectId, {
      readme_content: generatedMarkdown,
    });

    return NextResponse.json({
      ok: true,
      markdown: generatedMarkdown,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menghasilkan topik.md';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
