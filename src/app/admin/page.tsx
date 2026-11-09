'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
  const [adminShowPassword, setAdminShowPassword] = useState<boolean>(false);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);
  const [copiedPassword, setCopiedPassword] = useState<boolean>(false);

  // Add commit form state
  const [newCommitMemberId, setNewCommitMemberId] = useState<string>('');
  const [newCommitMessage, setNewCommitMessage] = useState<string>('');
  const [newCommitDate, setNewCommitDate] = useState<string>(
    new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16)
  );
  const [isPushingCommit, setIsPushingCommit] = useState<string | null>(null);
  const [isRunningCron, setIsRunningCron] = useState<boolean>(false);

  // Upload PPT state
  const [pptFileUrlInput, setPptFileUrlInput] = useState<{ [projectId: string]: string }>({});

  // Preview payment proof modal state
  const [previewProof, setPreviewProof] = useState<{
    url: string;
    buyerName: string;
    totalPrice: number;
    serviceType?: string;
  } | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewProof(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Summary Metrics
  const stats = useMemo(() => {
    const total = projects.length;
    const pendingPayment = projects.filter((p) => p.payment_status === 'pending').length;
    const inProgress = projects.filter((p) => p.status === 'in_progress').length;
    const withCredentials = projects.filter((p) => Boolean(p.github_email && p.github_password)).length;
    return { total, pendingPayment, inProgress, withCredentials };
  }, [projects]);

  // Trigger batch cron auto-push
  const handleRunCronAutoPush = async () => {
    setIsRunningCron(true);
    try {
      const res = await fetch('/api/cron/push-commits?force=true', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(`Auto-Push selesai: ${data.totalPushed} commit berhasil dipush.`);
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

  const handleUpdateProjectStatus = async (newStatus: Project['status']) => {
    if (!selectedProjectId) return;
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        loadAllProjects();
      }
    } catch {
      alert('Gagal mengubah status proyek');
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
        alert(`Commit berhasil di-push: #${data.commitHash}`);
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
        alert('File PPT berhasil ditautkan ke proyek');
        loadAllProjects();
      }
    } catch {
      alert('Gagal menyimpan file PPT');
    }
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="text-[#ededed] min-h-screen flex flex-col selection:bg-[#6b62f2]/30 selection:text-white font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 sm:px-12 pt-28 sm:pt-32 pb-24 flex flex-col gap-9">
        {/* Header Title & Segmented Control */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/[0.08] pb-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.12em] text-[#8e8e8e] font-mono">
              Panel Operator &amp; Joki
            </span>
            <h1 className="text-[32px] sm:text-[38px] font-medium leading-[1.1] text-[#ededed] tracking-[-0.035em]">
              Admin Workspace
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Segmented Control Pill Tabs */}
            <div className="flex items-center gap-1 p-1 bg-white/[0.04] backdrop-blur-xl rounded-full border border-white/10">
              <button
                onClick={() => setActiveTab('payments')}
                className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'payments'
                    ? 'bg-white text-[#161616] shadow-sm'
                    : 'text-[#c2c2c2] hover:text-[#ededed]'
                }`}
              >
                <span>Verifikasi QRIS</span>
                {stats.pendingPayment > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
                      activeTab === 'payments'
                        ? 'bg-[#161616] text-white'
                        : 'bg-[#ffb829] text-[#161616]'
                    }`}
                  >
                    {stats.pendingPayment}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('scheduler')}
                className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                  activeTab === 'scheduler'
                    ? 'bg-white text-[#161616] shadow-sm'
                    : 'text-[#c2c2c2] hover:text-[#ededed]'
                }`}
              >
                Auto-Commit Scheduler
              </button>
              <button
                onClick={() => setActiveTab('ppt')}
                className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                  activeTab === 'ppt'
                    ? 'bg-white text-[#161616] shadow-sm'
                    : 'text-[#c2c2c2] hover:text-[#ededed]'
                }`}
              >
                Upload PPT
              </button>
            </div>
          </div>
        </div>

        {/* 4 Frosted Glass Summary Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-[20px] bg-white/[0.03] backdrop-blur-md border border-white/[0.08] hover:border-white/15 transition-all flex flex-col justify-between gap-3">
            <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-[#686868]">
              Total Pesanan
            </span>
            <div>
              <div className="text-[28px] sm:text-[32px] font-medium text-[#ededed] font-mono tracking-tight tabular-nums">
                {stats.total}
              </div>
              <span className="text-[12px] text-[#c2c2c2]">Semua order masuk</span>
            </div>
          </div>

          <div className="p-5 rounded-[20px] bg-white/[0.03] backdrop-blur-md border border-white/[0.08] hover:border-white/15 transition-all flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-[#686868]">
                Menunggu Verifikasi
              </span>
              {stats.pendingPayment > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#ffb829] animate-pulse" />
              )}
            </div>
            <div>
              <div
                className={`text-[28px] sm:text-[32px] font-medium font-mono tracking-tight tabular-nums ${
                  stats.pendingPayment > 0 ? 'text-[#ffb829]' : 'text-[#ededed]'
                }`}
              >
                {stats.pendingPayment}
              </div>
              <span className="text-[12px] text-[#c2c2c2]">
                {stats.pendingPayment > 0 ? 'Perlu tindakan review' : 'Semua sudah diverifikasi'}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-[20px] bg-white/[0.03] backdrop-blur-md border border-white/[0.08] hover:border-white/15 transition-all flex flex-col justify-between gap-3">
            <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-[#686868]">
              Sedang Berjalan
            </span>
            <div>
              <div className="text-[28px] sm:text-[32px] font-medium text-[#ededed] font-mono tracking-tight tabular-nums">
                {stats.inProgress}
              </div>
              <span className="text-[12px] text-[#c2c2c2]">Dalam tahap joki aktif</span>
            </div>
          </div>

          <div className="p-5 rounded-[20px] bg-white/[0.03] backdrop-blur-md border border-white/[0.08] hover:border-white/15 transition-all flex flex-col justify-between gap-3">
            <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-[#686868]">
              Kredensial GitHub Siap
            </span>
            <div>
              <div className="text-[28px] sm:text-[32px] font-medium text-[#59d499] font-mono tracking-tight tabular-nums">
                {stats.withCredentials}
              </div>
              <span className="text-[12px] text-[#c2c2c2]">Akun klien siap disetup</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-[#686868] font-mono text-[13px] rounded-[24px] border border-white/[0.08] bg-white/[0.02]">
            Memuat data internal operator...
          </div>
        ) : (
          <>
            {/* TAB 1: VERIFIKASI PEMBAYARAN */}
            {activeTab === 'payments' && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-[18px] font-medium text-[#ededed] tracking-tight">
                      Antrean Pembayaran
                    </h2>
                    <span className="text-[12px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-[#c2c2c2]">
                      {projects.length}
                    </span>
                  </div>

                  <button
                    onClick={loadAllProjects}
                    className="text-[12px] text-[#c2c2c2] hover:text-[#ededed] border border-white/10 hover:border-white/25 px-3.5 py-1.5 rounded-full bg-white/[0.02] hover:bg-white/[0.06] transition-all font-mono inline-flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5 text-[#686868]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="border border-white/10 rounded-[24px] overflow-hidden bg-white/[0.05] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px]">
                      <thead className="bg-white/[0.06] text-[#8e8e8e] text-[11px] uppercase tracking-[0.1em] font-mono border-b border-white/10">
                        <tr>
                          <th className="py-4 px-5 font-normal">Tanggal &amp; ID</th>
                          <th className="py-4 px-5 font-normal">Pemesan</th>
                          <th className="py-4 px-5 font-normal">Layanan &amp; Paket</th>
                          <th className="py-4 px-5 font-normal">Nominal</th>
                          <th className="py-4 px-5 font-normal">Bukti QRIS</th>
                          <th className="py-4 px-5 font-normal">Akun GitHub Klien</th>
                          <th className="py-4 px-5 font-normal">Status</th>
                          <th className="py-4 px-5 text-right font-normal">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {projects.map((p) => (
                          <tr key={p.id} className="hover:bg-white/[0.025] transition-colors duration-150">
                            <td className="py-4 px-5 font-mono text-[12px]">
                              <div className="text-[#ededed] font-medium">
                                {new Date(p.created_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </div>
                              <span className="text-[10px] text-[#8e8e8e] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] w-fit inline-block mt-0.5">
                                #{p.id.slice(0, 8)}
                              </span>
                            </td>
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center font-mono text-[12px] font-medium text-white shrink-0">
                                  {p.buyer_name ? p.buyer_name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium text-[#ededed] text-[13px] leading-snug">
                                    {p.buyer_name}
                                  </span>
                                  <span className="text-[11px] text-[#8e8e8e] font-mono leading-snug">
                                    {p.buyer_whatsapp}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[#ededed] capitalize font-medium text-[13px]">
                                  {p.service_type.replace('_', ' ')}
                                </span>
                                {p.doc_topic ? (
                                  <span className="text-[11px] text-white/90 font-medium truncate max-w-[180px]" title={p.doc_topic}>
                                    Topik: {p.doc_topic}
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-[#8e8e8e] font-mono">
                                    Paket {p.package_type} • {p.member_count} org
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-5 font-mono text-[#ededed] font-medium tabular-nums text-[13px]">
                              Rp {p.total_price.toLocaleString('id-ID')}
                            </td>
                            <td className="py-4 px-5">
                              {p.payment_proof_url ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setPreviewProof({
                                      url: p.payment_proof_url!,
                                      buyerName: p.buyer_name,
                                      totalPrice: p.total_price,
                                      serviceType: p.service_type,
                                    })
                                  }
                                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 text-[11px] font-mono text-[#ededed] transition-all cursor-pointer"
                                >
                                  <svg className="w-3.5 h-3.5 text-[#c2c2c2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  <span>Bukti Bayar</span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-[#686868] font-mono">Tidak ada</span>
                              )}
                            </td>
                            <td className="py-4 px-5 font-mono text-[12px]">
                              {p.github_email ? (
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5 text-[#59d499]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="text-[#ededed] truncate max-w-[140px]" title={p.github_email}>
                                      {p.github_email}
                                    </span>
                                  </div>
                                  <span className="text-[#8e8e8e] text-[10px] pl-4.5">
                                    PW: {p.github_password ? '••••••••' : '-'}
                                  </span>
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#8e8e8e] px-2.5 py-0.5 rounded-full bg-white/[0.02] border border-white/[0.06]">
                                  Belum diisi
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-5">
                              {p.payment_status === 'paid' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#59d499]/15 text-[#59d499] border border-[#59d499]/30 text-[11px] font-mono uppercase tracking-wider font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#59d499]" />
                                  <span>Paid</span>
                                </span>
                              )}
                              {p.payment_status === 'pending' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffb829]/15 text-[#ffb829] border border-[#ffb829]/30 text-[11px] font-mono uppercase tracking-wider font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffb829] animate-pulse" />
                                  <span>Pending</span>
                                </span>
                              )}
                              {p.payment_status === 'rejected' && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 text-red-300 border border-red-500/30 text-[11px] font-mono uppercase tracking-wider font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                  <span>Rejected</span>
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-5 text-right">
                              {p.payment_status === 'pending' ? (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => handlePaymentStatus(p.id, 'paid')}
                                    className="btn-white-pill text-[11px] px-3.5 py-1.5 rounded-full font-medium"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handlePaymentStatus(p.id, 'rejected')}
                                    className="bg-transparent hover:bg-red-500/10 text-red-400 text-[11px] px-3 py-1.5 rounded-full border border-red-500/25 transition-all"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <Link
                                  href={`/admin/project/${p.id}`}
                                  className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#c2c2c2] hover:text-white px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 hover:border-white/25 transition-all"
                                >
                                  <span>Kelola Proyek</span>
                                  <span className="text-[10px]">↗</span>
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
                {/* Project Selector & Repo URL */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-[24px] bg-white/[0.03] backdrop-blur-xl border border-white/[0.08]">
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] uppercase tracking-wider text-[#686868] font-mono">Proyek:</span>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="bg-[#161616] border border-white/15 focus:border-white text-[#ededed] rounded-[10px] px-3.5 py-2 text-[13px] outline-none transition-colors"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id} className="bg-[#161616]">
                          {p.buyer_name} ({p.selected_idea?.title || p.package_type}) ({p.id.slice(0, 6)})
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
                      className="flex-1 bg-white/[0.04] border border-white/15 focus:border-white text-[#ededed] rounded-[10px] px-3.5 py-2 text-[13px] font-mono outline-none transition-colors"
                    />
                    <button
                      onClick={handleSaveRepoUrl}
                      className="btn-white-pill text-[12px] px-4 py-2 rounded-full shrink-0"
                    >
                      Simpan Repo
                    </button>
                  </div>
                </div>

                {/* Quick Status Control */}
                {selectedProjectId && (
                  <div className="p-5 rounded-[20px] bg-white/[0.03] border border-white/[0.08] flex flex-wrap items-center justify-between gap-4 text-[13px]">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[#686868] text-[11px] font-mono uppercase tracking-wider">Tahap Proyek:</span>
                      <span className="font-mono text-[#ededed] capitalize bg-white/[0.06] border border-white/10 px-3 py-1 rounded-[6px]">
                        {selectedProject?.status || 'waiting_payment'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateProjectStatus('in_progress')}
                        className="bg-transparent hover:bg-white/[0.06] border border-white/15 text-[#c2c2c2] hover:text-white px-3.5 py-1.5 rounded-full text-[12px] transition-colors"
                      >
                        Tandai In-Progress
                      </button>
                      <button
                        onClick={() => handleUpdateProjectStatus('completed')}
                        className="btn-white-pill text-[12px] px-4 py-1.5 rounded-full"
                      >
                        Tandai Selesai (UAS Ready)
                      </button>
                    </div>
                  </div>
                )}

                {/* GitHub Credentials from Client Card */}
                {selectedProjectId && (
                  <div className="p-6 rounded-[24px] bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
                      <div className="flex items-center gap-2.5">
                        <svg className="w-4 h-4 text-[#c2c2c2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <span className="text-[13px] font-medium text-[#ededed]">
                          Kredensial Akun GitHub Klien (Setup &amp; Pengerjaan)
                        </span>
                        {selectedProject?.github_email ? (
                          <span className="text-[11px] text-[#59d499] px-2 py-0.5 rounded-full bg-[#59d499]/10 border border-[#59d499]/25 font-mono">
                            ✓ Tersedia
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#ffb829] px-2 py-0.5 rounded-full bg-[#ffb829]/10 border border-[#ffb829]/25 font-mono">
                            Belum Diisi Klien
                          </span>
                        )}
                      </div>

                      <a
                        href="https://github.com/login"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[12px] text-[#c2c2c2] hover:text-white underline inline-flex items-center gap-1 self-start sm:self-auto font-mono"
                      >
                        <span>Buka GitHub Login</span>
                        <span>↗</span>
                      </a>
                    </div>

                    {selectedProject?.github_email ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px] font-mono">
                        <div className="p-4 rounded-[16px] bg-white/[0.02] border border-white/[0.08] flex items-center justify-between gap-3">
                          <div className="truncate">
                            <span className="text-[11px] text-[#686868] block mb-0.5">Email Akun:</span>
                            <span className="text-[#ededed] select-all font-medium">
                              {selectedProject.github_email}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              if (selectedProject.github_email) {
                                navigator.clipboard.writeText(selectedProject.github_email);
                                setCopiedEmail(true);
                                setTimeout(() => setCopiedEmail(false), 2000);
                              }
                            }}
                            className="text-[11px] text-[#c2c2c2] hover:text-white px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] shrink-0 transition-colors"
                          >
                            {copiedEmail ? 'Tersalin!' : 'Salin'}
                          </button>
                        </div>

                        <div className="p-4 rounded-[16px] bg-white/[0.02] border border-white/[0.08] flex items-center justify-between gap-3">
                          <div className="truncate">
                            <span className="text-[11px] text-[#686868] block mb-0.5">Password:</span>
                            <span className="text-[#ededed] select-all font-medium">
                              {adminShowPassword
                                ? selectedProject.github_password
                                : '••••••••••••'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => setAdminShowPassword(!adminShowPassword)}
                              className="text-[11px] text-[#c2c2c2] hover:text-white px-2.5 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] transition-colors"
                            >
                              {adminShowPassword ? 'Tutup' : 'Lihat'}
                            </button>
                            <button
                              onClick={() => {
                                if (selectedProject.github_password) {
                                  navigator.clipboard.writeText(selectedProject.github_password);
                                  setCopiedPassword(true);
                                  setTimeout(() => setCopiedPassword(false), 2000);
                                }
                              }}
                              className="text-[11px] text-[#c2c2c2] hover:text-white px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] transition-colors"
                            >
                              {copiedPassword ? 'Tersalin!' : 'Salin'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[13px] text-[#c2c2c2] leading-relaxed font-sans">
                        Klien belum mengisi email &amp; password akun GitHub. Anda dapat menghubungi pemesan via WhatsApp:{' '}
                        <strong className="text-[#ededed] font-mono">
                          {selectedProject?.buyer_whatsapp}
                        </strong>
                      </p>
                    )}
                  </div>
                )}

                {/* Form Add Commit Schedule */}
                <form
                  onSubmit={handleAddSchedule}
                  className="p-8 rounded-[24px] bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] flex flex-col gap-5"
                >
                  <h3 className="text-[16px] font-medium text-[#ededed]">Tambah Jadwal Commit Baru</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-[#686868] font-mono">
                        Anggota Pengirim
                      </label>
                      <select
                        value={newCommitMemberId}
                        onChange={(e) => setNewCommitMemberId(e.target.value)}
                        className="bg-[#161616] border border-white/15 focus:border-white text-[#ededed] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none transition-colors"
                      >
                        {projectMembers.map((m) => (
                          <option key={m.id} value={m.id} className="bg-[#161616]">
                            {m.name} (@{m.github_username || 'unconnected'}) {m.is_connected ? '✓' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-[#686868] font-mono">
                        Pesan Commit (Imperative)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="feat: implement transaction query controller"
                        value={newCommitMessage}
                        onChange={(e) => setNewCommitMessage(e.target.value)}
                        className="bg-white/[0.04] border border-white/15 focus:border-white text-[#ededed] rounded-[10px] px-3.5 py-2.5 text-[13px] font-mono outline-none transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase tracking-wider text-[#686868] font-mono">
                        Jadwal Eksekusi
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={newCommitDate}
                        onChange={(e) => setNewCommitDate(e.target.value)}
                        className="bg-white/[0.04] border border-white/15 focus:border-white text-[#ededed] rounded-[10px] px-3.5 py-2.5 text-[13px] font-mono outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="self-end btn-white-pill text-[12px] px-6 py-2.5 rounded-full transition-all"
                  >
                    Jadwalkan Commit
                  </button>
                </form>

                {/* Schedules Table */}
                <div className="border border-white/10 rounded-[24px] overflow-hidden bg-white/[0.05] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                  <div className="p-4 bg-white/[0.04] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="text-[13px] font-medium text-[#ededed] font-mono">
                      Antrean Commit Proyek Terpilih ({projectSchedules.length})
                    </span>
                    <button
                      onClick={handleRunCronAutoPush}
                      disabled={isRunningCron}
                      className="btn-white-pill text-[11px] px-4 py-1.5 rounded-full self-start sm:self-auto font-medium"
                    >
                      {isRunningCron ? 'Mengeksekusi...' : 'Jalankan Auto-Push Sekarang'}
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px]">
                      <thead className="bg-white/[0.02] text-[#8e8e8e] text-[11px] uppercase tracking-[0.1em] font-mono border-b border-white/10">
                        <tr>
                          <th className="py-4 px-5 font-normal">Anggota</th>
                          <th className="py-4 px-5 font-normal">Pesan Commit</th>
                          <th className="py-4 px-5 font-normal">Jadwal</th>
                          <th className="py-4 px-5 font-normal">Status</th>
                          <th className="py-4 px-5 text-right font-normal">Eksekusi Push</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.06]">
                        {projectSchedules.map((s) => {
                          const member = projectMembers.find((m) => m.id === s.member_id);
                          return (
                            <tr key={s.id} className="hover:bg-white/[0.025] transition-colors duration-150">
                              <td className="py-4 px-5">
                                <div className="text-[#ededed] font-medium">{member?.name || s.member_name || 'Anggota'}</div>
                                <div className="text-[12px] text-[#8e8e8e] font-mono">
                                  @{member?.github_username || s.github_username || 'contributor'}
                                </div>
                              </td>
                              <td className="py-4 px-5 font-mono text-[13px] text-[#ededed]">{s.commit_message}</td>
                              <td className="py-4 px-5 font-mono text-[12px] text-[#c2c2c2]">
                                {new Date(s.scheduled_at).toLocaleString('id-ID')}
                              </td>
                              <td className="py-4 px-5">
                                <div className="flex items-center gap-2">
                                  {s.status === 'pushed' && (
                                    <span className="bg-[#59d499]/15 text-[#59d499] border border-[#59d499]/30 text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 font-medium">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#59d499]" />
                                      <span>pushed</span>
                                    </span>
                                  )}
                                  {s.status === 'scheduled' && (
                                    <span className="bg-white/[0.04] text-[#c2c2c2] border border-white/10 text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#c2c2c2]" />
                                      <span>scheduled</span>
                                    </span>
                                  )}
                                  {s.status === 'failed' && (
                                    <span className="bg-red-500/15 text-red-300 border border-red-500/30 text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                      <span>failed</span>
                                    </span>
                                  )}
                                  {s.commit_hash && (
                                    <span className="text-[11px] font-mono text-[#ededed] bg-white/[0.06] border border-white/10 px-2 py-0.5 rounded-[6px]">
                                      #{s.commit_hash}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-5 text-right">
                                {s.status !== 'pushed' ? (
                                  <button
                                    onClick={() => handlePushCommitNow(s)}
                                    disabled={isPushingCommit === s.id}
                                    className="btn-white-pill text-[11px] px-3.5 py-1.5 rounded-full font-medium"
                                  >
                                    {isPushingCommit === s.id ? 'Pushing...' : 'Push Sekarang ↗'}
                                  </button>
                                ) : (
                                  <span className="text-[12px] text-[#59d499] font-mono font-medium">✓ Pushed</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {projectSchedules.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 px-5 text-center text-[#686868] font-mono text-[13px]">
                              Belum ada jadwal commit untuk proyek ini.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: UPLOAD PPT */}
            {activeTab === 'ppt' && (
              <div className="flex flex-col gap-4">
                <h2 className="text-[18px] font-medium text-[#ededed] tracking-tight">
                  Unggah Slide Presentasi untuk Add-on
                </h2>

                <div className="grid grid-cols-1 gap-4">
                  {projects
                    .filter((p) => p.ppt_addon_paid)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="p-8 rounded-[24px] bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] flex flex-col md:flex-row md:items-center justify-between gap-6"
                      >
                        <div className="flex flex-col gap-1">
                          <div className="text-[15px] font-medium text-[#ededed]">
                            {p.buyer_name} ({p.buyer_whatsapp})
                          </div>
                          <div className="text-[13px] text-[#686868] font-mono">
                            Proyek: {p.selected_idea?.title || p.package_type} • ID: {p.id.slice(0, 8)}
                          </div>
                          {p.ppt_file_url && (
                            <a
                              href={p.ppt_file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[12px] text-[#ededed] hover:text-white underline mt-1 font-mono inline-flex items-center gap-1"
                            >
                              <span>File aktif: {p.ppt_file_url}</span>
                              <span>↗</span>
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-3 w-full md:max-w-md">
                          <input
                            type="text"
                            placeholder="URL File PPTX / PDF (Firebase Storage / Drive)"
                            value={pptFileUrlInput[p.id] || ''}
                            onChange={(e) =>
                              setPptFileUrlInput({ ...pptFileUrlInput, [p.id]: e.target.value })
                            }
                            className="flex-1 bg-white/[0.04] border border-white/15 focus:border-white text-[#ededed] rounded-[10px] px-3.5 py-2.5 text-[13px] outline-none font-mono transition-colors"
                          />
                          <button
                            onClick={() => handleSavePptFile(p.id)}
                            className="btn-white-pill text-[12px] px-5 py-2.5 rounded-full shrink-0"
                          >
                            Tautkan File
                          </button>
                        </div>
                      </div>
                    ))}

                  {projects.filter((p) => p.ppt_addon_paid).length === 0 && (
                    <div className="p-8 text-center text-[#686868] text-[13px] font-mono border border-white/[0.08] rounded-[24px] bg-white/[0.02]">
                      Belum ada proyek yang mengaktifkan add-on Slide PPT.
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Modal Popup Bukti Transfer */}
        {previewProof && (
          <div
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setPreviewProof(null)}
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
                    {previewProof.buyerName} •{' '}
                    <span className="font-mono text-[#ededed]">
                      Rp {previewProof.totalPrice.toLocaleString('id-ID')}
                    </span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewProof(null)}
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
                  src={previewProof.url}
                  alt={`Bukti transfer ${previewProof.buyerName}`}
                  className="max-h-[60vh] max-w-full object-contain rounded-[12px]"
                />
              </div>

              {/* Footer controls */}
              <div className="flex items-center justify-between pt-2">
                <a
                  href={previewProof.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={`bukti-transfer-${previewProof.buyerName}.jpg`}
                  className="text-[12px] font-mono text-[#8e8e8e] hover:text-white inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>Buka Gambar Asli</span>
                  <span className="text-[10px]">↗</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewProof(null)}
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
