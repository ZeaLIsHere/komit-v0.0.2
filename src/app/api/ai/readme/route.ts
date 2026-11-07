import { NextResponse } from 'next/server';
import { updateProject } from '@/lib/data';
import { IdeaItem, ProjectMember } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const { projectId, selectedIdea, members } = (await req.json()) as {
      projectId: string;
      selectedIdea: IdeaItem;
      members: ProjectMember[];
    };

    if (!selectedIdea) {
      return NextResponse.json({ error: 'Data ide proyek wajib disertakan' }, { status: 400 });
    }

    const memberList = (members || [])
      .map((m, idx) => {
        const gh = m.github_username ? `GitHub: \`@${m.github_username}\`` : 'GitHub: Pending';
        const nimKom = m.nim && m.nim !== '-' ? `, NIM: \`${m.nim}\`, KOM: \`${m.kom}\`` : '';
        return `${idx + 1}. **${m.name}** (${gh}${nimKom})`;
      })
      .join('\n');

    const memberRoles = (members || []).map((m, idx) => {
      const roles = [
        'Lead Architect & Backend API / Database Schema Design',
        'Frontend UI/UX Specialist & Responsive View Implementation',
        'Authentication Flow & Security Hardening / Git Branching',
        'Testing, API Integration & Deployment Configuration',
        'Database Optimization & Report Generator Services',
      ];
      return `- **${m.name}**: ${roles[idx % roles.length]}`;
    }).join('\n');

    const techStackBadges = (selectedIdea.techStack || ['Next.js', 'PostgreSQL', 'Tailwind CSS'])
      .map((t) => `\`${t}\``)
      .join(' • ');

    const readmeContent = `# ${selectedIdea.title}

> **Deskripsi:** ${selectedIdea.description}  
> **Tech Stack:** ${techStackBadges}  
> **Gimmick Pemikat Dosen:** ${selectedIdea.gimmick}

---

## 👥 Tim Pengembang (Kelompok)
${memberList || '- Belum ada data anggota'}

### Pembagian Tugas & Tanggung Jawab
${memberRoles || '- Pembagian tugas tim'}

---

## 🏛️ Arsitektur Sistem
Aplikasi ini dibangun menggunakan arsitektur modular berlapis (*separation of concerns*):
1. **Presentation Layer:** Antarmuka responsif dengan standar UX modern dan feedback visual instan.
2. **Business Logic Layer:** Controller terisolasi dengan validasi ketat di batas request.
3. **Data Access Layer:** ORM / Query builder terindeks untuk query atomic dan aman dari SQL Injection.

---

## 🚀 Panduan Menjawab Pertanyaan Dosen Penguji UAS
Ketika dosen menguji kelayakan dan orisinalitas proyek ini, gunakan argumen teknis berikut:

1. **"Mengapa memilih stack ${selectedIdea.techStack?.[0] || 'ini'}?"**  
   *Jawaban:* Stack ini menawarkan performa rendering optimal, skalabilitas tinggi, ekosistem library matang, dan kemudahan kolaborasi multi-developer lewat typing statis.

2. **"Apa nilai keunikan atau fitur unggulan aplikasi ini?"**  
   *Jawaban:* Implementasi **"${selectedIdea.gimmick}"** yang dirancang spesifik untuk menjawab inefisiensi pada sistem konvensional.

3. **"Bagaimana pembagian commit di repository?"**  
   *Jawaban:* Setiap anggota memiliki branch fitur terpisah dengan riwayat commit atomik sesuai jadwal iterasi sprint mingguan.
`;

    if (projectId) {
      await updateProject(projectId, { readme_content: readmeContent });
    }

    return NextResponse.json({ readme: readmeContent });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Gagal menghasilkan README';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
