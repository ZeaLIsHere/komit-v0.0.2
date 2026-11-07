import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroConstellation from '@/components/HeroConstellation';

export default function HomePage() {
  return (
    <div className="bg-[#0a0a0a] text-[#ededed] min-h-screen flex flex-col selection:bg-[#6b62f2]/30 selection:text-white font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 sm:px-12 py-10 flex flex-col gap-20 md:gap-28">
        {/* HERO SECTION WITH DUSK VIOLET ATMOSPHERIC BACKGROUND */}
        <section className="relative min-h-[75vh] flex flex-col items-center justify-center text-center gap-8 py-16 overflow-hidden">
          {/* 3D Constellation Sphere Background */}
          <HeroConstellation />

          {/* Foreground Content Stack */}
          <div className="relative z-10 max-w-4xl flex flex-col items-center gap-6">
            <h1 className="text-[44px] sm:text-[60px] md:text-[72px] leading-[1.0] font-medium tracking-[-0.035em] text-white">
              Proyek kelompok selesai. Commit natural di mata dosen.
            </h1>
            <p className="text-[16px] md:text-[18px] text-[#c2c2c2] leading-[1.5] max-w-2xl mx-auto font-normal">
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

        {/* SECTION: CARA KERJA (FROSTED GLASS FEATURE CARDS) */}
        <section id="cara-kerja" className="flex flex-col gap-8">
          <h2 className="text-[32px] md:text-[40px] font-semibold text-white tracking-[-0.02em] font-sans">
            Pengerjaan bertahap dari pemesanan hingga sidang akhir.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                title: 'Order & Bayar QRIS',
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
                desc: 'Kode di-push terjadwal tiap minggu. Saat UAS tiba, gunakan mode presentasi interaktif atau generate README.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-7 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col justify-between gap-6"
              >
                <span className="text-[14px] font-mono text-[#c2c2c2]">
                  {item.step}
                </span>

                <div className="flex flex-col gap-2">
                  <h3 className="text-[18px] font-medium leading-[1.3] text-white">
                    {item.title}
                  </h3>
                  <p className="text-[14px] text-[#c2c2c2] leading-[1.5]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION: KATALOG LAYANAN */}
        <section id="layanan" className="flex flex-col gap-8">
          <h2 className="text-[32px] md:text-[40px] font-semibold text-white tracking-[-0.02em] font-sans">
            Dirancang untuk kebutuhan akademik mahasiswa informatika.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-8 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-3">
                <h3 className="text-[24px] font-medium text-white">
                  Joki Proyek Kuliah Berkelompok
                </h3>
                <p className="text-[15px] text-[#c2c2c2] leading-[1.5]">
                  Pengerjaan kode aplikasi fullstack, cicil commit terjadwal mingguan atas nama akun asli masing-masing anggota kelompok via GitHub OAuth, dan bahan presentasi UAS siap pakai.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 w-full text-[12px] text-[#c2c2c2]">
                <span className="py-2 px-2 text-center rounded-[10px] bg-[#0a0a0a] border border-[#e5e5e5]/10 flex items-center justify-center">
                  Paket Full
                </span>
                <span className="py-2 px-2 text-center rounded-[10px] bg-[#0a0a0a] border border-[#e5e5e5]/10 flex items-center justify-center">
                  Koding Saja
                </span>
                <span className="py-2 px-2 text-center rounded-[10px] bg-[#0a0a0a] border border-[#e5e5e5]/10 flex items-center justify-center">
                  Ide & Blueprint
                </span>
              </div>
            </div>

            <div className="p-8 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-3">
                <h3 className="text-[24px] font-medium text-white">
                  Makalah & Laporan Akademik
                </h3>
                <p className="text-[15px] text-[#c2c2c2] leading-[1.5]">
                  Penyusunan laporan akademik terstandar, diagram UML komprehensif (Use Case, Activity, Sequence), relasi ERD database, dan referensi jurnal ilmiah terindeks.
                </p>
              </div>

              <div className="text-[13px] text-[#686868]">
                Revisi sampai disetujui dosen pembimbing
              </div>
            </div>

            <div className="p-8 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-3">
                <h3 className="text-[24px] font-medium text-white">
                  Slide Presentasi (PPT)
                </h3>
                <p className="text-[15px] text-[#c2c2c2] leading-[1.5]">
                  Slide presentasi ringkas, estetis, dan terstruktur untuk presentasi demo aplikasi di hadapan dosen penguji tanpa rasa cemas.
                </p>
              </div>

              <div className="text-[13px] text-[#686868]">
                Tersedia sebagai opsi add-on dashboard
              </div>
            </div>

            <div className="p-8 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-3">
                <h3 className="text-[24px] font-medium text-white">
                  Tugas Ringan & Praktikum
                </h3>
                <p className="text-[15px] text-[#c2c2c2] leading-[1.5]">
                  Penyelesaian modul tugas mingguan algoritma, struktur data, basis data SQL, pembuatan query, dan modul praktikum lab komputer.
                </p>
              </div>

              <div className="text-[13px] text-[#686868]">
                Garansi nilai & penjelasan logika koding
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: BIAYA TRANSPARAN */}
        <section id="harga" className="p-10 sm:p-14 rounded-[32px] bg-[#161616]/90 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex flex-col gap-3 max-w-2xl">
            <h2 className="text-[32px] sm:text-[40px] font-medium leading-[1.1] text-white tracking-[-0.02em]">
              Mulai dari Rp 50.000 per anggota.
            </h2>
            <p className="text-[15px] text-[#c2c2c2] leading-[1.5]">
              Biaya dibagi rata sejumlah anggota kelompok. Jika kelompok Anda beranggotakan 4 orang, total tagihan adalah Rp 200.000. Tiap anggota kelompok mendapatkan kontribusi commit di repository GitHub.
            </p>
          </div>

          <div className="shrink-0 md:mr-4">
            <Link
              href="/order"
              className="btn-white-pill text-[14px] px-8 py-3.5 rounded-full"
            >
              Order Sekarang
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
