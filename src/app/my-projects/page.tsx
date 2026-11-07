'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Project } from '@/lib/types';

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch('/api/customer/projects');
        if (!res.ok) {
          throw new Error('Gagal memuat daftar proyek');
        }
        const data = await res.json();
        setProjects(data.projects || []);
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const getStatusBadge = (status: Project['status'], paymentStatus: Project['payment_status']) => {
    if (paymentStatus === 'pending') {
      return (
        <span className="text-[11px] uppercase tracking-[0.08em] px-2.5 py-1 rounded-[4px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
          ⏳ Menunggu Verifikasi QRIS
        </span>
      );
    }
    if (paymentStatus === 'rejected') {
      return (
        <span className="text-[11px] uppercase tracking-[0.08em] px-2.5 py-1 rounded-[4px] bg-red-500/20 text-red-300 border border-red-500/30">
          ✕ Pembayaran Ditolak
        </span>
      );
    }
    if (status === 'setup') {
      return (
        <span className="text-[11px] uppercase tracking-[0.08em] px-2.5 py-1 rounded-[4px] bg-[#cbfffc]/20 text-[#cbfffc] border border-[#cbfffc]/30">
          🚀 Siap Setup Ide &amp; Kelompok
        </span>
      );
    }
    if (status === 'in_progress') {
      return (
        <span className="text-[11px] uppercase tracking-[0.08em] px-2.5 py-1 rounded-[4px] bg-[#15846e]/30 text-[#cbfffc] border border-[#15846e]">
          ⚡ Sedang Dikerjakan &amp; Cicil Commit
        </span>
      );
    }
    if (status === 'completed') {
      return (
        <span className="text-[11px] uppercase tracking-[0.08em] px-2.5 py-1 rounded-[4px] bg-green-500/20 text-green-300 border border-green-500/30">
          ✓ Selesai &amp; Lulus UAS
        </span>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#012624] text-[#bbc7c6] min-h-screen flex flex-col selection:bg-[#00827c] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 sm:px-12 py-16 flex flex-col gap-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#003734] pb-6">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.12em] text-[#cbfffc] font-mono">
              Portal Mahasiswa
            </span>
            <h1 className="text-[32px] sm:text-[44px] font-medium leading-[1.0] text-white tracking-[-0.03em]">
              Proyek &amp; Pesanan Saya
            </h1>
            <p className="text-[14px] text-[#bbc7c6]">
              Pantau status verifikasi, setup ide, dan progres pengerjaan commit repository kelompok Anda.
            </p>
          </div>

          <Link
            href="/order"
            className="btn-aurora text-[13px] px-6 py-3 rounded-[6px] shrink-0 self-start sm:self-auto"
          >
            + Buat Pesanan Baru
          </Link>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-[6px] border border-red-500/40 bg-red-950/30 text-red-200 text-[13px] font-mono">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="p-16 text-center text-[#bbc7c6] font-mono text-[14px]">
            Memuat daftar proyek...
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 sm:p-16 rounded-[16px] bg-[#003734] text-center flex flex-col items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-[#011d1c] border border-[#00827c] flex items-center justify-center text-[20px]">
              📁
            </div>
            <div className="flex flex-col gap-2 max-w-md">
              <h2 className="text-[20px] font-medium text-white">Belum Ada Proyek Aktif</h2>
              <p className="text-[14px] text-[#bbc7c6]">
                Anda belum memiliki pesanan joki atau tugas kelompok. Mulai pesan sekarang untuk mengamankan nilai UAS.
              </p>
            </div>
            <Link href="/order" className="btn-aurora text-[14px] px-8 py-3.5 rounded-[6px]">
              Pesan Proyek Sekarang ↗
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {projects.map((p) => (
              <div
                key={p.id}
                className="p-8 rounded-[16px] bg-[#003734] border border-transparent hover:border-[#00827c] transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex flex-col gap-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[11px] font-mono text-[#bbc7c6] uppercase tracking-[0.08em]">
                      ID: {p.id.slice(0, 8)}...
                    </span>
                    {getStatusBadge(p.status, p.payment_status)}
                  </div>

                  <h3 className="text-[22px] font-medium text-white leading-[1.2]">
                    {p.selected_idea?.title ||
                      `${p.service_type.replace('_', ' ').toUpperCase()} — Paket ${p.package_type.toUpperCase()}`}
                  </h3>

                  {p.selected_idea?.gimmick && (
                    <p className="text-[13px] text-[#cbfffc] italic">
                      &quot;{p.selected_idea.gimmick}&quot;
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-[13px] text-[#bbc7c6] pt-1">
                    <span>
                      Kuota: <strong className="text-white">{p.member_count} Orang</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Total: <strong className="text-[#fde9ff] font-mono">Rp {p.total_price.toLocaleString('id-ID')}</strong>
                    </span>
                    {p.github_repo_url && (
                      <>
                        <span>•</span>
                        <a
                          href={p.github_repo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#cbfffc] hover:underline truncate max-w-xs"
                        >
                          Repo GitHub ↗
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
                  {p.payment_status === 'paid' && p.status === 'setup' ? (
                    <Link
                      href={`/project/${p.id}/setup`}
                      className="btn-aurora text-[13px] px-6 py-3 rounded-[6px]"
                    >
                      Lanjut Setup ↗
                    </Link>
                  ) : (
                    <Link
                      href={`/project/${p.id}`}
                      className="btn-aurora text-[13px] px-6 py-3 rounded-[6px]"
                    >
                      Buka Dashboard ↗
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
