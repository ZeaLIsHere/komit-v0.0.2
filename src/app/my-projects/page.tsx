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
        <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-300 border border-yellow-500/25 inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
          <span>Menunggu Verifikasi QRIS</span>
        </span>
      );
    }
    if (paymentStatus === 'rejected') {
      return (
        <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-300 border border-red-500/25 inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <span>Pembayaran Ditolak</span>
        </span>
      );
    }
    if (status === 'setup') {
      return (
        <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[#ededed] border border-white/15 inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c2c2c2]" />
          <span>Siap Setup Ide &amp; Kelompok</span>
        </span>
      );
    }
    if (status === 'in_progress') {
      return (
        <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/[0.08] text-white border border-white/20 inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          <span>Sedang Dikerjakan &amp; Cicil Commit</span>
        </span>
      );
    }
    if (status === 'completed') {
      return (
        <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#59d499]/10 text-[#59d499] border border-[#59d499]/25 inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#59d499]" />
          <span>Selesai &amp; Siap UAS</span>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="text-[#ededed] min-h-screen flex flex-col selection:bg-[#6b62f2]/30 selection:text-white font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1100px] w-full mx-auto px-6 sm:px-12 py-16 flex flex-col gap-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-wider text-white/60 font-mono">
              Portal Mahasiswa
            </span>
            <h1 className="text-[32px] sm:text-[44px] font-medium leading-[1.1] text-white tracking-[-0.03em]">
              Proyek &amp; Pesanan Saya
            </h1>
            <p className="text-[14px] text-[#c2c2c2]">
              Pantau status verifikasi, setup ide, dan progres pengerjaan commit repository kelompok Anda.
            </p>
          </div>

          <Link
            href="/order"
            className="btn-white-pill text-[13px] px-6 py-2.5 rounded-full shrink-0 self-start sm:self-auto"
          >
            + Buat Pesanan Baru
          </Link>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-[12px] border border-red-500/40 bg-red-950/30 text-red-200 text-[13px] font-mono">
            {errorMsg}
          </div>
        )}

        {loading ? (
          <div className="p-16 text-center text-[#c2c2c2] font-mono text-[14px]">
            Memuat daftar proyek...
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 sm:p-16 rounded-[24px] bg-white/[0.04] backdrop-blur-xl border border-white/10 text-center flex flex-col items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-white/70">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <div className="flex flex-col gap-2 max-w-md">
              <h2 className="text-[20px] font-medium text-white">Belum Ada Proyek Aktif</h2>
              <p className="text-[14px] text-[#c2c2c2]">
                Anda belum memiliki pesanan joki atau tugas kelompok. Mulai pesan sekarang untuk mengamankan nilai UAS.
              </p>
            </div>
            <Link href="/order" className="btn-white-pill text-[14px] px-8 py-3.5 rounded-full">
              Pesan Proyek Sekarang ↗
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {projects.map((p) => (
              <div
                key={p.id}
                className="p-8 rounded-[24px] bg-white/[0.04] backdrop-blur-xl border border-white/10 hover:border-white/25 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex flex-col gap-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-[11px] font-mono text-[#686868] uppercase tracking-[0.08em]">
                      ID: {p.id.slice(0, 8)}...
                    </span>
                    {getStatusBadge(p.status, p.payment_status)}
                  </div>

                  <h3 className="text-[22px] font-medium text-white leading-[1.2]">
                    {p.selected_idea?.title ||
                      `${p.service_type.replace('_', ' ').toUpperCase()} (${p.package_type.toUpperCase()})`}
                  </h3>

                  {p.selected_idea?.gimmick && (
                    <p className="text-[13px] text-white/80 italic">
                      &quot;{p.selected_idea.gimmick}&quot;
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-[13px] text-[#c2c2c2] pt-1">
                    <span>
                      Kuota: <strong className="text-white">{p.member_count} Orang</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Total: <strong className="text-white font-mono">Rp {p.total_price.toLocaleString('id-ID')}</strong>
                    </span>
                    {p.github_repo_url && (
                      <>
                        <span>•</span>
                        <a
                          href={p.github_repo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-white underline truncate max-w-xs"
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
                      className="btn-white-pill text-[13px] px-6 py-2.5 rounded-full"
                    >
                      Lanjut Setup ↗
                    </Link>
                  ) : (
                    <Link
                      href={`/project/${p.id}`}
                      className="btn-white-pill text-[13px] px-6 py-2.5 rounded-full"
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
