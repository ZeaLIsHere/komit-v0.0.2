'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Project, ProjectMember, CommitSchedule } from '@/lib/types';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'payments' | 'scheduler' | 'ppt'>('payments');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Selected project in scheduler tab
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [projectSchedules, setProjectSchedules] = useState<CommitSchedule[]>([]);
  const [repoUrlInput, setRepoUrlInput] = useState<string>('');

  // Add commit form state
  const [newCommitMemberId, setNewCommitMemberId] = useState<string>('');
  const [newCommitMessage, setNewCommitMessage] = useState<string>('');
  const [newCommitDate, setNewCommitDate] = useState<string>(
    new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16)
  );
  const [isPushingCommit, setIsPushingCommit] = useState<string | null>(null);

  // Upload PPT state
  const [pptFileUrlInput, setPptFileUrlInput] = useState<{ [projectId: string]: string }>({});

  useEffect(() => {
    loadAllProjects();
  }, []);

  const loadAllProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      const list: Project[] = data.projects || [];
      setProjects(list);
      if (list.length > 0 && !selectedProjectId) {
        setSelectedProjectId(list[0].id);
        setRepoUrlInput(list[0].github_repo_url || '');
      }
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

  // Load members and schedules when selected project changes
  useEffect(() => {
    if (!selectedProjectId) return;
    const proj = projects.find((p) => p.id === selectedProjectId);
    if (proj) {
      setRepoUrlInput(proj.github_repo_url || '');
    }

    async function loadProjectDetails() {
      try {
        const [mRes, sRes] = await Promise.all([
          fetch(`/api/projects/${selectedProjectId}/members`),
          fetch(`/api/projects/${selectedProjectId}/schedules`),
        ]);
        if (mRes.ok) {
          const mData = await mRes.json();
          setProjectMembers(mData.members || []);
          if (mData.members && mData.members.length > 0) {
            setNewCommitMemberId(mData.members[0].id);
          }
        }
        if (sRes.ok) {
          const sData = await sRes.json();
          setProjectSchedules(sData.schedules || []);
        }
      } catch (err) {
        console.error('Failed to load project details', err);
      }
    }

    loadProjectDetails();
  }, [selectedProjectId, projects]);

  // Payment Actions
  const handlePaymentStatus = async (projectId: string, newStatus: 'paid' | 'rejected') => {
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_status: newStatus,
          status: newStatus === 'paid' ? 'setup' : 'waiting_payment',
        }),
      });
      if (res.ok) {
        await loadAllProjects();
        alert(`Status pembayaran berhasil diubah menjadi ${newStatus}`);
      }
    } catch {
      alert('Gagal memperbarui status pembayaran');
    }
  };

  // Save Repo URL
  const handleSaveRepoUrl = async () => {
    if (!selectedProjectId) return;
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ github_repo_url: repoUrlInput }),
      });
      if (res.ok) {
        alert('URL Repository GitHub berhasil disimpan');
        loadAllProjects();
      }
    } catch {
      alert('Gagal menyimpan URL repository');
    }
  };

  // Add Commit Schedule
  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommitMemberId || !newCommitMessage.trim() || !newCommitDate) {
      alert('Lengkapi seluruh field commit');
      return;
    }

    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member_id: newCommitMemberId,
          commit_message: newCommitMessage,
          scheduled_at: new Date(newCommitDate).toISOString(),
        }),
      });

      if (res.ok) {
        const sRes = await fetch(`/api/projects/${selectedProjectId}/schedules`);
        const sData = await sRes.json();
        setProjectSchedules(sData.schedules || []);
        setNewCommitMessage('');
        alert('Jadwal commit berhasil ditambahkan!');
      }
    } catch {
      alert('Gagal menambahkan jadwal');
    }
  };

  // Push Commit to GitHub Now
  const handlePushCommitNow = async (schedule: CommitSchedule) => {
    setIsPushingCommit(schedule.id);
    try {
      const res = await fetch('/api/admin/commit/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduleId: schedule.id,
          projectId: selectedProjectId,
          memberId: schedule.member_id,
          commitMessage: schedule.commit_message,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Refresh schedules
        const sRes = await fetch(`/api/projects/${selectedProjectId}/schedules`);
        const sData = await sRes.json();
        setProjectSchedules(sData.schedules || []);
        alert(`Berhasil di-push! Hash: #${data.commitHash}`);
      } else {
        throw new Error(data.error || 'Gagal push commit');
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Gagal mengeksekusi push commit');
    } finally {
      setIsPushingCommit(null);
    }
  };

  // Save PPT File URL
  const handleSavePptFile = async (projectId: string) => {
    const fileUrl = pptFileUrlInput[projectId];
    if (!fileUrl) {
      alert('Masukkan link / URL file PPT');
      return;
    }

    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ppt_file_url: fileUrl }),
      });
      if (res.ok) {
        alert('File PPT berhasil ditautkan ke proyek!');
        loadAllProjects();
      }
    } catch {
      alert('Gagal menyimpan file PPT');
    }
  };

  return (
    <div className="bg-[#000000] text-[#ffffff] min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-12 flex flex-col gap-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-[12px] uppercase tracking-[0.2em] text-[#ffb829]">
              Internal Operator Panel
            </span>
            <h1 className="text-[32px] md:text-[42px] font-normal tracking-[-0.04em] text-white">
              Admin & Tim Joki Komit
            </h1>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 p-1.5 bg-[#0a0a0a] rounded-full border border-white/10">
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-5 py-2 rounded-full text-[13px] font-normal transition-all ${
                activeTab === 'payments'
                  ? 'bg-[#8052ff] text-white'
                  : 'text-[#9a9a9a] hover:text-white'
              }`}
            >
              Verifikasi QRIS
            </button>
            <button
              onClick={() => setActiveTab('scheduler')}
              className={`px-5 py-2 rounded-full text-[13px] font-normal transition-all ${
                activeTab === 'scheduler'
                  ? 'bg-[#8052ff] text-white'
                  : 'text-[#9a9a9a] hover:text-white'
              }`}
            >
              Auto-Commit Scheduler
            </button>
            <button
              onClick={() => setActiveTab('ppt')}
              className={`px-5 py-2 rounded-full text-[13px] font-normal transition-all ${
                activeTab === 'ppt'
                  ? 'bg-[#8052ff] text-white'
                  : 'text-[#9a9a9a] hover:text-white'
              }`}
            >
              Upload PPT
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-[#9a9a9a] font-extralight">
            Memuat data internal admin...
          </div>
        ) : (
          <>
            {/* TAB 1: VERIFIKASI PEMBAYARAN */}
            {activeTab === 'payments' && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-[20px] font-normal text-white">
                    Daftar Antrean Pembayaran Masuk ({projects.length})
                  </h2>
                  <button
                    onClick={loadAllProjects}
                    className="text-[12px] text-[#9a9a9a] hover:text-white border border-white/10 px-3 py-1 rounded-full"
                  >
                    Refresh Data
                  </button>
                </div>

                <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#060606]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[14px]">
                      <thead className="bg-[#0c0c0c] text-[#9a9a9a] text-[12px] uppercase tracking-wider border-b border-white/5">
                        <tr>
                          <th className="p-4">Tanggal & ID</th>
                          <th className="p-4">Pemesan</th>
                          <th className="p-4">Layanan & Paket</th>
                          <th className="p-4">Nominal</th>
                          <th className="p-4">Bukti Transfer</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-extralight">
                        {projects.map((p) => (
                          <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 font-mono text-[12px] text-[#bdbdbd]">
                              <div>{new Date(p.created_at).toLocaleDateString('id-ID')}</div>
                              <div className="text-[10px] text-[#9a9a9a]">{p.id.slice(0, 8)}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-normal text-white">{p.buyer_name}</div>
                              <div className="text-[12px] text-[#9a9a9a] font-mono">{p.buyer_whatsapp}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-white capitalize">{p.service_type.replace('_', ' ')}</div>
                              <div className="text-[12px] text-[#8052ff]">{p.package_type} • {p.member_count} org</div>
                            </td>
                            <td className="p-4 font-mono text-[#ffb829] tabular-nums">
                              Rp {p.total_price.toLocaleString('id-ID')}
                            </td>
                            <td className="p-4">
                              {p.payment_proof_url ? (
                                <a
                                  href={p.payment_proof_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[12px] text-[#8052ff] underline"
                                >
                                  Lihat Bukti
                                </a>
                              ) : (
                                <span className="text-[12px] text-[#9a9a9a]">Tidak ada</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span
                                className={`text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                  p.payment_status === 'paid'
                                    ? 'bg-[#15846e]/20 text-[#15846e] border border-[#15846e]/40'
                                    : p.payment_status === 'rejected'
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                    : 'bg-[#ffb829]/20 text-[#ffb829] border border-[#ffb829]/40'
                                }`}
                              >
                                {p.payment_status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              {p.payment_status === 'pending' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handlePaymentStatus(p.id, 'paid')}
                                    className="bg-[#15846e] hover:bg-[#126b59] text-white text-[12px] px-3 py-1.5 rounded-full transition-all"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handlePaymentStatus(p.id, 'rejected')}
                                    className="bg-red-950/40 hover:bg-red-900/60 text-red-300 text-[12px] px-3 py-1.5 rounded-full border border-red-500/30 transition-all"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <Link
                                  href={`/project/${p.id}`}
                                  className="text-[12px] text-[#9a9a9a] hover:text-white underline"
                                >
                                  Buka Dashboard
                                </Link>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: COMMIT SCHEDULER & GITHUB PUSH */}
            {activeTab === 'scheduler' && (
              <div className="flex flex-col gap-8">
                {/* Project Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#060606] border border-white/10">
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] text-[#9a9a9a]">Pilih Proyek:</span>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="bg-black border border-white/20 text-white rounded-xl px-3 py-2 text-[14px] outline-none"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.buyer_name} — {p.selected_idea?.title || p.package_type} ({p.id.slice(0, 6)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 flex-1 sm:max-w-md">
                    <input
                      type="text"
                      placeholder="https://github.com/org/repo-uas"
                      value={repoUrlInput}
                      onChange={(e) => setRepoUrlInput(e.target.value)}
                      className="flex-1 bg-black border border-white/20 text-white rounded-xl px-3 py-2 text-[13px] font-mono outline-none"
                    />
                    <button
                      onClick={handleSaveRepoUrl}
                      className="bg-white/10 hover:bg-white/20 text-white text-[12px] px-4 py-2 rounded-xl transition-all shrink-0"
                    >
                      Simpan Repo
                    </button>
                  </div>
                </div>

                {/* Form Add Commit Schedule */}
                <form
                  onSubmit={handleAddSchedule}
                  className="p-6 rounded-2xl bg-[#060606] border border-white/10 flex flex-col gap-4"
                >
                  <h3 className="text-[16px] font-normal text-white">Tambah Jadwal Commit Baru</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[12px] text-[#9a9a9a]">Pilih Anggota Pengirim Commit</span>
                      <select
                        value={newCommitMemberId}
                        onChange={(e) => setNewCommitMemberId(e.target.value)}
                        className="bg-black border border-white/15 text-white rounded-xl px-3 py-2.5 text-[14px] outline-none"
                      >
                        {projectMembers.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} (@{m.github_username || 'unconnected'}) {m.is_connected ? '✓' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[12px] text-[#9a9a9a]">Pesan Commit (Atomic Conventional)</span>
                      <input
                        type="text"
                        required
                        placeholder="feat: implement transaction query controller"
                        value={newCommitMessage}
                        onChange={(e) => setNewCommitMessage(e.target.value)}
                        className="bg-black border border-white/15 text-white rounded-xl px-3 py-2.5 text-[14px] font-mono outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[12px] text-[#9a9a9a]">Jadwal Tanggal & Jam</span>
                      <input
                        type="datetime-local"
                        required
                        value={newCommitDate}
                        onChange={(e) => setNewCommitDate(e.target.value)}
                        className="bg-black border border-white/15 text-white rounded-xl px-3 py-2 text-[14px] outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="self-end bg-[#8052ff] hover:bg-[#7042ef] text-white text-[12px] font-normal uppercase tracking-wider px-6 py-2.5 rounded-full transition-all"
                  >
                    Jadwalkan Commit
                  </button>
                </form>

                {/* Schedules Table */}
                <div className="border border-white/10 rounded-2xl overflow-hidden bg-[#060606]">
                  <div className="p-4 bg-[#0c0c0c] border-b border-white/5 flex items-center justify-between">
                    <span className="text-[14px] font-normal text-white">
                      Antrean Commit Proyek Terpilih ({projectSchedules.length})
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[14px]">
                      <thead className="bg-black text-[#9a9a9a] text-[12px] uppercase tracking-wider border-b border-white/5">
                        <tr>
                          <th className="p-4">Anggota</th>
                          <th className="p-4">Pesan Commit</th>
                          <th className="p-4">Jadwal</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Eksekusi Push</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-extralight">
                        {projectSchedules.map((s) => {
                          const member = projectMembers.find((m) => m.id === s.member_id);
                          return (
                            <tr key={s.id} className="hover:bg-white/[0.02]">
                              <td className="p-4">
                                <div className="text-white font-normal">{member?.name || s.member_name || 'Anggota'}</div>
                                <div className="text-[12px] text-[#8052ff] font-mono">
                                  @{member?.github_username || s.github_username || 'contributor'}
                                </div>
                              </td>
                              <td className="p-4 font-mono text-[13px] text-white">{s.commit_message}</td>
                              <td className="p-4 font-mono text-[12px] text-[#9a9a9a] tabular-nums">
                                {new Date(s.scheduled_at).toLocaleString('id-ID')}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                      s.status === 'pushed'
                                        ? 'bg-[#15846e]/20 text-[#15846e] border border-[#15846e]/40'
                                        : 'bg-white/5 text-[#9a9a9a]'
                                    }`}
                                  >
                                    {s.status}
                                  </span>
                                  {s.commit_hash && (
                                    <span className="text-[11px] font-mono text-[#ffb829] tabular-nums">
                                      #{s.commit_hash}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                {s.status !== 'pushed' ? (
                                  <button
                                    onClick={() => handlePushCommitNow(s)}
                                    disabled={isPushingCommit === s.id}
                                    className="bg-[#15846e] hover:bg-[#126b59] disabled:opacity-50 text-white text-[12px] px-3.5 py-1.5 rounded-full transition-all"
                                  >
                                    {isPushingCommit === s.id ? 'Pushing...' : 'Push Sekarang ↗'}
                                  </button>
                                ) : (
                                  <span className="text-[12px] text-[#15846e]">✓ Sudah Ter-push</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: UPLOAD PPT */}
            {activeTab === 'ppt' && (
              <div className="flex flex-col gap-6">
                <h2 className="text-[20px] font-normal text-white">
                  Unggah Slide Presentasi untuk Proyek yang Membeli Add-on
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  {projects
                    .filter((p) => p.ppt_addon_paid)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="p-6 rounded-2xl bg-[#060606] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="text-[16px] font-normal text-white">
                            {p.buyer_name} ({p.buyer_whatsapp})
                          </div>
                          <div className="text-[13px] text-[#9a9a9a]">
                            Proyek: {p.selected_idea?.title || p.package_type} • ID: {p.id.slice(0, 8)}
                          </div>
                          {p.ppt_file_url && (
                            <a
                              href={p.ppt_file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[12px] text-[#8052ff] underline mt-1"
                            >
                              File aktif: {p.ppt_file_url}
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-2 w-full md:max-w-md">
                          <input
                            type="text"
                            placeholder="URL File PPTX / PDF (Google Drive / Supabase)"
                            value={pptFileUrlInput[p.id] || ''}
                            onChange={(e) =>
                              setPptFileUrlInput({ ...pptFileUrlInput, [p.id]: e.target.value })
                            }
                            className="flex-1 bg-black border border-white/20 text-white rounded-xl px-3 py-2 text-[13px] outline-none"
                          />
                          <button
                            onClick={() => handleSavePptFile(p.id)}
                            className="bg-[#8052ff] hover:bg-[#7042ef] text-white text-[12px] px-4 py-2 rounded-xl transition-all shrink-0"
                          >
                            Tautkan File
                          </button>
                        </div>
                      </div>
                    ))}

                  {projects.filter((p) => p.ppt_addon_paid).length === 0 && (
                    <div className="p-8 text-center text-[#9a9a9a] text-[14px] font-extralight border border-white/5 rounded-2xl bg-[#060606]">
                      Belum ada proyek yang mengaktifkan add-on Slide PPT.
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
