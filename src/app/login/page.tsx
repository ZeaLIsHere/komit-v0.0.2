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

  const [githubUsername, setGithubUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="w-full max-w-[460px] mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <h1 className="text-[32px] sm:text-[40px] font-medium leading-[1.1] text-white tracking-[-0.03em]">
          Masuk ke Komit
        </h1>
        <p className="text-[14px] text-[#c2c2c2] leading-[1.5]">
          Gunakan username akun GitHub Anda untuk langsung masuk dan mengelola proyek.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-3.5 rounded-[12px] border border-red-500/40 bg-red-950/30 text-red-200 text-[13px]">
          {error}
        </div>
      )}

      {/* GitHub Login Card */}
      <div className="p-8 rounded-[24px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-6">
        <form onSubmit={handleGitHubSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] uppercase tracking-[0.08em] text-white/70 font-medium">
              Username GitHub
            </label>
            <input
              type="text"
              required
              autoFocus
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/15 focus:border-white rounded-[10px] px-4 py-3 text-[14px] font-mono text-white outline-none transition-colors"
            />
            <p className="text-[12px] text-white/60 leading-relaxed">
              Profil dan nama akun akan langsung diverifikasi ke GitHub API.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-white-pill text-[14px] py-3.5 rounded-full w-full justify-center transition-all flex items-center gap-2 mt-1"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            {loading ? 'Memverifikasi...' : 'Masuk dengan Akun GitHub ↗'}
          </button>
        </form>
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
