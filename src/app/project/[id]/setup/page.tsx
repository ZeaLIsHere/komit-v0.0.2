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

  // Quick fill demo members
  const handleQuickFillMembers = () => {
    const dummyList = [
      { name: 'Fadhil Pratama', nim: '221401010', kom: 'A', github_username: 'fadhilpratama' },
      { name: 'Sarah Amanda', nim: '221401011', kom: 'A', github_username: 'sarahamanda' },
      { name: 'Reza Fauzan', nim: '221401012', kom: 'A', github_username: 'rezafauzan' },
      { name: 'Nabila Putri', nim: '221401013', kom: 'A', github_username: 'nabilaputri' },
      { name: 'Ilham Hidayat', nim: '221401014', kom: 'B', github_username: 'ilhamhidayat' },
      { name: 'Aisyah Zahra', nim: '221401015', kom: 'B', github_username: 'aisyahzahra' },
      { name: 'Kevin Santoso', nim: '221401016', kom: 'C', github_username: 'kevinsantoso' },
      { name: 'Tiara Maharani', nim: '221401017', kom: 'C', github_username: 'tiaramaharani' },
    ];
    const count = project?.member_count || 4;
    setMembers(dummyList.slice(0, count));
  };

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
      <div className="text-[#bbc7c6] min-h-screen flex items-center justify-center font-mono text-[14px]">
        Memuat data setup proyek...
      </div>
    );
  }

  if (errorMsg || !project) {
    return (
      <div className="text-[#bbc7c6] min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-[24px] font-medium text-white">Proyek Tidak Ditemukan</h1>
        <Link href="/" className="text-[#cbfffc] underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  // 1. PAYMENT GATE
  if (project.payment_status !== 'paid') {
    return (
      <div className="text-[#ededed] min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-[760px] w-full mx-auto px-6 py-20 flex flex-col gap-8">
          <div className="p-10 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col gap-6">
            <h1 className="text-[32px] sm:text-[40px] font-medium leading-[1.1] text-white tracking-[-0.03em]">
              Menunggu Konfirmasi Operator
            </h1>
            <p className="text-[15px] text-[#c2c2c2] leading-[1.5]">
              Halo <strong className="text-white font-medium">{project.buyer_name}</strong>, bukti pembayaran untuk paket <strong className="text-white font-medium">{project.package_type}</strong> dengan total tagihan <strong className="text-white font-mono">Rp {project.total_price.toLocaleString('id-ID')}</strong> telah masuk ke antrean verifikasi tim joki.
            </p>

            <div className="text-[13px] text-[#c2c2c2] font-mono border-t border-[#e5e5e5]/10 pt-4 flex flex-col gap-1">
              <div>WhatsApp Pemesan: <span className="text-white">{project.buyer_whatsapp}</span></div>
              <div>ID Proyek: <span className="text-white">{project.id}</span></div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#e5e5e5]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[13px] text-[#686868]">Mode pengujian cepat:</span>
              <button
                onClick={handleSimulatePaymentApprove}
                className="btn-white-pill text-[12px] px-5 py-2.5 rounded-full"
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
    <div className="text-[#ededed] min-h-screen flex flex-col selection:bg-[#6b62f2]/30 selection:text-white font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1040px] w-full mx-auto px-6 sm:px-12 py-16 flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-wider text-[#161616] bg-white px-2.5 py-0.5 rounded-full font-medium">
              Pembayaran Terverifikasi
            </span>
            <span className="text-[12px] text-[#686868] font-mono">
              ID: {project.id.slice(0, 8)}
            </span>
          </div>
          <h1 className="text-[36px] sm:text-[44px] font-medium leading-[1.1] text-white tracking-[-0.03em]">
            Setup Proyek & Data Kelompok
          </h1>
          <p className="text-[15px] text-[#c2c2c2] leading-[1.5] max-w-2xl">
            Pilih rekomendasi ide aplikasi dari AI, isi data anggota kelompok, dan bagikan tautan koneksi GitHub sebelum pengerjaan sprint dimulai.
          </p>
        </div>

        {/* STEP 1: AI IDEATION */}
        {(project.package_type === 'full' || project.package_type === 'idea_only') && (
          <section className="p-8 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-[20px] font-medium text-white">
                Rekomendasi Ide AI & Gimmick Dosen
              </h2>
              <p className="text-[14px] text-[#c2c2c2]">
                Ketik topik mata kuliah atau niche, AI akan menyajikan 3 opsi proyek berdaya saing tinggi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Contoh: Pemrograman Web — Sistem Manajemen Lab Komputer"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="flex-1 bg-[#0a0a0a] border border-[#e5e5e5]/15 focus:border-white rounded-[10px] px-4 py-3 text-[14px] text-white outline-none"
              />
              <button
                type="button"
                onClick={handleGenerateIdeas}
                disabled={isGeneratingIdeas}
                className="btn-white-pill text-[13px] px-6 py-3 rounded-full transition-all shrink-0"
              >
                {isGeneratingIdeas ? 'Menghasilkan...' : 'Generate 3 Ide AI'}
              </button>
            </div>

            {selectedIdea && (
              <div className="p-6 rounded-[16px] bg-[#0a0a0a] border border-white flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-white">
                    Ide Terpilih & Terkunci
                  </span>
                  <span className="text-[11px] text-[#686868] font-mono">Tersimpan</span>
                </div>
                <h3 className="text-[22px] font-medium text-white">{selectedIdea.title}</h3>
                <p className="text-[14px] text-[#c2c2c2]">{selectedIdea.description}</p>
                <div className="p-4 rounded-[10px] bg-[#161616] border border-[#e5e5e5]/10 text-[13px]">
                  <span className="text-[11px] text-white uppercase tracking-wider block mb-1">
                    Gimmick Pemikat Dosen:
                  </span>
                  <span className="text-[#ededed]">{selectedIdea.gimmick}</span>
                </div>
              </div>
            )}

            {generatedIdeas.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {generatedIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className={`p-6 rounded-[16px] border transition-all flex flex-col gap-4 ${
                      selectedIdea?.id === idea.id
                        ? 'bg-[#1f1f1f] border-white'
                        : 'bg-[#0a0a0a] border-[#e5e5e5]/10 hover:border-[#e5e5e5]/25'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-[18px] font-medium text-white">{idea.title}</h4>
                        <p className="text-[14px] text-[#c2c2c2] mt-1">{idea.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectIdea(idea)}
                        className={`text-[12px] font-medium px-4 py-2 rounded-full shrink-0 transition-all ${
                          selectedIdea?.id === idea.id
                            ? 'bg-white text-[#161616]'
                            : 'border border-[#e5e5e5]/20 text-white hover:border-white'
                        }`}
                      >
                        {selectedIdea?.id === idea.id ? 'Terkunci' : 'Kunci Ide Ini'}
                      </button>
                    </div>

                    <div className="p-3.5 rounded-[10px] bg-[#161616]">
                      <span className="text-[11px] uppercase tracking-wider text-white block mb-1">
                        Gimmick Dosen:
                      </span>
                      <p className="text-[13px] text-[#ededed]">{idea.gimmick}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {idea.techStack?.map((t) => (
                        <span key={t} className="text-[11px] font-mono text-[#c2c2c2] px-2.5 py-1 rounded-[6px] bg-[#161616] border border-[#e5e5e5]/10">
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
        <section className="p-8 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-[20px] font-medium text-white">
                Data Anggota Kelompok ({project.member_count} Orang)
              </h2>
              <p className="text-[14px] text-[#c2c2c2]">
                Data ini dicantumkan dalam README laporan resmi dan dikaitkan dengan akun GitHub masing-masing anggota.
              </p>
            </div>
            <button
              type="button"
              onClick={handleQuickFillMembers}
              className="text-[12px] text-white/80 hover:text-white underline self-start sm:self-auto shrink-0"
            >
              ⚡ Isi Data Contoh
            </button>
          </div>

          <form onSubmit={handleSaveMembers} className="flex flex-col gap-4">
            {members.map((m, idx) => (
              <div
                key={idx}
                className="p-4 rounded-[16px] bg-[#0a0a0a] border border-[#e5e5e5]/10 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#686868]">Nama Anggota {idx + 1}</span>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap"
                    value={m.name}
                    onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                    className="bg-[#161616] border border-[#e5e5e5]/15 focus:border-white rounded-[10px] px-3 py-2 text-[14px] text-white outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#686868]">NIM</span>
                  <input
                    type="text"
                    required
                    placeholder="211401001"
                    value={m.nim}
                    onChange={(e) => handleMemberChange(idx, 'nim', e.target.value)}
                    className="bg-[#161616] border border-[#e5e5e5]/15 focus:border-white rounded-[10px] px-3 py-2 text-[14px] font-mono text-white outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#686868]">Kelas / KOM</span>
                  <input
                    type="text"
                    required
                    placeholder="A / B / C"
                    value={m.kom}
                    onChange={(e) => handleMemberChange(idx, 'kom', e.target.value)}
                    className="bg-[#161616] border border-[#e5e5e5]/15 focus:border-white rounded-[10px] px-3 py-2 text-[14px] text-white outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-[#686868]">Username GitHub</span>
                  <input
                    type="text"
                    placeholder="cth: budi_dev"
                    value={m.github_username}
                    onChange={(e) => handleMemberChange(idx, 'github_username', e.target.value)}
                    className="bg-[#161616] border border-[#e5e5e5]/15 focus:border-white rounded-[10px] px-3 py-2 text-[14px] font-mono text-white outline-none"
                  />
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={isSavingMembers}
              className="self-end btn-white-pill text-[13px] px-6 py-2.5 rounded-full transition-all mt-2"
            >
              {isSavingMembers ? 'Menyimpan...' : 'Simpan Data Anggota'}
            </button>
          </form>
        </section>

        {/* STEP 3: CONNECT GITHUB INVITATION */}
        <section className="p-8 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-[20px] font-medium text-white">
              Tautan Undangan Connect GitHub
            </h2>
            <p className="text-[14px] text-[#c2c2c2]">
              Bagikan link ini ke grup kelompok Anda. Masing-masing anggota klik &quot;Connect GitHub&quot; agar commit tercatat atas nama akun mereka.
            </p>
          </div>

          <div className="p-5 rounded-[16px] bg-[#0a0a0a] border border-[#e5e5e5]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[14px] font-mono text-[#c2c2c2] truncate max-w-md">
              {typeof window !== 'undefined' ? `${window.location.origin}/join/${id}` : `/join/${id}`}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={copyInviteLink}
                className="bg-[#161616] hover:bg-[#1f1f1f] border border-[#e5e5e5]/15 text-white text-[13px] px-4 py-2 rounded-full transition-all"
              >
                {copiedLink ? '✓ Tautan Disalin!' : 'Salin Tautan'}
              </button>
              <a
                href={
                  typeof window !== 'undefined'
                    ? `https://api.whatsapp.com/send?text=${encodeURIComponent(
                        `Halo teman kelompok! Silakan hubungkan akun GitHub kalian untuk proyek "${project.selected_idea?.title || 'Proyek UAS'}" via tautan ini: ${window.location.origin}/join/${id}`
                      )}`
                    : '#'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba59] text-white text-[13px] font-medium px-4 py-2 rounded-full transition-all inline-flex items-center gap-1.5"
              >
                Kirim ke WhatsApp ↗
              </a>
            </div>
          </div>

          {dbMembers.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[12px] uppercase tracking-wider text-[#686868]">Status Koneksi Akun:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dbMembers.map((m) => (
                  <div key={m.id} className="p-4 rounded-[12px] bg-[#0a0a0a] border border-[#e5e5e5]/10 flex items-center justify-between">
                    <div>
                      <div className="text-[15px] font-medium text-white">{m.name}</div>
                      <div className="text-[12px] text-[#686868] font-mono">@{m.github_username || 'unconnected'}</div>
                    </div>
                    <span
                      className={`text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        m.is_connected
                          ? 'bg-white text-[#161616] font-medium'
                          : 'bg-[#161616] text-[#686868]'
                      }`}
                    >
                      {m.is_connected ? 'Connected' : 'Menunggu'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center border-t border-[#e5e5e5]/10 pt-4">
            <Link href="/" className="text-[13px] text-[#c2c2c2] hover:text-white">
              Kembali
            </Link>
            <Link
              href={`/project/${id}`}
              className="btn-white-pill text-[13px] px-6 py-3 rounded-full"
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
