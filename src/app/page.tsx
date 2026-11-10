'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroConstellation from '@/components/HeroConstellation';
import ScrollReveal from '@/components/ScrollReveal';
import { triggerParticleCollapse } from '@/lib/particles';

export default function HomePage() {
  return (
    <div className="text-[#ededed] min-h-screen flex flex-col selection:bg-[#6b62f2]/30 selection:text-white font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 sm:px-12 pb-20 flex flex-col gap-28 md:gap-36">
        {/* HERO SECTION WITH DUSK VIOLET ATMOSPHERIC BACKGROUND */}
        <section className="relative min-h-[calc(100vh-120px)] flex flex-col items-center justify-center text-center gap-8 pt-20 pb-16 md:pt-28 md:pb-20 overflow-hidden">
          {/* 3D Constellation Sphere Background */}
          <HeroConstellation />

          {/* Foreground Content Stack */}
          <div className="relative z-10 max-w-4xl flex flex-col items-center gap-6">
            <h1 className="text-[44px] sm:text-[60px] md:text-[72px] leading-[1.0] font-medium tracking-[-0.035em] text-white">
              Tugas kuliah kelar, lo tinggal santai.
            </h1>
            <p className="text-[16px] md:text-[18px] text-white/80 leading-[1.6] max-w-2xl mx-auto font-normal">
              Capek begadang tiap malam atau dapet temen kelompok yang ngilang? Dari proyek koding cicil commit, tugas praktikum harian, makalah rapi, sampe slide presentasi siap tampil — serahin ke sini, beres tanpa drama.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/order"
              onMouseEnter={() => triggerParticleCollapse(true)}
              onMouseLeave={() => triggerParticleCollapse(false)}
              className="btn-white-pill text-[14px] px-8 py-3.5 rounded-full"
            >
              Gas Order Sekarang
            </Link>
          </div>
        </section>

        {/* SECTION: CARA KERJA (VERTICAL EDITORIAL TIMELINE) */}
        <section id="cara-kerja" className="flex flex-col gap-8">
          {/* Section Header */}
          <ScrollReveal>
            <div className="border-b border-white/10 pb-6">
              <h2 className="text-[32px] md:text-[42px] font-medium text-white tracking-[-0.03em] leading-[1.1]">
                Alur simpel, tugas beres tanpa ribet
              </h2>
            </div>
          </ScrollReveal>

          {/* Vertical Editorial Step Rows */}
          <div className="flex flex-col divide-y divide-white/10 border-b border-white/10">
            {[
              {
                step: '01',
                title: 'Pilih Layanan & Bayar QRIS',
                desc: 'Tentukan jenis tugasmu (proyek kelompok, koding praktikum, makalah, atau slide), cantumkan detail instruksi, lalu selesaikan pembayaran via QRIS.',
              },
              {
                step: '02',
                title: 'Eksekusi Rapi Sesuai Target',
                desc: 'Tim langsung garap tugasmu: kodingan bersih berpenjelasan, riset makalah sitasi ilmiah bebas plagiasi, atau slide presentasi visual terarah.',
              },
              {
                step: '03',
                title: 'Pantau Progress di Dashboard',
                desc: 'Cek status pengerjaan secara real-time. Khusus proyek kelompok, undang anggota untuk sinkronisasi jadwal commit GitHub otomatis.',
              },
              {
                step: '04',
                title: 'Terima Jadi & Siap Ujian',
                desc: 'Unduh file hasil pengerjaan (dokumen, slide PPT, atau repo koding) langsung dari dashboard. Tinggal pelajari dan siap demo nilai A.',
              },
            ].map((item, idx) => (
              <ScrollReveal key={item.step} delay={idx * 70} yOffset={20}>
                <div className="py-8 md:py-10 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-center group hover:bg-white/[0.02] transition-colors -mx-4 px-4 rounded-[16px]">
                  {/* Step Number */}
                  <div className="md:col-span-2">
                    <span className="text-[32px] md:text-[40px] font-medium font-mono text-white/40 group-hover:text-white transition-colors tabular-nums">
                      {item.step}
                    </span>
                  </div>

                  {/* Step Title */}
                  <div className="md:col-span-4">
                    <h3 className="text-[20px] md:text-[22px] font-medium text-white leading-[1.3]">
                      {item.title}
                    </h3>
                  </div>

                  {/* Step Description */}
                  <div className="md:col-span-6">
                    <p className="text-[15px] text-white/75 leading-[1.6]">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* SECTION: KATALOG LAYANAN (BENTO 1+3: FULL-WIDTH FLAGSHIP + 3 EQUAL SUB-SERVICES) */}
        <section id="layanan" className="flex flex-col gap-12 md:gap-16">
          {/* Section Header */}
          <ScrollReveal>
            <div className="border-b border-white/10 pb-8">
              <h2 className="text-[32px] md:text-[44px] font-medium text-white tracking-[-0.03em] leading-[1.1]">
                Dirancang untuk kebutuhan akademik mahasiswa informatika.
              </h2>
            </div>
          </ScrollReveal>

          <div className="flex flex-col gap-10 md:gap-12">
            {/* 1. Flagship Hero Card (Full Width & Spacious) */}
            <ScrollReveal delay={100} yOffset={28}>
              <div className="p-10 md:p-14 lg:p-16 rounded-[32px] bg-white/[0.04] backdrop-blur-xl border border-white/10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
                  {/* Left (7 cols): Title, Description, Packages & CTA */}
                  <div className="lg:col-span-7 flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                      <h3 className="text-[30px] sm:text-[36px] md:text-[42px] font-medium text-white leading-[1.1] tracking-[-0.025em]">
                        Joki Proyek Kuliah Berkelompok
                      </h3>
                      <p className="text-[16px] md:text-[18px] text-white/80 leading-[1.65]">
                        Pengerjaan kode aplikasi fullstack terstandar industri, cicil commit mingguan otomatis atas nama akun asli masing-masing anggota kelompok via GitHub OAuth, dan bahan presentasi UAS siap pakai.
                      </p>
                    </div>

                    {/* Action */}
                    <div className="pt-2">
                      <Link
                        href="/order"
                        className="btn-white-pill text-[14px] px-8 py-3.5 rounded-full inline-flex items-center gap-2"
                      >
                        Pesan Proyek ↗
                      </Link>
                    </div>
                  </div>

                  {/* Right (5 cols): Clear Key Deliverables with Divider */}
                  <div className="lg:col-span-5 flex flex-col gap-6 border-t lg:border-t-0 lg:border-l border-white/10 pt-8 lg:pt-0 lg:pl-12 text-[15px] md:text-[16px] text-white/85">
                    <div className="flex items-start gap-4">
                      <span className="text-white/50 font-mono text-[15px] shrink-0 mt-0.5">01</span>
                      <span className="leading-[1.5]">Commit GitHub otomatis terjadwal atas akun asli tiap anggota</span>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="text-white/50 font-mono text-[15px] shrink-0 mt-0.5">02</span>
                      <span className="leading-[1.5]">Rekomendasi ide sesuai topik bidang yang kamu sukai</span>
                    </div>
                    <div className="flex items-start gap-4">
                      <span className="text-white/50 font-mono text-[15px] shrink-0 mt-0.5">03</span>
                      <span className="leading-[1.5]">Mode presentasi interaktif &amp; generate README anti-tanya dosen</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* 2. Three Supporting Services (Structured & Refined 3-Column Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
              {/* Service 02: Makalah & Laporan */}
              <ScrollReveal delay={120} yOffset={24}>
                <div className="p-8 md:p-9 rounded-[28px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col justify-between gap-8 hover:bg-white/[0.06] hover:border-white/20 transition-all group h-full">
                  <div className="flex flex-col gap-6">
                    <div className="border-b border-white/10 pb-4">
                      <span className="text-[13px] font-mono text-white/50">02</span>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <h4 className="text-[20px] md:text-[22px] font-medium text-white leading-[1.25]">
                        Makalah &amp; Laporan Akademik
                      </h4>
                      <p className="text-[14px] text-white/75 leading-[1.6]">
                        Penyusunan laporan standar kampus, perancangan diagram UML, relasi ERD database, dan referensi jurnal terindeks.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-white/10 text-[13px] text-white/80">
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-white/60 shrink-0" />
                        <span>Diagram UML (Use Case, Activity, Sequence)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-white/60 shrink-0" />
                        <span>Relasi ERD &amp; Kamus Data terstruktur</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-white/60 shrink-0" />
                        <span>Format Word (.docx) &amp; PDF siap cetak</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <Link
                      href="/order"
                      className="inline-flex items-center gap-1.5 text-[13px] text-white/80 hover:text-white transition-colors"
                    >
                      <span>Pilih Layanan</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">↗</span>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>

              {/* Service 03: Slide Presentasi (PPT) */}
              <ScrollReveal delay={200} yOffset={24}>
                <div className="p-8 md:p-9 rounded-[28px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col justify-between gap-8 hover:bg-white/[0.06] hover:border-white/20 transition-all group h-full">
                  <div className="flex flex-col gap-6">
                    <div className="border-b border-white/10 pb-4">
                      <span className="text-[13px] font-mono text-white/50">03</span>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <h4 className="text-[20px] md:text-[22px] font-medium text-white leading-[1.25]">
                        Slide Presentasi (PPT)
                      </h4>
                      <p className="text-[14px] text-white/75 leading-[1.6]">
                        Slide presentasi ringkas, estetis, dan terstruktur untuk demonstrasi sistem di hadapan dosen penguji tanpa rasa cemas.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-white/10 text-[13px] text-white/80">
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-white/60 shrink-0" />
                        <span>Tipografi modern &amp; layout slide estetis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-white/60 shrink-0" />
                        <span>Alur masalah, arsitektur sistem &amp; demo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-white/60 shrink-0" />
                        <span>File PowerPoint (.pptx) &amp; Slide PDF</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <Link
                      href="/order"
                      className="inline-flex items-center gap-1.5 text-[13px] text-white/80 hover:text-white transition-colors"
                    >
                      <span>Pilih Layanan</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">↗</span>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>

              {/* Service 04: Tugas Ringan & Praktikum */}
              <ScrollReveal delay={280} yOffset={24}>
                <div className="p-8 md:p-9 rounded-[28px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col justify-between gap-8 hover:bg-white/[0.06] hover:border-white/20 transition-all group h-full">
                  <div className="flex flex-col gap-6">
                    <div className="border-b border-white/10 pb-4">
                      <span className="text-[13px] font-mono text-white/50">04</span>
                    </div>

                    <div className="flex flex-col gap-2.5">
                      <h4 className="text-[20px] md:text-[22px] font-medium text-white leading-[1.25]">
                        Tugas Ringan &amp; Praktikum
                      </h4>
                      <p className="text-[14px] text-white/75 leading-[1.6]">
                        Penyelesaian tugas modul mingguan algoritma pemrograman, query database SQL, struktur data, dan praktikum komputer.
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-white/10 text-[13px] text-white/80">
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-white/60 shrink-0" />
                        <span>Source code bersih dengan komentar kode</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-white/60 shrink-0" />
                        <span>Algoritma, struktur data, &amp; query SQL</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-white/60 shrink-0" />
                        <span>Penjelasan logika &amp; garansi nilai modul</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                    <Link
                      href="/order"
                      className="inline-flex items-center gap-1.5 text-[13px] text-white/80 hover:text-white transition-colors"
                    >
                      <span>Pilih Layanan</span>
                      <span className="group-hover:translate-x-0.5 transition-transform">↗</span>
                    </Link>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* SECTION: BIAYA TRANSPARAN (HIGH-CONVERSION VALUE ANCHOR) */}
        <ScrollReveal yOffset={32}>
          <section
            id="harga"
            className="p-10 sm:p-14 md:p-16 rounded-[36px] bg-white/[0.04] backdrop-blur-xl border border-white/10 shadow-[0_12px_48px_rgba(0,0,0,0.2)] flex flex-col lg:flex-row lg:items-center justify-between gap-10 md:gap-14"
          >
            {/* Left Column: Value Proposition & 4-Service Breakdown */}
            <div className="flex flex-col gap-5 max-w-2xl">
              <h2 className="text-[32px] sm:text-[42px] md:text-[46px] font-medium leading-[1.08] text-white tracking-[-0.03em]">
                Biaya transparan, hasil tuntas untuk semua jenis tugas.
              </h2>

              <p className="text-[16px] md:text-[17px] text-white/80 leading-[1.65]">
                Pilih layanan sesuai kebutuhan akademikmu: proyek koding kelompok ber-commit teratur, koding modul praktikum mandiri, penulisan makalah berstandar ilmiah, atau slide presentasi siap uji.
              </p>

              {/* 4-Tier Pricing Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="p-3 rounded-[12px] bg-white/[0.03] border border-white/10 flex flex-col">
                  <span className="text-[11px] text-white/50 font-mono uppercase">Proyek Kelompok</span>
                  <span className="text-[14px] text-white font-medium font-mono tabular-nums mt-0.5">Rp 50k / org</span>
                </div>
                <div className="p-3 rounded-[12px] bg-white/[0.03] border border-white/10 flex flex-col">
                  <span className="text-[11px] text-white/50 font-mono uppercase">Koding Ringan</span>
                  <span className="text-[14px] text-white font-medium font-mono tabular-nums mt-0.5">Mulai Rp 50k</span>
                </div>
                <div className="p-3 rounded-[12px] bg-white/[0.03] border border-white/10 flex flex-col">
                  <span className="text-[11px] text-white/50 font-mono uppercase">Makalah / Paper</span>
                  <span className="text-[14px] text-white font-medium font-mono tabular-nums mt-0.5">Mulai Rp 75k</span>
                </div>
                <div className="p-3 rounded-[12px] bg-white/[0.03] border border-white/10 flex flex-col">
                  <span className="text-[11px] text-white/50 font-mono uppercase">Slide Presentasi</span>
                  <span className="text-[14px] text-white font-medium font-mono tabular-nums mt-0.5">Rp 75k</span>
                </div>
              </div>
            </div>

            {/* Right Column: Price Anchor & High-Converting CTA */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-6 shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 pt-8 lg:pt-0 lg:pl-12">
              <div className="flex flex-col lg:text-right">
                <span className="text-[12px] text-white/60 font-mono uppercase tracking-[0.12em]">
                  Investasi Mulai Dari
                </span>
                <div className="text-[40px] sm:text-[52px] font-medium text-white font-mono leading-none tracking-tight tabular-nums mt-1 whitespace-nowrap">
                  Rp 50.000
                </div>
                <span className="text-[13px] text-white/60 mt-1.5">
                  / mahasiswa / modul
                </span>
              </div>

              <div className="w-full sm:w-auto">
                <Link
                  href="/order"
                  className="btn-white-pill text-[15px] font-medium px-9 py-4 rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 w-full sm:w-auto text-center"
                >
                  <span>Pesan Tugas Sekarang</span>
                  <span>↗</span>
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>
      </main>

      <Footer />
    </div>
  );
}
