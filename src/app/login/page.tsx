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
  const [customerAuthMethod, setCustomerAuthMethod] = useState<'github' | 'email'>('github');
  const [customerEmailMode, setCustomerEmailMode] = useState<'login' | 'register'>('login');

  // GitHub username login state
  const [githubUsername, setGithubUsername] = useState('');

  // Email login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Admin form state
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('role') === 'admin') {
      setActiveTab('admin');
    }
  }, [searchParams]);

  // Handle GitHub Login (Real GitHub API Verification)
  const handleGitHubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUsername.trim()) {
      setError('Masukkan username GitHub Anda');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/github/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: githubUsername.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal login dengan GitHub');
      }

      const target = redirectTarget || '/order';
      router.push(target);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
      setLoading(false);
    }
  };

  // Handle Customer Email Login
  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: 'customer' }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login gagal');
      }

      const target = redirectTarget || '/order';
      router.push(target);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
      setLoading(false);
    }
  };

  // Handle Customer Email Register
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

  // Handle Admin Login
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminIdentifier,
          password: adminPassword,
          role: 'admin',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login admin gagal');
      }

      const target = redirectTarget || '/admin';
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
            ? 'Masuk terlebih dahulu untuk melanjutkan pemesanan proyek.'
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
          {/* Method Sub-tabs: GitHub vs Email */}
          <div className="flex items-center gap-2 p-1 bg-[#011d1c] rounded-[6px] border border-[#003734]">
            <button
              type="button"
              onClick={() => {
                setCustomerAuthMethod('github');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-[4px] text-[12px] uppercase tracking-[0.06em] font-medium transition-all flex items-center justify-center gap-1.5 ${
                customerAuthMethod === 'github'
                  ? 'bg-[#003734] text-white'
                  : 'text-[#bbc7c6] hover:text-white'
              }`}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              GitHub Langsung
            </button>
            <button
              type="button"
              onClick={() => {
                setCustomerAuthMethod('email');
                setError(null);
              }}
              className={`flex-1 py-2 rounded-[4px] text-[12px] uppercase tracking-[0.06em] font-medium transition-all ${
                customerAuthMethod === 'email'
                  ? 'bg-[#003734] text-white'
                  : 'text-[#bbc7c6] hover:text-white'
              }`}
            >
              Email &amp; Sandi
            </button>
          </div>

          {/* GitHub Flow */}
          {customerAuthMethod === 'github' && (
            <form onSubmit={handleGitHubSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] uppercase tracking-[0.08em] text-[#edfffe]">
                  Username GitHub Anda
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-[#bbc7c6] font-mono text-[14px]">@</span>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    placeholder="ZeaLIsHere"
                    className="w-full bg-[#011d1c] border border-[#003734] focus:border-[#cbfffc] rounded-[6px] pl-8 pr-4 py-3 text-[14px] font-mono text-white outline-none transition-colors"
                  />
                </div>
                <p className="text-[12px] text-[#bbc7c6] leading-relaxed">
                  Masukkan handle GitHub asli Anda. Profil dan nama akun akan langsung diverifikasi ke GitHub API.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-aurora text-[14px] px-6 py-3.5 rounded-[6px] transition-all flex items-center justify-center gap-2 mt-2"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                {loading ? 'Memverifikasi...' : 'Masuk dengan Akun GitHub ↗'}
              </button>
            </form>
          )}

          {/* Email Flow */}
          {customerAuthMethod === 'email' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 border-b border-[#012624] pb-3">
                <button
                  type="button"
                  onClick={() => {
                    setCustomerEmailMode('login');
                    setError(null);
                  }}
                  className={`text-[13px] font-medium transition-colors ${
                    customerEmailMode === 'login'
                      ? 'text-white border-b-2 border-[#cbfffc] pb-1'
                      : 'text-[#bbc7c6]'
                  }`}
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerEmailMode('register');
                    setError(null);
                  }}
                  className={`text-[13px] font-medium transition-colors ${
                    customerEmailMode === 'register'
                      ? 'text-white border-b-2 border-[#cbfffc] pb-1'
                      : 'text-[#bbc7c6]'
                  }`}
                >
                  Daftar Akun Baru
                </button>
              </div>

              {customerEmailMode === 'login' ? (
                <form onSubmit={handleEmailLoginSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] uppercase tracking-[0.08em] text-[#edfffe]">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@student.ac.id"
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
                    {loading ? 'Memproses...' : 'Masuk ↗'}
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
                      placeholder="Nama Anda"
                      className="bg-[#011d1c] border border-[#003734] focus:border-[#cbfffc] rounded-[6px] px-4 py-3 text-[14px] text-white outline-none transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] uppercase tracking-[0.08em] text-[#edfffe]">
                      Email
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="nama@student.ac.id"
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
                      placeholder="08xxxxxxxxxx"
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
            </div>
          )}
        </div>
      )}

      {/* Tab: Admin Form */}
      {activeTab === 'admin' && (
        <div className="p-8 rounded-[16px] bg-[#003734] flex flex-col gap-6">
          <div>
            <div className="text-[15px] font-medium text-white">Panel Tim Joki &amp; Admin</div>
            <div className="text-[12px] text-[#bbc7c6]">Akses verifikasi QRIS, auto-commit, &amp; upload PPT.</div>
          </div>

          <form onSubmit={handleAdminSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] uppercase tracking-[0.08em] text-[#edfffe]">
                Email / Username Admin
              </label>
              <input
                type="text"
                required
                value={adminIdentifier}
                onChange={(e) => setAdminIdentifier(e.target.value)}
                placeholder="admin"
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
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
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
