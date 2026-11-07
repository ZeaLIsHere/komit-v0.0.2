'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: 'customer' | 'admin';
  whatsapp?: string;
  githubUsername?: string;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/');
      router.refresh();
    } catch {
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#012624]/95 backdrop-blur-lg border-b border-[#003734]/80">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 py-7 min-h-[96px] flex items-center justify-between gap-6">
        {/* Logo Lockup */}
        <Link href="/" className="flex items-center gap-3.5 group shrink-0">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#00827c] to-[#cbfffc] flex items-center justify-center shadow-[0_0_12px_rgba(203,255,252,0.3)]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#012624]" />
          </div>
          <span className="text-[17px] font-medium tracking-tight text-white font-sans">
            Komit
          </span>
        </Link>

        {/* Ghost Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-[13px] uppercase tracking-[0.12em] text-[#bbc7c6]">
          <Link href="/#layanan" className="hover:text-white transition-colors">
            Layanan
          </Link>
          <Link
            href="/#cara-kerja"
            className="px-3 py-1.5 rounded-full hover:bg-white/[0.08] hover:text-white transition-all"
          >
            Cara Kerja
          </Link>
          <Link
            href="/#harga"
            className="px-3 py-1.5 rounded-full hover:bg-white/[0.08] hover:text-white transition-all"
          >
            Biaya
          </Link>
          <Link
            href="/project/demo-proyek-uas"
            className="px-3 py-1.5 rounded-full hover:bg-white/[0.08] hover:text-white transition-all"
          >
            Preview
          </Link>

          {user?.role === 'customer' && (
            <Link href="/my-projects" className="text-[#cbfffc] hover:underline font-medium">
              Proyek Saya
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link href="/admin" className="text-[#cbfffc] hover:underline font-medium">
              Panel Admin
            </Link>
          )}
        </nav>

        {/* Auth & Primary Action Button */}
        <div className="flex items-center gap-4 shrink-0">
          {!loading && user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-[12px] text-[#bbc7c6] font-mono">
                {user.role === 'admin'
                  ? '🛡️ Admin'
                  : user.githubUsername
                  ? `🐙 @${user.githubUsername}`
                  : `🎓 ${user.name.split(' ')[0]}`}
              </span>

              {user.role === 'customer' && (
                <Link
                  href="/my-projects"
                  className="hidden md:inline-block text-[12px] uppercase tracking-[0.08em] text-[#bbc7c6] hover:text-white border border-[#003734] px-3 py-2 rounded-[6px] bg-[#011d1c]"
                >
                  Proyek Saya
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="text-[12px] uppercase tracking-[0.08em] text-[#bbc7c6] hover:text-white border border-[#003734] px-3 py-2 rounded-[6px] bg-[#011d1c] transition-colors"
              >
                Keluar
              </button>

              <Link
                href="/order"
                className="btn-aurora text-[13px] px-6 py-3 rounded-[6px] inline-flex items-center justify-center leading-none"
              >
                Pesan Proyek ↗
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-[13px] uppercase tracking-[0.12em] text-[#bbc7c6] hover:text-white px-3 py-2 transition-colors"
              >
                Masuk
              </Link>

              {/* Clicking CTA when not logged in prompts login */}
              <Link
                href="/login?redirect=/order"
                className="btn-aurora text-[13px] px-6 py-3 rounded-[6px] inline-flex items-center justify-center leading-none"
              >
                Pesan Proyek ↗
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
