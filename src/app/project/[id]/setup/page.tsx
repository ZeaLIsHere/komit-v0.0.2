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
  const [githubStatus, setGithubStatus] = useState<{ [index: number]: 'idle' | 'checking' | 'valid' | 'invalid' | 'empty' }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ideation state
  const [niche, setNiche] = useState<string>('');
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState<boolean>(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<IdeaItem[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<IdeaItem | null>(null);

  // GitHub credentials for admin state
  const [githubEmail, setGithubEmail] = useState<string>('');
  const [githubPassword, setGithubPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSavingCredentials, setIsSavingCredentials] = useState<boolean>(false);
  const [credentialsSaved, setCredentialsSaved] = useState<boolean>(false);

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
      setGithubStatus((prev) => ({ ...prev, [index]: 'empty' }));
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
        if (data.project.github_email) {
          setGithubEmail(data.project.github_email);
        }
        if (data.project.github_password) {
          setGithubPassword(data.project.github_password);
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

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubEmail.trim() || !githubPassword.trim()) {
      alert('Email GitHub dan Password akun wajib diisi');
      return;
    }

    setIsSavingCredentials(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          github_email: githubEmail.trim(),
          github_password: githubPassword.trim(),
        }),
      });

      if (!res.ok) throw new Error('Gagal menyimpan kredensial GitHub');
      const data = await res.json();
      setProject(data.project);
      setCredentialsSaved(true);
      setTimeout(() => setCredentialsSaved(false), 3000);
      alert('Data akun GitHub berhasil dikirim ke panel admin!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal mengirim kredensial');
    } finally {
      setIsSavingCredentials(false);
    }
  };

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

    // Validasi data setiap anggota & akun GitHub
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name.trim()) {
        alert(`Tolong isi nama untuk Anggota ${i + 1} terlebih dahulu!`);
        return;
      }
      if (!m.github_username.trim()) {
        setGithubStatus((prev) => ({ ...prev, [i]: 'empty' }));
        alert(`Tolong isi akun GitHub untuk Anggota ${i + 1} terlebih dahulu!`);
        return;
      }
      if (githubStatus[i] === 'invalid') {
        alert(`Akun GitHub @${m.github_username} tidak dapat ditemukan di GitHub. Periksa kembali username!`);
        return;
      }
    }

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
      <div className="text-[#bbc7c6] min-h-screen flex items-center justify-center font-mono text-[14px]">
        Memuat data setup proyek...
      </div>
    );
  }

  if (errorMsg || !project) {
    return (
      <div className="text-[#bbc7c6] min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-[24px] font-medium text-white">Proyek Tidak Ditemukan</h1>
        <Link href="/" className="text-white underline">
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
          <div className="p-10 rounded-[24px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-6">
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

        {/* SECTION: GITHUB CREDENTIALS FOR ADMIN SETUP */}
        <section className="p-8 rounded-[24px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-white/60">
                  Form Akun Pengerjaan Joki
                </span>
                {project.github_email && project.github_password && (
                  <span className="text-[11px] text-[#59d499] font-mono px-2 py-0.5 rounded-full bg-[#59d499]/15 border border-[#59d499]/30">
                    ✓ Kredensial Terkirim ke Admin
                  </span>
                )}
              </div>
              <h2 className="text-[20px] font-medium text-white">
                Email &amp; Password GitHub untuk Tim Joki
              </h2>
              <p className="text-[14px] text-[#c2c2c2] max-w-2xl leading-relaxed">
                Masukkan email dan password akun GitHub Anda. Data ini akan diteruskan langsung ke panel admin agar operator joki dapat login, mengonfigurasi repository, dan melanjutkan pengerjaan proyek Anda.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveCredentials} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] uppercase tracking-[0.08em] text-white/70 font-medium">
                  Email Akun GitHub
                </label>
                <input
                  type="email"
                  required
                  placeholder="contoh: akun@gmail.com"
                  value={githubEmail}
                  onChange={(e) => setGithubEmail(e.target.value)}
                  className="bg-white/[0.04] border border-white/15 focus:border-white rounded-[10px] px-3.5 py-2.5 text-[14px] text-white outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[12px] uppercase tracking-[0.08em] text-white/70 font-medium">
                    Password Akun GitHub
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-white/60 hover:text-white"
                  >
                    {showPassword ? 'Sembunyikan' : 'Lihat'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={githubPassword}
                  onChange={(e) => setGithubPassword(e.target.value)}
                  className="bg-white/[0.04] border border-white/15 focus:border-white rounded-[10px] px-3.5 py-2.5 text-[14px] text-white outline-none transition-colors font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <p className="text-[12px] text-white/50 leading-relaxed font-mono">
                🔒 Data hanya terlihat oleh tim admin terautentikasi untuk kebutuhan setup repository.
              </p>
              <button
                type="submit"
                disabled={isSavingCredentials}
                className="btn-white-pill text-[13px] px-6 py-2.5 rounded-full self-start sm:self-auto shrink-0"
              >
                {isSavingCredentials
                  ? 'Mengirim...'
                  : credentialsSaved
                  ? '✓ Berhasil Dikirim!'
                  : 'Kirim Kredensial ke Admin ↗'}
              </button>
            </div>
          </form>
        </section>

        {/* STEP 1: AI IDEATION */}
        {(project.package_type === 'full' || project.package_type === 'idea_only') && (
          <section className="p-8 rounded-[24px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-6">
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
                className="flex-1 bg-white/[0.04] border border-white/15 focus:border-white rounded-[10px] px-4 py-3 text-[14px] text-white outline-none"
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
              <div className="p-6 rounded-[16px] bg-white/[0.04] border border-white flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-white">
                    Ide Terpilih & Terkunci
                  </span>
                  <span className="text-[11px] text-[#686868] font-mono">Tersimpan</span>
                </div>
                <h3 className="text-[22px] font-medium text-white">{selectedIdea.title}</h3>
                <p className="text-[14px] text-[#c2c2c2]">{selectedIdea.description}</p>
                <div className="p-4 rounded-[10px] bg-white/[0.05] border border-white/10 text-[13px]">
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
        <section className="p-8 rounded-[24px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-6">
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
              className="text-[12px] text-white/80 hover:text-white underline self-start sm:self-auto shrink-0"
            >
              ⚡ Isi Template Nama
            </button>
          </div>

          {/* Member Count Dynamic Slider */}
          <div className="p-5 rounded-[16px] bg-white/[0.03] border border-white/10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[12px] uppercase tracking-[0.08em] text-white/70">
                Atur Jumlah Anggota:
              </span>
              <span className="font-mono text-white text-[15px] font-medium">
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
                className="w-full accent-white cursor-pointer relative z-10"
              />

              <div className="relative w-full h-5 text-[11px] font-mono text-[#c2c2c2]">
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
                          ? 'text-white font-bold text-[12px]'
                          : 'text-[#686868] hover:text-white'
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
                className="p-4 rounded-[16px] bg-white/[0.03] border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] uppercase tracking-[0.06em] text-white/70">
                    {idx === 0 ? 'Nama Ketua Kelompok' : `Nama Anggota ${idx + 1}`}
                  </span>
                  <input
                    type="text"
                    required
                    placeholder={idx === 0 ? 'Nama Lengkap Ketua' : `Nama Anggota ${idx + 1}`}
                    value={m.name}
                    onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                    className="bg-white/[0.04] border border-white/15 focus:border-white rounded-[10px] px-3.5 py-2.5 text-[14px] text-white outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] uppercase tracking-[0.06em] text-white/70">
                    Akun GitHub
                  </span>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      required
                      placeholder="username GitHub"
                      value={m.github_username}
                      onChange={(e) => handleMemberChange(idx, 'github_username', e.target.value)}
                      onBlur={(e) => checkGitHubAccount(idx, e.target.value)}
                      className={`w-full bg-white/[0.04] border rounded-[10px] px-3.5 pr-12 py-2.5 text-[14px] font-mono text-white outline-none transition-colors ${
                        githubStatus[idx] === 'invalid'
                          ? 'border-red-500/80 focus:border-red-500 bg-red-950/20'
                          : githubStatus[idx] === 'empty'
                          ? 'border-yellow-500/80 focus:border-yellow-500 bg-yellow-950/20'
                          : githubStatus[idx] === 'valid'
                          ? 'border-[#59d499] focus:border-[#59d499]'
                          : 'border-white/15 focus:border-white'
                      }`}
                    />

                    {/* Status Icon on Right Side - Enlarged (w-6 h-6) */}
                    <div className="absolute right-3.5 flex items-center pointer-events-none">
                      {githubStatus[idx] === 'checking' && (
                        <div className="w-5 h-5 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                      )}
                      {githubStatus[idx] === 'valid' && (
                        <svg className="w-6 h-6 text-[#59d499]" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {githubStatus[idx] === 'invalid' && (
                        <svg className="w-6 h-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* Notification messages */}
                  {githubStatus[idx] === 'invalid' && (
                    <span className="text-[12px] text-red-400 font-mono mt-0.5 flex items-center gap-1 font-medium">
                      ✕ tidak dapat menemukan akun
                    </span>
                  )}
                  {githubStatus[idx] === 'empty' && (
                    <span className="text-[12px] text-yellow-300 font-mono mt-0.5 flex items-center gap-1 font-medium">
                      ⚠️ Akun GitHub belum diisi
                    </span>
                  )}
                  {githubStatus[idx] === 'valid' && (
                    <span className="text-[12px] text-[#59d499] font-mono mt-0.5 flex items-center gap-1 font-medium">
                      ✓ Akun GitHub terverifikasi
                    </span>
                  )}
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
        <section className="p-8 rounded-[24px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-[20px] font-medium text-white">
              Tautan Undangan Connect GitHub
            </h2>
            <p className="text-[14px] text-[#c2c2c2]">
              Bagikan link ini ke grup kelompok Anda. Masing-masing anggota klik &quot;Connect GitHub&quot; agar commit tercatat atas nama akun mereka.
            </p>
          </div>

          <div className="p-5 rounded-[16px] bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-[14px] font-mono text-white/80 truncate max-w-md">
              {typeof window !== 'undefined' ? `${window.location.origin}/join/${id}` : `/join/${id}`}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={copyInviteLink}
                className="bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white text-[13px] px-4 py-2 rounded-full transition-all"
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
                  <div key={m.id} className="p-4 rounded-[16px] bg-white/[0.03] border border-white/10 flex items-center justify-between">
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
