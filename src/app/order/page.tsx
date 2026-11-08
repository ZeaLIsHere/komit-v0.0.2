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
  const [members, setMembers] = useState<Array<{ name: string; github_username: string }>>([
    { name: '', github_username: '' },
    { name: '', github_username: '' },
    { name: '', github_username: '' },
    { name: '', github_username: '' },
  ]);
  const [buyerName, setBuyerName] = useState<string>('');
  const [buyerWhatsapp, setBuyerWhatsapp] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: string; githubUsername?: string } | null>(null);
  const [proofUrl, setProofUrl] = useState<string>('');
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [githubStatus, setGithubStatus] = useState<{ [index: number]: 'idle' | 'checking' | 'valid' | 'invalid' | 'empty' | 'duplicate' }>({});
  const [githubProfiles, setGithubProfiles] = useState<{
    [index: number]: {
      username: string;
      name: string;
      avatar_url: string;
      html_url: string;
    } | null;
  }>({});
  const [githubEmail, setGithubEmail] = useState<string>('');
  const [githubPassword, setGithubPassword] = useState<string>('');
  const [showGithubPassword, setShowGithubPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-fill from active customer session
  React.useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCurrentUser(data.user);
            const initialName = data.user.name || '';
            if (initialName) setBuyerName(initialName);
            if (data.user.whatsapp) setBuyerWhatsapp(data.user.whatsapp);
            setMembers((prev) => {
              const copy = [...prev];
              if (copy.length > 0) {
                const gh = copy[0].github_username || data.user.githubUsername || '';
                copy[0] = {
                  name: copy[0].name || initialName,
                  github_username: gh,
                };
                if (gh) {
                  checkGitHubAccount(0, gh);
                }
              }
              return copy;
            });
          }
        }
      } catch {
        // Fallback
      }
    }
    loadUser();
  }, []);

  // Validate GitHub username existence
  const checkGitHubAccount = async (index: number, username: string) => {
    const clean = username.trim().replace(/^@/, '');
    if (!clean) {
      setGithubStatus((prev) => ({ ...prev, [index]: 'empty' }));
      setGithubProfiles((prev) => ({ ...prev, [index]: null }));
      return;
    }

    // Check duplicate username with other members
    const isDuplicate = members.some(
      (m, i) => i !== index && m.github_username.trim().replace(/^@/, '').toLowerCase() === clean.toLowerCase()
    );
    if (isDuplicate) {
      setGithubStatus((prev) => ({ ...prev, [index]: 'duplicate' }));
      setGithubProfiles((prev) => ({ ...prev, [index]: null }));
      setErrorMsg(`Akun GitHub @${clean} sudah diinput untuk anggota lain.`);
      return;
    }

    setGithubStatus((prev) => ({ ...prev, [index]: 'checking' }));
    try {
      const res = await fetch(`/api/auth/github/check?username=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (data.exists) {
        setGithubStatus((prev) => ({ ...prev, [index]: 'valid' }));
        setGithubProfiles((prev) => ({
          ...prev,
          [index]: {
            username: data.username,
            name: data.name || data.username,
            avatar_url: data.avatar_url,
            html_url: data.html_url,
          },
        }));
      } else {
        setGithubStatus((prev) => ({ ...prev, [index]: 'invalid' }));
        setGithubProfiles((prev) => ({ ...prev, [index]: null }));
      }
    } catch {
      setGithubStatus((prev) => ({ ...prev, [index]: 'invalid' }));
      setGithubProfiles((prev) => ({ ...prev, [index]: null }));
    }
  };

  // Dynamic member resize based on count (1-8)
  const handleMemberCountChange = (newCount: number) => {
    const validCount = Math.max(1, Math.min(8, newCount));
    setMemberCount(validCount);
    setMembers((prev) => {
      if (validCount > prev.length) {
        const added = Array.from({ length: validCount - prev.length }, () => ({
          name: '',
          github_username: '',
        }));
        return [...prev, ...added];
      }
      return prev.slice(0, validCount);
    });
  };

  const handleMemberChange = (index: number, field: 'name' | 'github_username', value: string) => {
    setMembers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
    if (index === 0 && field === 'name') {
      setBuyerName(value);
    }
    if (field === 'github_username') {
      setGithubStatus((prev) => ({ ...prev, [index]: 'idle' }));
    }
  };

  const handleBuyerNameChange = (val: string) => {
    setBuyerName(val);
    setMembers((prev) => {
      if (prev.length === 0) return [{ name: val, github_username: '' }];
      const copy = [...prev];
      copy[0] = { ...copy[0], name: val };
      return copy;
    });
  };

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

  // Quick attach test proof for local dev
  const handleQuickDemoFill = () => {
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
      alert('Tolong lengkapi nama pemesan dan nomor WhatsApp terlebih dahulu!');
      return;
    }

    if (!proofUrl || !proofUrl.trim()) {
      alert('Tolong berikan bukti pembayaran terlebih dahulu sebelum melanjutkan!');
      setErrorMsg('Bukti pembayaran QRIS wajib dilampirkan sebelum mengirim pesanan.');
      return;
    }

    // Validasi data setiap anggota & akun GitHub
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name.trim()) {
        setErrorMsg(`Nama untuk Anggota ${i + 1} belum diisi!`);
        alert(`Tolong isi nama untuk Anggota ${i + 1} terlebih dahulu!`);
        return;
      }
      if (!m.github_username.trim()) {
        setGithubStatus((prev) => ({ ...prev, [i]: 'empty' }));
        setErrorMsg(`Akun GitHub untuk Anggota ${i + 1} belum diisi!`);
        alert(`Tolong isi akun GitHub untuk Anggota ${i + 1} terlebih dahulu!`);
        return;
      }
      if (githubStatus[i] === 'invalid') {
        setErrorMsg(`Akun GitHub untuk Anggota ${i + 1} (@${m.github_username}) tidak dapat ditemukan!`);
        alert(`Akun GitHub @${m.github_username} tidak dapat ditemukan di GitHub. Periksa kembali username!`);
        return;
      }
    }

    // Validasi akun GitHub tim joki
    if (!githubEmail.trim() || !githubPassword.trim()) {
      setErrorMsg('Email dan password akun GitHub wajib diisi agar operator joki dapat memulai pengerjaan!');
      alert('Tolong masukkan email dan password akun GitHub Anda untuk tim joki!');
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
          github_email: githubEmail.trim(),
          github_password: githubPassword.trim(),
          service_type: serviceType,
          package_type: packageType,
          member_count: memberCount,
          total_price: totalPrice,
          payment_proof_url: proofUrl,
          members: members,
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
    <div className="text-[#ededed] min-h-screen flex flex-col selection:bg-[#6b62f2]/30 selection:text-white font-sans">
      <Navbar />

      <main className="flex-1 max-w-[960px] w-full mx-auto px-6 sm:px-12 pt-24 pb-16 md:pt-28 flex flex-col gap-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-white/70 hover:text-white transition-colors self-start"
        >
          ← Kembali ke Beranda
        </Link>

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
          <div className="p-8 rounded-[14px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-4">
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
                      ? 'bg-white/[0.12] border-white text-white'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/25 text-white/80'
                  }`}
                >
                  <div className="text-[15px] font-medium text-white">{item.label}</div>
                  <div className="text-[12px] text-white/70 mt-1">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Pilih Paket (Khusus Proyek Berkelompok) */}
          {serviceType === 'project_joki' && (
            <div className="p-8 rounded-[14px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-4">
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
                        ? 'bg-white/[0.12] border-white text-white'
                        : 'bg-white/[0.03] border-white/10 hover:border-white/25 text-white/80'
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
                      <p className="text-[12px] text-white/70 mt-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Jumlah Anggota & Form Anggota Kelompok (Tersedia untuk semua kategori layanan) */}
          <div className="p-8 rounded-[14px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[18px] font-medium text-white">
                  Jumlah Anggota
                </h2>
                <p className="text-[12px] text-white/60">
                  {serviceType === 'project_joki'
                    ? 'Tentukan kuota anggota kelompok yang berkontribusi dalam repository.'
                    : `Tentukan jumlah anggota kelompok untuk pengerjaan ${serviceType.replace('_', ' ')}.`}
                </p>
              </div>
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
                onChange={(e) => handleMemberCountChange(Number(e.target.value))}
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
                      onClick={() => handleMemberCountChange(num)}
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

            {/* Dynamic Member Form: Changes count automatically (hanya nama & akun github) */}
            <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="text-[13px] uppercase tracking-[0.08em] text-white font-medium">
                  Form Anggota Kelompok ({memberCount} Orang)
                </span>
                <span className="text-[11px] text-white/60">
                  Verifikasi akun GitHub langsung otomatis
                </span>
              </div>

              <div className="flex flex-col gap-3 mt-1">
                {members.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-[10px] bg-white/[0.03] border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3"
                  >
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase tracking-[0.06em] text-white/70">
                        {idx === 0 ? 'Nama Ketua (Anda)' : `Nama Anggota ${idx + 1}`}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={idx === 0 ? 'Nama Ketua Kelompok' : `Nama Anggota ${idx + 1}`}
                        value={m.name}
                        onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                        className="bg-white/[0.04] border border-white/15 focus:border-white rounded-[10px] px-3.5 py-2.5 text-[14px] text-white outline-none transition-colors"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] uppercase tracking-[0.06em] text-white/70">
                        Akun GitHub
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="text"
                          required
                          placeholder="username GitHub"
                          value={m.github_username}
                          onChange={(e) => handleMemberChange(idx, 'github_username', e.target.value)}
                          onBlur={(e) => checkGitHubAccount(idx, e.target.value)}
                          className={`w-full bg-white/[0.04] border rounded-[10px] px-3.5 pr-12 py-2.5 text-[14px] font-mono text-white outline-none transition-colors ${
                            githubStatus[idx] === 'invalid'
                              ? 'border-red-500/80 focus:border-red-500 bg-red-950/20'
                              : githubStatus[idx] === 'empty'
                              ? 'border-yellow-500/80 focus:border-yellow-500 bg-yellow-950/20'
                              : githubStatus[idx] === 'valid'
                              ? 'border-[#59d499] focus:border-[#59d499]'
                              : 'border-white/15 focus:border-white'
                          }`}
                        />

                        {/* Status Icon on Right Side - Enlarged (w-6 h-6) */}
                        <div className="absolute right-3 flex items-center pointer-events-none">
                          {githubStatus[idx] === 'checking' && (
                            <div className="w-5 h-5 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
                          )}
                          {githubStatus[idx] === 'valid' && (
                            <svg className="w-6 h-6 text-[#59d499]" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                          {githubStatus[idx] === 'invalid' && (
                            <svg className="w-6 h-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>

                      {/* Notification messages */}
                      {githubStatus[idx] === 'invalid' && (
                        <span className="text-[12px] text-red-400 font-mono mt-1 flex items-center gap-1 font-medium">
                          <span>Akun @{m.github_username.trim().replace(/^@/, '')} tidak ditemukan di GitHub</span>
                        </span>
                      )}
                      {githubStatus[idx] === 'duplicate' && (
                        <span className="text-[12px] text-yellow-300 font-mono mt-1 flex items-center gap-1 font-medium">
                          <span>Username ini sudah diinput untuk anggota lain</span>
                        </span>
                      )}
                      {githubStatus[idx] === 'empty' && (
                        <span className="text-[12px] text-yellow-300 font-mono mt-1 flex items-center gap-1 font-medium">
                          <span>Akun GitHub belum diisi</span>
                        </span>
                      )}
                      {githubStatus[idx] === 'valid' && githubProfiles[idx] && (
                        <div className="mt-2 p-2 rounded-[8px] bg-white/[0.04] border border-[#59d499]/30 flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={githubProfiles[idx]!.avatar_url}
                              alt={githubProfiles[idx]!.username}
                              className="w-5 h-5 rounded-full border border-white/20 shrink-0"
                            />
                            <div className="flex items-center gap-1.5 truncate text-[11px] font-mono">
                              <span className="text-[#59d499] font-medium">✓ Terverifikasi:</span>
                              <span className="text-white truncate font-medium">{githubProfiles[idx]!.name}</span>
                              <span className="text-white/60">(@{githubProfiles[idx]!.username})</span>
                            </div>
                          </div>
                          <a
                            href={githubProfiles[idx]!.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-white/70 hover:text-white underline font-mono shrink-0"
                          >
                            Buka ↗
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Data Pemesan */}
          <div className="p-8 rounded-[14px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-4">
            <h2 className="text-[18px] font-medium text-white">
              {serviceType === 'project_joki' ? 'Data Ketua Kelompok' : 'Data Pemesan'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] text-white/70">Nama Lengkap</span>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={buyerName}
                  onChange={(e) => handleBuyerNameChange(e.target.value)}
                  className="bg-white/[0.04] border border-white/15 focus:border-white rounded-[10px] px-4 py-2.5 text-[14px] text-white outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] text-white/70">Nomor WhatsApp</span>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={buyerWhatsapp}
                  onChange={(e) => setBuyerWhatsapp(e.target.value)}
                  className="bg-white/[0.04] border border-white/15 focus:border-white rounded-[10px] px-4 py-2.5 text-[14px] text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* 5. Kredensial Akun GitHub untuk Tim Joki */}
          <div className="p-8 rounded-[14px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-[0.08em] text-white/60">
                  Setup Repository
                </span>
                <span className="text-[10px] text-[#59d499] font-mono px-2 py-0.5 rounded-full bg-[#59d499]/10 border border-[#59d499]/25">
                  Terkirim ke Admin
                </span>
              </div>
              <h2 className="text-[18px] font-medium text-white">
                Akun GitHub untuk Pengerjaan Proyek
              </h2>
              <p className="text-[13px] text-[#c2c2c2] leading-relaxed">
                Masukkan email atau username akun GitHub serta password Anda. Data ini akan diteruskan ke panel admin agar operator joki kami dapat langsung login, membuat repository, dan memproses cicil commit atas nama Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] text-white/70">Email / Username GitHub</span>
                <input
                  type="text"
                  required
                  placeholder="contoh: akun@gmail.com atau usergh"
                  value={githubEmail}
                  onChange={(e) => setGithubEmail(e.target.value)}
                  className="bg-white/[0.04] border border-white/15 focus:border-white rounded-[10px] px-4 py-2.5 text-[14px] text-white outline-none font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-white/70">Password Akun GitHub</span>
                  <button
                    type="button"
                    onClick={() => setShowGithubPassword(!showGithubPassword)}
                    className="text-[11px] text-white/60 hover:text-white"
                  >
                    {showGithubPassword ? 'Sembunyikan' : 'Lihat'}
                  </button>
                </div>
                <input
                  type={showGithubPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={githubPassword}
                  onChange={(e) => setGithubPassword(e.target.value)}
                  className="bg-white/[0.04] border border-white/15 focus:border-white rounded-[10px] px-4 py-2.5 text-[14px] text-white outline-none font-mono"
                />
              </div>
            </div>
            <p className="text-[11px] text-white/50 font-mono">
              Data hanya diteruskan secara aman ke operator joki untuk inisialisasi git repository proyek.
            </p>
          </div>

          {/* 6. Pembayaran QRIS Statis */}
          <div className="p-8 rounded-[14px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[18px] font-medium text-white">
                Pembayaran QRIS
              </h2>
              <div className="text-right">
                <span className="text-[11px] text-white/70 uppercase tracking-[0.08em] block">Total Tagihan</span>
                <span className="text-[26px] font-medium text-white font-mono leading-none">
                  Rp {totalPrice.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <div className="p-6 rounded-[10px] bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-center gap-6">
              <div className="w-[140px] h-[140px] bg-white rounded-[10px] p-2 flex flex-col items-center justify-center shrink-0">
                <div className="text-black text-center text-[9px] font-mono font-bold leading-tight">
                  <div className="text-[12px] tracking-wider mb-1">QRIS STATIS</div>
                  <div className="border-2 border-black p-1.5 my-1 text-[8px] uppercase">
                    KOMIT PLATFORM
                  </div>
                  <div>NMID: ID102938475</div>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-[14px] text-white/80">
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
                    <label className="cursor-pointer bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-white px-4 py-2 rounded-full text-[13px] text-white flex items-center gap-2 transition-all">
                      <svg className="w-4 h-4 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Pilih Gambar Bukti</span>
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
                      className="text-[12px] text-white/80 hover:text-white underline font-mono"
                    >
                      Lampirkan Gambar Contoh
                    </button>
                  </div>

                  {proofPreview && (
                    <div className="mt-2 flex items-center gap-2.5 p-2.5 bg-white/[0.06] rounded-[10px] border border-white/10">
                      <svg className="w-4 h-4 text-[#59d499] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-[11px] text-white font-medium">Bukti bayar terlampir</span>
                      <span className="text-[11px] text-white/70 truncate max-w-xs font-mono">{proofUrl.slice(0, 32)}...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end pt-4">
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
