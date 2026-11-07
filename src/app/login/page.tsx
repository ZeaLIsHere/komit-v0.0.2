'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '';

  const [authMethod, setAuthMethod] = useState<'github' | 'email'>('github');
  const [emailMode, setEmailMode] = useState<'login' | 'register'>('login');

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

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  // Handle Email & Password Login (automatically detects admin vs user)
  const handleEmailLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login gagal');
      }

      // If admin, route to /admin by default unless a redirect was requested
      const target =
        data.user?.role === 'admin'
          ? redirectTarget || '/admin'
          : redirectTarget || '/order';

      router.push(target);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
      setLoading(false);
    }
  };

  // Handle Register (New User)
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
        <h1 className="text-[32px] sm:text-[40px] font-medium leading-[1.1] text-white tracking-[-0.03em]">
          Masuk ke Komit
        </h1>
        <p className="text-[14px] text-[#c2c2c2] leading-[1.5]">
          Masuk dengan akun GitHub atau email Anda untuk melanjutkan.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-[12px] border border-red-500/40 bg-red-950/30 text-red-200 text-[13px]">
          {error}
        </div>
      )}

      {/* Unified Form Container */}
      <div className="p-8 rounded-[24px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-6">
        {/* Method Sub-tabs: GitHub vs Email */}
        <div className="flex items-center gap-2 p-1 bg-white/[0.04] rounded-full border border-white/10">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('github');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-full text-[12px] uppercase tracking-[0.06em] font-medium transition-all flex items-center justify-center gap-1.5 ${
              authMethod === 'github'
                ? 'bg-white text-[#161616]'
                : 'text-white/60 hover:text-white'
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
              setAuthMethod('email');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-full text-[12px] uppercase tracking-[0.06em] font-medium transition-all ${
              authMethod === 'email'
                ? 'bg-white text-[#161616]'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Email &amp; Sandi
          </button>
        </div>

        {/* GitHub Flow */}
        {authMethod === 'github' && (
          <form onSubmit={handleGitHubSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] uppercase tracking-[0.08em] text-white/70 font-medium">
                Username GitHub Anda
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-white/50 font-mono text-[14px]">@</span>
                <input
                  type="text"
                  required
                  autoFocus
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="ZeaLIsHere"
                  className="w-full bg-white/[0.04] border border-white/15 focus:border-white rounded-[10px] pl-8 pr-4 py-3 text-[14px] font-mono text-white outline-none transition-colors"
                />
              </div>
              <p className="text-[12px] text-white/60 leading-relaxed">
                Masukkan handle GitHub asli Anda. Profil dan nama akun akan langsung diverifikasi ke GitHub API.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-white-pill text-[14px] py-3.5 rounded-full w-full justify-center transition-all flex items-center gap-2 mt-2"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              {loading ? 'Memverifikasi...' : 'Masuk dengan Akun GitHub ↗'}
            </button>
          </form>
        )}

        {/* Email Flow */}
        {authMethod === 'email' && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 border-b border-white/10 pb-3">
              <button
                type="button"
                onClick={() => {
                  setEmailMode('login');
                  setError(null);
                }}
                className={`text-[13px] font-medium transition-colors ${
                  emailMode === 'login'
                    ? 'text-white border-b-2 border-white pb-1'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmailMode('register');
                  setError(null);
                }}
                className={`text-[13px] font-medium transition-colors ${
                  emailMode === 'register'
                    ? 'text-white border-b-2 border-white pb-1'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                Daftar Akun Baru
              </button>
            </div>

            {emailMode === 'login' ? (
              <form onSubmit={handleEmailLoginSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] uppercase tracking-[0.08em] text-white/70 font-medium">
                    Email atau Username
                  </label>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@student.ac.id"
                    className="bg-white/[0.04] border border-white/15 focus:border-white rounded-[10px] px-4 py-3 text-[14px] text-white outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] uppercase tracking-[0.08em] text-white/70 font-medium">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white/[0.04] border border-white/15 focus:border-white rounded-[10px] px-4 py-3 text-[14px] text-white outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-white-pill text-[14px] py-3.5 rounded-full w-full justify-center transition-all mt-2"
                >
                  {loading ? 'Memproses...' : 'Masuk ↗'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] uppercase tracking-[0.08em] text-white/70 font-medium">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Nama Anda"
                    className="bg-white/[0.04] border border-white/15 focus:border-white rounded-[10px] px-4 py-3 text-[14px] text-white outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] uppercase tracking-[0.08em] text-white/70 font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="nama@student.ac.id"
                    className="bg-white/[0.04] border border-white/15 focus:border-white rounded-[10px] px-4 py-3 text-[14px] text-white outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] uppercase tracking-[0.08em] text-white/70 font-medium">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    value={regWhatsapp}
                    onChange={(e) => setRegWhatsapp(e.target.value)}
                    placeholder="08xxxxxxxxxx"
                    className="bg-white/[0.04] border border-white/15 focus:border-white rounded-[10px] px-4 py-3 text-[14px] text-white outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] uppercase tracking-[0.08em] text-white/70 font-medium">
                    Password (min. 6 karakter)
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white/[0.04] border border-white/15 focus:border-white rounded-[10px] px-4 py-3 text-[14px] text-white outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-white-pill text-[14px] py-3.5 rounded-full w-full justify-center transition-all mt-2"
                >
                  {loading ? 'Mendaftar...' : 'Daftar Akun Baru ↗'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Back to Home Link */}
      <Link
        href="/"
        className="text-[13px] text-[#c2c2c2] hover:text-white transition-colors text-center"
      >
        ← Kembali ke Beranda
      </Link>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="text-[#ededed] min-h-screen flex flex-col selection:bg-[#6b62f2]/30 selection:text-white font-sans">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <Suspense fallback={<div className="font-mono text-[14px] text-[#c2c2c2]">Memuat...</div>}>
          <LoginForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
