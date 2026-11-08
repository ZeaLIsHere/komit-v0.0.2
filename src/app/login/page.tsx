'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { auth, googleProvider, githubProvider } from '@/lib/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '';

  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Status states
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Helper terjemahan error Firebase ke bahasa Indonesia
  const parseFirebaseError = (err: unknown): string => {
    if (typeof err === 'object' && err !== null && 'code' in err) {
      const code = String((err as { code: unknown }).code);
      switch (code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          return 'Email atau password yang Anda masukkan salah.';
        case 'auth/email-already-in-use':
          return 'Alamat email ini sudah terdaftar. Silakan pilih mode Masuk.';
        case 'auth/weak-password':
          return 'Password terlalu lemah. Masukkan minimal 6 karakter.';
        case 'auth/invalid-email':
          return 'Format alamat email tidak valid.';
        case 'auth/popup-closed-by-user':
          return 'Jendela login Google ditutup sebelum selesai.';
        case 'auth/popup-blocked':
          return 'Popup diblokir browser. Izinkan popup untuk login dengan Google.';
        case 'auth/network-request-failed':
          return 'Koneksi internet bermasalah. Periksa jaringan Anda.';
        case 'auth/too-many-requests':
          return 'Terlalu banyak percobaan gagal. Silakan tunggu beberapa menit.';
        default:
          return (err as { message?: string }).message || 'Autentikasi gagal.';
      }
    }
    return err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
  };

  // Sinkronisasi user Firebase ke backend & session cookie
  const syncFirebaseUser = async (userPayload: { email: string; name?: string; photoUrl?: string }) => {
    const res = await fetch('/api/auth/firebase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userPayload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Gagal menyinkronkan profil ke database');
    }

    const target =
      data.user?.role === 'admin'
        ? redirectTarget || '/admin'
        : redirectTarget || '/my-projects';

    router.push(target);
    router.refresh();
  };

  // 1. LOGIN / DAFTAR DENGAN EMAIL & PASSWORD (FIREBASE)
  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (!email.trim() || !password.trim()) {
        throw new Error('Email dan password wajib diisi.');
      }

      if (isRegisterMode) {
        // Mode Daftar Baru
        const userCred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await syncFirebaseUser({
          email: userCred.user.email || email.trim(),
          name: name.trim() || email.split('@')[0],
          photoUrl: userCred.user.photoURL || '',
        });
      } else {
        // Mode Masuk
        const userCred = await signInWithEmailAndPassword(auth, email.trim(), password);
        await syncFirebaseUser({
          email: userCred.user.email || email.trim(),
          name: userCred.user.displayName || email.split('@')[0],
          photoUrl: userCred.user.photoURL || '',
        });
      }
    } catch (err: unknown) {
      setError(parseFirebaseError(err));
      setLoading(false);
    }
  };

  // 2. LOGIN DENGAN GOOGLE / GMAIL (FIREBASE POPUP)
  const handleGoogleLogin = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user.email) {
        throw new Error('Akun Google tidak memiliki alamat email aktif.');
      }

      await syncFirebaseUser({
        email: user.email,
        name: user.displayName || user.email.split('@')[0],
        photoUrl: user.photoURL || '',
      });
    } catch (err: unknown) {
      setError(parseFirebaseError(err));
      setLoading(false);
    }
  };

  // 3. LOGIN DENGAN GITHUB (FIREBASE POPUP)
  const handleGitHubFirebaseLogin = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;

      // Ambil username GitHub dari info provider jika ada
      const ghUsername =
        user.reloadUserInfo?.screenName ||
        user.displayName?.toLowerCase().replace(/\s+/g, '') ||
        user.email?.split('@')[0] ||
        '';

      await syncFirebaseUser({
        email: user.email || `${ghUsername}@users.noreply.github.com`,
        name: user.displayName || ghUsername,
        photoUrl: user.photoURL || '',
      });
    } catch (err: unknown) {
      setError(parseFirebaseError(err));
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-2 text-center sm:text-left">
        <h1 className="text-[32px] sm:text-[40px] font-medium leading-[1.1] text-white tracking-[-0.03em]">
          Masuk ke Komit
        </h1>
        <p className="text-[14px] text-white/70 leading-[1.5]">
          Kelola proyek kuliah, pantau commit kelompok, dan integrasikan akun Anda.
        </p>
      </div>

      {/* MAIN AUTH CARD */}
      <div className="p-8 sm:p-10 rounded-[30px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-6 shadow-[0_12px_40px_rgba(0,0,0,0.25)]">
        {/* FORM EMAIL & PASSWORD DI ATAS */}
        <form onSubmit={handleEmailPasswordSubmit} className="flex flex-col gap-4">
          {isRegisterMode && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] uppercase tracking-[0.08em] text-white/70 font-mono">
                Nama Lengkap
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/15 focus:border-white rounded-full px-5 py-3.5 text-[14px] text-white outline-none transition-colors"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] uppercase tracking-[0.08em] text-white/70 font-mono">
              Alamat Email
            </label>
            <input
              type="email"
              required
              placeholder="nama@kampus.ac.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/15 focus:border-white rounded-full px-5 py-3.5 text-[14px] text-white outline-none transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] uppercase tracking-[0.08em] text-white/70 font-mono">
              Kata Sandi
            </label>
            <input
              type="password"
              required
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/15 focus:border-white rounded-full px-5 py-3.5 text-[14px] text-white outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-full bg-white/[0.1] hover:bg-white/[0.18] border border-white/20 text-white text-[14px] font-medium transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
          >
            {loading
              ? 'Memproses...'
              : isRegisterMode
              ? 'Daftar'
              : 'Masuk'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-[1px] flex-1 bg-white/10" />
          <span className="text-[12px] uppercase tracking-wider text-white/40 font-mono">
            atau
          </span>
          <div className="h-[1px] flex-1 bg-white/10" />
        </div>

        {/* SOCIAL LOGIN: GOOGLE & GITHUB BERDAMPINGAN KIRI-KANAN (WHITE PILL) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Tombol Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="btn-white-pill text-[14px] !leading-normal py-3 px-5 rounded-full w-full justify-center transition-all flex items-center gap-2.5 cursor-pointer shadow-[0_0_24px_rgba(255,255,255,0.15)] hover:scale-[1.01] active:scale-[0.99]"
          >
            <svg className="w-5 h-5 shrink-0 overflow-visible" viewBox="-1 -1 26 26">
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
            <span className="text-[#161616] font-medium inline-block py-0.5">
              {loading ? '...' : 'Google'}
            </span>
          </button>

          {/* Tombol GitHub */}
          <button
            type="button"
            onClick={handleGitHubFirebaseLogin}
            disabled={loading}
            className="btn-white-pill text-[14px] !leading-normal py-3 px-5 rounded-full w-full justify-center transition-all flex items-center gap-2.5 cursor-pointer shadow-[0_0_24px_rgba(255,255,255,0.15)] hover:scale-[1.01] active:scale-[0.99]"
          >
            <svg className="w-5 h-5 fill-[#161616] shrink-0 overflow-visible" viewBox="-1 -1 26 26">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span className="text-[#161616] font-medium inline-block py-0.5">
              {loading ? '...' : 'GitHub'}
            </span>
          </button>
        </div>

        {/* Toggle Masuk vs Daftar Baru */}
        <div className="text-center pt-1 border-t border-white/10">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError(null);
            }}
            className="text-[13px] text-white/60 hover:text-white transition-colors"
          >
            {isRegisterMode ? (
              <span>
                Sudah punya akun?{' '}
                <strong className="text-white underline font-medium">Masuk di sini</strong>
              </span>
            ) : (
              <span>
                Belum memiliki akun?{' '}
                <strong className="text-white underline font-medium">Daftar sekarang</strong>
              </span>
            )}
          </button>
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
