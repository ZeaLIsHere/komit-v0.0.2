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
  const [memberCount, setMemberCount] = useState<number>(4);
  const [members, setMembers] = useState<Array<{ name: string; github_username: string }>>([]);
  const [dbMembers, setDbMembers] = useState<ProjectMember[]>([]);
  const [githubStatus, setGithubStatus] = useState<{ [index: number]: 'idle' | 'checking' | 'valid' | 'invalid' }>({});
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

  // Dynamic resize when count changes (1-8)
  const handleMemberCountChange = (newCount: number) => {
    const valid = Math.max(1, Math.min(8, newCount));
    setMemberCount(valid);
    setMembers((prev) => {
      if (valid > prev.length) {
        const added = Array.from({ length: valid - prev.length }, () => ({
          name: '',
          github_username: '',
        }));
        return [...prev, ...added];
      }
      return prev.slice(0, valid);
    });
  };

  const checkGitHubAccount = async (index: number, username: string) => {
    const clean = username.trim().replace(/^@/, '');
    if (!clean) {
      setGithubStatus((prev) => ({ ...prev, [index]: 'idle' }));
      return;
    }
    setGithubStatus((prev) => ({ ...prev, [index]: 'checking' }));
    try {
      const res = await fetch(`/api/auth/github/check?username=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (data.exists) {
        setGithubStatus((prev) => ({ ...prev, [index]: 'valid' }));
      } else {
        setGithubStatus((prev) => ({ ...prev, [index]: 'invalid' }));
      }
    } catch {
      setGithubStatus((prev) => ({ ...prev, [index]: 'invalid' }));
    }
  };

  // Quick fill template members
  const handleQuickFillMembers = () => {
    const count = memberCount;
    const buyer = project?.buyer_name || 'Ketua Kelompok';
    const dummyList = [
      { name: buyer, github_username: '' },
      { name: 'Anggota 2', github_username: '' },
      { name: 'Anggota 3', github_username: '' },
      { name: 'Anggota 4', github_username: '' },
      { name: 'Anggota 5', github_username: '' },
      { name: 'Anggota 6', github_username: '' },
      { name: 'Anggota 7', github_username: '' },
      { name: 'Anggota 8', github_username: '' },
    ];
    setMembers(dummyList.slice(0, count));
  };

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/projects/${id}`);
        if (!res.ok) throw new Error('Proyek tidak ditemukan');
        const data = await res.json();
        setProject(data.project);

        const count = data.project.member_count || 4;
        setMemberCount(count);

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
                github_username: m.github_username || '',
              }))
            );
            setMemberCount(mData.members.length);
          } else {
            setMembers(
              Array.from({ length: count }, (_, i) => ({
                name: i === 0 && data.project.buyer_name ? data.project.buyer_name : '',
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

  const handleMemberChange = (index: number, field: 'name' | 'github_username', val: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: val };
    setMembers(updated);
    if (field === 'github_username') {
      setGithubStatus((prev) => ({ ...prev, [index]: 'idle' }));
    }
  };

  const handleSaveMembers = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingMembers(true);
    try {
      const [mRes] = await Promise.all([
        fetch(`/api/projects/${id}/members`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ members }),
        }),
        fetch(`/api/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ member_count: memberCount }),
        }),
      ]);
      if (!mRes.ok) throw new Error('Gagal menyimpan data anggota');
      const data = await mRes.json();
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
      <div className="bg-[#012624] text-[#bbc7c6] min-h-screen flex items-center justify-center font-mono text-[14px]">
        Memuat data setup proyek...
      </div>
    );
  }

  if (errorMsg || !project) {
    return (
      <div className="bg-[#012624] text-[#bbc7c6] min-h-screen flex flex-col items-center justify-center gap-4">
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
      <div className="bg-[#012624] text-[#bbc7c6] min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-[760px] w-full mx-auto px-6 py-20 flex flex-col gap-8">
          <div className="p-10 rounded-[16px] bg-[#003734] flex flex-col gap-6">
            <h1 className="text-[32px] sm:text-[40px] font-medium leading-[1.0] text-white tracking-[-0.03em]">
              Menunggu Konfirmasi Operator
            </h1>
            <p className="text-[15px] text-[#bbc7c6] leading-[1.4]">
              Halo <strong className="text-white font-medium">{project.buyer_name}</strong>, bukti pembayaran untuk paket <strong className="text-white font-medium">{project.package_type}</strong> dengan total tagihan <strong className="text-[#fde9ff] font-mono">Rp {project.total_price.toLocaleString('id-ID')}</strong> telah masuk ke antrean verifikasi tim joki.
            </p>

            <div className="text-[13px] text-[#bbc7c6] font-mono border-t border-[#012624] pt-4 flex flex-col gap-1">
              <div>WhatsApp Pemesan: <span className="text-white">{project.buyer_whatsapp}</span></div>
              <div>ID Proyek: <span className="text-white">{project.id}</span></div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#012624] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[12px] text-[#bbc7c6]">Mode pengujian cepat:</span>
              <button
                onClick={handleSimulatePaymentApprove}
                className="btn-aurora text-[12px] px-5 py-2.5 rounded-[6px]"
              >
                Simulasi Approve Pembayaran ↗
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
    <div className="bg-[#012624] text-[#bbc7c6] min-h-screen flex flex-col selection:bg-[#00827c] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-[1040px] w-full mx-auto px-6 sm:px-12 py-16 flex flex-col gap-12">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.12em] text-[#012624] bg-[#cbfffc] px-2 py-0.5 rounded-[4px] font-medium">
              Pembayaran Terverifikasi
            </span>
            <span className="text-[12px] text-[#bbc7c6] font-mono">
              ID: {project.id.slice(0, 8)}
            </span>
          </div>
          <h1 className="text-[36px] sm:text-[48px] font-medium leading-[1.0] text-white tracking-[-0.03em]">
            Setup Proyek & Data Kelompok
          </h1>
          <p className="text-[15px] text-[#bbc7c6] leading-[1.4] max-w-2xl">
            Pilih rekomendasi ide aplikasi dari AI, isi data anggota kelompok, dan bagikan tautan koneksi GitHub sebelum pengerjaan sprint dimulai.
          </p>
        </div>

        {/* STEP 1: AI IDEATION */}
        {(project.package_type === 'full' || project.package_type === 'idea_only') && (
          <section className="p-8 rounded-[16px] bg-[#003734] flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-[20px] font-medium text-white">
                Rekomendasi Ide AI & Gimmick Dosen
              </h2>
              <p className="text-[14px] text-[#bbc7c6]">
                Ketik topik mata kuliah atau niche, AI akan menyajikan 3 opsi proyek berdaya saing tinggi.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Contoh: Pemrograman Web — Sistem Manajemen Lab Komputer"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                className="flex-1 bg-[#012624] border border-[#003734] focus:border-[#cbfffc] rounded-[6px] px-4 py-3 text-[14px] text-white outline-none"
              />
              <button
                type="button"
                onClick={handleGenerateIdeas}
                disabled={isGeneratingIdeas}
                className="btn-aurora text-[13px] px-6 py-3 rounded-[6px] transition-all shrink-0"
              >
                {isGeneratingIdeas ? 'Menghasilkan...' : 'Generate 3 Ide AI ↗'}
              </button>
            </div>

            {selectedIdea && (
              <div className="p-6 rounded-[12px] bg-[#011d1c] border border-[#cbfffc] flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#cbfffc]">
                    Ide Terpilih & Terkunci
                  </span>
                  <span className="text-[11px] text-[#fde9ff] font-mono">Tersimpan</span>
                </div>
                <h3 className="text-[22px] font-medium text-white">{selectedIdea.title}</h3>
                <p className="text-[14px] text-[#bbc7c6]">{selectedIdea.description}</p>
                <div className="p-4 rounded-[6px] bg-[#012624] text-[13px]">
                  <span className="text-[11px] text-[#edfffe] uppercase tracking-[0.12em] block mb-1">
                    Gimmick Pemikat Dosen:
                  </span>
                  <span className="text-white">{selectedIdea.gimmick}</span>
                </div>
              </div>
            )}

            {generatedIdeas.length > 0 && (
              <div className="grid grid-cols-1 gap-4">
                {generatedIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className={`p-6 rounded-[12px] border transition-all flex flex-col gap-4 ${
                      selectedIdea?.id === idea.id
                        ? 'bg-[#011d1c] border-[#cbfffc]'
                        : 'bg-[#012624] border-transparent hover:border-[#00827c]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-[18px] font-medium text-white">{idea.title}</h4>
                        <p className="text-[14px] text-[#bbc7c6] mt-1">{idea.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectIdea(idea)}
                        className={`text-[12px] font-medium uppercase tracking-[0.08em] px-4 py-2 rounded-[6px] shrink-0 transition-all ${
                          selectedIdea?.id === idea.id
                            ? 'bg-[#cbfffc] text-[#012624]'
                            : 'border border-[#00827c] text-white hover:bg-[#00827c]/20'
                        }`}
                      >
                        {selectedIdea?.id === idea.id ? 'Terkunci' : 'Kunci Ide Ini'}
                      </button>
                    </div>

                    <div className="p-3.5 rounded-[6px] bg-[#011d1c]">
                      <span className="text-[10px] uppercase tracking-[0.12em] text-[#edfffe] block mb-1">
                        Gimmick Dosen:
                      </span>
                      <p className="text-[13px] text-white">{idea.gimmick}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {idea.techStack?.map((t) => (
                        <span key={t} className="text-[11px] font-mono text-[#bbc7c6] px-2.5 py-1 rounded-[4px] bg-[#003734]">
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
        <section className="p-8 rounded-[16px] bg-[#003734] flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-[20px] font-medium text-white">
                Data Anggota Kelompok ({memberCount} Orang)
              </h2>
              <p className="text-[14px] text-[#bbc7c6]">
                Ubah jumlah anggota jika diperlukan. Form otomatis menyesuaikan (hanya nama &amp; akun GitHub).
              </p>
            </div>
            <button
              type="button"
              onClick={handleQuickFillMembers}
              className="text-[12px] text-[#cbfffc] hover:underline self-start sm:self-auto shrink-0"
            >
              ⚡ Isi Template Nama
            </button>
          </div>

          {/* Member Count Dynamic Slider */}
          <div className="p-5 rounded-[12px] bg-[#011d1c] border border-[#003734] flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] uppercase tracking-[0.08em] text-[#edfffe]">
                Atur Jumlah Anggota:
              </span>
              <span className="font-mono text-white text-[15px] font-medium text-[#cbfffc]">
                {memberCount} Orang
              </span>
            </div>

            <div className="relative flex flex-col gap-3 py-1">
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={memberCount}
                onChange={(e) => handleMemberCountChange(Number(e.target.value))}
                className="w-full accent-[#cbfffc] cursor-pointer relative z-10"
              />

              <div className="relative w-full h-5 text-[11px] font-mono text-[#bbc7c6]">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                  const percent = ((num - 1) / 7) * 100;
                  const isActive = memberCount === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleMemberCountChange(num)}
                      style={{ left: `${percent}%` }}
                      className={`absolute -translate-x-1/2 transition-all ${
                        isActive
                          ? 'text-[#cbfffc] font-bold text-[12px]'
                          : 'text-[#bbc7c6] hover:text-white'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveMembers} className="flex flex-col gap-4">
            {members.map((m, idx) => (
              <div
                key={idx}
                className="p-4 rounded-[12px] bg-[#012624] border border-[#003734] grid grid-cols-1 sm:grid-cols-2 gap-4 items-center"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] uppercase tracking-[0.06em] text-[#bbc7c6]">
                    {idx === 0 ? 'Nama Ketua Kelompok' : `Nama Anggota ${idx + 1}`}
                  </span>
                  <input
                    type="text"
                    required
                    placeholder={idx === 0 ? 'Nama Lengkap Ketua' : `Nama Anggota ${idx + 1}`}
                    value={m.name}
                    onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                    className="bg-[#011d1c] border border-[#003734] focus:border-[#cbfffc] rounded-[6px] px-3.5 py-2.5 text-[14px] text-white outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] uppercase tracking-[0.06em] text-[#bbc7c6]">
                    Akun GitHub
                  </span>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-[#bbc7c6] font-mono text-[13px]">@</span>
                    <input
                      type="text"
                      placeholder="username"
                      value={m.github_username}
                      onChange={(e) => handleMemberChange(idx, 'github_username', e.target.value)}
                      onBlur={(e) => checkGitHubAccount(idx, e.target.value)}
                      className={`w-full bg-[#011d1c] border rounded-[6px] pl-7 pr-9 py-2.5 text-[14px] font-mono text-white outline-none transition-colors ${
                        githubStatus[idx] === 'invalid'
                          ? 'border-red-500 focus:border-red-500'
                          : githubStatus[idx] === 'valid'
                          ? 'border-[#59d499] focus:border-[#59d499]'
                          : 'border-[#003734] focus:border-[#cbfffc]'
                      }`}
                    />

                    {/* Status Icon on Right Side */}
                    <div className="absolute right-3 flex items-center pointer-events-none">
                      {githubStatus[idx] === 'checking' && (
                        <div className="w-3.5 h-3.5 border-2 border-[#bbc7c6] border-t-transparent rounded-full animate-spin" />
                      )}
                      {githubStatus[idx] === 'valid' && (
                        <svg className="w-4 h-4 text-[#59d499]" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {githubStatus[idx] === 'invalid' && (
                        <svg className="w-4 h-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Error Text below field */}
                  {githubStatus[idx] === 'invalid' && (
                    <span className="text-[11px] text-red-400 font-mono mt-0.5">
                      tidak dapat menemukan akun
                    </span>
                  )}
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={isSavingMembers}
              className="self-end btn-aurora text-[13px] px-6 py-2.5 rounded-[6px] transition-all mt-2"
            >
              {isSavingMembers ? 'Menyimpan...' : 'Simpan Data Anggota ↗'}
            </button>
          </form>
        </section>

        {/* STEP 3: CONNECT GITHUB INVITATION */}
        <section className="p-8 rounded-[16px] bg-[#003734] flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-[20px] font-medium text-white">
              Tautan Undangan Connect GitHub
            </h2>
            <p className="text-[14px] text-[#bbc7c6]">
              Bagikan link ini ke grup kelompok Anda. Masing-masing anggota klik &quot;Connect GitHub&quot; agar commit tercatat atas nama akun mereka.
            </p>
          </div>

          <div className="p-5 rounded-[12px] bg-[#011d1c] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[14px] font-mono text-[#bbc7c6] truncate max-w-md">
              {typeof window !== 'undefined' ? `${window.location.origin}/join/${id}` : `/join/${id}`}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={copyInviteLink}
                className="bg-[#003734] hover:bg-[#004d49] text-white text-[13px] px-4 py-2 rounded-[6px] transition-all"
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
                className="bg-[#25D366] hover:bg-[#20ba59] text-white text-[13px] font-medium px-4 py-2 rounded-[6px] transition-all inline-flex items-center gap-1.5"
              >
                Kirim ke WhatsApp ↗
              </a>
            </div>
          </div>

          {dbMembers.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[12px] uppercase tracking-[0.12em] text-[#edfffe]">Status Koneksi Akun:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dbMembers.map((m) => (
                  <div key={m.id} className="p-4 rounded-[6px] bg-[#012624] flex items-center justify-between">
                    <div>
                      <div className="text-[15px] font-medium text-white">{m.name}</div>
                      <div className="text-[12px] text-[#bbc7c6] font-mono">@{m.github_username || 'unconnected'}</div>
                    </div>
                    <span
                      className={`text-[11px] uppercase tracking-[0.08em] px-2.5 py-1 rounded-[4px] ${
                        m.is_connected
                          ? 'bg-[#cbfffc] text-[#012624] font-medium'
                          : 'bg-[#003734] text-[#bbc7c6]'
                      }`}
                    >
                      {m.is_connected ? 'Connected' : 'Menunggu'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center border-t border-[#012624] pt-4">
            <Link href="/" className="text-[13px] uppercase tracking-[0.12em] text-[#bbc7c6] hover:text-white">
              Kembali
            </Link>
            <Link
              href={`/project/${id}`}
              className="btn-aurora text-[13px] px-6 py-3 rounded-[6px] transition-all"
            >
              Buka Dashboard Proyek ↗
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
