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
    <div className="bg-[#012624] text-[#bbc7c6] min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-[32px] font-medium leading-[1.0] text-white tracking-[-0.03em]">
            Admin Komit
          </h1>
          <p className="text-[14px] text-[#bbc7c6]">
            Masuk untuk mengakses panel operator internal.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-[6px] border border-red-500/40 bg-red-950/30 text-red-200 text-[13px] font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] uppercase tracking-[0.08em] text-[#edfffe]">
              Password Admin
            </label>
            <input
              type="password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-[#011d1c] border border-[#003734] focus:border-[#cbfffc] rounded-[6px] px-4 py-3 text-[15px] text-white outline-none transition-colors"
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
    </div>
  );
}
