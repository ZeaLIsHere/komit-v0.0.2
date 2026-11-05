import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroConstellation from '@/components/HeroConstellation';

export default function HomePage() {
  return (
    <div className="bg-[#040506] text-white min-h-screen flex flex-col selection:bg-[#ff6363]/30">
      <Navbar />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-12 md:py-20 flex flex-col gap-24 md:gap-32">
        {/* HERO SECTION */}
        <section className="flex flex-col items-center text-center gap-8 pt-6">
          {/* Eyebrow badge tag */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[6px] bg-[#1b1c1e] border border-[#363739] text-[11px] font-mono tracking-[0.05em] text-[#9c9c9d]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6363]" />
            KOMIT PRODUCTIZED SERVICE
          </div>

          <div className="max-w-3xl flex flex-col gap-4">
            {/* Signature Raycast 56px Inter 400 headline with subtle positive tracking */}
            <h1 className="text-[38px] sm:text-[56px] leading-[1.15] font-normal tracking-[0.22px] text-white">
              Proyek kuliah kelompok selesai. Commit natural di mata dosen.
            </h1>
            <p className="text-[16px] text-[#9c9c9d] font-normal leading-relaxed max-w-xl mx-auto">
              Cicil commit GitHub terjadwal menggunakan akun asli masing-masing anggota kelompok hingga UAS. Lengkap dengan rekomendasi ide AI dan bahan presentasi.
            </p>
          </div>

          {/* Action Button Group: Neutral Filled Button (Mist #e6e6e6 / Iron #454647) */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/order"
              className="inline-flex items-center justify-center bg-[#e6e6e6] hover:bg-white text-[#454647] text-[13px] font-medium rounded-lg px-5 py-2.5 transition-all shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
            >
              Mulai Pesan Proyek
            </Link>
            <Link
              href="/project/demo-proyek-uas"
              className="inline-flex items-center justify-center bg-[#111214] hover:bg-[#1b1c1e] text-[#9c9c9d] hover:text-white border border-[#363739] text-[13px] font-medium rounded-lg px-5 py-2.5 transition-all"
            >
              Buka Demo Dashboard
            </Link>
          </div>

          {/* Monospace Metadata Sub-strip */}
          <div className="text-[12px] font-mono text-[#6a6b6c] tracking-[0.017em]">
            v2.104 <span className="mx-1.5 text-[#2f3031]">|</span> N × Rp 50.000 <span className="mx-1.5 text-[#2f3031]">|</span> GitHub OAuth Scope: repo, workflow
          </div>

          {/* Hero Atmospheric Visualizer & Command Center */}
          <div className="w-full mt-4">
            <HeroConstellation />
          </div>
        </section>

        {/* SECTION 2: CARA KERJA (FEATURE CARDS WITH KEY SHADOW) */}
        <section id="cara-kerja" className="flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.05em] text-[#ff6363]">
              Workflow Otomatisasi
            </span>
            <h2 className="text-[28px] sm:text-[32px] font-normal text-white tracking-normal">
              Satu alur terstruktur dari pembayaran hingga demo UAS.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                step: '01',
                title: 'Order & Pembayaran QRIS',
                desc: 'Pilih paket, atur jumlah anggota (1–8 orang), dan bayar biaya transparan via QRIS statis.',
                icon: '💳',
              },
              {
                step: '02',
                title: 'Ide AI & Gimmick Dosen',
                desc: 'Input topik kuliah, AI menyajikan 3 ide berdaya saing dengan fitur gimmick pemikat nilai dosen.',
                icon: '⚡',
              },
              {
                step: '03',
                title: 'Connect GitHub Anggota',
                desc: 'Bagikan link unik ke kelompok. Masing-masing anggota menghubungkan akun GitHub via OAuth aman.',
                icon: '🔗',
              },
              {
                step: '04',
                title: 'Cicil Commit & README',
                desc: 'Kode di-push bertahap mingguan atas nama akun masing-masing. Dilengkapi bahan presentasi siap pakai.',
                icon: '🚀',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="p-6 rounded-2xl bg-[#07080a] border border-[#363739] key-shadow flex flex-col justify-between gap-6"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full bg-[#111214] border border-[#1b1c1e] flex items-center justify-center text-[16px]">
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-mono text-[#6a6b6c]">{item.step}</span>
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-[17px] font-medium text-white">{item.title}</h3>
                  <p className="text-[14px] text-[#9c9c9d] font-normal leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: KATALOG LAYANAN */}
        <section id="layanan" className="flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.05em] text-[#ff6363]">
              Pilihan Layanan
            </span>
            <h2 className="text-[28px] sm:text-[32px] font-normal text-white">
              Katalog pengerjaan tugas & proyek IT.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-[#07080a] border border-[#363739] key-shadow flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[20px] font-medium text-white">
                    Joki Proyek Kuliah Berkelompok
                  </h3>
                  <span className="text-[12px] font-mono text-[#e6e6e6] bg-[#1b1c1e] px-2.5 py-1 rounded-[6px] border border-[#363739]">
                    N × Rp 50.000
                  </span>
                </div>
                <p className="text-[14px] text-[#9c9c9d] leading-relaxed">
                  Layanan utama kami: pengerjaan koding fullstack, auto-commit terjadwal berkala atas nama akun GitHub anggota kelompok, integrasi branch, dan bahan presentasi UAS.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-[12px] font-mono text-[#9c9c9d]">
                <span className="px-2.5 py-1 rounded-md bg-[#111214] border border-[#1b1c1e]">Paket Full</span>
                <span className="px-2.5 py-1 rounded-md bg-[#111214] border border-[#1b1c1e]">Koding Saja</span>
                <span className="px-2.5 py-1 rounded-md bg-[#111214] border border-[#1b1c1e]">Ide & Blueprint</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#07080a] border border-[#363739] key-shadow flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[20px] font-medium text-white">
                    Makalah & Laporan Akademik
                  </h3>
                  <span className="text-[12px] font-mono text-[#6a6b6c] bg-[#111214] px-2.5 py-1 rounded-[6px]">
                    Format Kampus
                  </span>
                </div>
                <p className="text-[14px] text-[#9c9c9d] leading-relaxed">
                  Penyusunan dokumen teknis bab 1 hingga bab 5, diagram UML lengkap (Use Case, Sequence, Activity), relasi ERD database, dan referensi jurnal terakreditasi.
                </p>
              </div>

              <div className="text-[12px] text-[#6a6b6c] font-mono">
                Revisi sampai disetujui dosen pembimbing
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#07080a] border border-[#363739] key-shadow flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[20px] font-medium text-white">
                    Slide Presentasi (PPT)
                  </h3>
                  <span className="text-[12px] font-mono text-[#6a6b6c] bg-[#111214] px-2.5 py-1 rounded-[6px]">
                    Add-on / Standalone
                  </span>
                </div>
                <p className="text-[14px] text-[#9c9c9d] leading-relaxed">
                  Slide presentasi PPTX & PDF ringkas, estetis, dan profesional untuk demo proyek di hadapan dosen penguji tanpa rasa cemas.
                </p>
              </div>

              <div className="text-[12px] text-[#6a6b6c] font-mono">
                Tersedia sebagai opsi add-on dashboard
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#07080a] border border-[#363739] key-shadow flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[20px] font-medium text-white">
                    Tugas Praktikum & Koding Harian
                  </h3>
                  <span className="text-[12px] font-mono text-[#6a6b6c] bg-[#111214] px-2.5 py-1 rounded-[6px]">
                    Cepat & Tepat
                  </span>
                </div>
                <p className="text-[14px] text-[#9c9c9d] leading-relaxed">
                  Penyelesaian modul praktikum lab, query SQL kompleks, algoritma & struktur data, serta debugging script koding mingguan.
                </p>
              </div>

              <div className="text-[12px] text-[#6a6b6c] font-mono">
                Garansi nilai & penjelasan baris kode
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: HARGA TRANSPARAN */}
        <section id="harga" className="p-8 sm:p-12 rounded-2xl bg-[#07080a] border border-[#363739] key-shadow flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex flex-col gap-2 max-w-xl">
            <span className="text-[11px] font-mono uppercase tracking-[0.05em] text-[#ff6363]">
              Formula Biaya Transparan
            </span>
            <h2 className="text-[28px] sm:text-[36px] font-normal text-white">
              N × Rp 50.000 per anggota.
            </h2>
            <p className="text-[14px] text-[#9c9c9d] leading-relaxed">
              Biaya dibagi rata sejumlah anggota kelompok. Jika kelompok Anda beranggotakan 4 orang, total tagihan adalah Rp 200.000. Tiap anggota mendapatkan kontribusi commit di repository GitHub.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
            <Link
              href="/order"
              className="inline-flex items-center justify-center bg-[#e6e6e6] hover:bg-white text-[#454647] text-[13px] font-medium rounded-lg px-6 py-3 transition-all shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
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
