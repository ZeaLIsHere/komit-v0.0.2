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
      <div className="bg-[#012624] text-[#bbc7c6] min-h-screen flex items-center justify-center font-mono text-[14px]">
        Memuat dashboard proyek...
      </div>
    );
  }

  if (errorMsg || !project) {
    return (
      <div className="bg-[#012624] text-[#bbc7c6] min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-[20px] font-medium text-white">Proyek Tidak Ditemukan</h1>
        <Link href="/" className="text-[#cbfffc] underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const allConnected = members.length > 0 && members.every((m) => m.is_connected);

  return (
    <div className="bg-[#012624] text-[#bbc7c6] min-h-screen flex flex-col selection:bg-[#00827c] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 sm:px-12 py-16 flex flex-col gap-10">
        {/* Top Header / Project Overview */}
        <div className="p-8 sm:p-10 rounded-[16px] bg-[#003734] flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#012624] bg-[#cbfffc] px-2 py-0.5 rounded-[4px]">
                  {project.package_type.toUpperCase()} • {project.service_type}
                </span>
                <span className="text-[12px] text-[#bbc7c6] font-mono">
                  ID: {project.id.slice(0, 8)}
                </span>
              </div>
              <h1 className="text-[32px] sm:text-[40px] font-medium leading-[1.0] text-white tracking-[-0.03em]">
                {project.selected_idea?.title || 'Proyek Kelompok Sedang Berjalan'}
              </h1>
              <p className="text-[15px] text-[#bbc7c6] max-w-2xl leading-[1.4]">
                {project.selected_idea?.description || 'Persiapan repository dan commit sprint kelompok sedang diproses.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href={`/project/${id}/setup`}
                className="text-[13px] bg-[#011d1c] hover:bg-[#012624] text-white border border-[#003734] px-5 py-2.5 rounded-[6px] transition-all"
              >
                Ubah Setup
              </Link>
              {project.github_repo_url ? (
                <a
                  href={project.github_repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-aurora text-[13px] px-5 py-2.5 rounded-[6px] transition-all"
                >
                  GitHub Repo ↗
                </a>
              ) : (
                <span className="text-[12px] text-[#bbc7c6] px-4 py-2 bg-[#011d1c] rounded-[6px] font-mono">
                  Repo Sedang Dibuat
                </span>
              )}
            </div>
          </div>

          {/* Customer Milestone Pipeline */}
          <div className="pt-4 border-t border-[#012624] grid grid-cols-1 sm:grid-cols-3 gap-3 text-[13px]">
            <div className="p-3 rounded-[6px] bg-[#011d1c] flex items-center gap-2.5">
              <span className="text-[#cbfffc] font-bold">✓</span>
              <div>
                <div className="text-white font-medium text-[13px]">Pembayaran QRIS</div>
                <div className="text-[11px] text-[#59d499]">Terverifikasi</div>
              </div>
            </div>
            <div className="p-3 rounded-[6px] bg-[#011d1c] flex items-center gap-2.5">
              <span className="text-[#cbfffc] font-bold">{project.selected_idea ? '✓' : '•'}</span>
              <div>
                <div className="text-white font-medium text-[13px]">Ide & Anggota</div>
                <div className="text-[11px] text-[#bbc7c6]">{project.selected_idea ? 'Ide AI Terkunci' : 'Lengkapi Setup'}</div>
              </div>
            </div>
            <div className="p-3 rounded-[6px] bg-[#011d1c] flex items-center gap-2.5">
              <span className="text-[#cbfffc] font-bold">●</span>
              <div>
                <div className="text-white font-medium text-[13px]">Cicil Commit</div>
                <div className="text-[11px] text-[#cbfffc] font-mono">
                  {schedules.filter((s) => s.status === 'pushed').length}/{schedules.length} Selesai
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gimmick Banner */}
        {project.selected_idea?.gimmick && (
          <div className="p-6 rounded-[16px] bg-[#011d1c] border border-[#003734] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[13px] text-[#cbfffc] font-medium block mb-1">
                Gimmick Pemikat Nilai Dosen
              </span>
              <p className="text-[15px] text-white font-normal">
                {project.selected_idea.gimmick}
              </p>
            </div>
            <span className="text-[12px] text-[#fde9ff] font-mono shrink-0 uppercase tracking-wider">
              Target Nilai A
            </span>
          </div>
        )}

        {/* Members Status Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-medium text-white tracking-tight">
              Status GitHub Anggota ({members.length} Orang)
            </h2>
            {!allConnected && (
              <Link
                href={`/join/${id}`}
                className="text-[13px] uppercase tracking-[0.08em] text-[#cbfffc] hover:underline font-medium"
              >
                Undang / Connect Anggota Lain ↗
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {members.map((m) => (
              <div
                key={m.id}
                className="p-6 rounded-[16px] bg-[#003734] flex flex-col justify-between gap-4"
              >
                <div>
                  <div className="text-[16px] font-medium text-white">{m.name}</div>
                  <div className="text-[12px] text-[#bbc7c6] font-mono mt-1">
                    NIM: {m.nim} • KOM {m.kom}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#012624] pt-3">
                  <span className="text-[12px] font-mono text-[#bbc7c6]">
                    @{m.github_username || 'unconnected'}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-[0.08em] px-2.5 py-1 rounded-[4px] ${
                      m.is_connected
                        ? 'bg-[#cbfffc] text-[#012624] font-medium'
                        : 'bg-[#011d1c] text-[#bbc7c6]'
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
                Antrean & Riwayat Cicil Commit GitHub
              </h2>
              <p className="text-[14px] text-[#bbc7c6]">
                Commit didorong secara natural atas nama masing-masing anggota kelompok hingga batas UAS.
              </p>
            </div>
            <span className="text-[14px] text-[#fde9ff] font-mono">
              {schedules.filter((s) => s.status === 'pushed').length} / {schedules.length} Selesai
            </span>
          </div>

          <div className="border border-[#003734] rounded-[16px] overflow-hidden bg-[#003734]">
            {schedules.length === 0 ? (
              <div className="p-8 text-center text-[#bbc7c6] text-[14px] font-mono">
                Belum ada antrean commit. Tim joki akan segera menambahkan jadwal sprint mingguan.
              </div>
            ) : (
              <div className="divide-y divide-[#012624]">
                {schedules.map((s) => (
                  <div
                    key={s.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[14px] hover:bg-[#012624]/60 transition-colors"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[12px] font-mono text-[#edfffe] bg-[#012624] px-2 py-0.5 rounded-[4px]">
                          @{s.github_username || 'member'}
                        </span>
                        <span className="text-[12px] text-[#bbc7c6] font-mono">
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
                        <span className="text-[11px] font-mono text-[#fde9ff] bg-[#011d1c] px-2 py-0.5 rounded-[4px]">
                          #{s.commit_hash}
                        </span>
                      )}
                      <span
                        className={`text-[11px] uppercase tracking-[0.08em] px-2.5 py-0.5 rounded-[4px] ${
                          s.status === 'pushed'
                            ? 'bg-[#cbfffc] text-[#012624] font-medium'
                            : 'bg-[#011d1c] text-[#bbc7c6]'
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

        {/* UAS Presentation Materials Section */}
        <section className="flex flex-col gap-4">
          <h2 className="text-[24px] font-medium text-white tracking-tight">
            Bahan Presentasi & Panduan Tanya Jawab Dosen
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Opsi 1: Free AI README */}
            <div className="p-8 rounded-[16px] bg-[#003734] flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-[0.12em] text-[#cbfffc] font-medium">
                  Termasuk di Paket (Gratis)
                </span>
                <h3 className="text-[22px] font-medium text-white leading-tight">
                  Generate Bahan Presentasi (README)
                </h3>
                <p className="text-[14px] text-[#bbc7c6] leading-[1.4]">
                  Menyusun pembagian tugas per anggota, penjelasan arsitektur kode, dan bocoran argumen jawaban saat dosen menguji.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleGenerateReadme}
                  disabled={isGeneratingReadme}
                  className="btn-aurora text-[13px] px-5 py-2.5 rounded-[6px]"
                >
                  {isGeneratingReadme ? 'Menyusun...' : 'Generate README ↗'}
                </button>
                {readmeContent && (
                  <button
                    type="button"
                    onClick={copyReadmeToClipboard}
                    className="border border-[#003734] bg-[#011d1c] text-white text-[13px] px-4 py-2.5 rounded-[6px] hover:border-[#cbfffc] transition-all"
                  >
                    {copiedReadme ? '✓ Disalin' : 'Salin Markdown'}
                  </button>
                )}
              </div>
            </div>

            {/* Opsi 2: Add-on Slide PPT Jadi */}
            <div className="p-8 rounded-[16px] bg-[#003734] flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-[0.12em] text-[#fde9ff] font-medium">
                  Add-on Opsional
                </span>
                <h3 className="text-[22px] font-medium text-white leading-tight">
                  Slide Presentasi PPT Jadi
                </h3>
                <p className="text-[14px] text-[#bbc7c6] leading-[1.4]">
                  Tidak sempat merangkum ke slide? Tim kami siapkan slide PowerPoint (.pptx/.pdf) siap pakai untuk demo kelompok Anda.
                </p>
              </div>

              <div>
                {project.ppt_addon_paid ? (
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-[#cbfffc] font-mono">✓ Add-on Aktif</span>
                    {project.ppt_file_url ? (
                      <a
                        href={project.ppt_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-aurora text-[13px] px-5 py-2.5 rounded-[6px] inline-block"
                      >
                        Unduh Slide PPT ↗
                      </a>
                    ) : (
                      <span className="text-[13px] text-[#bbc7c6]">Admin sedang menyiapkan file</span>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPptModal(true)}
                    className="border border-[#00827c] text-white hover:border-[#cbfffc] text-[13px] font-medium uppercase tracking-[0.08em] px-5 py-2.5 rounded-[6px] transition-all"
                  >
                    Pesan Slide PPT (Rp 75.000)
                  </button>
                )}
              </div>
            </div>
          </div>

          {readmeContent && (
            <div className="p-8 rounded-[16px] bg-[#011d1c] border border-[#003734] flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-[#003734] pb-3">
                <span className="text-[12px] font-mono uppercase tracking-[0.12em] text-[#cbfffc]">
                  README.md Output Preview
                </span>
                <button
                  onClick={copyReadmeToClipboard}
                  className="text-[12px] text-[#bbc7c6] hover:text-white"
                >
                  {copiedReadme ? '✓ Disalin ke clipboard' : 'Salin Semua'}
                </button>
              </div>
              <pre className="text-[13px] font-mono text-[#bbc7c6] whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto">
                {readmeContent}
              </pre>
            </div>
          )}
        </section>

        {/* Modal Buy PPT */}
        {showPptModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#003734] rounded-[16px] p-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[20px] font-medium text-white">Pesan Slide PPT Jadi</h3>
                <button
                  onClick={() => setShowPptModal(false)}
                  className="text-[#bbc7c6] hover:text-white text-[18px]"
                >
                  ✕
                </button>
              </div>
              <p className="text-[14px] text-[#bbc7c6] leading-[1.4]">
                Biaya add-on slide presentasi UAS: <strong className="text-[#fde9ff] font-mono">Rp 75.000</strong>. File PPTX & PDF akan diunggah admin ke dashboard ini dalam 1-2 hari kerja.
              </p>
              <div className="p-4 bg-[#011d1c] rounded-[6px] flex flex-col items-center gap-1.5">
                <span className="text-[11px] uppercase tracking-[0.12em] text-[#edfffe]">QRIS Statis Pembayaran</span>
                <span className="text-[20px] text-[#fde9ff] font-mono font-medium">Rp 75.000</span>
                <span className="text-[11px] text-[#bbc7c6]">NMID: ID102938475 (KOMIT PLATFORM)</span>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPptModal(false)}
                  className="text-[13px] text-[#bbc7c6] hover:text-white px-3 py-1.5"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleBuyPptAddon}
                  disabled={isBuyingPpt}
                  className="btn-aurora text-[13px] px-5 py-2.5 rounded-[6px]"
                >
                  {isBuyingPpt ? 'Memproses...' : 'Konfirmasi Pembayaran ↗'}
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
