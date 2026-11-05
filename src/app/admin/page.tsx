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
    <div className="bg-[#040506] text-white min-h-screen flex flex-col selection:bg-[#ff6363]/30">
      <Navbar />

      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 py-12 flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1b1c1e] pb-6">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-[0.05em] text-[#ff6363]">
              Operator Control Surface
            </span>
            <h1 className="text-[28px] sm:text-[34px] font-normal text-white">
              Admin & Tim Joki Komit
            </h1>
          </div>

          {/* Tab Navigation in Inset Container */}
          <div className="flex items-center gap-1.5 p-1 bg-[#07080a] rounded-lg border border-[#363739]">
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                activeTab === 'payments'
                  ? 'bg-[#1b1c1e] text-white border border-[#363739]'
                  : 'text-[#9c9c9d] hover:text-white'
              }`}
            >
              Verifikasi QRIS
            </button>
            <button
              onClick={() => setActiveTab('scheduler')}
              className={`px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                activeTab === 'scheduler'
                  ? 'bg-[#1b1c1e] text-white border border-[#363739]'
                  : 'text-[#9c9c9d] hover:text-white'
              }`}
            >
              Auto-Commit Scheduler
            </button>
            <button
              onClick={() => setActiveTab('ppt')}
              className={`px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-all ${
                activeTab === 'ppt'
                  ? 'bg-[#1b1c1e] text-white border border-[#363739]'
                  : 'text-[#9c9c9d] hover:text-white'
              }`}
            >
              Upload PPT
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-[#6a6b6c] font-mono text-[14px]">
            Memuat data internal operator...
          </div>
        ) : (
          <>
            {/* TAB 1: VERIFIKASI PEMBAYARAN */}
            {activeTab === 'payments' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[17px] font-medium text-white">
                    Antrean Pembayaran Masuk ({projects.length})
                  </h2>
                  <button
                    onClick={loadAllProjects}
                    className="text-[12px] font-mono text-[#9c9c9d] hover:text-white border border-[#363739] px-3 py-1 rounded-md bg-[#07080a]"
                  >
                    Refresh Data
                  </button>
                </div>

                <div className="border border-[#363739] rounded-2xl overflow-hidden bg-[#07080a] key-shadow">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px]">
                      <thead className="bg-[#040506] text-[#6a6b6c] text-[11px] font-mono uppercase tracking-[0.05em] border-b border-[#1b1c1e]">
                        <tr>
                          <th className="p-3.5">Tanggal & ID</th>
                          <th className="p-3.5">Pemesan</th>
                          <th className="p-3.5">Layanan</th>
                          <th className="p-3.5">Nominal</th>
                          <th className="p-3.5">Bukti</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#111214]">
                        {projects.map((p) => (
                          <tr key={p.id} className="hover:bg-[#111214]/50 transition-colors">
                            <td className="p-3.5 font-mono text-[12px] text-[#9c9c9d]">
                              <div>{new Date(p.created_at).toLocaleDateString('id-ID')}</div>
                              <div className="text-[10px] text-[#6a6b6c]">{p.id.slice(0, 8)}</div>
                            </td>
                            <td className="p-3.5">
                              <div className="font-medium text-white">{p.buyer_name}</div>
                              <div className="text-[11px] text-[#6a6b6c] font-mono">{p.buyer_whatsapp}</div>
                            </td>
                            <td className="p-3.5">
                              <div className="text-white capitalize">{p.service_type.replace('_', ' ')}</div>
                              <div className="text-[11px] text-[#6a6b6c]">{p.package_type} • {p.member_count} org</div>
                            </td>
                            <td className="p-3.5 font-mono text-white">
                              Rp {p.total_price.toLocaleString('id-ID')}
                            </td>
                            <td className="p-3.5">
                              {p.payment_proof_url ? (
                                <a
                                  href={p.payment_proof_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[12px] text-[#ff6363] hover:underline"
                                >
                                  Lihat Bukti
                                </a>
                              ) : (
                                <span className="text-[12px] text-[#6a6b6c]">Tidak ada</span>
                              )}
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-[4px] ${
                                  p.payment_status === 'paid'
                                    ? 'bg-[#59d499]/10 text-[#59d499] border border-[#59d499]/30'
                                    : p.payment_status === 'rejected'
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                                    : 'bg-[#1b1c1e] text-[#9c9c9d] border border-[#363739]'
                                }`}
                              >
                                {p.payment_status}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              {p.payment_status === 'pending' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handlePaymentStatus(p.id, 'paid')}
                                    className="bg-[#e6e6e6] hover:bg-white text-[#454647] text-[12px] font-medium px-3 py-1 rounded-md transition-all"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handlePaymentStatus(p.id, 'rejected')}
                                    className="bg-[#1b1c1e] hover:bg-red-950/40 text-red-300 text-[12px] px-3 py-1 rounded-md border border-[#363739] transition-all"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <Link
                                  href={`/project/${p.id}`}
                                  className="text-[12px] text-[#6a6b6c] hover:text-white"
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
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#07080a] border border-[#363739] key-shadow">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[12px] text-[#6a6b6c]">Pilih Proyek:</span>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="bg-white/[0.05] border border-white/10 text-white rounded-lg px-2.5 py-1.5 text-[13px] outline-none"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id} className="bg-[#07080a]">
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
                      className="flex-1 bg-white/[0.05] border border-white/10 text-white rounded-lg px-3 py-1.5 text-[12px] font-mono outline-none"
                    />
                    <button
                      onClick={handleSaveRepoUrl}
                      className="bg-[#1b1c1e] hover:bg-[#2f3031] text-white border border-[#363739] text-[12px] px-3.5 py-1.5 rounded-lg transition-all shrink-0"
                    >
                      Simpan Repo
                    </button>
                  </div>
                </div>

                {/* Form Add Commit Schedule */}
                <form
                  onSubmit={handleAddSchedule}
                  className="p-5 rounded-2xl bg-[#07080a] border border-[#363739] key-shadow flex flex-col gap-4"
                >
                  <h3 className="text-[15px] font-medium text-white">Tambah Jadwal Commit Baru</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] text-[#6a6b6c]">Anggota Pengirim</span>
                      <select
                        value={newCommitMemberId}
                        onChange={(e) => setNewCommitMemberId(e.target.value)}
                        className="bg-white/[0.05] border border-white/10 text-white rounded-lg px-2.5 py-1.5 text-[13px] outline-none"
                      >
                        {projectMembers.map((m) => (
                          <option key={m.id} value={m.id} className="bg-[#07080a]">
                            {m.name} (@{m.github_username || 'unconnected'}) {m.is_connected ? '✓' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] text-[#6a6b6c]">Pesan Commit (Atomic)</span>
                      <input
                        type="text"
                        required
                        placeholder="feat: implement transaction query controller"
                        value={newCommitMessage}
                        onChange={(e) => setNewCommitMessage(e.target.value)}
                        className="bg-white/[0.05] border border-white/10 text-white rounded-lg px-2.5 py-1.5 text-[13px] font-mono outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] text-[#6a6b6c]">Jadwal Tanggal & Jam</span>
                      <input
                        type="datetime-local"
                        required
                        value={newCommitDate}
                        onChange={(e) => setNewCommitDate(e.target.value)}
                        className="bg-white/[0.05] border border-white/10 text-white rounded-lg px-2.5 py-1.5 text-[13px] outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="self-end bg-[#e6e6e6] hover:bg-white text-[#454647] text-[12px] font-medium px-4 py-2 rounded-lg transition-all"
                  >
                    Jadwalkan Commit
                  </button>
                </form>

                {/* Schedules Table */}
                <div className="border border-[#363739] rounded-2xl overflow-hidden bg-[#07080a] key-shadow">
                  <div className="p-3.5 bg-[#040506] border-b border-[#1b1c1e] flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white">
                      Antrean Commit Proyek Terpilih ({projectSchedules.length})
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px]">
                      <thead className="bg-[#040506] text-[#6a6b6c] text-[11px] font-mono uppercase tracking-[0.05em] border-b border-[#1b1c1e]">
                        <tr>
                          <th className="p-3.5">Anggota</th>
                          <th className="p-3.5">Pesan Commit</th>
                          <th className="p-3.5">Jadwal</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Eksekusi Push</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#111214]">
                        {projectSchedules.map((s) => {
                          const member = projectMembers.find((m) => m.id === s.member_id);
                          return (
                            <tr key={s.id} className="hover:bg-[#111214]/50">
                              <td className="p-3.5">
                                <div className="text-white font-medium">{member?.name || s.member_name || 'Anggota'}</div>
                                <div className="text-[11px] text-[#6a6b6c] font-mono">
                                  @{member?.github_username || s.github_username || 'contributor'}
                                </div>
                              </td>
                              <td className="p-3.5 font-mono text-[12px] text-white">{s.commit_message}</td>
                              <td className="p-3.5 font-mono text-[11px] text-[#6a6b6c]">
                                {new Date(s.scheduled_at).toLocaleString('id-ID')}
                              </td>
                              <td className="p-3.5">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-[4px] ${
                                      s.status === 'pushed'
                                        ? 'bg-[#59d499]/10 text-[#59d499] border border-[#59d499]/30'
                                        : 'bg-[#1b1c1e] text-[#6a6b6c]'
                                    }`}
                                  >
                                    {s.status}
                                  </span>
                                  {s.commit_hash && (
                                    <span className="text-[10px] font-mono text-[#e6e6e6] bg-[#111214] px-1.5 py-0.5 rounded border border-[#1b1c1e]">
                                      #{s.commit_hash}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3.5 text-right">
                                {s.status !== 'pushed' ? (
                                  <button
                                    onClick={() => handlePushCommitNow(s)}
                                    disabled={isPushingCommit === s.id}
                                    className="bg-[#e6e6e6] hover:bg-white disabled:opacity-50 text-[#454647] text-[12px] font-medium px-3 py-1 rounded-md transition-all"
                                  >
                                    {isPushingCommit === s.id ? 'Pushing...' : 'Push Sekarang ↗'}
                                  </button>
                                ) : (
                                  <span className="text-[12px] text-[#59d499] font-mono">✓ Pushed</span>
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
                <h2 className="text-[17px] font-medium text-white">
                  Unggah Slide Presentasi untuk Add-on
                </h2>

                <div className="grid grid-cols-1 gap-3">
                  {projects
                    .filter((p) => p.ppt_addon_paid)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="p-5 rounded-2xl bg-[#07080a] border border-[#363739] key-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="text-[15px] font-medium text-white">
                            {p.buyer_name} ({p.buyer_whatsapp})
                          </div>
                          <div className="text-[12px] text-[#6a6b6c]">
                            Proyek: {p.selected_idea?.title || p.package_type} • ID: {p.id.slice(0, 8)}
                          </div>
                          {p.ppt_file_url && (
                            <a
                              href={p.ppt_file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[12px] text-[#ff6363] hover:underline mt-1"
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
                            className="flex-1 bg-white/[0.05] border border-white/10 text-white rounded-lg px-2.5 py-1.5 text-[12px] outline-none font-mono"
                          />
                          <button
                            onClick={() => handleSavePptFile(p.id)}
                            className="bg-[#e6e6e6] hover:bg-white text-[#454647] text-[12px] font-medium px-3.5 py-1.5 rounded-lg transition-all shrink-0"
                          >
                            Tautkan File
                          </button>
                        </div>
                      </div>
                    ))}

                  {projects.filter((p) => p.ppt_addon_paid).length === 0 && (
                    <div className="p-8 text-center text-[#6a6b6c] text-[13px] font-mono border border-[#1b1c1e] rounded-2xl bg-[#07080a]">
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
