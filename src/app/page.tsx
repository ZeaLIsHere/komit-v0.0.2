import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroConstellation from '@/components/HeroConstellation';

export default function HomePage() {
  return (
    <div className="bg-[#012624] text-[#bbc7c6] min-h-screen flex flex-col selection:bg-[#00827c] selection:text-white">
      <Navbar />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 sm:px-12 py-10 flex flex-col gap-24 md:gap-32">
        {/* HERO SECTION WITH BIOLUMINESCENT SPHERE BACKGROUND */}
        <section className="relative min-h-[75vh] flex flex-col items-center justify-center text-center gap-8 py-16 overflow-hidden">
          {/* Atmospheric Particle Sphere Background */}
          <HeroConstellation />

          {/* Foreground Content Stack */}
          <div className="relative z-10 max-w-4xl flex flex-col items-center gap-6">
            <h1 className="text-[44px] sm:text-[68px] md:text-[86px] leading-[1.0] font-medium tracking-[-0.04em] text-white">
              Proyek kelompok selesai. Commit natural di mata dosen.
            </h1>
            <p className="text-[16px] md:text-[18px] text-[#bbc7c6] leading-[1.4] max-w-2xl mx-auto font-normal">
              Cicil commit GitHub terjadwal otomatis menggunakan akun asli masing-masing anggota kelompok hingga UAS. Dilengkapi rekomendasi ide AI dengan fitur pemikat nilai dan bahan presentasi.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-6 pt-2">
            <Link
              href="/order"
              className="btn-aurora text-[14px] px-8 py-4 rounded-[6px] transition-all"
            >
              Mulai Pesan Proyek ↗
            </Link>
            <Link
              href="/project/demo-proyek-uas"
              className="text-[13px] uppercase tracking-[0.12em] text-[#bbc7c6] hover:text-white transition-colors"
            >
              Lihat Demo Dashboard Kelompok
            </Link>
          </div>
        </section>

        {/* STATISTIC COUNTER STRIP (Lavender Phosphor #fde9ff) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 p-12 rounded-[16px] bg-[#003734] border border-[#003734]">
          <div className="flex flex-col gap-2">
            <span className="text-[56px] md:text-[72px] font-medium leading-[1.0] text-[#fde9ff] tracking-[-0.04em]">
              100%
            </span>
            <span className="text-[12px] uppercase tracking-[0.12em] text-[#edfffe]">
              Akun GitHub Asli Anggota Kelompok
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[56px] md:text-[72px] font-medium leading-[1.0] text-[#fde9ff] tracking-[-0.04em]">
              Rp 50K
            </span>
            <span className="text-[12px] uppercase tracking-[0.12em] text-[#edfffe]">
              Formula Biaya Transparan Per Anggota
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[56px] md:text-[72px] font-medium leading-[1.0] text-[#fde9ff] tracking-[-0.04em]">
              UAS A
            </span>
            <span className="text-[12px] uppercase tracking-[0.12em] text-[#edfffe]">
              Target Nilai dengan Gimmick AI
            </span>
          </div>
        </section>

        {/* SECTION: CARA KERJA (FEATURE ROW CARDS) */}
        <section id="cara-kerja" className="flex flex-col gap-12">
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-medium uppercase tracking-[0.15em] text-[#edfffe]">
              Alur Operasional
            </span>
            <h2 className="text-[32px] md:text-[44px] font-medium leading-[1.0] text-white tracking-[-0.03em]">
              Pengerjaan bertahap dari pemesanan hingga sidang akhir.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Order & Pembayaran QRIS',
                desc: 'Pilih paket, atur kuota anggota kelompok (1–8 orang), dan bayar dengan nominal terjangkau via QRIS statis.',
              },
              {
                step: '02',
                title: 'Ide AI & Gimmick Dosen',
                desc: 'Ketik topik mata kuliah, AI menyajikan 3 ide berdaya saing dengan fitur unik pemikat nilai saat demo dosen.',
              },
              {
                step: '03',
                title: 'Connect GitHub Anggota',
                desc: 'Tautan undangan dibagikan ke kelompok. Masing-masing anggota menghubungkan akun GitHub via OAuth aman.',
              },
              {
                step: '04',
                title: 'Cicil Commit & README',
                desc: 'Kode di-push terjadwal tiap minggu. Saat UAS tiba, generate bahan presentasi dan Q&A atau beli add-on slide PPT.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-8 rounded-[16px] bg-[#003734] flex flex-col justify-between gap-6"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-mono text-[#edfffe] uppercase tracking-[0.12em]">
                    Fase {item.step}
                  </span>
                  <div className="w-8 h-8 rounded-[6px] bg-[#03514b]/60 flex items-center justify-center text-white text-[13px]">
                    ↗
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-[20px] font-medium leading-[1.2] text-white">
                    {item.title}
                  </h3>
                  <p className="text-[14px] text-[#bbc7c6] leading-[1.4]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: KATALOG LAYANAN (SURFACE CARDS LIQUID KELP #003734) */}
        <section id="layanan" className="flex flex-col gap-12">
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-medium uppercase tracking-[0.15em] text-[#edfffe]">
              Katalog Layanan IT
            </span>
            <h2 className="text-[32px] md:text-[44px] font-medium leading-[1.0] text-white tracking-[-0.03em]">
              Dirancang untuk kebutuhan akademik mahasiswa informatika.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-9 rounded-[16px] bg-[#003734] flex flex-col justify-between gap-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[28px] font-medium leading-[1.0] text-white">
                      Joki Proyek Kuliah Berkelompok
                    </h3>
                    <span className="text-[12px] uppercase tracking-[0.12em] text-[#edfffe] block mt-2">
                      Layanan Unggulan MVP
                    </span>
                  </div>
                  <span className="text-[15px] font-medium text-[#fde9ff] whitespace-nowrap bg-[#012624] px-3 py-1.5 rounded-[6px]">
                    N × Rp 50.000
                  </span>
                </div>
                <p className="text-[15px] text-[#bbc7c6] leading-[1.4]">
                  Pengerjaan kode aplikasi fullstack, cicil commit terjadwal mingguan atas nama akun asli masing-masing anggota kelompok via GitHub OAuth, dan bahan presentasi UAS siap pakai.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[12px] uppercase tracking-[0.08em] text-[#bbc7c6]">
                <span className="px-3 py-1 rounded-[6px] bg-[#012624]">Paket Full</span>
                <span className="px-3 py-1 rounded-[6px] bg-[#012624]">Koding Saja</span>
                <span className="px-3 py-1 rounded-[6px] bg-[#012624]">Ide & Blueprint</span>
              </div>
            </div>

            <div className="p-9 rounded-[16px] bg-[#003734] flex flex-col justify-between gap-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[28px] font-medium leading-[1.0] text-white">
                      Makalah & Laporan Akademik
                    </h3>
                    <span className="text-[12px] uppercase tracking-[0.12em] text-[#edfffe] block mt-2">
                      Format Institusi
                    </span>
                  </div>
                  <span className="text-[14px] text-[#bbc7c6] bg-[#012624] px-3 py-1.5 rounded-[6px]">
                    Lengkap Bab 1–5
                  </span>
                </div>
                <p className="text-[15px] text-[#bbc7c6] leading-[1.4]">
                  Penyusunan laporan akademik terstandar, diagram UML komprehensif (Use Case, Activity, Sequence), relasi ERD database, dan referensi jurnal ilmiah terindeks.
                </p>
              </div>

              <div className="text-[12px] uppercase tracking-[0.12em] text-[#bbc7c6]">
                Revisi sampai disetujui dosen pembimbing
              </div>
            </div>

            <div className="p-9 rounded-[16px] bg-[#003734] flex flex-col justify-between gap-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[28px] font-medium leading-[1.0] text-white">
                      Slide Presentasi (PPT)
                    </h3>
                    <span className="text-[12px] uppercase tracking-[0.12em] text-[#edfffe] block mt-2">
                      Visual Demo Sidang
                    </span>
                  </div>
                  <span className="text-[14px] text-[#bbc7c6] bg-[#012624] px-3 py-1.5 rounded-[6px]">
                    Add-on / Standalone
                  </span>
                </div>
                <p className="text-[15px] text-[#bbc7c6] leading-[1.4]">
                  Slide presentasi ringkas, estetis, dan terstruktur untuk presentasi demo aplikasi di hadapan dosen penguji tanpa rasa cemas.
                </p>
              </div>

              <div className="text-[12px] uppercase tracking-[0.12em] text-[#bbc7c6]">
                Tersedia sebagai opsi add-on dashboard
              </div>
            </div>

            <div className="p-9 rounded-[16px] bg-[#003734] flex flex-col justify-between gap-8">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[28px] font-medium leading-[1.0] text-white">
                      Tugas Ringan & Praktikum
                    </h3>
                    <span className="text-[12px] uppercase tracking-[0.12em] text-[#edfffe] block mt-2">
                      Lab Mingguan
                    </span>
                  </div>
                  <span className="text-[14px] text-[#bbc7c6] bg-[#012624] px-3 py-1.5 rounded-[6px]">
                    Cepat & Akurat
                  </span>
                </div>
                <p className="text-[15px] text-[#bbc7c6] leading-[1.4]">
                  Penyelesaian modul tugas mingguan algoritma, struktur data, basis data SQL, pembuatan query, dan modul praktikum lab komputer.
                </p>
              </div>

              <div className="text-[12px] uppercase tracking-[0.12em] text-[#bbc7c6]">
                Garansi nilai & penjelasan logika koding
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: BIAYA TRANSPARAN (RECESSED CARD LIQUID DEEP #011d1c) */}
        <section id="harga" className="p-12 sm:p-16 rounded-[16px] bg-[#011d1c] border border-[#003734] flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex flex-col gap-3 max-w-2xl">
            <span className="text-[12px] font-medium uppercase tracking-[0.15em] text-[#edfffe]">
              Formula Biaya Transparan
            </span>
            <h2 className="text-[36px] sm:text-[48px] font-medium leading-[1.0] text-white tracking-[-0.03em]">
              N × Rp 50.000 per anggota.
            </h2>
            <p className="text-[15px] text-[#bbc7c6] leading-[1.4]">
              Biaya dibagi rata sejumlah anggota kelompok. Jika kelompok Anda beranggotakan 4 orang, total tagihan adalah Rp 200.000. Tiap anggota kelompok mendapatkan kontribusi commit di repository GitHub.
            </p>
          </div>

          <div className="shrink-0">
            <Link
              href="/order"
              className="btn-aurora text-[14px] px-8 py-4 rounded-[6px] transition-all inline-block"
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
