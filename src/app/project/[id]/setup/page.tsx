'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Project, IdeaItem, ProjectMember } from '@/lib/types';

export default function ProjectSetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<Array<{ name: string; nim: string; kom: string; github_username: string }>>([]);
  const [dbMembers, setDbMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ideation state
  const [niche, setNiche] = useState<string>('');
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState<boolean>(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<IdeaItem[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<IdeaItem | null>(null);

  // Member form submission state
  const [isSavingMembers, setIsSavingMembers] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error('Proyek tidak ditemukan');
        const data = await res.json();
        setProject(data.project);

        if (data.project.selected_idea) {
          setSelectedIdea(data.project.selected_idea);
        }
        if (data.project.niche_input) {
          setNiche(data.project.niche_input);
        }

        const mRes = await fetch(`/api/projects/${id}/members`);
        if (mRes.ok) {
          const mData = await mRes.json();
          setDbMembers(mData.members || []);
          if (mData.members && mData.members.length > 0) {
            setMembers(
              mData.members.map((m: ProjectMember) => ({
                name: m.name,
                nim: m.nim,
                kom: m.kom,
                github_username: m.github_username || '',
              }))
            );
          } else {
            const count = data.project.member_count || 1;
            setMembers(
              Array.from({ length: count }, () => ({
                name: '',
                nim: '',
                kom: 'A',
                github_username: '',
              }))
            );
          }
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Gagal memuat proyek');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  const handleSimulatePaymentApprove = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: 'paid', status: 'setup' }),
      });
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
      }
    } catch {
      alert('Gagal memperbarui status');
    }
  };

  const handleGenerateIdeas = async () => {
    if (!niche.trim()) {
      alert('Masukkan topik mata kuliah terlebih dahulu');
      return;
    }

    setIsGeneratingIdeas(true);
    try {
      const res = await fetch('/api/ai/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, service_type: project?.service_type }),
      });
      const data = await res.json();
      if (res.ok && data.ideas) {
        setGeneratedIdeas(data.ideas);
      } else {
        throw new Error(data.error || 'Gagal generate ide');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal memanggil AI');
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handleSelectIdea = async (idea: IdeaItem) => {
    setSelectedIdea(idea);
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selected_idea: idea,
          niche_input: niche,
        }),
      });
    } catch (err) {
      console.error('Failed to lock idea:', err);
    }
  };

  const handleMemberChange = (index: number, field: string, val: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: val };
    setMembers(updated);
  };

  const handleSaveMembers = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMembers(true);
    try {
      const res = await fetch(`/api/projects/${id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members }),
      });
      if (!res.ok) throw new Error('Gagal menyimpan data anggota');
      const data = await res.json();
      setDbMembers(data.members);
      alert('Data anggota kelompok berhasil disimpan!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal simpan anggota');
    } finally {
      setIsSavingMembers(false);
    }
  };

  const copyInviteLink = () => {
    const url = `${window.location.origin}/join/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) {
    return (
      <div className="bg-[#040506] text-white min-h-screen flex items-center justify-center font-mono text-[14px]">
        Memuat data setup proyek...
      </div>
    );
  }

  if (errorMsg || !project) {
    return (
      <div className="bg-[#040506] text-white min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-[20px] font-normal">Proyek Tidak Ditemukan</h1>
        <Link href="/" className="text-[#9c9c9d] hover:text-white underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  // 1. PAYMENT GATE
  if (project.payment_status !== 'paid') {
    return (
      <div className="bg-[#040506] text-white min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-[680px] w-full mx-auto px-6 py-20 flex flex-col gap-8">
          <div className="p-8 rounded-2xl bg-[#07080a] border border-[#363739] key-shadow flex flex-col gap-6">
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.05em] text-[#ff6363]">
              Verifikasi Pembayaran QRIS
            </div>
            <h1 className="text-[28px] sm:text-[34px] font-normal text-white">
              Menunggu Konfirmasi Admin
            </h1>
            <p className="text-[15px] text-[#9c9c9d] leading-relaxed">
              Halo <strong className="text-white font-medium">{project.buyer_name}</strong>, pesanan untuk paket <strong className="text-white font-medium">{project.package_type}</strong> dengan total <strong className="text-white font-mono font-medium">Rp {project.total_price.toLocaleString('id-ID')}</strong> sedang dalam antrean verifikasi operator joki.
            </p>

            <div className="text-[13px] text-[#6a6b6c] font-mono border-t border-[#1b1c1e] pt-4 flex flex-col gap-1">
              <div>WhatsApp Pemesan: <span className="text-white">{project.buyer_whatsapp}</span></div>
              <div>ID Proyek: <span className="text-white">{project.id}</span></div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#1b1c1e] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[12px] text-[#6a6b6c]">Mode pengujian cepat:</span>
              <button
                onClick={handleSimulatePaymentApprove}
                className="bg-[#e6e6e6] hover:bg-white text-[#454647] text-[13px] font-medium px-4 py-2 rounded-lg transition-all"
              >
                Simulasi Approve Pembayaran
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 2. SETUP ACTIVE
  return (
    <div className="bg-[#040506] text-white min-h-screen flex flex-col selection:bg-[#ff6363]/30">
      <Navbar />

      <main className="flex-1 max-w-[900px] w-full mx-auto px-6 py-12 flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono uppercase tracking-[0.05em] text-[#59d499] bg-[#59d499]/10 px-2 py-0.5 rounded-[4px] border border-[#59d499]/30">
              Pembayaran Terverifikasi
            </span>
            <span className="text-[12px] text-[#6a6b6c] font-mono">
              ID: {project.id.slice(0, 8)}
            </span>
          </div>
          <h1 className="text-[32px] sm:text-[40px] font-normal text-white">
            Setup Proyek & Data Kelompok
          </h1>
          <p className="text-[15px] text-[#9c9c9d] leading-relaxed">
            Pilih rekomendasi ide AI, lengkapi data anggota kelompok, dan hubungkan akun GitHub sebelum pengerjaan sprint dimulai.
          </p>
        </div>

        {/* STEP 1: AI IDEATION */}
        {(project.package_type === 'full' || project.package_type === 'idea_only') && (
          <section className="p-6 rounded-2xl bg-[#07080a] border border-[#363739] key-shadow flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-mono uppercase tracking-[0.05em] text-[#ff6363]">
                Langkah 1: Rekomendasi Ide AI & Gimmick Dosen
              </span>
              <p className="text-[14px] text-[#9c9c9d]">
                Ketik topik mata kuliah atau niche, AI akan menyajikan 3 opsi proyek berdaya saing.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Contoh: Pemrograman Web — Sistem Manajemen Lab Komputer"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="flex-1 bg-white/[0.05] border border-white/10 focus:border-white/30 rounded-lg px-3.5 py-2 text-[14px] text-white outline-none"
              />
              <button
                type="button"
                onClick={handleGenerateIdeas}
                disabled={isGeneratingIdeas}
                className="bg-[#e6e6e6] hover:bg-white disabled:opacity-50 text-[#454647] text-[13px] font-medium px-4 py-2 rounded-lg transition-all shrink-0"
              >
                {isGeneratingIdeas ? 'Menghasilkan...' : 'Generate 3 Ide AI'}
              </button>
            </div>

            {selectedIdea && (
              <div className="p-4 rounded-xl bg-[#111214] border border-[#ff6363]/50 key-shadow-active flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-[#ff6363]">
                    Ide Terpilih & Terkunci
                  </span>
                  <span className="text-[11px] text-[#59d499] font-mono">Tersimpan</span>
                </div>
                <h3 className="text-[18px] font-medium text-white">{selectedIdea.title}</h3>
                <p className="text-[14px] text-[#9c9c9d]">{selectedIdea.description}</p>
                <div className="p-3 rounded-lg bg-[#040506] border border-[#1b1c1e] text-[13px]">
                  <span className="text-[11px] text-[#ff6363] font-mono uppercase block mb-0.5">
                    Gimmick Pemikat Dosen:
                  </span>
                  <span className="text-white">{selectedIdea.gimmick}</span>
                </div>
              </div>
            )}

            {generatedIdeas.length > 0 && (
              <div className="grid grid-cols-1 gap-3">
                {generatedIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col gap-3 ${
                      selectedIdea?.id === idea.id
                        ? 'bg-[#111214] border-[#ff6363]/50 key-shadow-active'
                        : 'bg-[#040506] border-[#1b1c1e] hover:border-[#363739]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-[16px] font-medium text-white">{idea.title}</h4>
                        <p className="text-[13px] text-[#9c9c9d] mt-1">{idea.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectIdea(idea)}
                        className={`text-[12px] font-medium px-3 py-1.5 rounded-lg shrink-0 transition-all ${
                          selectedIdea?.id === idea.id
                            ? 'bg-[#e6e6e6] text-[#454647]'
                            : 'border border-[#363739] text-[#9c9c9d] hover:text-white'
                        }`}
                      >
                        {selectedIdea?.id === idea.id ? 'Terkunci' : 'Kunci Ide Ini'}
                      </button>
                    </div>

                    <div className="p-3 rounded-lg bg-[#07080a] border border-[#111214]">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#ff6363] block mb-0.5">
                        Gimmick Dosen:
                      </span>
                      <p className="text-[12px] text-white">{idea.gimmick}</p>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {idea.techStack?.map((t) => (
                        <span key={t} className="text-[10px] font-mono text-[#6a6b6c] px-2 py-0.5 rounded bg-[#111214]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* STEP 2: MEMBER DATA FORM */}
        <section className="p-6 rounded-2xl bg-[#07080a] border border-[#363739] key-shadow flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-mono uppercase tracking-[0.05em] text-[#ff6363]">
              Langkah 2: Data Anggota Kelompok ({project.member_count} Orang)
            </span>
            <p className="text-[14px] text-[#9c9c9d]">
              Data ini dicantumkan dalam README laporan resmi dan dikaitkan dengan akun GitHub masing-masing anggota.
            </p>
          </div>

          <form onSubmit={handleSaveMembers} className="flex flex-col gap-3">
            {members.map((m, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#040506] border border-[#1b1c1e] grid grid-cols-1 sm:grid-cols-4 gap-3 items-center"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#6a6b6c]">Nama Anggota {idx + 1}</span>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap"
                    value={m.name}
                    onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                    className="bg-white/[0.05] border border-white/10 focus:border-white/30 rounded-lg px-2.5 py-1.5 text-[13px] text-white outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#6a6b6c]">NIM</span>
                  <input
                    type="text"
                    required
                    placeholder="211401001"
                    value={m.nim}
                    onChange={(e) => handleMemberChange(idx, 'nim', e.target.value)}
                    className="bg-white/[0.05] border border-white/10 focus:border-white/30 rounded-lg px-2.5 py-1.5 text-[13px] font-mono text-white outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#6a6b6c]">Kelas / KOM</span>
                  <input
                    type="text"
                    required
                    placeholder="A / B / C"
                    value={m.kom}
                    onChange={(e) => handleMemberChange(idx, 'kom', e.target.value)}
                    className="bg-white/[0.05] border border-white/10 focus:border-white/30 rounded-lg px-2.5 py-1.5 text-[13px] text-white outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#6a6b6c]">Username GitHub</span>
                  <input
                    type="text"
                    placeholder="cth: budi_dev"
                    value={m.github_username}
                    onChange={(e) => handleMemberChange(idx, 'github_username', e.target.value)}
                    className="bg-white/[0.05] border border-white/10 focus:border-white/30 rounded-lg px-2.5 py-1.5 text-[13px] font-mono text-white outline-none"
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={isSavingMembers}
              className="self-end bg-[#e6e6e6] hover:bg-white disabled:opacity-50 text-[#454647] text-[13px] font-medium px-4 py-2 rounded-lg transition-all mt-2"
            >
              {isSavingMembers ? 'Menyimpan...' : 'Simpan Data Anggota'}
            </button>
          </form>
        </section>

        {/* STEP 3: CONNECT GITHUB INVITATION */}
        <section className="p-6 rounded-2xl bg-[#07080a] border border-[#363739] key-shadow flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-mono uppercase tracking-[0.05em] text-[#ff6363]">
              Langkah 3: Tautan Undangan GitHub Anggota
            </span>
            <p className="text-[14px] text-[#9c9c9d]">
              Kirim tautan ini ke grup WhatsApp kelompok. Masing-masing anggota klik &quot;Connect GitHub&quot; agar commit tercatat atas nama akun mereka.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#040506] border border-[#1b1c1e] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[13px] font-mono text-[#9c9c9d] truncate max-w-md">
              {typeof window !== 'undefined' ? `${window.location.origin}/join/${id}` : `/join/${id}`}
            </div>
            <button
              onClick={copyInviteLink}
              className="bg-[#111214] hover:bg-[#1b1c1e] text-white border border-[#363739] text-[12px] px-3.5 py-1.5 rounded-lg transition-all shrink-0"
            >
              {copiedLink ? '✓ Tautan Disalin!' : 'Salin Tautan'}
            </button>
          </div>

          {dbMembers.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-mono uppercase text-[#6a6b6c]">Status Koneksi Anggota:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dbMembers.map((m) => (
                  <div key={m.id} className="p-3 rounded-lg border border-[#1b1c1e] bg-[#040506] flex items-center justify-between">
                    <div>
                      <div className="text-[14px] text-white">{m.name}</div>
                      <div className="text-[12px] text-[#6a6b6c] font-mono">@{m.github_username || 'unconnected'}</div>
                    </div>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-[4px] ${
                        m.is_connected
                          ? 'bg-[#59d499]/10 text-[#59d499] border border-[#59d499]/30'
                          : 'bg-[#1b1c1e] text-[#6a6b6c]'
                      }`}
                    >
                      {m.is_connected ? 'Connected' : 'Menunggu'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center border-t border-[#1b1c1e] pt-4">
            <Link href="/" className="text-[13px] text-[#9c9c9d] hover:text-white">
              Kembali
            </Link>
            <Link
              href={`/project/${id}`}
              className="inline-flex items-center justify-center bg-[#e6e6e6] hover:bg-white text-[#454647] text-[13px] font-medium rounded-lg px-5 py-2 transition-all shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
            >
              Buka Dashboard Proyek →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
