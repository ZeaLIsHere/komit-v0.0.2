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

      router.push(`/project/${data.project.id}/setup`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      setErrorMsg(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#040506] text-white min-h-screen flex flex-col selection:bg-[#ff6363]/30">
      <Navbar />

      <main className="flex-1 max-w-[800px] w-full mx-auto px-6 py-12 flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 text-[11px] font-mono text-[#ff6363] uppercase tracking-[0.05em]">
            Formulir Pemesanan
          </div>
          <h1 className="text-[32px] sm:text-[40px] font-normal tracking-[0.2px] text-white">
            Pesan Proyek & Layanan Kuliah
          </h1>
          <p className="text-[15px] text-[#9c9c9d] leading-relaxed">
            Pilih paket, tentukan jumlah anggota kelompok, dan konfirmasi pembayaran via QRIS statis.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-lg border border-red-500/30 bg-red-950/20 text-red-200 text-[13px] font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* 1. Pilih Kategori Layanan */}
          <div className="p-6 rounded-2xl bg-[#07080a] border border-[#363739] key-shadow flex flex-col gap-4">
            <span className="text-[12px] font-mono uppercase tracking-[0.05em] text-[#9c9c9d]">
              1. Kategori Layanan
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { id: 'project_joki', label: 'Joki Proyek Berkelompok', desc: 'Cicil commit GitHub tiap anggota' },
                { id: 'makalah', label: 'Makalah & Laporan', desc: 'Format kampus, UML & ERD' },
                { id: 'ppt', label: 'Slide Presentasi (PPT)', desc: 'Desain estetis untuk demo UAS' },
                { id: 'tugas_ringan', label: 'Tugas Koding Ringan', desc: 'Algoritma, SQL, praktikum lab' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setServiceType(item.id as ServiceType)}
                  className={`text-left p-3.5 rounded-lg border transition-all ${
                    serviceType === item.id
                      ? 'bg-[#111214] border-[#ff6363]/60 key-shadow-active text-white'
                      : 'bg-[#040506] border-[#1b1c1e] hover:border-[#363739] text-[#9c9c9d]'
                  }`}
                >
                  <div className="text-[14px] font-medium text-white">{item.label}</div>
                  <div className="text-[12px] text-[#6a6b6c] mt-0.5">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Pilih Paket (Khusus Proyek Berkelompok) */}
          {serviceType === 'project_joki' && (
            <div className="p-6 rounded-2xl bg-[#07080a] border border-[#363739] key-shadow flex flex-col gap-4">
              <span className="text-[12px] font-mono uppercase tracking-[0.05em] text-[#9c9c9d]">
                2. Paket Proyek
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'full',
                    label: 'Paket Full',
                    desc: 'Ide AI + Gimmick Dosen + Koding + Cicil Commit + Bahan README',
                    badge: 'Rekomendasi',
                  },
                  {
                    id: 'code_only',
                    label: 'Koding Saja',
                    desc: 'Ide dari kelompok Anda + Koding + Cicil Commit GitHub',
                  },
                  {
                    id: 'idea_only',
                    label: 'Ide & Blueprint',
                    desc: '3 Ide AI + Arsitektur sistem + Panduan koding mandiri',
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPackageType(item.id as PackageType)}
                    className={`text-left p-3.5 rounded-lg border flex flex-col justify-between transition-all ${
                      packageType === item.id
                        ? 'bg-[#111214] border-[#ff6363]/60 key-shadow-active text-white'
                        : 'bg-[#040506] border-[#1b1c1e] hover:border-[#363739] text-[#9c9c9d]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-medium text-white">{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] font-mono text-[#ff6363] bg-[#ff6363]/10 px-1.5 py-0.5 rounded-[4px] border border-[#ff6363]/30">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#6a6b6c] mt-2 leading-relaxed">
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
            <div className="p-6 rounded-2xl bg-[#07080a] border border-[#363739] key-shadow flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-mono uppercase tracking-[0.05em] text-[#9c9c9d]">
                  3. Jumlah Anggota Kelompok (1–8 Orang)
                </span>
                <span className="text-[16px] font-mono text-white bg-[#111214] border border-[#363739] px-2.5 py-0.5 rounded-md">
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
                className="w-full accent-[#e6e6e6] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-[#6a6b6c] font-mono">
                <span>1 org</span>
                <span>2 org</span>
                <span>4 org</span>
                <span>6 org</span>
                <span>8 org</span>
              </div>
            </div>
          )}

          {/* 4. Data Pemesan */}
          <div className="p-6 rounded-2xl bg-[#07080a] border border-[#363739] key-shadow flex flex-col gap-4">
            <span className="text-[12px] font-mono uppercase tracking-[0.05em] text-[#9c9c9d]">
              {serviceType === 'project_joki' ? '4. Data Ketua Kelompok' : '2. Data Pemesan'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] text-[#9c9c9d]">Nama Lengkap</span>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="bg-white/[0.05] border border-white/10 focus:border-white/30 rounded-lg px-3.5 py-2 text-[14px] text-white outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] text-[#9c9c9d]">Nomor WhatsApp</span>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={buyerWhatsapp}
                  onChange={(e) => setBuyerWhatsapp(e.target.value)}
                  className="bg-white/[0.05] border border-white/10 focus:border-white/30 rounded-lg px-3.5 py-2 text-[14px] text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* 5. Pembayaran QRIS */}
          <div className="p-6 rounded-2xl bg-[#07080a] border border-[#363739] key-shadow flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-mono uppercase tracking-[0.05em] text-[#9c9c9d]">
                {serviceType === 'project_joki' ? '5. Pembayaran QRIS Statis' : '3. Pembayaran QRIS'}
              </span>
              <div className="text-right">
                <span className="text-[11px] text-[#6a6b6c] block">Total Tagihan</span>
                <span className="text-[20px] font-medium text-white font-mono">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#040506] border border-[#1b1c1e] flex flex-col sm:flex-row items-center gap-6">
              <div className="w-[140px] h-[140px] bg-white rounded-lg p-2 flex flex-col items-center justify-center shrink-0">
                <div className="text-black text-center text-[9px] font-mono font-bold leading-tight">
                  <div className="text-[12px] tracking-wider mb-1">QRIS STATIS</div>
                  <div className="border-2 border-black p-1.5 my-1 text-[8px] uppercase">
                    KOMIT PLATFORM
                  </div>
                  <div>NMID: ID102938475</div>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-[13px] text-[#9c9c9d]">
                <p className="leading-relaxed">
                  Scan kode QRIS di samping menggunakan m-Banking atau e-Wallet pilihan Anda.
                </p>
                <p className="text-white">
                  Nominal transfer:{' '}
                  <span className="text-white font-mono font-medium">
                    Rp {totalPrice.toLocaleString('id-ID')}
                  </span>
                </p>
                <div className="mt-2 flex flex-col gap-1.5">
                  <span className="text-[11px] text-[#6a6b6c]">Link / URL Bukti Transfer</span>
                  <input
                    type="text"
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    placeholder="URL gambar bukti bayar"
                    className="bg-white/[0.05] border border-white/10 focus:border-white/30 rounded-lg px-3 py-1.5 text-[13px] text-white outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <Link href="/" className="text-[13px] text-[#9c9c9d] hover:text-white transition-colors">
              ← Kembali ke Beranda
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center bg-[#e6e6e6] hover:bg-white disabled:opacity-50 text-[#454647] text-[13px] font-medium rounded-lg px-6 py-2.5 transition-all shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
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
