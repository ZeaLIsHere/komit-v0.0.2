'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login gagal');
      }
      router.push('/admin');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
      setLoading(false);
    }
  };

  return (
    <div className="text-[#ededed] min-h-screen flex items-center justify-center px-6 font-sans">
      <div className="w-full max-w-sm p-8 rounded-[24px] bg-white/[0.04] backdrop-blur-xl border border-white/10 flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-[28px] font-medium leading-[1.1] text-white tracking-[-0.02em]">
            Admin Komit
          </h1>
          <p className="text-[14px] text-white/70">
            Masuk untuk mengakses panel operator internal.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-[10px] border border-red-500/30 bg-red-950/20 text-red-200 text-[13px] font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] text-white font-medium">
              Password Admin
            </label>
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-white/[0.04] border border-white/15 focus:border-white rounded-[10px] px-4 py-2.5 text-[14px] text-white outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-white-pill text-[14px] px-6 py-3 rounded-full transition-all mt-2"
          >
            {loading ? 'Masuk...' : 'Masuk ke Panel Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
