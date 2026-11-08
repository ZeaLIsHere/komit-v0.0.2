'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '';

  const [githubUsername, setGithubUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGitHub, setLoadingGitHub] = useState(false);
  const [showGithubInput, setShowGithubInput] = useState(false);

  // 1. Google / Gmail Login via Firebase
  const handleGoogleLogin = async () => {
    setLoadingGoogle(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user.email) {
        throw new Error('Akun Google tidak memiliki alamat email yang valid.');
      }

      // Kirim profil Google ke backend untuk sinkronisasi database & set session cookie
      const res = await fetch('/api/auth/firebase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          photoUrl: user.photoURL || '',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal menyinkronkan akun Google');
      }

      const target =
        data.user?.role === 'admin'
          ? redirectTarget || '/admin'
          : redirectTarget || '/my-projects';

      router.push(target);
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal login via Google';
      setError(msg);
      setLoadingGoogle(false);
    }
  };

  // 2. GitHub OAuth Direct Redirection
  const handleGitHubOAuthRedirect = () => {
    window.location.href = '/api/auth/github';
  };

  // 3. Alternative GitHub Username Instant Verification
  const handleGitHubUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUsername.trim()) {
      setError('Masukkan username GitHub Anda');
      return;
    }

    setLoadingGitHub(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/github/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: githubUsername.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal verifikasi akun GitHub');
      }

      const target =
        data.user?.role === 'admin'
          ? redirectTarget || '/admin'
          : redirectTarget || '/my-projects';

      router.push(target);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan sistem');
      setLoadingGitHub(false);
    }
  };

  return (
    <div className="w-full max-w-[460px] mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <h1 className="text-[32px] sm:text-[40px] font-medium leading-[1.1] text-white tracking-[-0.03em]">
          Masuk ke Komit
        </h1>
        <p className="text-[14px] text-white/70 leading-[1.5]">
          Pilih metode autentikasi menggunakan akun Gmail atau GitHub Anda.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-[12px] border border-red-500/40 bg-red-950/30 text-red-200 text-[13px]">
          {error}
        </div>
      )}

      {/* Auth Card */}
      <div className="p-8 sm:p-10 rounded-[28px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-5">
        {/* PILIHAN 1: GOOGLE (GMAIL VIA FIREBASE) */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loadingGoogle || loadingGitHub}
          className="btn-white-pill text-[14px] py-3.5 rounded-full w-full justify-center transition-all flex items-center gap-3 cursor-pointer shadow-[0_0_24px_rgba(255,255,255,0.15)] hover:scale-[1.01] active:scale-[0.99]"
        >
          {/* Google Icon SVG */}
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="text-[#161616] font-medium">
            {loadingGoogle ? 'Menghubungkan...' : 'Lanjutkan dengan Google (Gmail)'}
          </span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-1">
          <div className="h-[1px] flex-1 bg-white/10" />
          <span className="text-[12px] uppercase tracking-wider text-white/40 font-mono">
            Atau
          </span>
          <div className="h-[1px] flex-1 bg-white/10" />
        </div>

        {/* PILIHAN 2: GITHUB OAUTH */}
        <button
          type="button"
          onClick={handleGitHubOAuthRedirect}
          disabled={loadingGoogle || loadingGitHub}
          className="w-full py-3.5 px-6 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/15 hover:border-white/30 text-white text-[14px] font-medium transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          <span>Lanjutkan dengan GitHub</span>
        </button>

        {/* Option to enter GitHub Username manually */}
        <div className="pt-2 flex flex-col items-center">
          {!showGithubInput ? (
            <button
              type="button"
              onClick={() => setShowGithubInput(true)}
              className="text-[12px] text-white/50 hover:text-white transition-colors underline"
            >
              Atau masuk via username GitHub langsung
            </button>
          ) : (
            <form onSubmit={handleGitHubUsernameSubmit} className="w-full flex flex-col gap-3 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] uppercase tracking-[0.08em] text-white/60 font-mono">
                  Username GitHub
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="budi_dev"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                    className="flex-1 bg-white/[0.04] border border-white/15 focus:border-white rounded-[10px] px-3.5 py-2.5 text-[14px] font-mono text-white outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loadingGitHub}
                    className="btn-white-pill text-[13px] px-5 py-2.5 rounded-[10px]"
                  >
                    {loadingGitHub ? '...' : 'Masuk'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="text-[#ededed] min-h-screen flex flex-col selection:bg-[#6b62f2]/30 selection:text-white font-sans">
      <Navbar />
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 sm:px-12 pt-24 pb-16 md:pt-28 flex flex-col">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] text-white/70 hover:text-white transition-colors self-start mb-6"
        >
          ← Kembali ke Beranda
        </Link>
        <div className="flex-1 flex items-center justify-center">
          <Suspense fallback={<div className="font-mono text-[14px] text-[#c2c2c2]">Memuat...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
