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

        // Fetch existing members if any
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
            // Initialize empty rows based on member_count
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
        const msg = err instanceof Error ? err.message : 'Gagal memuat proyek';
        setErrorMsg(msg);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  // Demo auto-approve payment handler
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

  // Generate AI Ideas
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

  // Lock selected idea
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

  // Member list change
  const handleMemberChange = (index: number, field: string, val: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: val };
    setMembers(updated);
  };

  // Save members
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
      <div className="bg-[#000000] text-[#ffffff] min-h-screen flex items-center justify-center font-extralight text-[16px]">
        Memuat data setup proyek...
      </div>
    );
  }

  if (errorMsg || !project) {
    return (
      <div className="bg-[#000000] text-[#ffffff] min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-[24px]">Proyek Tidak Ditemukan</h1>
        <Link href="/" className="text-[#8052ff] underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  // 1. PAYMENT GATE (If payment is still pending)
  if (project.payment_status !== 'paid') {
    return (
      <div className="bg-[#000000] text-[#ffffff] min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-[720px] w-full mx-auto px-6 py-20 flex flex-col gap-8">
          <div className="p-8 rounded-3xl border border-white/10 bg-[#060606] flex flex-col gap-6">
            <span className="text-[12px] uppercase tracking-[0.2em] text-[#ffb829]">
              Status Verifikasi QRIS
            </span>
            <h1 className="text-[32px] md:text-[40px] font-normal tracking-[-0.03em] leading-tight">
              Pembayaran Sedang Diverifikasi Admin
            </h1>
            <p className="text-[16px] text-[#9a9a9a] font-extralight leading-relaxed">
              Halo <strong className="text-white font-normal">{project.buyer_name}</strong>, bukti pembayaran untuk paket <strong className="text-white font-normal">{project.package_type}</strong> sebesar <strong className="text-[#ffb829] font-mono tabular-nums">Rp {project.total_price.toLocaleString('id-ID')}</strong> telah kami terima dan sedang diverifikasi oleh tim joki.
            </p>
            <div className="text-[14px] text-[#9a9a9a] border-t border-white/5 pt-4 flex flex-col gap-1">
              <div>WhatsApp Pemesan: <span className="text-white font-mono">{project.buyer_whatsapp}</span></div>
              <div>ID Proyek: <span className="text-white font-mono">{project.id}</span></div>
            </div>

            {/* Quick Demo Simulator for reviewer */}
            <div className="mt-4 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[12px] text-[#9a9a9a]">Tombol demo verifikasi cepat:</span>
              <button
                onClick={handleSimulatePaymentApprove}
                className="bg-[#15846e] hover:bg-[#126b59] text-white text-[13px] font-normal uppercase tracking-wider px-5 py-2.5 rounded-full transition-all"
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

  // 2. SETUP ACTIVE (Payment has been approved)
  return (
    <div className="bg-[#000000] text-[#ffffff] min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[960px] w-full mx-auto px-6 py-12 flex flex-col gap-16">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-[12px] uppercase tracking-[0.2em] text-[#15846e] px-2.5 py-0.5 rounded-full border border-[#15846e]/40">
              Pembayaran Terverifikasi
            </span>
            <span className="text-[12px] text-[#9a9a9a] font-mono tabular-nums">
              ID: {project.id.slice(0, 8)}
            </span>
          </div>
          <h1 className="text-[36px] md:text-[48px] font-normal tracking-[-0.04em] text-[#ffffff]">
            Setup Proyek & Data Kelompok
          </h1>
          <p className="text-[16px] text-[#9a9a9a] font-extralight leading-relaxed max-w-2xl">
            Lengkapi pemilihan ide aplikasi dari AI, data anggota kelompok, dan bagikan tautan koneksi GitHub sebelum tim joki memulai pengerjaan kode.
          </p>
        </div>

        {/* STEP 1: AI IDEATION & GIMMICK (For full or idea_only package) */}
        {(project.package_type === 'full' || project.package_type === 'idea_only') && (
          <section className="flex flex-col gap-6 border-t border-white/10 pt-8">
            <div className="flex flex-col gap-1">
              <span className="text-[14px] uppercase tracking-[0.1em] text-[#ffb829]">
                Langkah 1: Rekomendasi Ide AI & Gimmick Pemikat Dosen
              </span>
              <p className="text-[14px] text-[#9a9a9a] font-extralight">
                Ketik topik mata kuliah atau niche yang diinginkan, AI kami akan menghasilkan 3 opsi proyek berdaya saing tinggi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Contoh: Pemrograman Web — Sistem Manajemen Lab Komputer"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="flex-1 bg-black border border-white/15 focus:border-[#8052ff] rounded-xl px-4 py-3 text-[15px] text-[#ffffff] outline-none"
              />
              <button
                type="button"
                onClick={handleGenerateIdeas}
                disabled={isGeneratingIdeas}
                className="bg-[#8052ff] hover:bg-[#7042ef] disabled:opacity-50 text-white text-[13px] font-normal uppercase tracking-wider px-6 py-3 rounded-full transition-all shrink-0"
              >
                {isGeneratingIdeas ? 'Menghasilkan Ide...' : 'Generate 3 Ide AI'}
              </button>
            </div>

            {/* Selected Idea Banner if locked */}
            {selectedIdea && (
              <div className="p-6 rounded-2xl border border-[#8052ff]/40 bg-[#8052ff]/5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] uppercase tracking-[0.15em] text-[#8052ff] font-semibold">
                    Ide Terpilih & Terkunci
                  </span>
                  <span className="text-[12px] text-[#15846e] font-mono">Tersimpan</span>
                </div>
                <h3 className="text-[20px] font-normal text-white">{selectedIdea.title}</h3>
                <p className="text-[14px] text-[#bdbdbd] font-extralight">{selectedIdea.description}</p>
                <div className="p-3 rounded-xl bg-black/60 border border-white/5">
                  <span className="text-[12px] text-[#ffb829] uppercase tracking-wider block mb-1">
                    Gimmick Pemikat Dosen:
                  </span>
                  <span className="text-[14px] text-white font-extralight">{selectedIdea.gimmick}</span>
                </div>
              </div>
            )}

            {/* Generated Ideas Cards */}
            {generatedIdeas.length > 0 && (
              <div className="grid grid-cols-1 gap-4 mt-2">
                {generatedIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className={`p-6 rounded-2xl border transition-all flex flex-col gap-4 ${
                      selectedIdea?.id === idea.id
                        ? 'border-[#8052ff] bg-[#8052ff]/10'
                        : 'border-white/10 hover:border-white/20 bg-[#050505]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-[18px] font-normal text-white">{idea.title}</h4>
                        <p className="text-[14px] text-[#9a9a9a] font-extralight mt-1">
                          {idea.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectIdea(idea)}
                        className={`text-[12px] font-normal uppercase tracking-wider px-4 py-2 rounded-full shrink-0 transition-all ${
                          selectedIdea?.id === idea.id
                            ? 'bg-[#8052ff] text-white'
                            : 'border border-white/20 text-[#ffffff] hover:border-white/40'
                        }`}
                      >
                        {selectedIdea?.id === idea.id ? 'Terkunci' : 'Kunci Ide Ini'}
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black border border-white/5">
                      <span className="text-[11px] uppercase tracking-widest text-[#ffb829] block mb-1">
                        Gimmick Dosen:
                      </span>
                      <p className="text-[13px] text-white font-extralight leading-relaxed">
                        {idea.gimmick}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {idea.techStack?.map((t) => (
                        <span key={t} className="text-[11px] font-mono text-[#9a9a9a] px-2.5 py-0.5 rounded-md bg-white/5">
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
        <section className="flex flex-col gap-6 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-1">
            <span className="text-[14px] uppercase tracking-[0.1em] text-[#ffb829]">
              Langkah 2: Data Anggota Kelompok ({project.member_count} Orang)
            </span>
            <p className="text-[14px] text-[#9a9a9a] font-extralight">
              Data ini akan dicantumkan di README laporan resmi dan dikaitkan dengan akun GitHub masing-masing anggota.
            </p>
          </div>

          <form onSubmit={handleSaveMembers} className="flex flex-col gap-4">
            {members.map((m, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-white/10 bg-[#050505] grid grid-cols-1 sm:grid-cols-4 gap-3 items-center"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] uppercase text-[#9a9a9a]">Nama Anggota {idx + 1}</span>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap"
                    value={m.name}
                    onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                    className="bg-black border border-white/15 focus:border-[#8052ff] rounded-lg px-3 py-2 text-[14px] text-white outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] uppercase text-[#9a9a9a]">NIM</span>
                  <input
                    type="text"
                    required
                    placeholder="211401001"
                    value={m.nim}
                    onChange={(e) => handleMemberChange(idx, 'nim', e.target.value)}
                    className="bg-black border border-white/15 focus:border-[#8052ff] rounded-lg px-3 py-2 text-[14px] font-mono text-white outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] uppercase text-[#9a9a9a]">Kelas / KOM</span>
                  <input
                    type="text"
                    required
                    placeholder="A / B / C"
                    value={m.kom}
                    onChange={(e) => handleMemberChange(idx, 'kom', e.target.value)}
                    className="bg-black border border-white/15 focus:border-[#8052ff] rounded-lg px-3 py-2 text-[14px] text-white outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] uppercase text-[#9a9a9a]">Username GitHub</span>
                  <input
                    type="text"
                    placeholder="cth: budi_dev"
                    value={m.github_username}
                    onChange={(e) => handleMemberChange(idx, 'github_username', e.target.value)}
                    className="bg-black border border-white/15 focus:border-[#8052ff] rounded-lg px-3 py-2 text-[14px] font-mono text-white outline-none"
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={isSavingMembers}
              className="self-end bg-[#8052ff] hover:bg-[#7042ef] disabled:opacity-50 text-white text-[13px] font-normal uppercase tracking-wider px-6 py-3 rounded-full transition-all"
            >
              {isSavingMembers ? 'Menyimpan Data...' : 'Simpan Data Anggota'}
            </button>
          </form>
        </section>

        {/* STEP 3: CONNECT GITHUB INVITATION */}
        <section className="flex flex-col gap-6 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-1">
            <span className="text-[14px] uppercase tracking-[0.1em] text-[#15846e]">
              Langkah 3: Tautan Undangan Connect GitHub Anggota
            </span>
            <p className="text-[14px] text-[#9a9a9a] font-extralight">
              Kirimkan link ini ke grup WhatsApp kelompok Anda. Masing-masing teman klik &quot;Connect GitHub&quot; agar commit dapat di-push atas nama akun mereka.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-white/10 bg-[#060606] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[14px] font-mono text-[#bdbdbd] truncate max-w-md">
              {typeof window !== 'undefined' ? `${window.location.origin}/join/${id}` : `/join/${id}`}
            </div>
            <button
              onClick={copyInviteLink}
              className="bg-white/10 hover:bg-white/20 text-white text-[13px] px-5 py-2.5 rounded-full transition-all shrink-0"
            >
              {copiedLink ? '✓ Tautan Disalin!' : 'Salin Tautan Undangan'}
            </button>
          </div>

          {/* Members connection status indicator */}
          {dbMembers.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[12px] uppercase text-[#9a9a9a]">Status Koneksi Akun Anggota:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dbMembers.map((m) => (
                  <div key={m.id} className="p-3 rounded-xl border border-white/5 bg-black flex items-center justify-between">
                    <div>
                      <div className="text-[14px] text-white">{m.name}</div>
                      <div className="text-[12px] text-[#9a9a9a] font-mono">@{m.github_username || 'belum connect'}</div>
                    </div>
                    <span
                      className={`text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        m.is_connected
                          ? 'bg-[#15846e]/20 text-[#15846e] border border-[#15846e]/40'
                          : 'bg-white/5 text-[#9a9a9a]'
                      }`}
                    >
                      {m.is_connected ? 'Connected' : 'Menunggu'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Proceed to Dashboard CTA */}
          <div className="flex justify-between items-center border-t border-white/10 pt-6">
            <Link href="/" className="text-[14px] text-[#9a9a9a] hover:text-white">
              Kembali
            </Link>
            <Link
              href={`/project/${id}`}
              className="inline-flex items-center justify-center bg-[#8052ff] hover:bg-[#7042ef] text-white text-[14px] font-normal uppercase tracking-[0.025em] px-8 py-3.5 rounded-full transition-all"
            >
              Buka Dashboard Proyek
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
