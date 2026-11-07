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
  const [proofUrl, setProofUrl] = useState<string>('');
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle image upload from file picker with 5MB validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Ukuran file maksimal 5 MB');
        return;
      }
      setErrorMsg(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProofPreview(result);
        setProofUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick fill for testing
  const handleQuickDemoFill = () => {
    setBuyerName('Fadhil Pratama');
    setBuyerWhatsapp('081234567890');
    setProofUrl('/dummy-qris-proof.jpg');
    setProofPreview('/dummy-qris-proof.jpg');
  };

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

      router.push(`/project/${data.project.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
      setErrorMsg(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] text-[#ededed] min-h-screen flex flex-col selection:bg-[#6b62f2]/30 selection:text-white font-sans">
      <Navbar />

      <main className="flex-1 max-w-[960px] w-full mx-auto px-6 sm:px-12 py-16 flex flex-col gap-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-[36px] sm:text-[44px] font-medium leading-[1.1] text-white tracking-[-0.03em]">
            Pesan Layanan & Proyek Kuliah
          </h1>
          <p className="text-[15px] text-[#c2c2c2] leading-[1.5]">
            Tentukan konfigurasi paket, kuota anggota kelompok, dan konfirmasi bukti bayar QRIS statis.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-[10px] border border-red-500/30 bg-red-950/20 text-red-200 text-[13px] font-mono">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {/* 1. Pilih Kategori Layanan */}
          <div className="p-8 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col gap-4">
            <h2 className="text-[18px] font-medium text-white">
              Kategori Layanan
            </h2>
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
                  className={`text-left p-4 rounded-[10px] border transition-all ${
                    serviceType === item.id
                      ? 'bg-[#1f1f1f] border-white text-white'
                      : 'bg-[#0a0a0a] border-[#e5e5e5]/10 hover:border-[#e5e5e5]/25 text-[#c2c2c2]'
                  }`}
                >
                  <div className="text-[15px] font-medium text-white">{item.label}</div>
                  <div className="text-[12px] text-[#c2c2c2] mt-1">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Pilih Paket (Khusus Proyek Berkelompok) */}
          {serviceType === 'project_joki' && (
            <div className="p-8 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col gap-4">
              <h2 className="text-[18px] font-medium text-white">
                Paket Proyek
              </h2>
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
                    className={`text-left p-4 rounded-[10px] border flex flex-col justify-between transition-all ${
                      packageType === item.id
                        ? 'bg-[#1f1f1f] border-white text-white'
                        : 'bg-[#0a0a0a] border-[#e5e5e5]/10 hover:border-[#e5e5e5]/25 text-[#c2c2c2]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[15px] font-medium text-white">{item.label}</span>
                        {item.badge && (
                          <span className="text-[10px] text-[#161616] bg-white px-2 py-0.5 rounded-full font-medium">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] text-[#c2c2c2] mt-2 leading-relaxed">
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
            <div className="p-8 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-medium text-white">
                  Jumlah Anggota Kelompok
                </h2>
                <span className="text-[20px] font-medium text-white font-mono">
                  {memberCount} Orang
                </span>
              </div>

              {/* Slider Track with Exact Value Synchronization */}
              <div className="relative flex flex-col gap-3 py-1">
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={memberCount}
                  onChange={(e) => setMemberCount(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer relative z-10"
                />

                {/* Synchronized Exact Position Ticks (1 to 8) */}
                <div className="relative w-full h-5 text-[11px] font-mono text-[#c2c2c2]">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                    const percent = ((num - 1) / 7) * 100;
                    const isActive = memberCount === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setMemberCount(num)}
                        style={{ left: `${percent}%` }}
                        className={`absolute -translate-x-1/2 transition-all ${
                          isActive
                            ? 'text-white font-bold text-[12px]'
                            : 'text-[#686868] hover:text-white'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 4. Data Pemesan */}
          <div className="p-8 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col gap-4">
            <h2 className="text-[18px] font-medium text-white">
              {serviceType === 'project_joki' ? 'Data Ketua Kelompok' : 'Data Pemesan'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] text-[#c2c2c2]">Nama Lengkap</span>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  className="bg-[#0a0a0a] border border-[#e5e5e5]/15 focus:border-white rounded-[10px] px-4 py-2.5 text-[14px] text-white outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] text-[#c2c2c2]">Nomor WhatsApp</span>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={buyerWhatsapp}
                  onChange={(e) => setBuyerWhatsapp(e.target.value)}
                  className="bg-[#0a0a0a] border border-[#e5e5e5]/15 focus:border-white rounded-[10px] px-4 py-2.5 text-[14px] text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* 5. Pembayaran QRIS Statis */}
          <div className="p-8 rounded-[24px] bg-[#161616]/75 backdrop-blur-md border border-[#e5e5e5]/10 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-medium text-white">
                Pembayaran QRIS
              </h2>
              <div className="text-right">
                <span className="text-[11px] text-[#c2c2c2] uppercase tracking-[0.08em] block">Total Tagihan</span>
                <span className="text-[26px] font-medium text-white font-mono leading-none">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="p-6 rounded-[16px] bg-[#0a0a0a] border border-[#e5e5e5]/10 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-[140px] h-[140px] bg-white rounded-[10px] p-2 flex flex-col items-center justify-center shrink-0">
                <div className="text-black text-center text-[9px] font-mono font-bold leading-tight">
                  <div className="text-[12px] tracking-wider mb-1">QRIS STATIS</div>
                  <div className="border-2 border-black p-1.5 my-1 text-[8px] uppercase">
                    KOMIT PLATFORM
                  </div>
                  <div>NMID: ID102938475</div>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-[14px] text-[#c2c2c2]">
                <p className="leading-[1.5]">
                  Scan kode QRIS di samping menggunakan m-Banking atau e-Wallet Anda.
                </p>
                <p className="text-white">
                  Nominal transfer tepat:{' '}
                  <span className="text-white font-mono font-medium">
                    Rp {totalPrice.toLocaleString('id-ID')}
                  </span>
                </p>
                <div className="mt-3 flex flex-col gap-2">
                  <span className="text-[12px] text-white">Upload Bukti Transfer (Screenshot/Foto)</span>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label className="cursor-pointer bg-[#161616] hover:bg-[#1f1f1f] border border-[#e5e5e5]/15 hover:border-white px-4 py-2 rounded-full text-[13px] text-white flex items-center gap-2 transition-all">
                      <span>📁 Pilih Gambar Bukti</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleQuickDemoFill}
                      className="text-[12px] text-white/80 hover:text-white underline"
                    >
                      ⚡ Isi Data Cepat untuk Testing
                    </button>
                  </div>

                  {proofPreview && (
                    <div className="mt-2 flex items-center gap-3 p-2 bg-[#161616] rounded-[10px] border border-[#e5e5e5]/10">
                      <span className="text-[11px] text-white font-medium">✓ Bukti bayar terlampir</span>
                      <span className="text-[11px] text-[#c2c2c2] truncate max-w-xs">{proofUrl.slice(0, 32)}...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-4">
            <Link href="/" className="text-[13px] text-[#c2c2c2] hover:text-white transition-colors">
              ← Kembali ke Beranda
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-white-pill text-[14px] px-8 py-3.5 rounded-full"
            >
              {isSubmitting ? 'Memproses...' : 'Kirim Pesanan & Bukti Bayar'}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
