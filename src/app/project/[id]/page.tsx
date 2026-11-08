'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommitHeatmap from '@/components/CommitHeatmap';
import { Project, ProjectMember, CommitSchedule } from '@/lib/types';

export default function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [schedules, setSchedules] = useState<CommitSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // README generator state
  const [isGeneratingReadme, setIsGeneratingReadme] = useState<boolean>(false);
  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [copiedReadme, setCopiedReadme] = useState<boolean>(false);

  // PPT Add-on state
  const [showPptModal, setShowPptModal] = useState<boolean>(false);
  const [isBuyingPpt, setIsBuyingPpt] = useState<boolean>(false);

  useEffect(() => {
    async function loadProjectData() {
      try {
        const [pRes, mRes, sRes] = await Promise.all([
          fetch(`/api/projects/${id}`),
          fetch(`/api/projects/${id}/members`),
          fetch(`/api/projects/${id}/schedules`),
        ]);

        if (!pRes.ok) throw new Error('Proyek tidak ditemukan');
        const pData = await pRes.json();
        setProject(pData.project);
        if (pData.project.readme_content) {
          setReadmeContent(pData.project.readme_content);
        }

        if (mRes.ok) {
          const mData = await mRes.json();
          setMembers(mData.members || []);
        }

        if (sRes.ok) {
          const sData = await sRes.json();
          setSchedules(sData.schedules || []);
        }
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Gagal memuat dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadProjectData();
  }, [id]);

  const handleGenerateReadme = async () => {
    if (!project?.selected_idea) {
      alert('Pilih ide proyek terlebih dahulu di menu Setup');
      return;
    }

    setIsGeneratingReadme(true);
    try {
      const res = await fetch('/api/ai/readme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: id,
          selectedIdea: project.selected_idea,
          members,
        }),
      });

      const data = await res.json();
      if (res.ok && data.readme) {
        setReadmeContent(data.readme);
      } else {
        throw new Error(data.error || 'Gagal generate README');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal membuat bahan presentasi');
    } finally {
      setIsGeneratingReadme(false);
    }
  };

  const copyReadmeToClipboard = () => {
    if (!readmeContent) return;
    navigator.clipboard.writeText(readmeContent);
    setCopiedReadme(true);
    setTimeout(() => setCopiedReadme(false), 2500);
  };

  const handleBuyPptAddon = async () => {
    setIsBuyingPpt(true);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ppt_addon_paid: true,
          ppt_file_url: 'https://komit-v2.storage/demo-slide-presentasi.pdf',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
        setShowPptModal(false);
        alert('Add-on Slide PPT berhasil dipesan!');
      }
    } catch {
      alert('Gagal memproses add-on');
    } finally {
      setIsBuyingPpt(false);
    }
  };

  if (loading) {
    return (
      <div className="text-[#bbc7c6] min-h-screen flex items-center justify-center font-mono text-[14px]">
        Memuat dashboard proyek...
      </div>
    );
  }

  if (errorMsg || !project) {
    return (
      <div className="text-[#bbc7c6] min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-[20px] font-medium text-white">Proyek Tidak Ditemukan</h1>
        <Link href="/" className="text-white underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  // Show waiting payment screen before admin approves
  if (project.payment_status === 'pending') {
    return (
      <div className="text-[#ededed] min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-[700px] w-full mx-auto px-6 sm:px-12 py-24 flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <span className="text-[12px] uppercase tracking-wider text-[#686868] font-mono">
              ID Pesanan: {project.id.slice(0, 8)}...
            </span>
            <h1 className="text-[36px] sm:text-[44px] font-medium leading-[1.1] text-white tracking-[-0.03em]">
              Pesanan diterima. Menunggu verifikasi.
            </h1>
            <p className="text-[15px] text-[#c2c2c2] leading-[1.5]">
              Tim Komit sedang memverifikasi bukti transfer QRIS kamu. Proses verifikasi biasanya selesai dalam{' '}
              <strong className="text-white">1 sampai 3 jam</strong> pada hari kerja.
            </p>
          </div>

          <div className="p-8 rounded-[14px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4 text-[14px]">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-[#686868] mb-1">Pemesan</div>
                <div className="text-white font-medium">{project.buyer_name}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-[#686868] mb-1">WhatsApp</div>
                <div className="text-white font-mono">{project.buyer_whatsapp}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-[#686868] mb-1">Layanan</div>
                <div className="text-white capitalize">{project.service_type.replace('_', ' ')} ({project.package_type})</div>
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-[#686868] mb-1">Total Tagihan</div>
                <div className="text-white font-mono font-medium">Rp {project.total_price.toLocaleString('id-ID')}</div>
              </div>
            </div>

            <div className="border-t border-[#e5e5e5]/10 pt-4 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0" />
              <span className="text-[14px] text-[#c2c2c2]">
                Status pembayaran: <strong className="text-white font-medium">Menunggu Verifikasi</strong>
              </span>
            </div>
          </div>

          <p className="text-[13px] text-[#686868]">
            Simpan link halaman ini untuk memantau status pesanan. Setelah diverifikasi, halaman ini otomatis terbuka untuk setup proyek.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.location.reload()}
              className="btn-white-pill text-[14px] px-6 py-3 rounded-full self-start"
            >
              Refresh Status
            </button>
            <Link href="/" className="text-[13px] text-[#c2c2c2] hover:text-white self-start mt-1">
              ← Kembali ke Beranda
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Payment rejected screen
  if (project.payment_status === 'rejected') {
    return (
      <div className="text-[#ededed] min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-[700px] w-full mx-auto px-6 sm:px-12 py-24 flex flex-col gap-6">
          <h1 className="text-[36px] font-medium leading-[1.1] text-white tracking-[-0.03em]">
            Pembayaran ditolak.
          </h1>
          <p className="text-[15px] text-[#c2c2c2] leading-[1.5]">
            Bukti transfer tidak valid atau nominal tidak sesuai. Hubungi tim Komit via WhatsApp untuk klarifikasi.
          </p>
          <div className="p-5 rounded-[16px] bg-white/[0.04] border border-white/10">
            <div className="text-[11px] uppercase tracking-wider text-[#686868] mb-1">ID Pesanan</div>
            <div className="text-white font-mono text-[14px]">{project.id}</div>
          </div>
          <Link href="/order" className="btn-white-pill text-[14px] px-6 py-3 rounded-full self-start">
            Pesan Ulang ↗
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const allConnected = members.length > 0 && members.every((m) => m.is_connected);

  return (
    <div className="text-[#ededed] min-h-screen flex flex-col selection:bg-[#6b62f2]/30 selection:text-white font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 sm:px-12 pt-28 sm:pt-32 pb-20 flex flex-col gap-10">
        {/* Setup Banner */}
        {project.status === 'setup' && (() => {
          const needsGitHub = project.service_type === 'project_joki' || project.service_type === 'tugas_ringan';
          return (
            <div className="p-6 rounded-[14px] bg-white/[0.04] backdrop-blur-xl border border-white/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] uppercase tracking-wider text-white font-medium">
                    Pembayaran Terverifikasi
                  </span>
                  {needsGitHub ? (
                    project.github_email && project.github_password ? (
                      <span className="text-[10px] text-[#59d499] font-mono px-2 py-0.5 rounded-full bg-[#59d499]/15 border border-[#59d499]/30">
                        Akun GitHub Terkirim ke Admin
                      </span>
                    ) : (
                      <span className="text-[10px] text-yellow-300 font-mono px-2 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/30">
                        Email &amp; Password GitHub Diperlukan
                      </span>
                    )
                  ) : (
                    <span className="text-[10px] text-[#59d499] font-mono px-2 py-0.5 rounded-full bg-[#59d499]/15 border border-[#59d499]/30">
                      Siap Diproses
                    </span>
                  )}
                </div>
                <p className="text-[15px] text-[#ededed]">
                  {needsGitHub ? (
                    !project.github_email
                      ? 'Kirimkan email & password GitHub Anda dan lengkapi data anggota agar admin dapat memulai pengerjaan proyek.'
                      : 'Kredensial GitHub Anda telah dikirim ke admin. Anda dapat melanjutkan setup ide dan pembagian tugas anggota.'
                  ) : (
                    `Pembayaran Anda telah diverifikasi. Silakan periksa atau lengkapi data anggota kelompok untuk pengerjaan ${project.service_type === 'makalah' ? 'makalah resmi' : 'slide presentasi'}.`
                  )}
                </p>
              </div>
              <Link
                href={`/project/${id}/setup`}
                className="btn-white-pill text-[13px] px-6 py-2.5 rounded-full shrink-0"
              >
                {needsGitHub
                  ? (!project.github_email ? 'Isi Kredensial GitHub ↗' : 'Lanjut Setup Proyek ↗')
                  : 'Lengkapi Data Anggota ↗'}
              </Link>
            </div>
          );
        })()}

        {/* Completed Banner — shown when admin marks project completed */}
        {project.status === 'completed' && (
          <div className="p-6 rounded-[14px] bg-white/[0.04] backdrop-blur-xl border border-[#59d499]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-[#59d499] font-medium mb-1">
                Proyek Selesai &amp; Siap Sidang UAS
              </div>
              <p className="text-[15px] text-white">
                Seluruh pengerjaan kode dan cicil commit telah tuntas diselesaikan oleh tim joki.
              </p>
            </div>
          </div>
        )}

        {/* GitHub Credentials status for client awareness (Hanya untuk Joki Proyek & Koding Ringan) */}
        {project.payment_status === 'paid' && project.status !== 'setup' && (project.service_type === 'project_joki' || project.service_type === 'tugas_ringan') && (
          <div className="p-5 rounded-[20px] bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px]">
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <div>
                <span className="text-white font-medium">Akun GitHub untuk Admin:</span>{' '}
                <span className="text-white/80 font-mono">
                  {project.github_email ? `${project.github_email} (Terkirim ke Admin)` : 'Belum diisi'}
                </span>
              </div>
            </div>
            <Link
              href={`/project/${id}/setup`}
              className="text-[12px] text-white/80 hover:text-white underline self-start sm:self-auto"
            >
              {project.github_email ? 'Perbarui Kredensial' : 'Kirim Email & Password GitHub ↗'}
            </Link>
          </div>
        )}

        {/* Top Header / Project Overview */}
        <div className="p-8 sm:p-10 rounded-[14px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#161616] bg-white px-2.5 py-0.5 rounded-full font-mono">
                  {project.package_type.toUpperCase()} • {project.service_type}
                </span>
                <span className="text-[12px] text-white/60 font-mono">
                  ID: {project.id.slice(0, 8)}
                </span>
              </div>
              <h1 className="text-[32px] sm:text-[40px] font-medium leading-[1.1] text-white tracking-[-0.03em]">
                {project.doc_topic || project.selected_idea?.title || (project.service_type === 'makalah' ? 'Pengerjaan Makalah & Laporan' : project.service_type === 'ppt' ? 'Pembuatan Slide Presentasi PPT' : 'Pengerjaan Tugas Koding')}
              </h1>
              <p className="text-[15px] text-white/80 max-w-2xl leading-[1.5]">
                {project.doc_details || project.selected_idea?.description || 'Persiapan dan pengerjaan dokumen sedang diproses oleh tim spesialis.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href={`/project/${id}/setup`}
                className="btn-hairline-ghost text-[13px] px-5 py-2.5 rounded-full transition-all"
              >
                Ubah Setup
              </Link>
              {project.service_type === 'project_joki' && (
                project.github_repo_url ? (
                  <a
                    href={project.github_repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-hairline-ghost text-[13px] px-5 py-2.5 rounded-full transition-all"
                  >
                    GitHub Repo ↗
                  </a>
                ) : (
                  <span className="text-[12px] text-white/60 px-4 py-2 bg-white/[0.05] rounded-full font-mono border border-white/10">
                    Repo Sedang Dibuat
                  </span>
                )
              )}
            </div>
          </div>

          {/* Customer Milestone Pipeline */}
          <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[13px]">
            <div className="p-3.5 rounded-[12px] bg-white/[0.05] border border-white/10 flex items-center gap-2.5">
              <span className="text-white font-bold">✓</span>
              <div>
                <div className="text-white font-medium text-[13px]">Pembayaran QRIS</div>
                <div className="text-[11px] text-white/70">Terverifikasi</div>
              </div>
            </div>
            <div className="p-3.5 rounded-[12px] bg-white/[0.05] border border-white/10 flex items-center gap-2.5">
              <span className="text-white font-bold">{project.selected_idea ? '✓' : '•'}</span>
              <div>
                <div className="text-white font-medium text-[13px]">Ide & Anggota</div>
                <div className="text-[11px] text-white/70">{project.selected_idea ? 'Ide AI Terkunci' : 'Lengkapi Setup'}</div>
              </div>
            </div>
            <div className="p-3.5 rounded-[12px] bg-white/[0.05] border border-white/10 flex items-center gap-2.5">
              <span className="text-white font-bold">{project.status === 'completed' ? '✓' : '●'}</span>
              <div>
                <div className="text-white font-medium text-[13px]">
                  {project.service_type === 'project_joki' ? 'Cicil Commit' : 'Status Pengerjaan'}
                </div>
                <div className="text-[11px] text-white/90 font-mono">
                  {project.service_type === 'project_joki'
                    ? `${schedules.filter((s) => s.status === 'pushed').length}/${schedules.length} Selesai`
                    : project.status === 'completed'
                    ? 'Selesai Dikerjakan'
                    : 'Sedang Dikerjakan'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gimmick Banner */}
        {project.selected_idea?.gimmick && (
          <div className="p-6 rounded-[14px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[13px] text-white font-medium block mb-1">
                Gimmick Pemikat Nilai Dosen
              </span>
              <p className="text-[15px] text-white/80 font-normal">
                {project.selected_idea.gimmick}
              </p>
            </div>
            <span className="text-[12px] text-white font-mono shrink-0 uppercase tracking-wider bg-white/[0.06] px-3 py-1 rounded-full border border-white/10">
              Target Nilai A
            </span>
          </div>
        )}

        {/* SEKSI KHUSUS JOKI PROYEK: STATUS GITHUB, HEATMAP & JADWAL COMMIT */}
        {project.service_type === 'project_joki' ? (
          <>
            {/* Members Status Section */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[20px] font-medium text-white tracking-tight">
                  Status GitHub Anggota ({members.length} Orang)
                </h2>
                {!allConnected && (
                  <Link
                    href={`/join/${id}`}
                    className="text-[13px] text-white hover:underline font-medium"
                  >
                    Undang / Connect Anggota Lain ↗
                  </Link>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="p-6 rounded-[14px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="text-[16px] font-medium text-white">{m.name}</div>
                      <div className="text-[12px] text-white/60 font-mono mt-1">
                        NIM: {m.nim} • KOM {m.kom}
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="text-[12px] font-mono text-white/80">
                        @{m.github_username || 'unconnected'}
                      </span>
                      <span
                        className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full font-mono ${
                          m.is_connected
                            ? 'bg-white text-[#161616] font-medium'
                            : 'bg-white/[0.08] text-white/70 border border-white/15'
                        }`}
                      >
                        {m.is_connected ? 'Connected' : 'Pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* GitHub Contribution Heatmap Grid */}
            <section>
              <CommitHeatmap schedules={schedules} members={members} />
            </section>

            {/* Commit Schedule & History (Cicil Commit) */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[20px] font-medium text-white tracking-tight">
                    Antrean &amp; Riwayat Cicil Commit GitHub
                  </h2>
                  <p className="text-[14px] text-white/70">
                    Commit didorong secara natural atas nama masing-masing anggota kelompok hingga batas UAS.
                  </p>
                </div>
                <span className="text-[14px] text-white font-mono">
                  {schedules.filter((s) => s.status === 'pushed').length} / {schedules.length} Selesai
                </span>
              </div>

              <div className="border border-white/10 rounded-[14px] overflow-hidden bg-white/[0.04] backdrop-blur-xl">
                {schedules.length === 0 ? (
                  <div className="p-8 text-center text-white/60 text-[14px] font-mono">
                    Belum ada antrean commit. Tim joki akan segera menambahkan jadwal sprint mingguan.
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {schedules.map((s) => (
                      <div
                        key={s.id}
                        className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[14px] hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <span className="text-[12px] font-mono text-white bg-white/[0.08] border border-white/15 px-2.5 py-0.5 rounded-[6px]">
                              @{s.github_username || 'member'}
                            </span>
                            <span className="text-[12px] text-white/60 font-mono">
                              {new Date(s.scheduled_at).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <span className="text-white font-mono text-[13px]">{s.commit_message}</span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                          {s.commit_hash && (
                            <span className="text-[11px] font-mono text-white/80 bg-white/[0.06] border border-white/10 px-2.5 py-0.5 rounded-[6px]">
                              #{s.commit_hash}
                            </span>
                          )}
                          <span
                            className={`text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-mono ${
                              s.status === 'pushed'
                                ? 'bg-white text-[#161616] font-medium'
                                : 'bg-white/[0.08] text-white/80 border border-white/15'
                            }`}
                          >
                            {s.status === 'pushed' ? 'Pushed' : 'Scheduled'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          /* SEKSI UNTUK MAKALAH, PPT, DAN TUGAS RINGAN (NON-GIT) */
          <div className="flex flex-col gap-6">
            {project.doc_topic && (
              <div className="p-6 sm:p-8 rounded-[14px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-white/60">
                    Spesifikasi Pesanan Klien
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-white/80">
                    {project.service_type === 'makalah' ? 'Makalah / Laporan' : 'Slide PPT'}
                  </span>
                </div>
                <h3 className="text-[20px] font-medium text-white">{project.doc_topic}</h3>
                {project.doc_details && (
                  <p className="text-[14px] text-white/80 leading-relaxed whitespace-pre-line border-t border-white/10 pt-3">
                    {project.doc_details}
                  </p>
                )}
              </div>
            )}

            <section className="flex flex-col gap-4">
              <h2 className="text-[20px] font-medium text-white tracking-tight">
                Data Anggota Kelompok ({members.length} Orang)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {members.map((m, idx) => (
                  <div
                    key={m.id || idx}
                    className="p-6 rounded-[14px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col justify-between gap-3"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-mono uppercase text-white/50">
                        {idx === 0 ? 'Ketua' : `Anggota ${idx + 1}`}
                      </span>
                      <div className="text-[16px] font-medium text-white">{m.name}</div>
                    </div>
                    <div className="border-t border-white/10 pt-3 flex items-center justify-between text-[12px] font-mono">
                      <span className="text-white/60">NIM:</span>
                      <span className="text-white font-medium">{m.nim && m.nim !== '-' ? m.nim : 'Tercatat'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* UAS Presentation Materials Section (HANYA UNTUK LAYANAN KODING) */}
        {(project.service_type === 'project_joki' || project.service_type === 'tugas_ringan') && (
          <section className="flex flex-col gap-4">
            <h2 className="text-[24px] font-medium text-white tracking-tight">
              Bahan Presentasi &amp; Panduan Tanya Jawab Dosen
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Opsi 1: Free AI README */}
              <div className="p-8 rounded-[14px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col justify-between gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-wider text-white font-medium">
                    Termasuk di Paket (Gratis)
                  </span>
                  <h3 className="text-[22px] font-medium text-white leading-tight">
                    Generate Bahan Presentasi (README)
                  </h3>
                  <p className="text-[14px] text-[#c2c2c2] leading-[1.5]">
                    Menyusun pembagian tugas per anggota, penjelasan arsitektur kode, dan bocoran argumen jawaban saat dosen menguji.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleGenerateReadme}
                    disabled={isGeneratingReadme}
                    className="btn-white-pill text-[13px] px-5 py-2.5 rounded-full"
                  >
                    {isGeneratingReadme ? 'Menyusun...' : 'Generate README'}
                  </button>
                  {readmeContent && (
                    <button
                      type="button"
                      onClick={copyReadmeToClipboard}
                      className="btn-hairline-ghost text-[13px] px-4 py-2 rounded-full transition-all"
                    >
                      {copiedReadme ? '✓ Disalin' : 'Salin Markdown'}
                    </button>
                  )}
                </div>
              </div>

              {/* Opsi 2: Add-on Slide PPT Jadi */}
              <div className="p-8 rounded-[14px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col justify-between gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-wider text-white font-medium">
                    Add-on Opsional
                  </span>
                  <h3 className="text-[22px] font-medium text-white leading-tight">
                    Slide Presentasi PPT Jadi
                  </h3>
                  <p className="text-[14px] text-[#c2c2c2] leading-[1.5]">
                    Tidak sempat merangkum ke slide? Tim kami siapkan slide PowerPoint (.pptx/.pdf) siap pakai untuk demo kelompok Anda.
                  </p>
                </div>

                <div>
                  {project.ppt_addon_paid ? (
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] text-white font-mono">✓ Add-on Aktif</span>
                      {project.ppt_file_url ? (
                        <a
                          href={project.ppt_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-white-pill text-[13px] px-5 py-2.5 rounded-full inline-block"
                        >
                          Unduh Slide PPT ↗
                        </a>
                      ) : (
                        <span className="text-[13px] text-[#686868]">Admin sedang menyiapkan file</span>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowPptModal(true)}
                      className="btn-hairline-ghost text-white text-[13px] font-medium px-5 py-2.5 rounded-full transition-all"
                    >
                      Pesan Slide PPT (Rp 75.000)
                    </button>
                  )}
                </div>
              </div>
            </div>

            {readmeContent && (
              <div className="p-8 rounded-[14px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-[#e5e5e5]/10 pb-3">
                  <span className="text-[12px] font-mono text-white">
                    README.md Output Preview
                  </span>
                  <button
                    onClick={copyReadmeToClipboard}
                    className="text-[12px] text-[#c2c2c2] hover:text-white"
                  >
                    {copiedReadme ? '✓ Disalin ke clipboard' : 'Salin Semua'}
                  </button>
                </div>
                <pre className="text-[13px] font-mono text-[#c2c2c2] whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto">
                  {readmeContent}
                </pre>
              </div>
            )}
          </section>
        )}

        {/* Modal Buy PPT */}
        {showPptModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white/[0.06] backdrop-blur-2xl border border-white/15 rounded-[14px] p-8 flex flex-col gap-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-[20px] font-medium text-white">Pesan Slide PPT Jadi</h3>
                <button
                  onClick={() => setShowPptModal(false)}
                  className="text-[#686868] hover:text-white text-[18px]"
                >
                  ✕
                </button>
              </div>
              <p className="text-[14px] text-[#c2c2c2] leading-[1.5]">
                Biaya add-on slide presentasi UAS: <strong className="text-white font-mono">Rp 75.000</strong>. File PPTX & PDF akan diunggah admin ke dashboard ini dalam 1-2 hari kerja.
              </p>
              <div className="p-4 bg-white/[0.04] rounded-[14px] border border-white/10 flex flex-col items-center gap-1.5">
                <span className="text-[11px] uppercase tracking-wider text-white/60 font-mono">QRIS Statis Pembayaran</span>
                <span className="text-[20px] text-white font-mono font-medium">Rp 75.000</span>
                <span className="text-[11px] text-white/50 font-mono">NMID: ID102938475 (KOMIT PLATFORM)</span>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPptModal(false)}
                  className="text-[13px] text-[#686868] hover:text-white px-3 py-1.5"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleBuyPptAddon}
                  disabled={isBuyingPpt}
                  className="btn-white-pill text-[13px] px-5 py-2.5 rounded-full"
                >
                  {isBuyingPpt ? 'Memproses...' : 'Konfirmasi Pembayaran'}
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
