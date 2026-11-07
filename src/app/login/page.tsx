'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'admin' ? 'admin' : 'customer';
  const redirectTarget = searchParams.get('redirect') || '';

  const [activeTab, setActiveTab] = useState<'customer' | 'admin'>(initialRole);
  const [customerMode, setCustomerMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('role') === 'admin') {
      setActiveTab('admin');
    }
  }, [searchParams]);

  // Quick fill demo customer
  const handleDemoCustomer = () => {
    setActiveTab('customer');
    setCustomerMode('login');
    setEmail('fadhil@student.ac.id');
    setPassword('customer123');
    setError(null);
  };

  // Quick fill admin
  const handleDemoAdmin = () => {
    setActiveTab('admin');
    setEmail('admin@komit.id');
    setPassword('admin123');
    setError(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: activeTab }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login gagal');
      }

      const target =
        redirectTarget || (data.user.role === 'admin' ? '/admin' : '/order');
      router.push(target);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          whatsapp: regWhatsapp,
          password: regPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Pendaftaran gagal');
      }

      const target = redirectTarget || '/order';
      router.push(target);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <span className="text-[11px] uppercase tracking-[0.12em] text-[#cbfffc] font-mono">
          Autentikasi Pengguna &amp; Role
        </span>
        <h1 className="text-[32px] sm:text-[40px] font-medium leading-[1.0] text-white tracking-[-0.03em]">
          Masuk ke Komit
        </h1>
        <p className="text-[14px] text-[#bbc7c6] leading-[1.4]">
          {redirectTarget === '/order'
            ? 'Masuk atau buat akun terlebih dahulu untuk melanjutkan pemesanan proyek.'
            : 'Pilih role untuk mengakses fitur pesanan mahasiswa atau panel operator internal.'}
        </p>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-2 p-1.5 bg-[#011d1c] rounded-[8px] border border-[#003734]">
        <button
          type="button"
          onClick={() => {
            setActiveTab('customer');
            setError(null);
          }}
          className={`py-2.5 px-4 rounded-[6px] text-[13px] font-medium transition-all ${
            activeTab === 'customer'
              ? 'bg-[#003734] text-white shadow-sm'
              : 'text-[#bbc7c6] hover:text-white'
          }`}
        >
          🎓 Mahasiswa (Customer)
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('admin');
            setError(null);
          }}
          className={`py-2.5 px-4 rounded-[6px] text-[13px] font-medium transition-all ${
            activeTab === 'admin'
              ? 'bg-[#003734] text-white shadow-sm'
              : 'text-[#bbc7c6] hover:text-white'
          }`}
        >
          🛡️ Admin (Tim Joki)
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-[6px] border border-red-500/40 bg-red-950/30 text-red-200 text-[13px]">
          {error}
        </div>
      )}

      {/* Tab: Customer Form */}
      {activeTab === 'customer' && (
        <div className="p-8 rounded-[16px] bg-[#003734] flex flex-col gap-6">
          {/* Sub-toggle: Login vs Register */}
          <div className="flex items-center justify-between border-b border-[#012624] pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setCustomerMode('login');
                  setError(null);
                }}
                className={`text-[14px] font-medium transition-colors ${
                  customerMode === 'login' ? 'text-white border-b-2 border-[#cbfffc] pb-1' : 'text-[#bbc7c6]'
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomerMode('register');
                  setError(null);
                }}
                className={`text-[14px] font-medium transition-colors ${
                  customerMode === 'register' ? 'text-white border-b-2 border-[#cbfffc] pb-1' : 'text-[#bbc7c6]'
                }`}
              >
                Daftar Baru
              </button>
            </div>

            <button
              type="button"
              onClick={handleDemoCustomer}
              className="text-[11px] text-[#cbfffc] hover:underline"
            >
              ⚡ Auto-isi Demo
            </button>
          </div>

          {customerMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] uppercase tracking-[0.08em] text-[#edfffe]">
                  Email Mahasiswa
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="fadhil@student.ac.id"
                  className="bg-[#011d1c] border border-[#003734] focus:border-[#cbfffc] rounded-[6px] px-4 py-3 text-[14px] text-white outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] uppercase tracking-[0.08em] text-[#edfffe]">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-[#011d1c] border border-[#003734] focus:border-[#cbfffc] rounded-[6px] px-4 py-3 text-[14px] text-white outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-aurora text-[14px] px-6 py-3.5 rounded-[6px] transition-all mt-2"
              >
                {loading ? 'Memproses...' : 'Masuk sebagai Mahasiswa ↗'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] uppercase tracking-[0.08em] text-[#edfffe]">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Budi Santoso"
                  className="bg-[#011d1c] border border-[#003734] focus:border-[#cbfffc] rounded-[6px] px-4 py-3 text-[14px] text-white outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] uppercase tracking-[0.08em] text-[#edfffe]">
                  Email Kampus / Pribadi
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="budi@student.ac.id"
                  className="bg-[#011d1c] border border-[#003734] focus:border-[#cbfffc] rounded-[6px] px-4 py-3 text-[14px] text-white outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] uppercase tracking-[0.08em] text-[#edfffe]">
                  Nomor WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  value={regWhatsapp}
                  onChange={(e) => setRegWhatsapp(e.target.value)}
                  placeholder="081234567890"
                  className="bg-[#011d1c] border border-[#003734] focus:border-[#cbfffc] rounded-[6px] px-4 py-3 text-[14px] text-white outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] uppercase tracking-[0.08em] text-[#edfffe]">
                  Password (min. 6 karakter)
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-[#011d1c] border border-[#003734] focus:border-[#cbfffc] rounded-[6px] px-4 py-3 text-[14px] text-white outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-aurora text-[14px] px-6 py-3.5 rounded-[6px] transition-all mt-2"
              >
                {loading ? 'Mendaftar...' : 'Daftar Akun Baru ↗'}
              </button>
            </form>
          )}

          {/* Quick Credential Hint */}
          <div className="p-3 rounded-[6px] bg-[#011d1c] border border-[#003734] flex flex-col gap-1 text-[12px]">
            <span className="text-[#cbfffc] font-medium">Akun Demo Mahasiswa Tersedia:</span>
            <div className="text-[#bbc7c6] font-mono">
              Email: <span className="text-white">fadhil@student.ac.id</span> | Password: <span className="text-white">customer123</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Admin Form */}
      {activeTab === 'admin' && (
        <div className="p-8 rounded-[16px] bg-[#003734] flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-[#012624] pb-4">
            <div>
              <div className="text-[15px] font-medium text-white">Panel Tim Joki &amp; Admin</div>
              <div className="text-[12px] text-[#bbc7c6]">Akses verifikasi QRIS, auto-commit, &amp; upload PPT.</div>
            </div>
            <button
              type="button"
              onClick={handleDemoAdmin}
              className="text-[11px] text-[#cbfffc] hover:underline shrink-0"
            >
              ⚡ Auto-isi Admin
            </button>
          </div>

          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] uppercase tracking-[0.08em] text-[#edfffe]">
                Email / Username Admin
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@komit.id"
                className="bg-[#011d1c] border border-[#003734] focus:border-[#cbfffc] rounded-[6px] px-4 py-3 text-[14px] text-white outline-none transition-colors"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] uppercase tracking-[0.08em] text-[#edfffe]">
                Password Admin
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-[#011d1c] border border-[#003734] focus:border-[#cbfffc] rounded-[6px] px-4 py-3 text-[14px] text-white outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-aurora text-[14px] px-6 py-3.5 rounded-[6px] transition-all mt-2"
            >
              {loading ? 'Masuk...' : 'Masuk ke Panel Admin ↗'}
            </button>
          </form>

          {/* Admin Credential Hint */}
          <div className="p-3 rounded-[6px] bg-[#011d1c] border border-[#003734] flex flex-col gap-1 text-[12px]">
            <span className="text-[#cbfffc] font-medium">Akun Admin Bawaan (Default):</span>
            <div className="text-[#bbc7c6] font-mono">
              Email: <span className="text-white">admin@komit.id</span> | Password: <span className="text-white">admin123</span>
            </div>
          </div>
        </div>
      )}

      {/* Back to Home Link */}
      <Link
        href="/"
        className="text-[13px] uppercase tracking-[0.12em] text-[#bbc7c6] hover:text-white transition-colors text-center"
      >
        ← Kembali ke Beranda
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="bg-[#012624] text-[#bbc7c6] min-h-screen flex flex-col selection:bg-[#00827c] selection:text-white">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <Suspense fallback={<div className="font-mono text-[14px] text-[#bbc7c6]">Memuat...</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
