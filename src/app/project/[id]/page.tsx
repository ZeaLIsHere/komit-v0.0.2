'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
      <div className="bg-[#040506] text-white min-h-screen flex items-center justify-center font-mono text-[14px]">
        Memuat dashboard proyek...
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

  const allConnected = members.length > 0 && members.every((m) => m.is_connected);

  return (
    <div className="bg-[#040506] text-white min-h-screen flex flex-col selection:bg-[#ff6363]/30">
      <Navbar />

      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 py-12 flex flex-col gap-10">
        {/* Top Header / Project Overview */}
        <div className="p-6 rounded-2xl bg-[#07080a] border border-[#363739] key-shadow flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-[0.05em] text-[#e6e6e6] bg-[#1b1c1e] px-2 py-0.5 rounded-[4px] border border-[#363739]">
                {project.package_type.toUpperCase()} • {project.service_type}
              </span>
              <span className="text-[11px] text-[#6a6b6c] font-mono">
                ID: {project.id.slice(0, 8)}
              </span>
            </div>
            <h1 className="text-[26px] sm:text-[34px] font-normal text-white">
              {project.selected_idea?.title || 'Proyek Kelompok Sedang Berjalan'}
            </h1>
            <p className="text-[14px] text-[#9c9c9d] max-w-2xl leading-relaxed">
              {project.selected_idea?.description || 'Persiapan repository dan commit sprint kelompok sedang diproses.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href={`/project/${id}/setup`}
              className="text-[13px] bg-[#111214] hover:bg-[#1b1c1e] text-[#9c9c9d] hover:text-white border border-[#363739] px-4 py-2 rounded-lg transition-all"
            >
              Ubah Setup
            </Link>
            {project.github_repo_url ? (
              <a
                href={project.github_repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] bg-[#e6e6e6] hover:bg-white text-[#454647] font-medium px-4 py-2 rounded-lg transition-all"
              >
                GitHub Repo ↗
              </a>
            ) : (
              <span className="text-[12px] text-[#6a6b6c] px-3 py-1.5 bg-[#111214] rounded-lg border border-[#1b1c1e] font-mono">
                Repo Sedang Dibuat
              </span>
            )}
          </div>
        </div>

        {/* Gimmick Banner */}
        {project.selected_idea?.gimmick && (
          <div className="p-4 rounded-xl bg-[#07080a] border border-[#ff6363]/40 key-shadow-active flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#ff6363] block mb-0.5">
                Gimmick Pemikat Nilai Dosen (UAS Ready)
              </span>
              <p className="text-[14px] text-white">
                {project.selected_idea.gimmick}
              </p>
            </div>
            <span className="text-[11px] font-mono text-[#6a6b6c] shrink-0">
              Target Nilai A
            </span>
          </div>
        )}

        {/* Members Status Section */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-[16px] font-medium text-white">
              Status GitHub Anggota ({members.length} Orang)
            </h2>
            {!allConnected && (
              <Link
                href={`/join/${id}`}
                className="text-[12px] text-[#ff6363] hover:underline font-mono"
              >
                Undang / Connect Anggota Lain →
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {members.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-[#07080a] border border-[#363739] key-shadow flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="text-[14px] font-medium text-white">{m.name}</div>
                  <div className="text-[12px] text-[#6a6b6c] font-mono mt-0.5">
                    NIM: {m.nim} • KOM {m.kom}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#111214] pt-2">
                  <span className="text-[11px] font-mono text-[#9c9c9d]">
                    @{m.github_username || 'unconnected'}
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-[4px] ${
                      m.is_connected
                        ? 'bg-[#59d499]/10 text-[#59d499] border border-[#59d499]/30'
                        : 'bg-[#1b1c1e] text-[#6a6b6c]'
                    }`}
                  >
                    {m.is_connected ? 'Connected' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Commit Schedule & History */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-medium text-white">
                Antrean & Riwayat Cicil Commit GitHub
              </h2>
              <p className="text-[13px] text-[#6a6b6c]">
                Commit didorong secara natural atas nama akun masing-masing anggota kelompok hingga UAS.
              </p>
            </div>
            <span className="text-[12px] text-[#9c9c9d] font-mono">
              {schedules.filter((s) => s.status === 'pushed').length} / {schedules.length} Selesai
            </span>
          </div>

          <div className="border border-[#363739] rounded-2xl overflow-hidden bg-[#07080a] key-shadow">
            {schedules.length === 0 ? (
              <div className="p-8 text-center text-[#6a6b6c] text-[13px] font-mono">
                Belum ada antrean commit. Tim joki akan segera menambahkan jadwal sprint mingguan.
              </div>
            ) : (
              <div className="divide-y divide-[#111214]">
                {schedules.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[13px] hover:bg-[#111214]/50 transition-colors"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[11px] font-mono text-white bg-[#1b1c1e] px-1.5 py-0.5 rounded">
                          @{s.github_username || 'member'}
                        </span>
                        <span className="text-[11px] text-[#6a6b6c] font-mono">
                          {new Date(s.scheduled_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <span className="text-white font-mono text-[13px]">{s.commit_message}</span>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                      {s.commit_hash && (
                        <span className="text-[11px] font-mono text-[#e6e6e6] bg-[#111214] px-2 py-0.5 rounded border border-[#1b1c1e]">
                          #{s.commit_hash}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-[4px] ${
                          s.status === 'pushed'
                            ? 'bg-[#59d499]/10 text-[#59d499] border border-[#59d499]/30'
                            : 'bg-[#1b1c1e] text-[#6a6b6c]'
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
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-mono uppercase tracking-[0.05em] text-[#ff6363]">
              Persiapan Demo & Sidang UAS
            </span>
            <h2 className="text-[20px] font-medium text-white">
              Bahan Presentasi & Tanya Jawab Dosen
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Opsi 1: Free AI README */}
            <div className="p-6 rounded-2xl bg-[#07080a] border border-[#363739] key-shadow flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-mono uppercase text-[#59d499]">
                  Termasuk di Paket (Gratis)
                </span>
                <h3 className="text-[17px] font-medium text-white">
                  Generate Bahan Presentasi (README)
                </h3>
                <p className="text-[13px] text-[#9c9c9d] leading-relaxed">
                  Menyusun pembagian tugas per anggota, penjelasan arsitektur kode, dan bocoran argumen saat dosen menguji.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleGenerateReadme}
                  disabled={isGeneratingReadme}
                  className="bg-[#e6e6e6] hover:bg-white disabled:opacity-50 text-[#454647] text-[12px] font-medium px-4 py-2 rounded-lg transition-all"
                >
                  {isGeneratingReadme ? 'Menyusun...' : 'Generate README'}
                </button>
                {readmeContent && (
                  <button
                    type="button"
                    onClick={copyReadmeToClipboard}
                    className="border border-[#363739] text-[#9c9c9d] hover:text-white text-[12px] px-3.5 py-2 rounded-lg transition-all"
                  >
                    {copiedReadme ? '✓ Disalin' : 'Salin Markdown'}
                  </button>
                )}
              </div>
            </div>

            {/* Opsi 2: Add-on Slide PPT Jadi */}
            <div className="p-6 rounded-2xl bg-[#07080a] border border-[#363739] key-shadow flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-mono uppercase text-[#ff6363]">
                  Add-on Opsional
                </span>
                <h3 className="text-[17px] font-medium text-white">
                  Slide Presentasi PPT Jadi
                </h3>
                <p className="text-[13px] text-[#9c9c9d] leading-relaxed">
                  Tidak sempat merangkum ke slide? Tim kami siapkan slide PowerPoint (.pptx/.pdf) siap pakai untuk demo kelompok.
                </p>
              </div>

              <div>
                {project.ppt_addon_paid ? (
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-[#59d499] font-mono">✓ Add-on Aktif</span>
                    {project.ppt_file_url ? (
                      <a
                        href={project.ppt_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#e6e6e6] hover:bg-white text-[#454647] text-[12px] font-medium px-4 py-2 rounded-lg transition-all"
                      >
                        Unduh Slide PPT ↗
                      </a>
                    ) : (
                      <span className="text-[12px] text-[#6a6b6c]">Admin sedang menyiapkan file</span>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPptModal(true)}
                    className="border border-[#363739] hover:border-[#ff6363] text-white text-[12px] font-medium px-4 py-2 rounded-lg transition-all"
                  >
                    Pesan Slide PPT (Rp 75.000)
                  </button>
                )}
              </div>
            </div>
          </div>

          {readmeContent && (
            <div className="p-6 rounded-2xl bg-[#040506] border border-[#1b1c1e] flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#111214] pb-2">
                <span className="text-[11px] font-mono text-[#9c9c9d]">README.md Output Preview</span>
                <button
                  onClick={copyReadmeToClipboard}
                  className="text-[11px] text-[#6a6b6c] hover:text-white"
                >
                  {copiedReadme ? '✓ Disalin ke clipboard' : 'Salin Semua'}
                </button>
              </div>
              <pre className="text-[12px] font-mono text-[#9c9c9d] whitespace-pre-wrap leading-relaxed max-h-[360px] overflow-y-auto">
                {readmeContent}
              </pre>
            </div>
          )}
        </section>

        {/* Modal Buy PPT */}
        {showPptModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#07080a] border border-[#363739] key-shadow rounded-2xl p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h3 className="text-[18px] font-medium text-white">Pesan Slide PPT Jadi</h3>
                <button
                  onClick={() => setShowPptModal(false)}
                  className="text-[#6a6b6c] hover:text-white text-[16px]"
                >
                  ✕
                </button>
              </div>
              <p className="text-[14px] text-[#9c9c9d] leading-relaxed">
                Biaya add-on slide presentasi UAS: <strong className="text-white font-mono">Rp 75.000</strong>. File PPTX & PDF akan diunggah admin ke dashboard ini.
              </p>
              <div className="p-3.5 bg-[#040506] rounded-xl border border-[#1b1c1e] flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase text-[#6a6b6c]">QRIS Statis Pembayaran</span>
                <span className="text-[16px] text-white font-mono font-medium">Rp 75.000</span>
                <span className="text-[10px] text-[#6a6b6c] font-mono">NMID: ID102938475 (KOMIT PLATFORM)</span>
              </div>
              <div className="flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPptModal(false)}
                  className="text-[12px] text-[#6a6b6c] hover:text-white px-3 py-1.5"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleBuyPptAddon}
                  disabled={isBuyingPpt}
                  className="bg-[#e6e6e6] hover:bg-white text-[#454647] text-[12px] font-medium px-4 py-2 rounded-lg transition-all"
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
