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
      <div className="bg-[#012624] text-[#bbc7c6] min-h-screen flex items-center justify-center font-mono text-[14px]">
        Menyiapkan slide presentasi UAS...
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-[#012624] text-white min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-[20px] font-medium">Data Proyek Tidak Ditemukan</h1>
        <Link href="/" className="text-[#cbfffc] underline">
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
    <div className="bg-[#012624] text-white min-h-screen flex flex-col selection:bg-[#00827c] selection:text-white relative overflow-hidden">
      {/* Top Controls Bar (Hidden in Print) */}
      <header className="print:hidden h-16 border-b border-[#003734] px-6 sm:px-12 flex items-center justify-between bg-[#011d1c]/90 backdrop-blur-md relative z-30">
        <div className="flex items-center gap-3">
          <Link
            href={`/project/${id}`}
            className="text-[13px] text-[#bbc7c6] hover:text-white transition-colors"
          >
            ← Kembali ke Dashboard
          </Link>
          <span className="text-[#003734]">|</span>
          <span className="text-[12px] font-mono text-[#cbfffc] uppercase">
            Mode Sidang Demo UAS
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="text-[12px] uppercase tracking-wider text-[#bbc7c6] hover:text-white border border-[#003734] px-3.5 py-1.5 rounded-[6px] transition-all"
          >
            Cetak PDF Handout
          </button>
          <button
            onClick={toggleFullscreen}
            className="btn-aurora text-[12px] px-4 py-1.5 rounded-[6px] transition-all"
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
            <span className="text-[12px] font-mono uppercase tracking-[0.2em] text-[#cbfffc] bg-[#003734] px-3 py-1 rounded-[4px]">
              Presentasi Sidang Akhir Semester
            </span>
            <h1 className="text-[30px] sm:text-[48px] md:text-[60px] font-medium leading-[1.1] text-white max-w-4xl tracking-[-0.03em]">
              {idea.title}
            </h1>
            <p className="text-[18px] text-[#bbc7c6] max-w-2xl leading-[1.4]">
              {idea.description}
            </p>

            <div className="w-full max-w-3xl mt-4 p-8 rounded-[16px] bg-[#003734] border border-[#004d49] text-left">
              <span className="text-[12px] uppercase tracking-[0.12em] text-[#edfffe] font-medium block mb-3">
                Tim Pengembang (Kelompok)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {members.map((m, idx) => (
                  <div key={m.id} className="p-3 bg-[#011d1c] rounded-[6px] flex items-center justify-between">
                    <div>
                      <div className="text-[15px] font-medium text-white">{idx + 1}. {m.name}</div>
                      <div className="text-[12px] text-[#bbc7c6] font-mono">NIM: {m.nim} • KOM {m.kom}</div>
                    </div>
                    <span className="text-[11px] font-mono text-[#cbfffc]">@{m.github_username || 'contributor'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 1: LATAR BELAKANG & MASALAH */}
        {currentSlide === 1 && (
          <div className="w-full flex flex-col gap-8 animate-fadeIn max-w-4xl">
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-mono uppercase tracking-[0.15em] text-[#cbfffc]">
                01. Latar Belakang & Motivasi
              </span>
              <h2 className="text-[36px] sm:text-[48px] font-medium leading-[1.1] text-white">
                Mengapa Aplikasi Ini Perlu Dibangun?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-8 rounded-[16px] bg-[#003734] flex flex-col gap-4">
                <span className="text-[13px] uppercase tracking-wider text-[#edfffe] font-medium">
                  Masalah Nyata (Problem Statement)
                </span>
                <p className="text-[15px] text-[#bbc7c6] leading-[1.5]">
                  Sistem konvensional yang digunakan saat ini seringkali lambat, memerlukan input manual yang berulang, dan minim visualisasi audit data, sehingga menyulitkan proses monitoring performa secara berkala.
                </p>
              </div>

              <div className="p-8 rounded-[16px] bg-[#003734] flex flex-col gap-4">
                <span className="text-[13px] uppercase tracking-wider text-[#cbfffc] font-medium">
                  Solusi yang Diterapkan
                </span>
                <p className="text-[15px] text-[#bbc7c6] leading-[1.5]">
                  Membangun arsitektur modern berbasis web dengan respons real-time, automasi sinkronisasi data antar modul, serta validasi data berlapis di tingkat API untuk menjamin integritas sistem.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 2: ARSITEKTUR & TECH STACK */}
        {currentSlide === 2 && (
          <div className="w-full flex flex-col gap-8 animate-fadeIn max-w-4xl">
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-mono uppercase tracking-[0.15em] text-[#cbfffc]">
                02. Arsitektur & Teknologi
              </span>
              <h2 className="text-[36px] sm:text-[48px] font-medium leading-[1.1] text-white">
                Struktur Perancangan Sistem
              </h2>
            </div>

            <div className="p-8 rounded-[16px] bg-[#003734] flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-5 rounded-[8px] bg-[#011d1c] border border-[#004d49] flex flex-col gap-2">
                  <span className="text-[12px] uppercase text-[#cbfffc] font-mono">Frontend Layer</span>
                  <div className="text-[16px] font-medium text-white">Next.js 15 & React 19</div>
                  <p className="text-[12px] text-[#bbc7c6]">Antarmuka interaktif, server rendering cepat, & responsive styling Tailwind v4.</p>
                </div>
                <div className="p-5 rounded-[8px] bg-[#011d1c] border border-[#004d49] flex flex-col gap-2">
                  <span className="text-[12px] uppercase text-[#cbfffc] font-mono">Backend Layer</span>
                  <div className="text-[16px] font-medium text-white">Server Actions & API</div>
                  <p className="text-[12px] text-[#bbc7c6]">Validasi tipe end-to-end, middleware keamanan, dan endpoint webhook otomatis.</p>
                </div>
                <div className="p-5 rounded-[8px] bg-[#011d1c] border border-[#004d49] flex flex-col gap-2">
                  <span className="text-[12px] uppercase text-[#cbfffc] font-mono">Database Layer</span>
                  <div className="text-[16px] font-medium text-white">PostgreSQL & Supabase</div>
                  <p className="text-[12px] text-[#bbc7c6]">Relational schema terindeks, Row Level Security (RLS), & realtime subscriptions.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-center border-t border-[#012624] pt-4">
                <span className="text-[12px] text-[#bbc7c6] uppercase font-mono mr-2">Tech Stack:</span>
                {(idea.techStack || []).map((t) => (
                  <span key={t} className="text-[12px] font-mono bg-[#012624] text-[#cbfffc] px-3 py-1 rounded-[4px] border border-[#004d49]">
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
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-mono uppercase tracking-[0.15em] text-[#cbfffc]">
                03. Nilai Tambah & Fitur Unggulan
              </span>
              <h2 className="text-[36px] sm:text-[48px] font-medium leading-[1.1] text-white">
                Gimmick Pemikat Dosen Penguji
              </h2>
            </div>

            <div className="p-10 rounded-[16px] bg-[#003734] border border-[#cbfffc] flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#012624] bg-[#cbfffc] px-2.5 py-0.5 rounded-[4px] font-bold">
                  Key Competitive Feature
                </span>
                <span className="text-[13px] font-mono text-[#fde9ff]">Demo Live Ready</span>
              </div>

              <h3 className="text-[26px] sm:text-[32px] font-medium text-white leading-tight">
                {idea.gimmick}
              </h3>

              <div className="p-6 rounded-[8px] bg-[#011d1c] text-[14px] text-[#bbc7c6] leading-[1.5] flex flex-col gap-2">
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
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-mono uppercase tracking-[0.15em] text-[#cbfffc]">
                04. Distribusi Tugas & Kolaborasi
              </span>
              <h2 className="text-[36px] sm:text-[48px] font-medium leading-[1.1] text-white">
                Kontribusi Nyata Tiap Anggota
              </h2>
            </div>

            <div className="p-8 rounded-[16px] bg-[#003734] flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {members.map((m, idx) => {
                  const roles = [
                    'Arsitek Sistem & Backend API',
                    'Frontend UI/UX & Responsive Views',
                    'Otentikasi & Database Architecture',
                    'Integrasi Endpoint & QA Testing',
                  ];
                  return (
                    <div key={m.id} className="p-4 rounded-[8px] bg-[#011d1c] flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[15px] font-medium text-white">{m.name}</span>
                        <span className="text-[11px] font-mono text-[#cbfffc]">@{m.github_username || 'member'}</span>
                      </div>
                      <div className="text-[12px] text-[#edfffe] font-mono">{roles[idx % roles.length]}</div>
                      <div className="text-[11px] text-[#bbc7c6] mt-1">
                        Status Commit: <span className="text-[#59d499]">Terjadwal & Berkontribusi</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-[8px] bg-[#012624] text-[12px] font-mono text-[#bbc7c6] flex items-center justify-between">
                <span>Total Jadwal Sprint: {schedules.length} Commit</span>
                <span className="text-[#cbfffc]">Grafik Kontribusi GitHub Terdistribusi Merata</span>
              </div>
            </div>
          </div>
        )}

        {/* SLIDE 5: Q&A DEFENSE CHEAT SHEET */}
        {currentSlide === 5 && (
          <div className="w-full flex flex-col gap-8 animate-fadeIn max-w-4xl">
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-mono uppercase tracking-[0.15em] text-[#cbfffc]">
                05. Pertahanan Sidang & Tanya Jawab
              </span>
              <h2 className="text-[36px] sm:text-[48px] font-medium leading-[1.1] text-white">
                Panduan Menjawab Pertanyaan Dosen
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-[16px] bg-[#003734] flex flex-col gap-2">
                <span className="text-[13px] text-[#fde9ff] font-medium">
                  Tanya: &quot;Apa tantangan teknis tersulit dalam proyek ini?&quot;
                </span>
                <p className="text-[13px] text-[#bbc7c6] leading-[1.5]">
                  <strong className="text-white">Jawaban:</strong> Menjaga konsistensi data real-time dan optimasi query saat banyak anggota mengakses sistem secara paralel tanpa terjadi race condition.
                </p>
              </div>

              <div className="p-6 rounded-[16px] bg-[#003734] flex flex-col gap-2">
                <span className="text-[13px] text-[#fde9ff] font-medium">
                  Tanya: &quot;Bagaimana cara membuktikan pembagian kerja tim adil?&quot;
                </span>
                <p className="text-[13px] text-[#bbc7c6] leading-[1.5]">
                  <strong className="text-white">Jawaban:</strong> Silakan cek riwayat git log dan grafik kontributor GitHub kami. Masing-masing anggota memiliki branch fitur dan commit terisolasi.
                </p>
              </div>

              <div className="p-6 rounded-[16px] bg-[#003734] flex flex-col gap-2">
                <span className="text-[13px] text-[#fde9ff] font-medium">
                  Tanya: &quot;Mengapa tidak menggunakan framework lain?&quot;
                </span>
                <p className="text-[13px] text-[#bbc7c6] leading-[1.5]">
                  <strong className="text-white">Jawaban:</strong> Stack yang dipilih menawarkan efisiensi pengembangan tertinggi dengan dukungan static typing penuh untuk mencegah bug di tahap produksi.
                </p>
              </div>

              <div className="p-6 rounded-[16px] bg-[#003734] flex flex-col gap-2">
                <span className="text-[13px] text-[#fde9ff] font-medium">
                  Tanya: &quot;Apa rencana pengembangan proyek ke depan?&quot;
                </span>
                <p className="text-[13px] text-[#bbc7c6] leading-[1.5]">
                  <strong className="text-white">Jawaban:</strong> Menambahkan integrasi payment gateway otomatis, automasi pipeline CI/CD, dan aplikasi mobile pendukung.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Slide Navigation Bar (Hidden in Print) */}
      <footer className="print:hidden h-20 border-t border-[#003734] px-6 sm:px-12 flex items-center justify-between bg-[#011d1c]/90 backdrop-blur-md relative z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
            disabled={currentSlide === 0}
            className="p-2.5 rounded-[6px] bg-[#003734] disabled:opacity-40 hover:bg-[#004d49] text-white text-[13px] transition-all"
          >
            ← Slide Sebelumnya
          </button>
          <button
            onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1))}
            disabled={currentSlide === totalSlides - 1}
            className="p-2.5 rounded-[6px] bg-[#003734] disabled:opacity-40 hover:bg-[#004d49] text-white text-[13px] transition-all"
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
                currentSlide === idx ? 'w-8 bg-[#cbfffc]' : 'bg-[#003734] hover:bg-[#004d49]'
              }`}
            />
          ))}
          <span className="text-[12px] font-mono text-[#bbc7c6] ml-3">
            {currentSlide + 1} / {totalSlides}
          </span>
        </div>

        <div className="text-[12px] font-mono text-[#707777] hidden md:block">
          Gunakan tombol [←] [→] atau [Spasi]
        </div>
      </footer>
    </div>
  );
}
