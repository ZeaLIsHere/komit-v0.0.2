'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Project } from '@/lib/types';

export default function AdminPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  useEffect(() => {
    loadAllProjects();
  }, []);

  const loadAllProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data.projects || []);
    } catch (err) {
      console.error('Failed to load projects', err);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="text-[#ededed] min-h-screen flex flex-col selection:bg-[#6b62f2]/30 selection:text-white font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 sm:px-12 pt-28 sm:pt-32 pb-24 flex flex-col gap-9">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.12em] text-white/70 font-mono">
              Panel Operator &amp; Joki
            </span>
            <h1 className="text-[32px] sm:text-[38px] font-medium leading-[1.1] text-white tracking-[-0.035em]">
              Admin Workspace
            </h1>
          </div>
        </div>

        {/* 4 Frosted Glass Summary Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-[20px] bg-white/[0.03] backdrop-blur-md border border-white/[0.08] hover:border-white/15 transition-all flex flex-col justify-between gap-3">
            <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-white/75 font-medium">
              Total Pesanan
            </span>
            <div>
              <div className="text-[28px] sm:text-[32px] font-medium text-white font-mono tracking-tight tabular-nums">
                {stats.total}
              </div>
              <span className="text-[12px] text-white/80">Semua order masuk</span>
            </div>
          </div>

          <div className="p-5 rounded-[20px] bg-white/[0.03] backdrop-blur-md border border-white/[0.08] hover:border-white/15 transition-all flex flex-col justify-between gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-white/75 font-medium">
                Menunggu Verifikasi
              </span>
              {stats.pendingPayment > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#ffb829] animate-pulse" />
              )}
            </div>
            <div>
              <div
                className={`text-[28px] sm:text-[32px] font-medium font-mono tracking-tight tabular-nums ${
                  stats.pendingPayment > 0 ? 'text-[#ffb829]' : 'text-white'
                }`}
              >
                {stats.pendingPayment}
              </div>
              <span className="text-[12px] text-white/80">
                {stats.pendingPayment > 0 ? 'Perlu tindakan review' : 'Semua sudah diverifikasi'}
              </span>
            </div>
          </div>

          <div className="p-5 rounded-[20px] bg-white/[0.03] backdrop-blur-md border border-white/[0.08] hover:border-white/15 transition-all flex flex-col justify-between gap-3">
            <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-white/75 font-medium">
              Sedang Berjalan
            </span>
            <div>
              <div className="text-[28px] sm:text-[32px] font-medium text-white font-mono tracking-tight tabular-nums">
                {stats.inProgress}
              </div>
              <span className="text-[12px] text-white/80">Dalam tahap joki aktif</span>
            </div>
          </div>

          <div className="p-5 rounded-[20px] bg-white/[0.03] backdrop-blur-md border border-white/[0.08] hover:border-white/15 transition-all flex flex-col justify-between gap-3">
            <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-white/75 font-medium">
              Kredensial GitHub Siap
            </span>
            <div>
              <div className="text-[28px] sm:text-[32px] font-medium text-[#59d499] font-mono tracking-tight tabular-nums">
                {stats.withCredentials}
              </div>
              <span className="text-[12px] text-white/80">Akun klien siap disetup</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-white/70 font-mono text-[13px] rounded-[24px] border border-white/[0.08] bg-white/[0.02]">
            Memuat data internal operator...
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <h2 className="text-[18px] font-medium text-white tracking-tight">
                  Antrean Pembayaran
                </h2>
                <span className="text-[12px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 border border-white/20 text-white font-medium">
                  {projects.length}
                </span>
              </div>

              <button
                onClick={loadAllProjects}
                className="text-[12px] text-white/85 hover:text-white border border-white/20 hover:border-white/35 px-3.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] transition-all font-mono inline-flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 text-white/75" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>

            <div className="border border-white/10 rounded-[24px] overflow-hidden bg-white/[0.05] backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-white/[0.08] text-white text-[11px] uppercase tracking-[0.1em] font-mono border-b border-white/15">
                    <tr>
                      <th className="py-4 px-5 font-semibold text-white whitespace-nowrap">Tanggal &amp; ID</th>
                      <th className="py-4 px-5 font-semibold text-white whitespace-nowrap">Pemesan</th>
                      <th className="py-4 px-5 font-semibold text-white whitespace-nowrap">Layanan &amp; Paket</th>
                      <th className="py-4 px-5 font-semibold text-white whitespace-nowrap">Nominal</th>
                      <th className="py-4 px-5 font-semibold text-white whitespace-nowrap">Bukti QRIS</th>
                      <th className="py-4 px-5 font-semibold text-white whitespace-nowrap">Akun GitHub Klien</th>
                      <th className="py-4 px-5 font-semibold text-white whitespace-nowrap">Status</th>
                      <th className="py-4 px-5 text-right font-semibold text-white whitespace-nowrap min-w-[130px]">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {projects.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.025] transition-colors duration-150">
                        <td className="py-4 px-5 font-mono text-[12px]">
                          <div className="text-white font-medium">
                            {new Date(p.created_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                          <span className="text-[10px] text-white/90 px-1.5 py-0.5 rounded bg-white/10 border border-white/20 w-fit inline-block mt-0.5 font-mono">
                            #{p.id.slice(0, 8)}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center font-mono text-[12px] font-medium text-white shrink-0">
                              {p.buyer_name ? p.buyer_name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-white text-[13px] leading-snug">
                                {p.buyer_name}
                              </span>
                              <span className="text-[11px] text-white/80 font-mono leading-snug">
                                {p.buyer_whatsapp}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-white capitalize font-medium text-[13px]">
                              {p.service_type.replace('_', ' ')}
                            </span>
                            {p.doc_topic ? (
                              <span className="text-[11px] text-white font-medium truncate max-w-[180px]" title={p.doc_topic}>
                                Topik: {p.doc_topic}
                              </span>
                            ) : (
                              <span className="text-[11px] text-white/80 font-mono">
                                Paket {p.package_type} • {p.member_count} org
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-5 font-mono text-white font-semibold tabular-nums text-[13px]">
                          Rp {p.total_price.toLocaleString('id-ID')}
                        </td>
                        <td className="py-4 px-5 whitespace-nowrap">
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
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/35 text-[11px] font-mono text-white transition-all cursor-pointer font-medium whitespace-nowrap"
                            >
                              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>Bukti Bayar</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-white/50 font-mono">Tidak ada</span>
                          )}
                        </td>
                        <td className="py-4 px-5 font-mono text-[12px]">
                          {p.github_email ? (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-[#59d499]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-white truncate max-w-[140px]" title={p.github_email}>
                                  {p.github_email}
                                </span>
                              </div>
                              <span className="text-white/75 text-[10px] pl-4.5">
                                PW: {p.github_password ? '••••••••' : '-'}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-white/75 px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/15">
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
                        <td className="py-4 px-5 text-right whitespace-nowrap">
                          {p.payment_status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handlePaymentStatus(p.id, 'paid')}
                                className="btn-white-pill text-[11px] px-3.5 py-1.5 rounded-full font-medium whitespace-nowrap cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handlePaymentStatus(p.id, 'rejected')}
                                className="bg-transparent hover:bg-red-500/10 text-red-400 text-[11px] px-3 py-1.5 rounded-full border border-red-500/25 transition-all whitespace-nowrap cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <Link
                              href={`/admin/project/${p.id}`}
                              className="inline-flex items-center justify-center text-[12px] font-sans font-medium text-white hover:text-white px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/35 transition-all whitespace-nowrap"
                            >
                              <span>Kelola Proyek</span>
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
                    Bukti Transfer
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
                  aria-label="Tutup"
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
                  className="text-[12px] font-mono text-white/80 hover:text-white inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>Buka Gambar Asli</span>
                  <svg className="w-3.5 h-3.5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
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
