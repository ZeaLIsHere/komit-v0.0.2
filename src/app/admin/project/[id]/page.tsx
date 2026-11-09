'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Project, ProjectMember } from '@/lib/types';
import { Eye, EyeOff, Copy, Check, MessageSquare, ExternalLink, ShieldCheck, FileText, Download, Sparkles } from 'lucide-react';

export default function AdminProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // States
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [copiedPassword, setCopiedPassword] = useState<boolean>(false);
  const [repoUrlInput, setRepoUrlInput] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);

  // AI Topic Doc (topik.md) state
  const [topicMarkdown, setTopicMarkdown] = useState<string | null>(null);
  const [isGeneratingTopic, setIsGeneratingTopic] = useState<boolean>(false);
  const [copiedTopic, setCopiedTopic] = useState<boolean>(false);

  // Deliverable file (PPT/Makalah) state
  const [docFileUrlInput, setDocFileUrlInput] = useState<string>('');
  const [isSavingDocFile, setIsSavingDocFile] = useState<boolean>(false);

  // Payment proof preview modal
  const [showProofModal, setShowProofModal] = useState<boolean>(false);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowProofModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadData = async () => {
    try {
      const [pRes, mRes] = await Promise.all([
        fetch(`/api/projects/${id}`),
        fetch(`/api/projects/${id}/members`),
      ]);

      if (!pRes.ok) throw new Error('Data proyek tidak ditemukan');
      const pData = await pRes.json();
      setProject(pData.project);
      setRepoUrlInput(pData.project.github_repo_url || '');
      setDocFileUrlInput(pData.project.doc_file_url || pData.project.ppt_file_url || '');
      if (pData.project.readme_content) {
        setTopicMarkdown(pData.project.readme_content);
      }

      if (mRes.ok) {
        const mData = await mRes.json();
        setMembers(mData.members || []);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleCopyPassword = () => {
    if (!project?.github_password) return;
    navigator.clipboard.writeText(project.github_password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  // Generate topik.md with Groq AI
  const handleGenerateTopicDoc = async () => {
    setIsGeneratingTopic(true);
    try {
      const res = await fetch('/api/ai/topic-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: id,
          doc_topic: project?.doc_topic,
          doc_details: project?.doc_details,
          service_type: project?.service_type,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal generate topik.md');
      setTopicMarkdown(data.markdown);
      alert('Dokumen topik.md berhasil disusun oleh Groq AI!');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal menghasilkan dokumen');
    } finally {
      setIsGeneratingTopic(false);
    }
  };

  const handleCopyTopicDoc = () => {
    if (!topicMarkdown) return;
    navigator.clipboard.writeText(topicMarkdown);
    setCopiedTopic(true);
    setTimeout(() => setCopiedTopic(false), 2000);
  };

  const handleDownloadTopicDoc = () => {
    if (!topicMarkdown) return;
    const blob = new Blob([topicMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'topik.md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePaymentAction = async (newStatus: 'paid' | 'rejected') => {
    if (!confirm(`Konfirmasi ubah status pembayaran ke: ${newStatus.toUpperCase()}?`)) return;
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_status: newStatus,
          status: newStatus === 'paid' ? 'setup' : 'waiting_payment',
        }),
      });
      if (res.ok) {
        await loadData();
      } else {
        alert('Gagal memperbarui status');
      }
    } catch {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveRepoUrl = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ github_repo_url: repoUrlInput.trim() }),
      });
      if (res.ok) {
        alert('URL Repository GitHub berhasil disimpan!');
        loadData();
      }
    } catch {
      alert('Gagal menyimpan URL repository');
    }
  };

  const handleSaveDocFile = async (markCompleted: boolean = false) => {
    if (!docFileUrlInput.trim()) {
      alert('Masukkan link / URL file hasil pengerjaan (Google Drive / PDF / PPTX / Docx)');
      return;
    }
    setIsSavingDocFile(true);
    try {
      const updatePayload: Record<string, unknown> = {
        doc_file_url: docFileUrlInput.trim(),
        ppt_file_url: docFileUrlInput.trim(),
      };
      if (markCompleted) {
        updatePayload.status = 'completed';
      }
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });
      if (res.ok) {
        alert(
          markCompleted
            ? 'Hasil pengerjaan berhasil dikirim & status proyek ditandai SELESAI!'
            : 'Link file hasil pengerjaan berhasil disimpan!'
        );
        await loadData();
      } else {
        alert('Gagal menyimpan file hasil pengerjaan');
      }
    } catch {
      alert('Terjadi kesalahan jaringan saat menyimpan file');
    } finally {
      setIsSavingDocFile(false);
    }
  };

  if (loading) {
    return (
      <div className="text-[#ededed] min-h-screen flex items-center justify-center font-mono text-[14px]">
        Memuat inspeksi data proyek (POV Admin)...
      </div>
    );
  }

  if (errorMsg || !project) {
    return (
      <div className="text-[#ededed] min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-[22px] font-medium text-white">Proyek Tidak Ditemukan</h1>
        <Link href="/admin" className="btn-white-pill text-[13px] px-6 py-2.5 rounded-full">
          ← Kembali ke Panel Admin
        </Link>
      </div>
    );
  }

  // Format WhatsApp Link
  const cleanPhone = project.buyer_whatsapp.replace(/\D/g, '');
  const waUrl = cleanPhone.startsWith('0')
    ? `https://wa.me/62${cleanPhone.slice(1)}`
    : `https://wa.me/${cleanPhone}`;

  return (
    <div className="text-[#ededed] min-h-screen flex flex-col selection:bg-[#6b62f2]/30 selection:text-white font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 sm:px-12 pt-28 sm:pt-32 pb-24 flex flex-col gap-8">
        {/* Top Breadcrumb & Quick Nav */}
        <div className="flex items-center justify-between border-b border-white/10 pb-5">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-[13px] text-white/70 hover:text-white transition-colors"
          >
            ← Kembali ke Panel Admin
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">
              POV OPERATOR ADMIN
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#59d499]" />
          </div>
        </div>

        {/* Header Title & Status Badges */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#161616] bg-white px-3 py-1 rounded-full font-medium">
                {project.service_type.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/80">
                Paket {project.package_type}
              </span>
              <span className="text-[12px] font-mono text-white/50">
                ID: #{project.id.slice(0, 8)}
              </span>
            </div>

            <h1 className="text-[30px] sm:text-[38px] font-medium leading-[1.1] text-white tracking-[-0.03em]">
              {project.doc_topic || project.selected_idea?.title || `Pesanan ${project.buyer_name}`}
            </h1>
            <p className="text-[14px] text-white/60 font-mono">
              Dibuat: {new Date(project.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
            </p>
          </div>

          {/* Payment Status Indicator */}
          <div className="flex flex-col sm:items-end gap-2 shrink-0">
            <span className="text-[11px] font-mono uppercase tracking-wider text-white/50">Status Pembayaran</span>
            <span
              className={`text-[12px] font-mono uppercase tracking-wider px-3.5 py-1.5 rounded-full font-medium inline-flex items-center gap-2 ${
                project.payment_status === 'paid'
                  ? 'bg-[#59d499]/15 text-[#59d499] border border-[#59d499]/30'
                  : project.payment_status === 'rejected'
                  ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                  : 'bg-[#ffb829]/15 text-[#ffb829] border border-[#ffb829]/30'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              <span>{project.payment_status.toUpperCase()}</span>
            </span>
          </div>
        </div>

        {/* GRID SECTION 1 & 2: DATA CUSTOMER & KREDENSIAL GITHUB (KREDENSIAL HANYA UNTUK PROYEK KODING) */}
        {(() => {
          const isCodingProject = project.service_type === 'project_joki' || project.service_type === 'tugas_ringan';

          return (
            <div className={isCodingProject ? "grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" : "w-full"}>
              {/* DATA LENGKAP CUSTOMER */}
              <div className={`${isCodingProject ? "lg:col-span-7" : "w-full"} p-7 sm:p-8 rounded-[24px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col justify-between gap-6`}>
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <span className="text-[12px] font-mono uppercase tracking-[0.1em] text-white/60">
                      Data Kontak &amp; Tagihan Klien
                    </span>
                    <span className="text-[13px] font-mono text-white font-medium tabular-nums">
                      Rp {project.total_price.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className={`grid grid-cols-1 ${isCodingProject ? "sm:grid-cols-2" : "sm:grid-cols-4"} gap-4 text-[14px]`}>
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-mono uppercase text-white/50">Nama Pemesan</span>
                      <div className="text-[16px] font-medium text-white">{project.buyer_name}</div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-mono uppercase text-white/50">WhatsApp Klien</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-white font-medium">{project.buyer_whatsapp}</span>
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#59d499] hover:underline font-mono"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat WA ↗</span>
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-mono uppercase text-white/50">Email Akun</span>
                      <div className="font-mono text-white/80 truncate">
                        {project.buyer_email || 'Tidak terdaftar email'}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-mono uppercase text-white/50">Jumlah Anggota</span>
                      <div className="text-white font-mono">{project.member_count} Orang</div>
                    </div>
                  </div>

                  {/* Bukti Pembayaran QRIS */}
                  <div className="p-4 rounded-[16px] bg-white/[0.03] border border-white/10 flex items-center justify-between gap-4 mt-1">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-mono uppercase text-white/50">Bukti Transfer QRIS</span>
                      <span className="text-[13px] text-white/80">
                        {project.payment_proof_url ? 'Bukti bayar terlampir' : 'Belum diunggah'}
                      </span>
                    </div>

                    {project.payment_proof_url && (
                      <button
                        type="button"
                        onClick={() => setShowProofModal(true)}
                        className="btn-white-pill text-[12px] px-4 py-2 rounded-full inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Buka Gambar Bukti</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Aksi Verifikasi Pembayaran */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                  <span className="text-[12px] text-white/60">Tindakan Admin:</span>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handlePaymentAction('paid')}
                      disabled={isUpdatingStatus || project.payment_status === 'paid'}
                      className={`text-[12px] px-5 py-2 rounded-full font-medium transition-all ${
                        project.payment_status === 'paid'
                          ? 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
                          : 'btn-white-pill'
                      }`}
                    >
                      {project.payment_status === 'paid' ? '✓ Sudah Disetujui' : 'Setujui Pembayaran'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePaymentAction('rejected')}
                      disabled={isUpdatingStatus || project.payment_status === 'rejected'}
                      className="text-[12px] text-red-300 hover:text-white px-4 py-2 rounded-full border border-red-500/30 hover:bg-red-950/40 transition-all"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              </div>

              {/* KREDENSIAL GITHUB (HANYA DITAMPILKAN JIKA PROYEK KODING) */}
              {isCodingProject && (
                <div className="lg:col-span-5 p-7 sm:p-8 rounded-[24px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col justify-between gap-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                      <span className="text-[12px] font-mono uppercase tracking-[0.1em] text-white/60">
                        Kredensial GitHub Klien
                      </span>
                      <span className="text-[10px] text-[#59d499] font-mono px-2 py-0.5 rounded-full bg-[#59d499]/10 border border-[#59d499]/25 inline-flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Server Only</span>
                      </span>
                    </div>

                    {project.github_email && project.github_password ? (
                      <div className="flex flex-col gap-4 pt-1">
                        {/* Username / Email */}
                        <div className="flex flex-col gap-1 p-3.5 rounded-[14px] bg-white/[0.03] border border-white/10">
                          <span className="text-[11px] font-mono uppercase text-white/50">Email / Username GitHub</span>
                          <div className="text-[15px] font-mono text-white font-medium select-all">
                            {project.github_email}
                          </div>
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1 p-3.5 rounded-[14px] bg-white/[0.03] border border-white/10">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono uppercase text-white/50">Password Akun GitHub</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-white/60 hover:text-white transition-colors"
                                title={showPassword ? 'Sembunyikan' : 'Tampilkan'}
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              <button
                                type="button"
                                onClick={handleCopyPassword}
                                className="text-white/60 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-mono"
                                title="Salin Password"
                              >
                                {copiedPassword ? <Check className="w-4 h-4 text-[#59d499]" /> : <Copy className="w-4 h-4" />}
                                <span>{copiedPassword ? 'Tersalin' : 'Salin'}</span>
                              </button>
                            </div>
                          </div>

                          <div className="text-[15px] font-mono text-white font-medium select-all">
                            {showPassword ? project.github_password : '••••••••••••••••'}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-center text-white/60 font-mono text-[13px] border border-white/10 rounded-[16px] bg-white/[0.02] flex flex-col items-center gap-2">
                        <span>Klien belum mengirim email &amp; password GitHub.</span>
                      </div>
                    )}
                  </div>

                  {/* Input URL Repository yang Dibuat Admin */}
                  <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
                    <span className="text-[11px] font-mono uppercase text-white/60">Tautkan Repo Proyek (GitHub URL):</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="https://github.com/org/repo-uas"
                        value={repoUrlInput}
                        onChange={(e) => setRepoUrlInput(e.target.value)}
                        className="flex-1 bg-white/[0.04] border border-white/15 focus:border-white rounded-full px-4 py-2 text-[13px] font-mono text-white outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleSaveRepoUrl}
                        className="btn-white-pill text-[12px] px-4 py-2 rounded-full shrink-0"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* SECTION 3: SPESIFIKASI PENGERJAAN (IDE AI / TOPIK MAKALAH & PPT) */}
        <div className="p-7 sm:p-8 rounded-[24px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-[18px] font-medium text-white tracking-tight">
              Spesifikasi &amp; Detail Pengerjaan Proyek
            </h2>
            <span className="text-[11px] font-mono text-white/50 uppercase">
              {project.service_type === 'project_joki' ? 'Proyek Koding & AI' : 'Dokumen / Slide'}
            </span>
          </div>

          {/* Jika Joki Proyek: Tampilkan Ide AI, Gimmick Dosen, dan Tech Stack */}
          {project.service_type === 'project_joki' ? (
            project.selected_idea ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-mono uppercase text-white/50">Ide Proyek Terkunci Klien:</span>
                  <h3 className="text-[22px] font-medium text-white">{project.selected_idea.title}</h3>
                  <p className="text-[14px] text-white/80 leading-relaxed">{project.selected_idea.description}</p>
                </div>

                {project.selected_idea.gimmick && (
                  <div className="border-l-2 border-[#ffb829] bg-white/[0.03] p-4 rounded-r-[14px] flex flex-col gap-1">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#ffb829]">
                      Gimmick Pemikat Dosen Penguji:
                    </span>
                    <p className="text-[14px] text-white/90 leading-relaxed">{project.selected_idea.gimmick}</p>
                  </div>
                )}

                {project.selected_idea.techStack && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                    <span className="text-[12px] font-mono text-white/50 mr-2">Tech Stack:</span>
                    {project.selected_idea.techStack.map((t) => (
                      <span key={t} className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-white/80">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-white/60 font-mono text-[13px] border border-white/10 rounded-[16px] bg-white/[0.02]">
                Klien belum mengunci ide aplikasi di halaman setup.
              </div>
            )
          ) : (
            /* Jika Makalah atau PPT: Tampilkan Topik, Detail Catatan Khusus, dan Generator topik.md */
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-mono uppercase text-white/50">Topik / Judul Klien:</span>
                  <h3 className="text-[22px] font-medium text-white">{project.doc_topic || 'Topik belum ditentukan'}</h3>
                </div>

                {/* Tombol Buat topik.md dengan AI Groq */}
                <button
                  type="button"
                  onClick={handleGenerateTopicDoc}
                  disabled={isGeneratingTopic}
                  className="btn-white-pill text-[13px] px-6 py-2.5 rounded-full inline-flex items-center gap-2 shrink-0 shadow-[0_0_24px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Sparkles className="w-4 h-4 text-[#ffb829]" />
                  <span>{isGeneratingTopic ? 'Menyusun via Groq...' : 'Buat topik.md ⚡'}</span>
                </button>
              </div>

              {project.doc_details && (
                <div className="flex flex-col gap-1 border-t border-white/10 pt-4">
                  <span className="text-[11px] font-mono uppercase text-white/50">Detail &amp; Catatan Khusus Pengerjaan Klien:</span>
                  <div className="p-4 rounded-[14px] bg-white/[0.03] border border-white/10 text-[14px] text-white/90 leading-relaxed whitespace-pre-line">
                    {project.doc_details}
                  </div>
                </div>
              )}

              {/* Area Preview Hasil Generate topik.md */}
              {topicMarkdown && (
                <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#59d499]" />
                      <span className="text-[13px] font-mono font-medium text-white">
                        Dokumen topik.md (Siap Jadi Acuan Penulisan)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyTopicDoc}
                        className="btn-hairline-ghost text-[12px] px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5"
                      >
                        {copiedTopic ? <Check className="w-3.5 h-3.5 text-[#59d499]" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedTopic ? 'Tersalin!' : 'Salin Markdown'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleDownloadTopicDoc}
                        className="btn-white-pill text-[12px] px-4 py-1.5 rounded-full inline-flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh topik.md</span>
                      </button>
                    </div>
                  </div>

                  {/* Code / Markdown Block */}
                  <div className="p-5 rounded-[16px] bg-white/[0.03] border border-white/10 max-h-[460px] overflow-y-auto">
                    <pre className="text-[13px] font-mono text-white/85 whitespace-pre-wrap leading-relaxed">
                      {topicMarkdown}
                    </pre>
                  </div>
                </div>
              )}

              {/* Card Pengiriman File Deliverable (Makalah / PPT) */}
              <div className="p-6 rounded-[20px] bg-white/[0.04] border border-white/10 flex flex-col gap-4 mt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#59d499]" />
                    <h3 className="text-[16px] font-medium text-white">
                      Kirim Hasil Pengerjaan {project.service_type === 'makalah' ? 'Makalah / Dokumen' : 'Slide PPT'}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-white/60 uppercase">
                    Akses Klien di Dashboard
                  </span>
                </div>

                <p className="text-[13px] text-white/80 leading-relaxed">
                  Masukkan URL file yang siap diunduh oleh klien (Google Drive publik, Dropbox, direct link PDF/PPTX/Docx). Klien dapat langsung mengunduhnya dari dashboard proyek mereka.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="url"
                    placeholder="https://drive.google.com/file/d/... atau https://..."
                    value={docFileUrlInput}
                    onChange={(e) => setDocFileUrlInput(e.target.value)}
                    className="flex-1 bg-white/[0.04] border border-white/15 focus:border-white text-white rounded-[12px] px-4 py-2.5 text-[13px] font-mono outline-none transition-colors"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSaveDocFile(false)}
                      disabled={isSavingDocFile}
                      className="btn-hairline-ghost text-[12px] px-4 py-2.5 rounded-full text-white transition-all cursor-pointer whitespace-nowrap"
                    >
                      {isSavingDocFile ? 'Menyimpan...' : 'Simpan Link'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSaveDocFile(true)}
                      disabled={isSavingDocFile}
                      className="btn-white-pill text-[12px] px-5 py-2.5 rounded-full font-medium transition-all cursor-pointer whitespace-nowrap"
                    >
                      Kirim &amp; Selesaikan
                    </button>
                  </div>
                </div>

                {(project.doc_file_url || project.ppt_file_url) && (
                  <div className="flex items-center justify-between p-3.5 rounded-[12px] bg-white/[0.03] border border-white/10 text-[12px] font-mono">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-[#59d499]">✓ File Aktif:</span>
                      <span className="text-white truncate max-w-xs sm:max-w-md">
                        {project.doc_file_url || project.ppt_file_url}
                      </span>
                    </div>
                    <a
                      href={project.doc_file_url || project.ppt_file_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:underline shrink-0 ml-3 font-sans font-medium text-[12px]"
                    >
                      Buka File ↗
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 4: DATA ANGGOTA KELOMPOK */}
        <div className="p-7 sm:p-8 rounded-[24px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-[18px] font-medium text-white tracking-tight">
              Data Anggota Kelompok ({members.length} Orang)
            </h2>
            <span className="text-[11px] font-mono text-white/50">IDENTITAS RESMI TIM</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {members.map((m, idx) => (
              <div
                key={m.id || idx}
                className="p-5 rounded-[16px] bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] font-mono uppercase text-white/40">
                    {idx === 0 ? 'Ketua Kelompok' : `Anggota ${idx + 1}`}
                  </span>
                  <div className="text-[15px] font-medium text-white">{m.name}</div>
                  <div className="text-[12px] font-mono text-white/60">
                    NIM: {m.nim && m.nim !== '-' ? m.nim : 'Tercatat'}
                  </div>
                </div>

                {project.service_type === 'project_joki' && (
                  <div className="border-t border-white/10 pt-2.5 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-white/70">@{m.github_username || 'unconnected'}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full ${
                        m.is_connected ? 'bg-[#59d499]/15 text-[#59d499]' : 'bg-white/[0.06] text-white/50'
                      }`}
                    >
                      {m.is_connected ? 'OAuth Connected' : 'Waiting'}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Popup Bukti Transfer */}
        {showProofModal && project.payment_proof_url && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setShowProofModal(false)}
          >
            <div
              className="relative max-w-2xl w-full max-h-[90vh] bg-[#0c0c0c]/95 border border-white/10 rounded-[28px] p-6 flex flex-col gap-4 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex flex-col">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8e8e8e]">
                    Bukti Transfer QRIS
                  </span>
                  <h3 className="text-[16px] font-medium text-white">
                    {project.buyer_name} •{' '}
                    <span className="font-mono text-[#ededed]">
                      Rp {project.total_price.toLocaleString('id-ID')}
                    </span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProofModal(false)}
                  className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all text-[13px] font-mono cursor-pointer"
                  aria-label="Tutup modal"
                >
                  ✕
                </button>
              </div>

              {/* Image body */}
              <div className="flex-1 overflow-auto flex items-center justify-center bg-black/60 rounded-[18px] border border-white/[0.06] p-2 min-h-[260px] max-h-[65vh]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.payment_proof_url}
                  alt={`Bukti transfer ${project.buyer_name}`}
                  className="max-h-[60vh] max-w-full object-contain rounded-[12px]"
                />
              </div>

              {/* Footer controls */}
              <div className="flex items-center justify-between pt-2">
                <a
                  href={project.payment_proof_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`bukti-transfer-${project.buyer_name}.jpg`}
                  className="text-[12px] font-mono text-[#8e8e8e] hover:text-white inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>Buka Gambar Asli</span>
                  <span className="text-[10px]">↗</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowProofModal(false)}
                  className="btn-white-pill text-[12px] px-5 py-2 rounded-full font-medium cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
