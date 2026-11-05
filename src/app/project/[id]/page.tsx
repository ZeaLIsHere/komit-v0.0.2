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
      <div className="bg-[#000000] text-[#ffffff] min-h-screen flex items-center justify-center font-extralight text-[16px]">
        Memuat dashboard proyek...
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

  const allConnected = members.length > 0 && members.every((m) => m.is_connected);

  return (
    <div className="bg-[#000000] text-[#ffffff] min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1120px] w-full mx-auto px-6 py-12 flex flex-col gap-12">
        {/* Top Header / Project Overview */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="text-[12px] uppercase tracking-[0.15em] text-[#8052ff] px-2.5 py-0.5 rounded-full border border-[#8052ff]/30">
                {project.package_type.toUpperCase()} • {project.service_type}
              </span>
              <span className="text-[12px] text-[#9a9a9a] font-mono tabular-nums">
                ID: {project.id.slice(0, 8)}
              </span>
            </div>
            <h1 className="text-[32px] md:text-[44px] font-normal tracking-[-0.04em] text-white">
              {project.selected_idea?.title || 'Proyek Kelompok Sedang Dikerjakan'}
            </h1>
            <p className="text-[15px] text-[#9a9a9a] font-extralight max-w-2xl leading-relaxed">
              {project.selected_idea?.description || 'Data proyek dan persiapan commit sedang berlangsung.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/project/${id}/setup`}
              className="text-[13px] border border-white/20 hover:border-white/40 text-white px-5 py-2.5 rounded-full transition-all"
            >
              Ubah Setup / Anggota
            </Link>
            {project.github_repo_url ? (
              <a
                href={project.github_repo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] bg-white text-black hover:bg-neutral-200 px-5 py-2.5 rounded-full transition-all font-normal"
              >
                Buka GitHub Repo ↗
              </a>
            ) : (
              <span className="text-[13px] text-[#9a9a9a] px-4 py-2 bg-white/5 rounded-full border border-white/5">
                Repo Sedang Dibuat
              </span>
            )}
          </div>
        </div>

        {/* Gimmick Banner */}
        {project.selected_idea?.gimmick && (
          <div className="p-6 rounded-2xl border border-[#ffb829]/30 bg-[#ffb829]/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#ffb829] font-medium block mb-1">
                Gimmick Pemikat Dosen
              </span>
              <p className="text-[15px] text-white font-extralight">
                {project.selected_idea.gimmick}
              </p>
            </div>
            <div className="text-[12px] text-[#bdbdbd] shrink-0 font-mono">
              Demo UAS Ready
            </div>
          </div>
        )}

        {/* Members Status Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-normal tracking-[-0.02em] text-white">
              Status Akun GitHub Anggota ({members.length} Orang)
            </h2>
            {!allConnected && (
              <Link
                href={`/join/${id}`}
                className="text-[12px] text-[#ffb829] hover:underline"
              >
                Undang / Connect Anggota Lain
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {members.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl border border-white/10 bg-[#060606] flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="text-[15px] font-normal text-white">{m.name}</div>
                  <div className="text-[12px] text-[#9a9a9a] font-mono tabular-nums">
                    NIM: {m.nim} • KOM {m.kom}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-2">
                  <span className="text-[12px] font-mono text-[#bdbdbd]">
                    @{m.github_username || 'unconnected'}
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      m.is_connected
                        ? 'bg-[#15846e]/20 text-[#15846e] border border-[#15846e]/40'
                        : 'bg-white/5 text-[#9a9a9a]'
                    }`}
                  >
                    {m.is_connected ? 'Connected' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Commit Schedule & History (Cicil Commit) */}
        <section className="flex flex-col gap-4 border-t border-white/10 pt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[20px] font-normal tracking-[-0.02em] text-white">
                Riwayat & Jadwal Cicil Commit GitHub
              </h2>
              <p className="text-[13px] text-[#9a9a9a] font-extralight">
                Commit didorong secara natural atas nama masing-masing anggota kelompok hingga batas UAS.
              </p>
            </div>
            <span className="text-[12px] text-[#ffb829] font-mono tabular-nums">
              {schedules.filter((s) => s.status === 'pushed').length} / {schedules.length} Selesai
            </span>
          </div>

          <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#060606]">
            {schedules.length === 0 ? (
              <div className="p-8 text-center text-[#9a9a9a] text-[14px] font-extralight">
                Belum ada antrean jadwal commit. Tim joki akan segera menambahkan jadwal sprint.
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {schedules.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[14px]"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono text-[#8052ff] uppercase">
                          @{s.github_username || 'member'}
                        </span>
                        <span className="text-[11px] text-[#9a9a9a] font-mono tabular-nums">
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
                        <span className="text-[11px] font-mono text-[#ffb829] bg-white/5 px-2 py-0.5 rounded border border-white/10 tabular-nums">
                          #{s.commit_hash}
                        </span>
                      )}
                      <span
                        className={`text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          s.status === 'pushed'
                            ? 'bg-[#15846e]/20 text-[#15846e] border border-[#15846e]/40'
                            : 'bg-white/5 text-[#9a9a9a]'
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

        {/* UAS Presentation Materials Section (Free README vs Addon PPT) */}
        <section className="flex flex-col gap-6 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-1">
            <span className="text-[12px] uppercase tracking-[0.2em] text-[#ffb829]">
              Persiapan Demo & Sidang UAS
            </span>
            <h2 className="text-[24px] font-normal tracking-[-0.02em] text-white">
              Bahan Presentasi & Panduan Tanya Jawab Dosen
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Opsi 1: Free AI README */}
            <div className="p-6 rounded-2xl border border-white/10 bg-[#060606] flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-wider text-[#15846e]">
                  Termasuk di Paket (Gratis)
                </span>
                <h3 className="text-[18px] font-normal text-white">
                  Generate Panduan Presentasi (README)
                </h3>
                <p className="text-[13px] text-[#9a9a9a] font-extralight leading-relaxed">
                  Menyusun pembagian tugas per anggota, penjelasan arsitektur kode, dan bocoran contekan jawaban saat dosen menguji.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleGenerateReadme}
                  disabled={isGeneratingReadme}
                  className="bg-[#8052ff] hover:bg-[#7042ef] disabled:opacity-50 text-white text-[12px] font-normal uppercase tracking-wider px-5 py-2.5 rounded-full transition-all"
                >
                  {isGeneratingReadme ? 'Menyusun...' : 'Generate README'}
                </button>
                {readmeContent && (
                  <button
                    type="button"
                    onClick={copyReadmeToClipboard}
                    className="border border-white/20 hover:border-white/40 text-white text-[12px] px-4 py-2.5 rounded-full transition-all"
                  >
                    {copiedReadme ? '✓ Disalin' : 'Salin Markdown'}
                  </button>
                )}
              </div>
            </div>

            {/* Opsi 2: Add-on Slide PPT Jadi */}
            <div className="p-6 rounded-2xl border border-white/10 bg-[#060606] flex flex-col justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[11px] uppercase tracking-wider text-[#ffb829]">
                  Add-on Opsional
                </span>
                <h3 className="text-[18px] font-normal text-white">
                  Slide Presentasi PPT Jadi
                </h3>
                <p className="text-[13px] text-[#9a9a9a] font-extralight leading-relaxed">
                  Tidak sempat merangkum README ke slide? Dapatkan slide presentasi PowerPoint (.pptx/.pdf) siap pakai untuk kelompok Anda.
                </p>
              </div>

              <div>
                {project.ppt_addon_paid ? (
                  <div className="flex items-center gap-3">
                    <span className="text-[12px] text-[#15846e] font-mono">✓ Add-on Aktif</span>
                    {project.ppt_file_url ? (
                      <a
                        href={project.ppt_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white text-black hover:bg-neutral-200 text-[12px] font-normal px-5 py-2.5 rounded-full transition-all"
                      >
                        Unduh Slide PPT ↗
                      </a>
                    ) : (
                      <span className="text-[12px] text-[#9a9a9a]">Admin sedang menyiapkan file PPT</span>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPptModal(true)}
                    className="border border-[#ffb829]/40 hover:border-[#ffb829] text-[#ffb829] text-[12px] font-normal uppercase tracking-wider px-5 py-2.5 rounded-full transition-all"
                  >
                    Beli Add-on PPT (Rp 75.000)
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Generated README Display */}
          {readmeContent && (
            <div className="p-6 rounded-2xl border border-white/10 bg-[#030303] flex flex-col gap-4 mt-2">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-[12px] font-mono text-[#8052ff]">README.md Preview</span>
                <button
                  onClick={copyReadmeToClipboard}
                  className="text-[12px] text-[#9a9a9a] hover:text-white"
                >
                  {copiedReadme ? '✓ Disalin ke clipboard' : 'Salin Semua'}
                </button>
              </div>
              <pre className="text-[13px] font-mono text-[#bdbdbd] whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                {readmeContent}
              </pre>
            </div>
          )}
        </section>

        {/* Modal Buy PPT */}
        {showPptModal && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-[#0a0a0a] border border-white/15 rounded-3xl p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[20px] font-normal text-white">Pesan Slide PPT Jadi</h3>
                <button
                  onClick={() => setShowPptModal(false)}
                  className="text-white/60 hover:text-white text-[18px]"
                >
                  ✕
                </button>
              </div>
              <p className="text-[14px] text-[#9a9a9a] font-extralight leading-relaxed">
                Biaya add-on slide presentasi UAS: <strong className="text-[#ffb829] font-mono">Rp 75.000</strong>. File PPTX & PDF akan diunggah admin ke dashboard ini dalam 1-2 hari kerja.
              </p>
              <div className="p-4 bg-black rounded-xl border border-white/10 flex flex-col items-center gap-2">
                <span className="text-[11px] uppercase text-[#9a9a9a]">QRIS Statis Pembayaran</span>
                <span className="text-[18px] text-[#ffb829] font-mono">Rp 75.000</span>
                <span className="text-[11px] text-[#9a9a9a]">NMID: ID102938475 (KOMIT PLATFORM)</span>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPptModal(false)}
                  className="text-[13px] text-[#9a9a9a] hover:text-white px-4 py-2"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleBuyPptAddon}
                  disabled={isBuyingPpt}
                  className="bg-[#8052ff] hover:bg-[#7042ef] text-white text-[13px] font-normal uppercase tracking-wider px-5 py-2.5 rounded-full transition-all"
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
