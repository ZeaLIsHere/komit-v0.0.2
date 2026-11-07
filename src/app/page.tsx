import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroConstellation from '@/components/HeroConstellation';

export default function HomePage() {
  return (
    <div className="text-[#ededed] min-h-screen flex flex-col selection:bg-[#6b62f2]/30 selection:text-white font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 sm:px-12 py-10 flex flex-col gap-28 md:gap-36">
        {/* HERO SECTION WITH DUSK VIOLET ATMOSPHERIC BACKGROUND */}
        <section className="relative min-h-[75vh] flex flex-col items-center justify-center text-center gap-8 py-16 overflow-hidden">
          {/* 3D Constellation Sphere Background */}
          <HeroConstellation />

          {/* Foreground Content Stack */}
          <div className="relative z-10 max-w-4xl flex flex-col items-center gap-6">
            <h1 className="text-[44px] sm:text-[60px] md:text-[72px] leading-[1.0] font-medium tracking-[-0.035em] text-white">
              Proyek kelompok selesai. Commit natural di mata dosen.
            </h1>
            <p className="text-[16px] md:text-[18px] text-white/80 leading-[1.6] max-w-2xl mx-auto font-normal">
              Cicil commit GitHub terjadwal otomatis menggunakan akun asli masing-masing anggota kelompok hingga UAS. Dilengkapi rekomendasi ide AI dengan fitur pemikat nilai dan bahan presentasi.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/order"
              className="btn-white-pill text-[14px] px-7 py-3.5 rounded-full"
            >
              Mulai Pesan Proyek
            </Link>
            <Link
              href="/project/demo-proyek-uas"
              className="btn-hairline-ghost text-[14px] px-6 py-3 rounded-full"
            >
              Lihat Demo Dashboard
            </Link>
          </div>
        </section>

        {/* SECTION: CARA KERJA (DE-CONTAINERIZED CONNECTED TIMELINE) */}
        <section id="cara-kerja" className="flex flex-col gap-12">
          {/* Section Header with Contextual Metadata */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-mono uppercase tracking-[0.15em] text-white/60">
                Alur Eksekusi
              </span>
              <h2 className="text-[32px] md:text-[40px] font-medium text-white tracking-[-0.03em] leading-[1.1]">
                Pengerjaan bertahap dari pemesanan hingga sidang akhir.
              </h2>
            </div>
            <span className="text-[13px] text-white/50 font-mono shrink-0">
              04 Tahapan Terstruktur
            </span>
          </div>

          {/* Open Horizontal Pipeline */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
            {[
              {
                step: '01',
                title: 'Order & Bayar QRIS',
                desc: 'Pilih paket, atur kuota anggota kelompok (1–8 orang), dan selesaikan bayar via QRIS statis terjangkau.',
              },
              {
                step: '02',
                title: 'Ide AI & Gimmick Dosen',
                desc: 'Ketik topik mata kuliah, AI menyajikan 3 ide berdaya saing dengan fitur unik pemikat nilai saat demo.',
              },
              {
                step: '03',
                title: 'Connect GitHub Anggota',
                desc: 'Tautan dibagikan ke kelompok. Tiap anggota menghubungkan akun GitHub resmi via OAuth aman.',
              },
              {
                step: '04',
                title: 'Cicil Commit & README',
                desc: 'Kode di-push terjadwal mingguan. Saat UAS tiba, gunakan mode presentasi interaktif atau README.',
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-4 group">
                {/* Step Marker with Connected Hairline Divider */}
                <div className="flex items-center gap-3">
                  <span className="text-[28px] font-medium font-mono text-white/90 tabular-nums">
                    {item.step}
                  </span>
                  <div className="h-[1px] flex-1 bg-white/15 group-hover:bg-white/35 transition-colors" />
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-[17px] font-medium text-white leading-[1.3]">
                    {item.title}
                  </h3>
                  <p className="text-[14px] text-white/75 leading-[1.6]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: KATALOG LAYANAN (ASYMMETRIC BENTO: FLAGSHIP VS SECONDARY) */}
        <section id="layanan" className="flex flex-col gap-12">
          {/* Section Header */}
          <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
            <span className="text-[12px] font-mono uppercase tracking-[0.15em] text-white/60">
              Spesialisasi Akademik
            </span>
            <h2 className="text-[32px] md:text-[40px] font-medium text-white tracking-[-0.03em] leading-[1.1]">
              Dirancang untuk kebutuhan akademik mahasiswa informatika.
            </h2>
          </div>

          {/* Asymmetric 7:5 Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Left Column (7 cols): Flagship Core Service */}
            <div className="lg:col-span-7 p-8 md:p-10 rounded-[28px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col justify-between gap-8">
              <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-[#161616] bg-white px-3 py-1 rounded-full font-mono">
                    Layanan Utama • Flagship
                  </span>
                  <span className="text-[12px] text-white/60 font-mono">
                    Multi-Kontributor
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  <h3 className="text-[26px] md:text-[32px] font-medium text-white leading-[1.15] tracking-[-0.02em]">
                    Joki Proyek Kuliah Berkelompok
                  </h3>
                  <p className="text-[15px] text-white/80 leading-[1.6]">
                    Pengerjaan kode aplikasi fullstack terstandar industri, cicil commit mingguan otomatis atas nama akun asli masing-masing anggota kelompok via GitHub OAuth, dan bahan presentasi UAS siap pakai.
                  </p>
                </div>

                {/* Core Capability Checklist */}
                <div className="flex flex-col gap-2.5 pt-2 border-t border-white/10 text-[13px] text-white/85">
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                    <span>Commit GitHub otomatis terjadwal atas akun asli tiap anggota</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                    <span>Rekomendasi 3 ide AI dengan gimmick pemikat dosen penguji</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                    <span>Mode presentasi interaktif &amp; generate README anti-tanya dosen</span>
                  </div>
                </div>
              </div>

              {/* Bottom Package Options & Direct CTA */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/10">
                <div className="flex flex-wrap items-center gap-2 text-[12px]">
                  <span className="px-3 py-1 rounded-full bg-white/[0.08] border border-white/15 text-white/90">
                    Paket Full
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/70">
                    Koding Saja
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-white/70">
                    Ide &amp; Blueprint
                  </span>
                </div>

                <Link
                  href="/order"
                  className="btn-white-pill text-[13px] px-6 py-2.5 rounded-full shrink-0"
                >
                  Pesan Proyek ↗
                </Link>
              </div>
            </div>

            {/* Right Column (5 cols): 3 Secondary Complementary Services */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Secondary Service 1 */}
              <div className="flex-1 p-6 rounded-[22px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[18px] font-medium text-white">
                      Makalah &amp; Laporan Akademik
                    </h4>
                    <span className="text-[11px] font-mono text-white/50">Dokumen</span>
                  </div>
                  <p className="text-[13px] text-white/75 leading-[1.5]">
                    Penyusunan laporan standar kampus, perancangan diagram UML (Use Case, Activity, Sequence), relasi ERD database, dan referensi jurnal terindeks.
                  </p>
                </div>
                <span className="text-[12px] text-white/50">
                  Revisi sampai disetujui dosen pembimbing
                </span>
              </div>

              {/* Secondary Service 2 */}
              <div className="flex-1 p-6 rounded-[22px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[18px] font-medium text-white">
                      Slide Presentasi (PPT)
                    </h4>
                    <span className="text-[11px] font-mono text-white/50">Add-on</span>
                  </div>
                  <p className="text-[13px] text-white/75 leading-[1.5]">
                    Slide PowerPoint (.pptx) estetis dan ringkas untuk presentasi demo aplikasi di hadapan dosen penguji tanpa rasa cemas.
                  </p>
                </div>
                <span className="text-[12px] text-white/50">
                  Tersedia langsung di dashboard proyek
                </span>
              </div>

              {/* Secondary Service 3 */}
              <div className="flex-1 p-6 rounded-[22px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[18px] font-medium text-white">
                      Tugas Ringan &amp; Praktikum
                    </h4>
                    <span className="text-[11px] font-mono text-white/50">Modul</span>
                  </div>
                  <p className="text-[13px] text-white/75 leading-[1.5]">
                    Penyelesaian tugas mingguan algoritma pemrograman, struktur data, pembuatan query database SQL, dan modul praktikum lab.
                  </p>
                </div>
                <span className="text-[12px] text-white/50">
                  Garansi penjelasan logika kode
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: BIAYA TRANSPARAN (HIGH CONTRAST VALUE ANCHOR) */}
        <section
          id="harga"
          className="p-8 sm:p-12 md:p-14 rounded-[32px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col lg:flex-row lg:items-center justify-between gap-10"
        >
          <div className="flex flex-col gap-4 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-[12px] font-mono uppercase tracking-[0.15em] text-white/70">
                Formula Pembagian Adil
              </span>
            </div>

            <h2 className="text-[32px] sm:text-[42px] font-medium leading-[1.1] text-white tracking-[-0.03em]">
              Mulai dari Rp 50.000 per anggota.
            </h2>

            <p className="text-[15px] text-white/80 leading-[1.6]">
              Biaya dibagi rata sejumlah anggota kelompok. Jika kelompok Anda beranggotakan 4 orang, total tagihan adalah Rp 200.000. Tiap anggota kelompok mendapatkan kontribusi commit di repository GitHub.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-[12px] text-white/70">
              <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10">
                ✓ Tanpa Biaya Tersembunyi
              </span>
              <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10">
                ✓ Kontribusi GitHub Terbagi Rata
              </span>
              <span className="px-3 py-1 rounded-full bg-white/[0.05] border border-white/10">
                ✓ Garansi Sebelum Demo UAS
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-6 shrink-0 border-t lg:border-t-0 lg:border-l border-white/10 pt-6 lg:pt-0 lg:pl-10">
            <div className="flex flex-col lg:text-right">
              <span className="text-[12px] text-white/60 font-mono uppercase tracking-wider">
                Mulai Dari
              </span>
              <div className="text-[36px] sm:text-[44px] font-medium text-white font-mono leading-none tracking-tight tabular-nums">
                Rp 50.000
              </div>
              <span className="text-[13px] text-white/60 mt-1">
                / orang / proyek
              </span>
            </div>

            <Link
              href="/order"
              className="btn-white-pill text-[14px] px-8 py-3.5 rounded-full"
            >
              Order Sekarang ↗
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
