import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroConstellation from '@/components/HeroConstellation';

export default function HomePage() {
  return (
    <div className="bg-[#000000] text-[#ffffff] min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 py-12 md:py-24 flex flex-col gap-24 md:gap-36">
        {/* HERO SECTION */}
        <section className="flex flex-col gap-10">
          <div className="max-w-4xl flex flex-col gap-6">
            <span className="text-[14px] uppercase tracking-[0.2em] text-[#ffb829] font-normal">
              Productized Service & SaaS Mahasiswa IT
            </span>
            <h1 className="text-[44px] sm:text-[64px] md:text-[84px] leading-[1.05] font-normal tracking-[-0.04em] text-[#ffffff]">
              Proyek kelompok selesai, commit natural di mata dosen.
            </h1>
            <p className="text-[18px] md:text-[20px] text-[#9a9a9a] font-extralight leading-relaxed max-w-2xl">
              Cicil commit GitHub otomatis terjadwal atas nama akun asli masing-masing anggota kelompok hingga UAS. Dilengkapi ide AI ber-gimmick pemikat dosen dan bahan presentasi siap pakai.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <Link
              href="/order"
              className="inline-flex items-center justify-center bg-[#8052ff] hover:bg-[#7042ef] text-[#ffffff] text-[14px] font-normal uppercase tracking-[0.025em] px-8 py-3.5 rounded-full transition-all duration-200"
            >
              Mulai Pesan Proyek
            </Link>
            <Link
              href="/project/demo-proyek-uas"
              className="text-[14px] text-[#9a9a9a] hover:text-[#ffffff] transition-colors underline underline-offset-8"
            >
              Lihat Contoh Dashboard Proyek
            </Link>
          </div>

          {/* Interactive Constellation Visualizer */}
          <div className="mt-6 border border-white/5 rounded-[24px] bg-[#050505]">
            <HeroConstellation />
          </div>
        </section>

        {/* FITUR UNGGULAN / THE PROBLEM WE SOLVE */}
        <section id="cara-kerja" className="flex flex-col gap-12">
          <div className="flex flex-col gap-3">
            <span className="text-[14px] uppercase tracking-[0.2em] text-[#8052ff]">
              Cara Kerja
            </span>
            <h2 className="text-[36px] md:text-[48px] font-normal tracking-[-0.04em]">
              Satu alur rapi dari bayar sampai presentasi UAS.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="flex flex-col gap-4">
              <span className="text-[14px] font-mono text-[#ffb829]">01</span>
              <h3 className="text-[22px] font-normal tracking-[-0.02em] text-[#ffffff]">
                Pilih Layanan & Bayar QRIS
              </h3>
              <p className="text-[16px] text-[#9a9a9a] font-extralight leading-relaxed">
                Tentukan paket, atur jumlah anggota kelompok (1–8 orang), dan bayar dengan nominal terjangkau via QRIS statis.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-[14px] font-mono text-[#ffb829]">02</span>
              <h3 className="text-[22px] font-normal tracking-[-0.02em] text-[#ffffff]">
                Ide AI & Gimmick Dosen
              </h3>
              <p className="text-[16px] text-[#9a9a9a] font-extralight leading-relaxed">
                Ketik topik mata kuliah, AI menyajikan 3 rekomendasi ide lengkap dengan fitur gimmick pemikat nilai dosen saat demo.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-[14px] font-mono text-[#ffb829]">03</span>
              <h3 className="text-[22px] font-normal tracking-[-0.02em] text-[#ffffff]">
                Connect GitHub Anggota
              </h3>
              <p className="text-[16px] text-[#9a9a9a] font-extralight leading-relaxed">
                Bagikan link undangan ke teman kelompok untuk menghubungkan akun GitHub. Token tersimpan aman di server untuk cicil commit.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-[14px] font-mono text-[#ffb829]">04</span>
              <h3 className="text-[22px] font-normal tracking-[-0.02em] text-[#ffffff]">
                Cicil Commit & README Presentasi
              </h3>
              <p className="text-[16px] text-[#9a9a9a] font-extralight leading-relaxed">
                Kode di-push bertahap tiap minggu. Saat UAS tiba, generate bahan presentasi dan Q&A dosen atau beli add-on slide PPT jadi.
              </p>
            </div>
          </div>
        </section>

        {/* LAYANAN & HARGA */}
        <section id="layanan" className="flex flex-col gap-12">
          <div className="flex flex-col gap-3">
            <span className="text-[14px] uppercase tracking-[0.2em] text-[#15846e]">
              Katalog Layanan
            </span>
            <h2 className="text-[36px] md:text-[48px] font-normal tracking-[-0.04em]">
              Dirancang khusus untuk kebutuhan mahasiswa IT.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[24px] font-normal tracking-[-0.02em]">
                  Joki Proyek Kuliah Berkelompok
                </h3>
                <span className="text-[14px] text-[#ffb829] font-mono tabular-nums">
                  Rp 50.000 / anggota
                </span>
              </div>
              <p className="text-[16px] text-[#9a9a9a] font-extralight leading-relaxed">
                Layanan utama kami. Solusi komprehensif dari ide aplikasi, koding full-stack, auto-commit terjadwal via akun GitHub masing-masing anggota kelompok, hingga panduan presentasi.
              </p>
              <div className="text-[14px] text-[#bdbdbd] flex flex-wrap gap-2 mt-2">
                <span className="px-3 py-1 rounded-full bg-white/5">Paket Full</span>
                <span className="px-3 py-1 rounded-full bg-white/5">Paket Koding Saja</span>
                <span className="px-3 py-1 rounded-full bg-white/5">Paket Ide & Blueprint</span>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[24px] font-normal tracking-[-0.02em]">
                  Makalah & Laporan Akademik
                </h3>
                <span className="text-[14px] text-[#9a9a9a] font-mono">
                  Sesuai format kampus
                </span>
              </div>
              <p className="text-[16px] text-[#9a9a9a] font-extralight leading-relaxed">
                Penyusunan laporan bab 1 hingga bab 5, perancangan diagram UML (Use Case, Activity, Sequence), ERD database, serta tinjauan pustaka jurnal terindeks.
              </p>
            </div>

            <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[24px] font-normal tracking-[-0.02em]">
                  Slide Presentasi (PPT)
                </h3>
                <span className="text-[14px] text-[#9a9a9a] font-mono">
                  Desain profesional
                </span>
              </div>
              <p className="text-[16px] text-[#9a9a9a] font-extralight leading-relaxed">
                Slide presentasi ringkas, estetis, dan terstruktur untuk demo proyek di hadapan dosen penguji. Tersedia sebagai layanan terpisah atau add-on dashboard.
              </p>
            </div>

            <div className="flex flex-col gap-4 border-t border-white/10 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[24px] font-normal tracking-[-0.02em]">
                  Tugas Ringan & Praktikum
                </h3>
                <span className="text-[14px] text-[#9a9a9a] font-mono">
                  Cepat & bergaransi
                </span>
              </div>
              <p className="text-[16px] text-[#9a9a9a] font-extralight leading-relaxed">
                Penyelesaian tugas mingguan algoritma, struktur data, basis data SQL, pembuatan query, perbaikan bug kodingan, dan modul praktikum lab.
              </p>
            </div>
          </div>
        </section>

        {/* PRICING TRANSPARENCY */}
        <section id="harga" className="flex flex-col gap-10 border-t border-white/10 pt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="text-[14px] uppercase tracking-[0.2em] text-[#ffb829]">
                Skema Biaya Transparan
              </span>
              <h2 className="text-[36px] md:text-[54px] font-normal tracking-[-0.04em] mt-2">
                N × Rp 50.000. Adil untuk semua anggota.
              </h2>
            </div>
            <Link
              href="/order"
              className="inline-flex items-center justify-center bg-[#8052ff] hover:bg-[#7042ef] text-[#ffffff] text-[14px] font-normal uppercase tracking-[0.025em] px-8 py-3 rounded-full transition-all duration-200 self-start md:self-auto"
            >
              Order Sekarang
            </Link>
          </div>

          <p className="text-[18px] text-[#9a9a9a] font-extralight max-w-3xl leading-relaxed">
            Tidak ada biaya tersembunyi. Jika kelompok beranggotakan 4 orang, total biaya cukup Rp 200.000. Tiap anggota kelompok mendapatkan grafik commit GitHub yang terdistribusi rapi untuk verifikasi dosen.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
