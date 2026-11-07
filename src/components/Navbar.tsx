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
    <header className="sticky top-5 z-50 w-full max-w-[1160px] mx-auto px-4 sm:px-6">
      <div className="h-[60px] bg-white/[0.04] backdrop-blur-xl border border-white/15 rounded-full px-5 flex items-center justify-between gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
        {/* Logo Lockup */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#161616]" />
          </div>
          <span className="text-[17px] font-medium tracking-tight text-white font-sans">
            Komit
          </span>
        </Link>

        {/* Ghost Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 lg:gap-8 text-[14px] text-white/80 font-normal">
          <Link
            href="/#layanan"
            className="px-3 py-1.5 rounded-full hover:bg-white/[0.08] hover:text-white transition-all"
          >
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
            <Link
              href="/my-projects"
              className="px-3 py-1.5 rounded-full text-white font-medium hover:bg-white/[0.08] transition-all"
            >
              Proyek Saya
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className="px-3 py-1.5 rounded-full text-white font-medium hover:bg-white/[0.08] transition-all"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Auth & Primary Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          {!loading && user ? (
            <div className="flex items-center gap-2.5">
              <span className="hidden sm:inline-block text-[12px] text-white/75 font-mono px-3 py-1 rounded-full bg-white/[0.05] border border-white/10">
                {user.role === 'admin'
                  ? '🛡️ Admin'
                  : user.githubUsername
                  ? `@${user.githubUsername}`
                  : user.name.split(' ')[0]}
              </span>

              {user.role === 'customer' && (
                <Link
                  href="/my-projects"
                  className="hidden md:inline-flex text-[13px] text-white/80 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/[0.08] transition-all"
                >
                  Proyek Saya
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="text-[13px] text-white/70 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/[0.08] transition-all"
              >
                Keluar
              </button>

              <Link
                href="/order"
                className="btn-white-pill text-[13px] px-5 py-2 rounded-full"
              >
                Pesan Proyek ↗
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-[14px] text-white/80 hover:text-white px-3.5 py-1.5 rounded-full hover:bg-white/[0.08] transition-all"
              >
                Masuk
              </Link>

              <Link
                href="/login?redirect=/order"
                className="btn-white-pill text-[13px] px-5 py-2 rounded-full"
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
