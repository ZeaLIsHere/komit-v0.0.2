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
  const [githubStatus, setGithubStatus] = useState<{ [index: number]: 'idle' | 'checking' | 'valid' | 'invalid' | 'empty' | 'duplicate' }>({});
  const [githubProfiles, setGithubProfiles] = useState<{
    [index: number]: {
      username: string;
      name: string;
      avatar_url: string;
      html_url: string;
    } | null;
  }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ideation state
  const [niche, setNiche] = useState<string>('');
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState<boolean>(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<IdeaItem[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<IdeaItem | null>(null);
  const [chatMessages, setChatMessages] = useState<
    Array<{
      id: string;
      role: 'user' | 'assistant';
      content: string;
      ideas?: IdeaItem[];
    }>
  >([]);
  const [chatInput, setChatInput] = useState<string>('');

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
      setGithubProfiles((prev) => ({ ...prev, [index]: null }));
      return;
    }

    // Check duplicate
    const isDuplicate = members.some(
      (m, i) => i !== index && m.github_username.trim().replace(/^@/, '').toLowerCase() === clean.toLowerCase()
    );
    if (isDuplicate) {
      setGithubStatus((prev) => ({ ...prev, [index]: 'duplicate' }));
      setGithubProfiles((prev) => ({ ...prev, [index]: null }));
      return;
    }

    setGithubStatus((prev) => ({ ...prev, [index]: 'checking' }));
    try {
      const res = await fetch(`/api/auth/github/check?username=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (data.exists) {
        setGithubStatus((prev) => ({ ...prev, [index]: 'valid' }));
        setGithubProfiles((prev) => ({
          ...prev,
          [index]: {
            username: data.username,
            name: data.name || data.username,
            avatar_url: data.avatar_url,
            html_url: data.html_url,
          },
        }));
      } else {
        setGithubStatus((prev) => ({ ...prev, [index]: 'invalid' }));
        setGithubProfiles((prev) => ({ ...prev, [index]: null }));
      }
    } catch {
      setGithubStatus((prev) => ({ ...prev, [index]: 'invalid' }));
      setGithubProfiles((prev) => ({ ...prev, [index]: null }));
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
        if (data.project.generated_ideas && data.project.generated_ideas.length > 0) {
          setGeneratedIdeas(data.project.generated_ideas);
          setChatMessages([
            {
              id: 'init-1',
              role: 'assistant',
              content: `Halo! Saya konsultan AI Komit. Berdasarkan topik "${data.project.niche_input || 'yang Anda pilih'}", berikut 3 rekomendasi ide yang telah dirancang:`,
              ideas: data.project.generated_ideas,
            },
          ]);
        } else {
          setChatMessages([
            {
              id: 'init-0',
              role: 'assistant',
              content: 'Halo! Saya konsultan AI Komit. Ceritakan topik mata kuliah atau ide awal aplikasi yang kamu inginkan. Kamu bisa bebas berdiskusi atau meminta ganti ide seperti "Saya kurang suka, tolong ganti dengan ide lain" kapan saja.',
            },
          ]);
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

  const handleSendChat = async (overridePrompt?: string) => {
    const text = (overridePrompt || chatInput || niche).trim();
    if (!text || isGeneratingIdeas) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: text,
    };

    const nextMessages = [...chatMessages, userMessage];
    setChatMessages(nextMessages);
    setChatInput('');
    setIsGeneratingIdeas(true);

    try {
      const apiMessages = nextMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ai/ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: apiMessages,
          prompt: text,
          niche: niche || text,
          service_type: project?.service_type,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ideas) {
        setGeneratedIdeas(data.ideas);
        if (!niche) setNiche(text);

        const botMessage = {
          id: `bot-${Date.now()}`,
          role: 'assistant' as const,
          content: data.reply || 'Berikut 3 rekomendasi ide yang telah diperbarui sesuai arahan Anda:',
          ideas: data.ideas,
        };

        setChatMessages((prev) => [...prev, botMessage]);

        // Auto sync generated ideas to project
        await fetch(`/api/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            niche_input: niche || text,
            generated_ideas: data.ideas,
          }),
        });
      } else {
        throw new Error(data.error || 'Gagal memproses ide dari AI');
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
      alert(`Ide "${idea.title}" berhasil dipilih dan dikunci untuk proyek ini!`);
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
          <div className="p-10 rounded-[14px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-6">
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

      <main className="flex-1 max-w-[1040px] w-full mx-auto px-6 sm:px-12 pt-28 sm:pt-32 pb-20 flex flex-col gap-10">
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
        <section className="p-8 rounded-[14px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-6">
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
              <p className="text-[12px] text-white/50 leading-relaxed font-mono flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-white/50 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Data hanya terlihat oleh tim admin terautentikasi untuk kebutuhan setup repository.</span>
              </p>
              <button
                type="submit"
                disabled={isSavingCredentials}
                className="btn-white-pill text-[13px] px-6 py-2.5 rounded-full self-start sm:self-auto shrink-0"
              >
                {isSavingCredentials
                  ? 'Mengirim...'
                  : credentialsSaved
                  ? 'Berhasil Dikirim'
                  : 'Kirim Kredensial ke Admin ↗'}
              </button>
            </div>
          </form>
        </section>

        {/* STEP 1: INTERACTIVE AI IDEATION ASSISTANT (CHATGPT-STYLE) */}
        {(project.package_type === 'full' || project.package_type === 'idea_only') && (
          <section className="p-8 rounded-[14px] bg-white/[0.03] backdrop-blur-xl border border-white/10 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-white/60">
                  Interactive AI Ideation
                </span>
                <span className="text-[10px] text-[#59d499] font-mono px-2 py-0.5 rounded-full bg-[#59d499]/10 border border-[#59d499]/25">
                  DeepSeek &amp; Groq LPU Ready
                </span>
              </div>
              <h2 className="text-[22px] font-medium text-white">
                Konsultan Ide AI &amp; Gimmick Dosen
              </h2>
              <p className="text-[14px] text-[#c2c2c2] max-w-3xl leading-relaxed">
                Diskusikan topik proyek Anda layaknya berkonsultasi dengan ChatGPT. Anda dapat meminta ide baru, mengganti opsi yang kurang disukai, atau memfokuskan tech stack kapan saja.
              </p>
            </div>

            {/* Active Selected / Locked Idea Banner */}
            {selectedIdea && (
              <div className="p-6 rounded-[12px] bg-white/[0.05] border border-white/30 flex flex-col gap-3 shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#59d499]" />
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#59d499] font-medium">
                      Ide Terpilih &amp; Terkunci untuk Proyek
                    </span>
                  </div>
                  <span className="text-[11px] text-[#686868] font-mono">Tersimpan di Proyek</span>
                </div>
                <h3 className="text-[20px] sm:text-[22px] font-medium text-white">{selectedIdea.title}</h3>
                <p className="text-[14px] text-[#c2c2c2] leading-relaxed">{selectedIdea.description}</p>
                <div className="p-4 rounded-[12px] bg-[#161616] border border-white/10 text-[13px] flex flex-col gap-1">
                  <span className="text-[11px] font-mono text-white/70 uppercase tracking-wider">
                    Gimmick Pemikat Dosen:
                  </span>
                  <p className="text-[#ededed] font-sans">{selectedIdea.gimmick}</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {selectedIdea.techStack?.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] font-mono text-white/80 px-2.5 py-1 rounded-[6px] bg-white/[0.06] border border-white/10"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Chat Feed Container */}
            <div className="flex flex-col gap-5 p-4 sm:p-6 rounded-[12px] bg-[#0d0d0d] border border-white/10 min-h-[300px]">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col gap-3 ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Message Bubble */}
                  <div
                    className={`max-w-[85%] sm:max-w-xl text-[14px] leading-relaxed rounded-[10px] p-4 ${
                      msg.role === 'user'
                        ? 'bg-white text-[#161616] font-medium rounded-tr-sm shadow-sm'
                        : 'bg-white/[0.04] text-[#ededed] border border-white/10 rounded-tl-sm'
                    }`}
                  >
                    <p>{msg.content}</p>
                  </div>

                  {/* If assistant returned ideas, render the interactive cards under the bubble */}
                  {msg.role === 'assistant' && msg.ideas && msg.ideas.length > 0 && (
                    <div className="w-full grid grid-cols-1 gap-4 mt-2">
                      {msg.ideas.map((idea) => {
                        const isSelected = selectedIdea?.id === idea.id;
                        return (
                          <div
                            key={idea.id}
                            className={`p-6 rounded-[10px] border transition-all flex flex-col gap-4 ${
                              isSelected
                                ? 'bg-white/[0.08] border-white shadow-[0_0_24px_rgba(255,255,255,0.06)]'
                                : 'bg-white/[0.02] border-white/10 hover:border-white/25'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="flex flex-col gap-1">
                                <h4 className="text-[18px] font-medium text-white">{idea.title}</h4>
                                <p className="text-[13px] text-[#c2c2c2] leading-relaxed">
                                  {idea.description}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleSelectIdea(idea)}
                                className={`text-[12px] font-medium px-4 py-2 rounded-full shrink-0 transition-all ${
                                  isSelected
                                    ? 'bg-white text-[#161616]'
                                    : 'bg-white/[0.06] hover:bg-white text-white hover:text-[#161616] border border-white/20'
                                }`}
                              >
                                {isSelected ? '✓ Terkunci untuk Proyek' : 'Pilih & Kunci Ide Ini ↗'}
                              </button>
                            </div>

                            <div className="p-3.5 rounded-[12px] bg-[#161616] border border-white/[0.06]">
                              <span className="text-[11px] font-mono uppercase tracking-wider text-white/70 block mb-1">
                                Gimmick Pemikat Dosen:
                              </span>
                              <p className="text-[13px] text-[#ededed] leading-relaxed">
                                {idea.gimmick}
                              </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {idea.techStack?.map((t) => (
                                <span
                                  key={t}
                                  className="text-[11px] font-mono text-[#c2c2c2] px-2.5 py-1 rounded-[6px] bg-white/[0.03] border border-white/10"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isGeneratingIdeas && (
                <div className="flex items-center gap-2.5 p-3.5 bg-white/[0.03] border border-white/10 rounded-[10px] w-fit text-[13px] text-white/70 font-mono">
                  <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                  <span>Konsultan AI sedang menganalisis &amp; merancang ide proyek...</span>
                </div>
              )}
            </div>

            {/* Quick Suggestion Chips */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">
                Pintasan Konsultasi Cepat:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Buatkan 3 Ide Lain', prompt: 'Saya kurang suka, tolong buatkan 3 ide baru yang berbeda dari sebelumnya' },
                  { label: 'Fokuskan ke Mobile App', prompt: 'Tolong fokuskan rekomendasinya ke aplikasi mobile Flutter atau React Native' },
                  { label: 'Fokuskan ke Web Fullstack', prompt: 'Tolong fokuskan rekomendasinya ke web application fullstack modern' },
                  { label: 'Tambahkan Fitur AI & ML', prompt: 'Tolong tambahkan fitur kecerdasan buatan (AI/ML) atau deteksi cerdas pada ide' },
                  { label: 'Opsi Lebih Ringkas', prompt: 'Tolong berikan ide alternatif yang arsitekturnya lebih ringkas dan cepat dikerjakan' },
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isGeneratingIdeas}
                    onClick={() => handleSendChat(chip.prompt)}
                    className="text-[12px] text-white/80 hover:text-white px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 hover:border-white/25 transition-all font-mono"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt Bar Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <input
                type="text"
                placeholder="Ketik topik atau permintaan khusus (misal: 'Saya kurang suka, ganti dengan ide berbasis IoT' atau 'Buatkan opsi untuk e-commerce')..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isGeneratingIdeas}
                className="flex-1 bg-white/[0.04] border border-white/15 focus:border-white rounded-[12px] px-4 py-3 text-[14px] text-white outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={isGeneratingIdeas || !chatInput.trim()}
                className="btn-white-pill text-[13px] px-7 py-3 rounded-full transition-all shrink-0 flex items-center justify-center gap-1.5 font-medium disabled:opacity-40"
              >
                <span>{isGeneratingIdeas ? 'Merancang...' : 'Kirim'}</span>
                <span>↗</span>
              </button>
            </form>
          </section>
        )}

        {/* STEP 2: MEMBER DATA FORM */}
        <section className="p-8 rounded-[14px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-6">
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
              className="text-[12px] text-white/80 hover:text-white underline self-start sm:self-auto shrink-0 font-mono"
            >
              Isi Template Nama
            </button>
          </div>

          {/* Member Count Dynamic Slider */}
          <div className="p-5 rounded-[10px] bg-white/[0.03] border border-white/10 flex flex-col gap-3">
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
                className="p-4 rounded-[10px] bg-white/[0.03] border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center"
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
                    <span className="text-[12px] text-red-400 font-mono mt-1 flex items-center gap-1 font-medium">
                      <span>Akun @{m.github_username.trim().replace(/^@/, '')} tidak ditemukan di GitHub</span>
                    </span>
                  )}
                  {githubStatus[idx] === 'duplicate' && (
                    <span className="text-[12px] text-yellow-300 font-mono mt-1 flex items-center gap-1 font-medium">
                      <span>Username ini sudah diinput untuk anggota lain</span>
                    </span>
                  )}
                  {githubStatus[idx] === 'empty' && (
                    <span className="text-[12px] text-yellow-300 font-mono mt-1 flex items-center gap-1 font-medium">
                      <span>Akun GitHub belum diisi</span>
                    </span>
                  )}
                  {githubStatus[idx] === 'valid' && githubProfiles[idx] && (
                    <div className="mt-2 p-2 rounded-[8px] bg-white/[0.04] border border-[#59d499]/30 flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={githubProfiles[idx]!.avatar_url}
                          alt={githubProfiles[idx]!.username}
                          className="w-5 h-5 rounded-full border border-white/20 shrink-0"
                        />
                        <div className="flex items-center gap-1.5 truncate text-[11px] font-mono">
                          <span className="text-[#59d499] font-medium">✓ Terverifikasi:</span>
                          <span className="text-white truncate font-medium">{githubProfiles[idx]!.name}</span>
                          <span className="text-white/60">(@{githubProfiles[idx]!.username})</span>
                        </div>
                      </div>
                      <a
                        href={githubProfiles[idx]!.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-white/70 hover:text-white underline font-mono shrink-0"
                      >
                        Buka ↗
                      </a>
                    </div>
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
        <section className="p-8 rounded-[14px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-[20px] font-medium text-white">
              Tautan Undangan Connect GitHub
            </h2>
            <p className="text-[14px] text-[#c2c2c2]">
              Bagikan link ini ke grup kelompok Anda. Masing-masing anggota klik &quot;Connect GitHub&quot; agar commit tercatat atas nama akun mereka.
            </p>
          </div>

          <div className="p-5 rounded-[10px] bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
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
                  <div key={m.id} className="p-4 rounded-[10px] bg-white/[0.03] border border-white/10 flex items-center justify-between">
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
