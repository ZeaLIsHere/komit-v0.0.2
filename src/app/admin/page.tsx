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
  const [isRunningCron, setIsRunningCron] = useState<boolean>(false);

  // Trigger batch cron auto-push
  const handleRunCronAutoPush = async () => {
    setIsRunningCron(true);
    try {
      const res = await fetch('/api/cron/push-commits?force=true', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(`Auto-Push selesai! ${data.totalPushed} commit berhasil didorong ke antrean.`);
        if (selectedProjectId) {
          const sRes = await fetch(`/api/projects/${selectedProjectId}/schedules`);
          const sData = await sRes.json();
          setProjectSchedules(sData.schedules || []);
        }
      }
    } catch {
      alert('Gagal menjalankan auto-push');
    } finally {
      setIsRunningCron(false);
    }
  };

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

  const handleSavePptFile = async (projectId: string) => {
    const fileUrl = pptFileUrlInput[projectId];
    if (!fileUrl) {
      alert('Masukkan URL file PPT');
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
    <div className="bg-[#012624] text-[#bbc7c6] min-h-screen flex flex-col selection:bg-[#00827c] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 sm:px-12 py-16 flex flex-col gap-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#003734] pb-6">
          <div>
            <h1 className="text-[32px] sm:text-[40px] font-medium leading-[1.0] text-white tracking-[-0.03em]">
              Admin &amp; Tim Joki Komit
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Tab Navigation in Deep Surface */}
            <div className="flex items-center gap-2 p-1.5 bg-[#011d1c] rounded-[6px] border border-[#003734]">
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-4 py-2 rounded-[4px] text-[12px] uppercase tracking-[0.08em] font-medium transition-all ${
                activeTab === 'payments'
                  ? 'bg-[#012624] text-white border border-[#cbfffc]'
                  : 'text-[#bbc7c6] hover:text-white'
              }`}
            >
              Verifikasi QRIS
            </button>
            <button
              onClick={() => setActiveTab('scheduler')}
              className={`px-4 py-2 rounded-[4px] text-[12px] uppercase tracking-[0.08em] font-medium transition-all ${
                activeTab === 'scheduler'
                  ? 'bg-[#012624] text-white border border-[#cbfffc]'
                  : 'text-[#bbc7c6] hover:text-white'
              }`}
            >
              Auto-Commit Scheduler
            </button>
            <button
              onClick={() => setActiveTab('ppt')}
              className={`px-4 py-2 rounded-[4px] text-[12px] uppercase tracking-[0.08em] font-medium transition-all ${
                activeTab === 'ppt'
                  ? 'bg-[#012624] text-white border border-[#cbfffc]'
                  : 'text-[#bbc7c6] hover:text-white'
              }`}
            >
              Upload PPT
            </button>
          </div>

            <button
              onClick={async () => {
                await fetch('/api/admin/logout', { method: 'POST' });
                window.location.href = '/admin/login';
              }}
              className="text-[12px] uppercase tracking-[0.08em] text-[#bbc7c6] hover:text-white border border-[#003734] px-3 py-2 rounded-[6px] bg-[#011d1c] transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-[#bbc7c6] font-mono text-[14px]">
            Memuat data internal operator...
          </div>
        ) : (
          <>
            {/* TAB 1: VERIFIKASI PEMBAYARAN */}
            {activeTab === 'payments' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[20px] font-medium text-white tracking-tight">
                    Antrean Pembayaran Masuk ({projects.length})
                  </h2>
                  <button
                    onClick={loadAllProjects}
                    className="text-[12px] uppercase tracking-[0.08em] text-[#bbc7c6] hover:text-white border border-[#003734] px-4 py-1.5 rounded-[6px] bg-[#011d1c]"
                  >
                    Refresh Data
                  </button>
                </div>

                <div className="border border-[#003734] rounded-[16px] overflow-hidden bg-[#003734]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[14px]">
                      <thead className="bg-[#011d1c] text-[#edfffe] text-[11px] uppercase tracking-[0.12em] border-b border-[#012624]">
                        <tr>
                          <th className="p-4">Tanggal & ID</th>
                          <th className="p-4">Pemesan</th>
                          <th className="p-4">Layanan</th>
                          <th className="p-4">Nominal</th>
                          <th className="p-4">Bukti</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#012624]">
                        {projects.map((p) => (
                          <tr key={p.id} className="hover:bg-[#012624]/60 transition-colors">
                            <td className="p-4 font-mono text-[12px] text-[#bbc7c6]">
                              <div>{new Date(p.created_at).toLocaleDateString('id-ID')}</div>
                              <div className="text-[10px] text-[#707777]">{p.id.slice(0, 8)}</div>
                            </td>
                            <td className="p-4">
                              <div className="font-medium text-white">{p.buyer_name}</div>
                              <div className="text-[12px] text-[#bbc7c6] font-mono">{p.buyer_whatsapp}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-white capitalize">{p.service_type.replace('_', ' ')}</div>
                              <div className="text-[12px] text-[#bbc7c6]">{p.package_type} • {p.member_count} org</div>
                            </td>
                            <td className="p-4 font-mono text-[#fde9ff] font-medium">
                              Rp {p.total_price.toLocaleString('id-ID')}
                            </td>
                            <td className="p-4">
                              {p.payment_proof_url ? (
                                <a
                                  href={p.payment_proof_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[12px] text-[#cbfffc] hover:underline"
                                >
                                  Lihat Bukti
                                </a>
                              ) : (
                                <span className="text-[12px] text-[#707777]">Tidak ada</span>
                              )}
                            </td>
                            <td className="p-4">
                              <span
                                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-[4px] ${
                                  p.payment_status === 'paid'
                                    ? 'bg-[#cbfffc] text-[#012624] font-medium'
                                    : p.payment_status === 'rejected'
                                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                    : 'bg-[#011d1c] text-[#bbc7c6]'
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
                                    className="btn-aurora text-[11px] px-3.5 py-1.5 rounded-[4px]"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handlePaymentStatus(p.id, 'rejected')}
                                    className="bg-[#011d1c] hover:bg-red-950/40 text-red-300 text-[11px] px-3.5 py-1.5 rounded-[4px] border border-[#003734] transition-all"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <Link
                                  href={`/project/${p.id}`}
                                  className="text-[12px] text-[#cbfffc] hover:underline"
                                >
                                  Dashboard →
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
              <div className="flex flex-col gap-6">
                {/* Project Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[16px] bg-[#003734]">
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] text-[#edfffe]">Pilih Proyek:</span>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="bg-[#011d1c] border border-[#003734] text-white rounded-[6px] px-3 py-2 text-[14px] outline-none"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id} className="bg-[#011d1c]">
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
                      className="flex-1 bg-[#011d1c] border border-[#003734] text-white rounded-[6px] px-3 py-2 text-[13px] font-mono outline-none"
                    />
                    <button
                      onClick={handleSaveRepoUrl}
                      className="bg-[#012624] hover:bg-[#011d1c] text-white border border-[#003734] text-[12px] px-4 py-2 rounded-[6px] transition-all shrink-0"
                    >
                      Simpan Repo
                    </button>
                  </div>
                </div>

                {/* Form Add Commit Schedule */}
                <form
                  onSubmit={handleAddSchedule}
                  className="p-8 rounded-[16px] bg-[#003734] flex flex-col gap-4"
                >
                  <h3 className="text-[17px] font-medium text-white">Tambah Jadwal Commit Baru</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] text-[#edfffe]">Anggota Pengirim</span>
                      <select
                        value={newCommitMemberId}
                        onChange={(e) => setNewCommitMemberId(e.target.value)}
                        className="bg-[#011d1c] border border-[#003734] text-white rounded-[6px] px-3 py-2 text-[13px] outline-none"
                      >
                        {projectMembers.map((m) => (
                          <option key={m.id} value={m.id} className="bg-[#011d1c]">
                            {m.name} (@{m.github_username || 'unconnected'}) {m.is_connected ? '✓' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] text-[#edfffe]">Pesan Commit (Atomic)</span>
                      <input
                        type="text"
                        required
                        placeholder="feat: implement transaction query controller"
                        value={newCommitMessage}
                        onChange={(e) => setNewCommitMessage(e.target.value)}
                        className="bg-[#011d1c] border border-[#003734] text-white rounded-[6px] px-3 py-2 text-[13px] font-mono outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] text-[#edfffe]">Jadwal Tanggal & Jam</span>
                      <input
                        type="datetime-local"
                        required
                        value={newCommitDate}
                        onChange={(e) => setNewCommitDate(e.target.value)}
                        className="bg-[#011d1c] border border-[#003734] text-white rounded-[6px] px-3 py-2 text-[13px] outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="self-end btn-aurora text-[12px] px-6 py-2.5 rounded-[6px] transition-all"
                  >
                    Jadwalkan Commit ↗
                  </button>
                </form>

                {/* Schedules Table */}
                <div className="border border-[#003734] rounded-[16px] overflow-hidden bg-[#003734]">
                  <div className="p-4 bg-[#011d1c] border-b border-[#012624] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[14px] font-medium text-white">
                      Antrean Commit Proyek Terpilih ({projectSchedules.length})
                    </span>
                    <button
                      onClick={handleRunCronAutoPush}
                      disabled={isRunningCron}
                      className="btn-aurora text-[11px] px-3.5 py-1.5 rounded-[4px] self-start sm:self-auto"
                    >
                      {isRunningCron ? 'Mengeksekusi...' : '⚡ Jalankan Auto-Push Sekarang'}
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[14px]">
                      <thead className="bg-[#011d1c] text-[#edfffe] text-[11px] uppercase tracking-[0.12em] border-b border-[#012624]">
                        <tr>
                          <th className="p-4">Anggota</th>
                          <th className="p-4">Pesan Commit</th>
                          <th className="p-4">Jadwal</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Eksekusi Push</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#012624]">
                        {projectSchedules.map((s) => {
                          const member = projectMembers.find((m) => m.id === s.member_id);
                          return (
                            <tr key={s.id} className="hover:bg-[#012624]/60">
                              <td className="p-4">
                                <div className="text-white font-medium">{member?.name || s.member_name || 'Anggota'}</div>
                                <div className="text-[12px] text-[#bbc7c6] font-mono">
                                  @{member?.github_username || s.github_username || 'contributor'}
                                </div>
                              </td>
                              <td className="p-4 font-mono text-[13px] text-white">{s.commit_message}</td>
                              <td className="p-4 font-mono text-[12px] text-[#bbc7c6]">
                                {new Date(s.scheduled_at).toLocaleString('id-ID')}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-[4px] ${
                                      s.status === 'pushed'
                                        ? 'bg-[#cbfffc] text-[#012624] font-medium'
                                        : 'bg-[#011d1c] text-[#bbc7c6]'
                                    }`}
                                  >
                                    {s.status}
                                  </span>
                                  {s.commit_hash && (
                                    <span className="text-[11px] font-mono text-[#fde9ff] bg-[#011d1c] px-2 py-0.5 rounded-[4px]">
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
                                    className="btn-aurora text-[11px] px-4 py-1.5 rounded-[4px]"
                                  >
                                    {isPushingCommit === s.id ? 'Pushing...' : 'Push Sekarang ↗'}
                                  </button>
                                ) : (
                                  <span className="text-[12px] text-[#cbfffc] font-mono">✓ Pushed</span>
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
              <div className="flex flex-col gap-4">
                <h2 className="text-[20px] font-medium text-white tracking-tight">
                  Unggah Slide Presentasi untuk Add-on
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  {projects
                    .filter((p) => p.ppt_addon_paid)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="p-8 rounded-[16px] bg-[#003734] flex flex-col md:flex-row md:items-center justify-between gap-6"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="text-[16px] font-medium text-white">
                            {p.buyer_name} ({p.buyer_whatsapp})
                          </div>
                          <div className="text-[13px] text-[#bbc7c6]">
                            Proyek: {p.selected_idea?.title || p.package_type} • ID: {p.id.slice(0, 8)}
                          </div>
                          {p.ppt_file_url && (
                            <a
                              href={p.ppt_file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[12px] text-[#cbfffc] hover:underline mt-1"
                            >
                              File aktif: {p.ppt_file_url}
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-3 w-full md:max-w-md">
                          <input
                            type="text"
                            placeholder="URL File PPTX / PDF (Google Drive / Supabase)"
                            value={pptFileUrlInput[p.id] || ''}
                            onChange={(e) =>
                              setPptFileUrlInput({ ...pptFileUrlInput, [p.id]: e.target.value })
                            }
                            className="flex-1 bg-[#011d1c] border border-[#003734] text-white rounded-[6px] px-3 py-2 text-[13px] outline-none font-mono"
                          />
                          <button
                            onClick={() => handleSavePptFile(p.id)}
                            className="btn-aurora text-[12px] px-4 py-2 rounded-[6px] shrink-0"
                          >
                            Tautkan File ↗
                          </button>
                        </div>
                      </div>
                    ))}

                  {projects.filter((p) => p.ppt_addon_paid).length === 0 && (
                    <div className="p-8 text-center text-[#bbc7c6] text-[14px] font-mono border border-[#003734] rounded-[16px] bg-[#003734]">
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
