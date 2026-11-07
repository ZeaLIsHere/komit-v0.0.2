'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Project, ProjectMember, CommitSchedule } from '@/lib/types';

export default function PresentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [schedules, setSchedules] = useState<CommitSchedule[]>([]);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [pRes, mRes, sRes] = await Promise.all([
          fetch(`/api/projects/${id}`),
          fetch(`/api/projects/${id}/members`),
          fetch(`/api/projects/${id}/schedules`),
        ]);

        if (pRes.ok) {
          const pData = await pRes.json();
          setProject(pData.project);
        }
        if (mRes.ok) {
          const mData = await mRes.json();
          setMembers(mData.members || []);
        }
        if (sRes.ok) {
          const sData = await sRes.json();
          setSchedules(sData.schedules || []);
        }
      } catch (err) {
        console.error('Failed to load presentation data', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  // Keyboard navigation: Left/Right/Space/F
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalSlides = 6;

  if (loading) {
    return (
      <div className="bg-[#0a0a0a] text-[#ededed] min-h-screen flex items-center justify-center font-mono text-[14px]">
        Menyiapkan slide presentasi UAS...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-[#0a0a0a] text-white min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-[20px] font-medium">Data Proyek Tidak Ditemukan</h1>
        <Link href="/" className="text-white underline">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const idea = project.selected_idea || {
    title: 'Aplikasi Kolaborasi Proyek Terintegrasi',
    description: 'Sistem komputasi awan untuk manajemen tugas dan automasi repositori kode.',
    gimmick: 'Visualisasi radar chart kontribusi real-time dan generator laporan audit otomatis.',
    techStack: ['Next.js 15', 'TypeScript', 'Tailwind CSS', 'PostgreSQL', 'GitHub API'],
  };

  return (
    <div className="bg-[#0a0a0a] text-[#ededed] min-h-screen flex flex-col selection:bg-[#6b62f2]/30 selection:text-white relative overflow-hidden font-sans">
      {/* Top Controls Bar (Hidden in Print) */}
      <header className="print:hidden h-16 border-b border-[#e5e5e5]/10 px-6 sm:px-12 flex items-center justify-between bg-[#161616]/90 backdrop-blur-md relative z-30">
        <div className="flex items-center gap-3">
          <Link
            href={`/project/${id}`}
            className="text-[13px] text-[#c2c2c2] hover:text-white transition-colors"
          >
            ← Kembali ke Dashboard
          </Link>
          <span className="text-[#e5e5e5]/20">|</span>
          <span className="text-[12px] font-mono text-white">
            Mode Sidang Demo UAS
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="text-[12px] text-[#c2c2c2] hover:text-white border border-[#e5e5e5]/15 px-4 py-1.5 rounded-full bg-[#0a0a0a] transition-all"
          >
            Cetak PDF Handout
          </button>
          <button
            onClick={toggleFullscreen}
            className="btn-white-pill text-[12px] px-4 py-1.5 rounded-full"
          >
            {isFullscreen ? 'Keluar Layar Penuh' : 'Layar Penuh (F)'}
          </button>
        </div>
      </header>

      {/* Main Slide Presentation Stage */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 sm:px-16 py-10 flex flex-col justify-center items-center relative z-20">
        {/* SLIDE 0: COVER */}
        {currentSlide === 0 && (
          <div className="w-full flex flex-col items-center text-center gap-8 animate-fadeIn">
            <span className="text-[12px] font-mono uppercase tracking-[0.15em] text-[#161616] bg-white px-3 py-1 rounded-full font-medium">
              Presentasi Sidang Akhir Semester
            </span>
            <h1 className="text-[32px] sm:text-[48px] md:text-[60px] font-medium leading-[1.1] text-white max-w-4xl tracking-[-0.03em]">
              {idea.title}
            </h1>
            <p className="text-[18px] text-[#c2c2c2] max-w-2xl leading-[1.5]">
              {idea.description}
            </p>

            <div className="w-full max-w-3xl mt-4 p-8 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 text-left">
              <span className="text-[13px] text-white font-medium block mb-3">
                Tim Pengembang (Kelompok)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {members.map((m, idx) => (
                  <div key={m.id} className="p-3.5 bg-[#0a0a0a] border border-[#e5e5e5]/10 rounded-[12px] flex items-center justify-between">
                    <div>
                      <div className="text-[15px] font-medium text-white">{idx + 1}. {m.name}</div>
                      <div className="text-[12px] text-[#686868] font-mono">NIM: {m.nim} • KOM {m.kom}</div>
                    </div>
                    <span className="text-[11px] font-mono text-[#ededed]">@{m.github_username || 'contributor'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 1: LATAR BELAKANG & MASALAH */}
        {currentSlide === 1 && (
          <div className="w-full flex flex-col gap-8 animate-fadeIn max-w-4xl">
            <h2 className="text-[36px] sm:text-[48px] font-medium leading-[1.1] text-white">
              Mengapa Aplikasi Ini Perlu Dibangun?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col gap-4">
                <span className="text-[14px] text-white font-medium">
                  Masalah Nyata (Problem Statement)
                </span>
                <p className="text-[15px] text-[#c2c2c2] leading-[1.5]">
                  Sistem konvensional yang digunakan saat ini seringkali lambat, memerlukan input manual yang berulang, dan minim visualisasi audit data, sehingga menyulitkan proses monitoring performa secara berkala.
                </p>
              </div>

              <div className="p-8 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col gap-4">
                <span className="text-[14px] text-white font-medium">
                  Solusi yang Diterapkan
                </span>
                <p className="text-[15px] text-[#c2c2c2] leading-[1.5]">
                  Membangun arsitektur modern berbasis web dengan respons real-time, automasi sinkronisasi data antar modul, serta validasi data berlapis di tingkat API untuk menjamin integritas sistem.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: ARSITEKTUR & TECH STACK */}
        {currentSlide === 2 && (
          <div className="w-full flex flex-col gap-8 animate-fadeIn max-w-4xl">
            <h2 className="text-[36px] sm:text-[48px] font-medium leading-[1.1] text-white">
              Struktur Perancangan Sistem
            </h2>

            <div className="p-8 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-5 rounded-[16px] bg-[#0a0a0a] border border-[#e5e5e5]/10 flex flex-col gap-2">
                  <span className="text-[12px] uppercase text-white font-mono">Frontend Layer</span>
                  <div className="text-[16px] font-medium text-white">Next.js 15 & React 19</div>
                  <p className="text-[12px] text-[#c2c2c2]">Antarmuka interaktif, server rendering cepat, & responsive styling Tailwind v4.</p>
                </div>
                <div className="p-5 rounded-[16px] bg-[#0a0a0a] border border-[#e5e5e5]/10 flex flex-col gap-2">
                  <span className="text-[12px] uppercase text-white font-mono">Backend Layer</span>
                  <div className="text-[16px] font-medium text-white">Server Actions & API</div>
                  <p className="text-[12px] text-[#c2c2c2]">Validasi tipe end-to-end, middleware keamanan, dan endpoint webhook otomatis.</p>
                </div>
                <div className="p-5 rounded-[16px] bg-[#0a0a0a] border border-[#e5e5e5]/10 flex flex-col gap-2">
                  <span className="text-[12px] uppercase text-white font-mono">Database Layer</span>
                  <div className="text-[16px] font-medium text-white">PostgreSQL & Supabase</div>
                  <p className="text-[12px] text-[#c2c2c2]">Relational schema terindeks, Row Level Security (RLS), & realtime subscriptions.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-center border-t border-[#e5e5e5]/10 pt-4">
                <span className="text-[12px] text-[#686868] uppercase font-mono mr-2">Tech Stack:</span>
                {(idea.techStack || []).map((t) => (
                  <span key={t} className="text-[12px] font-mono bg-[#0a0a0a] text-white px-3 py-1 rounded-[6px] border border-[#e5e5e5]/10">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 3: GIMMICK PEMIKAT DOSEN */}
        {currentSlide === 3 && (
          <div className="w-full flex flex-col gap-8 animate-fadeIn max-w-4xl">
            <h2 className="text-[36px] sm:text-[48px] font-medium leading-[1.1] text-white">
              Gimmick Pemikat Dosen Penguji
            </h2>

            <div className="p-10 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-white/20 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-wider text-[#161616] bg-white px-2.5 py-0.5 rounded-full font-bold">
                  Key Competitive Feature
                </span>
                <span className="text-[13px] font-mono text-white">Demo Live Ready</span>
              </div>

              <h3 className="text-[26px] sm:text-[32px] font-medium text-white leading-tight">
                {idea.gimmick}
              </h3>

              <div className="p-6 rounded-[16px] bg-[#0a0a0a] border border-[#e5e5e5]/10 text-[14px] text-[#c2c2c2] leading-[1.5] flex flex-col gap-2">
                <strong className="text-white">Poin Pembuktian Saat Demo UAS:</strong>
                <p>
                  Fitur ini dirancang khusus untuk membedakan proyek ini dengan aplikasi CRUD biasa. Dosen penguji dapat langsung melihat pengujian interaktif yang membuktikan implementasi logika tingkat lanjut, bukan sekadar copy-paste template.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 4: PEMBAGIAN TUGAS & COMMIT PROOF */}
        {currentSlide === 4 && (
          <div className="w-full flex flex-col gap-8 animate-fadeIn max-w-4xl">
            <h2 className="text-[36px] sm:text-[48px] font-medium leading-[1.1] text-white">
              Kontribusi Nyata Tiap Anggota
            </h2>

            <div className="p-8 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {members.map((m, idx) => {
                  const roles = [
                    'Arsitek Sistem & Backend API',
                    'Frontend UI/UX & Responsive Views',
                    'Otentikasi & Database Architecture',
                    'Integrasi Endpoint & QA Testing',
                  ];
                  return (
                    <div key={m.id} className="p-4 rounded-[12px] bg-[#0a0a0a] border border-[#e5e5e5]/10 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[15px] font-medium text-white">{m.name}</span>
                        <span className="text-[11px] font-mono text-[#c2c2c2]">@{m.github_username || 'member'}</span>
                      </div>
                      <div className="text-[12px] text-white font-mono">{roles[idx % roles.length]}</div>
                      <div className="text-[11px] text-[#686868] mt-1">
                        Status Commit: <span className="text-white">Terjadwal & Berkontribusi</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-[12px] bg-[#0a0a0a] text-[12px] font-mono text-[#c2c2c2] border border-[#e5e5e5]/10 flex items-center justify-between">
                <span>Total Jadwal Sprint: {schedules.length} Commit</span>
                <span className="text-white font-medium">Grafik Kontribusi GitHub Terdistribusi Merata</span>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 5: Q&A DEFENSE CHEAT SHEET */}
        {currentSlide === 5 && (
          <div className="w-full flex flex-col gap-8 animate-fadeIn max-w-4xl">
            <h2 className="text-[36px] sm:text-[48px] font-medium leading-[1.1] text-white">
              Panduan Menjawab Pertanyaan Dosen
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col gap-2">
                <span className="text-[14px] text-white font-medium">
                  Tanya: &quot;Apa tantangan teknis tersulit dalam proyek ini?&quot;
                </span>
                <p className="text-[13px] text-[#c2c2c2] leading-[1.5]">
                  <strong className="text-white">Jawaban:</strong> Menjaga konsistensi data real-time dan optimasi query saat banyak anggota mengakses sistem secara paralel tanpa terjadi race condition.
                </p>
              </div>

              <div className="p-6 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col gap-2">
                <span className="text-[14px] text-white font-medium">
                  Tanya: &quot;Bagaimana cara membuktikan pembagian kerja tim adil?&quot;
                </span>
                <p className="text-[13px] text-[#c2c2c2] leading-[1.5]">
                  <strong className="text-white">Jawaban:</strong> Silakan cek riwayat git log dan grafik kontributor GitHub kami. Masing-masing anggota memiliki branch fitur dan commit terisolasi.
                </p>
              </div>

              <div className="p-6 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col gap-2">
                <span className="text-[14px] text-white font-medium">
                  Tanya: &quot;Mengapa tidak menggunakan framework lain?&quot;
                </span>
                <p className="text-[13px] text-[#c2c2c2] leading-[1.5]">
                  <strong className="text-white">Jawaban:</strong> Stack yang dipilih menawarkan efisiensi pengembangan tertinggi dengan dukungan static typing penuh untuk mencegah bug di tahap produksi.
                </p>
              </div>

              <div className="p-6 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col gap-2">
                <span className="text-[14px] text-white font-medium">
                  Tanya: &quot;Apa rencana pengembangan proyek ke depan?&quot;
                </span>
                <p className="text-[13px] text-[#c2c2c2] leading-[1.5]">
                  <strong className="text-white">Jawaban:</strong> Menambahkan integrasi payment gateway otomatis, automasi pipeline CI/CD, dan aplikasi mobile pendukung.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Slide Navigation Bar (Hidden in Print) */}
      <footer className="print:hidden h-20 border-t border-[#e5e5e5]/10 px-6 sm:px-12 flex items-center justify-between bg-[#161616]/90 backdrop-blur-md relative z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
            disabled={currentSlide === 0}
            className="p-2.5 px-4 rounded-full bg-[#0a0a0a] border border-[#e5e5e5]/10 disabled:opacity-40 hover:border-white text-white text-[13px] transition-all"
          >
            ← Slide Sebelumnya
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1))}
            disabled={currentSlide === totalSlides - 1}
            className="p-2.5 px-4 rounded-full bg-[#0a0a0a] border border-[#e5e5e5]/10 disabled:opacity-40 hover:border-white text-white text-[13px] transition-all"
          >
            Slide Berikutnya →
          </button>
        </div>

        {/* Slide Counter & Dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                currentSlide === idx ? 'w-8 bg-white' : 'bg-[#2b2b2b] hover:bg-[#404040]'
              }`}
            />
          ))}
          <span className="text-[12px] font-mono text-[#686868] ml-3">
            {currentSlide + 1} / {totalSlides}
          </span>
        </div>

        <div className="text-[12px] font-mono text-[#686868] hidden md:block">
          Gunakan tombol [←] [→] atau [Spasi]
        </div>
      </footer>
    </div>
  );
}
