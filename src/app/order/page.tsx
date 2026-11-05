'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ServiceType, PackageType } from '@/lib/types';

export default function OrderPage() {
  const router = useRouter();

  const [serviceType, setServiceType] = useState<ServiceType>('project_joki');
  const [packageType, setPackageType] = useState<PackageType>('full');
  const [memberCount, setMemberCount] = useState<number>(4);
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerWhatsapp, setBuyerWhatsapp] = useState<string>('');
  const [proofUrl, setProofUrl] = useState<string>('/dummy-qris-proof.jpg');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Price Calculation: N x Rp 50.000 for project_joki
  const calculateTotal = () => {
    if (serviceType === 'project_joki') {
      const base = memberCount * 50000;
      if (packageType === 'idea_only') return Math.max(50000, Math.round(base * 0.4));
      if (packageType === 'code_only') return Math.max(50000, Math.round(base * 0.85));
      return base;
    }
    if (serviceType === 'makalah') return 120000;
    if (serviceType === 'ppt') return 75000;
    if (serviceType === 'tugas_ringan') return 50000;
    return 100000;
  };

  const totalPrice = calculateTotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !buyerWhatsapp.trim()) {
      setErrorMsg('Nama pemesan dan nomor WhatsApp wajib diisi');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buyer_name: buyerName,
          buyer_whatsapp: buyerWhatsapp,
          service_type: serviceType,
          package_type: packageType,
          member_count: memberCount,
          total_price: totalPrice,
          payment_proof_url: proofUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat pesanan');
      }

      // Redirect to setup page for this project
      router.push(`/project/${data.project.id}/setup`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      setErrorMsg(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#000000] text-[#ffffff] min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[840px] w-full mx-auto px-6 py-12 flex flex-col gap-12">
        <div className="flex flex-col gap-2">
          <span className="text-[14px] uppercase tracking-[0.2em] text-[#ffb829]">
            Formulir Pemesanan
          </span>
          <h1 className="text-[36px] md:text-[48px] font-normal tracking-[-0.04em] text-[#ffffff]">
            Pesan Proyek & Layanan Kuliah
          </h1>
          <p className="text-[16px] text-[#9a9a9a] font-extralight leading-relaxed">
            Isi rincian kelompok dan unggah bukti transfer QRIS. Setelah diverifikasi, Anda dapat memilih ide AI dan menghubungkan akun GitHub anggota.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-200 text-[14px]">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          {/* 1. Pilih Kategori Layanan */}
          <div className="flex flex-col gap-3">
            <label className="text-[14px] uppercase tracking-[0.1em] text-[#bdbdbd]">
              1. Pilih Kategori Layanan
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'project_joki', label: 'Joki Proyek Berkelompok', desc: 'Cicil commit GitHub tiap anggota' },
                { id: 'makalah', label: 'Makalah & Laporan', desc: 'Format kampus, diagram UML & ERD' },
                { id: 'ppt', label: 'Slide Presentasi (PPT)', desc: 'Desain estetis untuk demo UAS' },
                { id: 'tugas_ringan', label: 'Tugas Koding Ringan', desc: 'Algoritma, SQL, praktikum mingguan' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setServiceType(item.id as ServiceType)}
                  className={`text-left p-4 rounded-2xl border transition-all ${
                    serviceType === item.id
                      ? 'border-[#8052ff] bg-[#8052ff]/10 text-[#ffffff]'
                      : 'border-white/10 hover:border-white/20 text-[#9a9a9a]'
                  }`}
                >
                  <div className="text-[16px] font-normal text-[#ffffff]">{item.label}</div>
                  <div className="text-[13px] font-extralight text-[#9a9a9a] mt-1">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Pilih Paket (Khusus Proyek Berkelompok) */}
          {serviceType === 'project_joki' && (
            <div className="flex flex-col gap-3">
              <label className="text-[14px] uppercase tracking-[0.1em] text-[#bdbdbd]">
                2. Pilih Paket Proyek
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'full',
                    label: 'Paket Full',
                    desc: 'Ide AI + Gimmick Dosen + Koding + Cicil Commit + Bahan Presentasi (README)',
                    badge: 'Rekomendasi',
                  },
                  {
                    id: 'code_only',
                    label: 'Koding Saja',
                    desc: 'Ide dari kelompok Anda + Koding + Cicil Commit GitHub per anggota',
                  },
                  {
                    id: 'idea_only',
                    label: 'Ide & Blueprint',
                    desc: '3 Rekomendasi Ide AI + Arsitektur sistem + Panduan koding mandiri',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPackageType(item.id as PackageType)}
                    className={`text-left p-4 rounded-2xl border flex flex-col justify-between transition-all ${
                      packageType === item.id
                        ? 'border-[#8052ff] bg-[#8052ff]/10 text-[#ffffff]'
                        : 'border-white/10 hover:border-white/20 text-[#9a9a9a]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[15px] font-normal text-[#ffffff]">{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] text-[#ffb829] uppercase tracking-wider border border-[#ffb829]/30 px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#9a9a9a] font-extralight mt-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Jumlah Anggota Kelompok */}
          {serviceType === 'project_joki' && (
            <div className="flex flex-col gap-3 border-t border-white/5 pt-6">
              <div className="flex items-center justify-between">
                <label className="text-[14px] uppercase tracking-[0.1em] text-[#bdbdbd]">
                  3. Jumlah Anggota Kelompok (1–8 Orang)
                </label>
                <span className="text-[18px] font-mono tabular-nums text-[#ffb829]">
                  {memberCount} Orang
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={memberCount}
                onChange={(e) => setMemberCount(Number(e.target.value))}
                className="w-full accent-[#8052ff] cursor-pointer"
              />
              <div className="flex justify-between text-[12px] text-[#9a9a9a] font-mono tabular-nums">
                <span>1 org</span>
                <span>2 org</span>
                <span>4 org</span>
                <span>6 org</span>
                <span>8 org</span>
              </div>
            </div>
          )}

          {/* 4. Data Pemesan */}
          <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
            <label className="text-[14px] uppercase tracking-[0.1em] text-[#bdbdbd]">
              {serviceType === 'project_joki' ? '4. Data Ketua Kelompok' : '2. Data Pemesan'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] text-[#9a9a9a]">Nama Lengkap</span>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="bg-black border border-white/15 focus:border-[#8052ff] rounded-xl px-4 py-3 text-[15px] text-[#ffffff] outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] text-[#9a9a9a]">Nomor WhatsApp Aktif</span>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={buyerWhatsapp}
                  onChange={(e) => setBuyerWhatsapp(e.target.value)}
                  className="bg-black border border-white/15 focus:border-[#8052ff] rounded-xl px-4 py-3 text-[15px] text-[#ffffff] outline-none"
                />
              </div>
            </div>
          </div>

          {/* 5. Pembayaran QRIS Statis */}
          <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
            <div className="flex items-center justify-between">
              <label className="text-[14px] uppercase tracking-[0.1em] text-[#bdbdbd]">
                {serviceType === 'project_joki' ? '5. Pembayaran QRIS Statis' : '3. Pembayaran QRIS'}
              </label>
              <div className="text-right">
                <span className="text-[12px] text-[#9a9a9a] block">Total Tagihan</span>
                <span className="text-[22px] font-normal text-[#ffb829] font-mono tabular-nums">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-[#060606] flex flex-col md:flex-row items-center gap-6">
              {/* QR Code SVG / Visualizer */}
              <div className="w-[160px] h-[160px] bg-white rounded-xl p-2 flex flex-col items-center justify-center shrink-0">
                <div className="text-black text-center text-[10px] font-mono font-bold leading-tight">
                  <div className="text-[13px] tracking-wider mb-1">QRIS STATIS</div>
                  <div className="border-4 border-black p-2 my-1 text-[9px] uppercase">
                    KOMIT PLATFORM
                  </div>
                  <div>NMID: ID102938475</div>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-[14px] text-[#9a9a9a]">
                <p className="font-extralight leading-relaxed">
                  Scan kode QRIS di samping menggunakan aplikasi m-Banking (BCA, Mandiri, BRI, BNI) atau e-Wallet (GoPay, OVO, Dana) Anda.
                </p>
                <p className="text-[#ffffff] font-normal">
                  Pastikan nominal transfer tepat <span className="text-[#ffb829] font-mono">Rp {totalPrice.toLocaleString('id-ID')}</span>.
                </p>
                <div className="mt-2 flex flex-col gap-1.5">
                  <span className="text-[13px] text-[#bdbdbd]">Upload / Link Bukti Transfer</span>
                  <input
                    type="text"
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    placeholder="URL gambar bukti bayar (cth: https://...)"
                    className="bg-black border border-white/15 focus:border-[#8052ff] rounded-xl px-4 py-2.5 text-[14px] text-[#ffffff] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between border-t border-white/10 pt-6">
            <Link href="/" className="text-[14px] text-[#9a9a9a] hover:text-[#ffffff] transition-colors">
              Kembali ke Beranda
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center bg-[#8052ff] hover:bg-[#7042ef] disabled:opacity-50 text-[#ffffff] text-[14px] font-normal uppercase tracking-[0.025em] px-8 py-3.5 rounded-full transition-all duration-200"
            >
              {isSubmitting ? 'Memproses Pesanan...' : 'Kirim Pesanan & Bukti Bayar'}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
