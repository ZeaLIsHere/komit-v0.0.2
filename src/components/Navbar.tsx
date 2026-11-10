'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { triggerParticleCollapse } from '@/lib/particles';
import { useDockController, ANIMATED_TOP_DOCK_DEFAULTS } from './topDockController';

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
  const pathname = usePathname();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<string>('');

  const dockRef = useDockController(() => ({
    ...ANIMATED_TOP_DOCK_DEFAULTS,
    lockTrack: true,
  }));

  useEffect(() => {
    if (pathname !== '/') {
      setActiveSection('');
      return;
    }

    const currentHash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
    if (currentHash) {
      setActiveSection(currentHash);
    }

    const sections = ['layanan', 'cara-kerja', 'harga'];
    const elements = sections
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));

    const onHashChange = () => {
      const h = window.location.hash.replace('#', '');
      if (h) setActiveSection(h);
    };

    window.addEventListener('hashchange', onHashChange);

    return () => {
      observer.disconnect();
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [pathname]);

  const isItemActive = (key: 'layanan' | 'cara-kerja' | 'harga' | 'my-projects' | 'admin') => {
    if (key === 'my-projects') return pathname.startsWith('/my-projects');
    if (key === 'admin') return pathname.startsWith('/admin');
    if (pathname === '/') return activeSection === key;
    return false;
  };

  const getLinkClass = (isActive: boolean) =>
    `px-3.5 py-1.5 rounded-full inline-flex items-center transition-all duration-200 ${
      isActive
        ? 'text-white font-medium bg-white/10 border border-white/30 shadow-[0_0_14px_rgba(255,255,255,0.4)] drop-shadow-[0_0_8px_rgba(255,255,255,0.85)]'
        : 'text-white/75 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]'
    }`;

  const handleItemClick = (key: string, e: React.MouseEvent<HTMLAnchorElement>) => {
    (e.currentTarget as HTMLElement)?.blur?.();
    if (pathname === '/') {
      setActiveSection(key);
    }
  };

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

        {/* Ghost Navigation Links with Animated Top Dock Magnification */}
        <nav
          ref={dockRef}
          aria-label="Primary"
          data-dock-state="idle"
          data-dock-max="0.00"
          className="hidden lg:flex items-center gap-6 lg:gap-8 text-[14px] font-normal"
        >
          <Link
            href="/#layanan"
            data-dock-item
            onClick={(e) => handleItemClick('layanan', e)}
            className={getLinkClass(isItemActive('layanan'))}
          >
            Layanan
          </Link>
          <Link
            href="/#cara-kerja"
            data-dock-item
            onClick={(e) => handleItemClick('cara-kerja', e)}
            className={getLinkClass(isItemActive('cara-kerja'))}
          >
            Cara Kerja
          </Link>
          <Link
            href="/#harga"
            data-dock-item
            onClick={(e) => handleItemClick('harga', e)}
            className={getLinkClass(isItemActive('harga'))}
          >
            Biaya
          </Link>

          {user?.role === 'customer' && (
            <Link
              href="/my-projects"
              data-dock-item
              onClick={(e) => handleItemClick('my-projects', e)}
              className={getLinkClass(isItemActive('my-projects'))}
            >
              Proyek Saya
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              href="/admin"
              data-dock-item
              onClick={(e) => handleItemClick('admin', e)}
              className={getLinkClass(isItemActive('admin'))}
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
                  ? 'Admin'
                  : user.githubUsername
                  ? `@${user.githubUsername}`
                  : user.name.split(' ')[0]}
              </span>

              <button
                onClick={handleLogout}
                title="Keluar"
                aria-label="Keluar"
                className="h-[28px] w-[28px] text-white/75 hover:text-white bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-white/25 rounded-full transition-all inline-flex items-center justify-center shrink-0"
              >
                <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                onMouseEnter={() => triggerParticleCollapse(true)}
                onMouseLeave={() => triggerParticleCollapse(false)}
                className="btn-white-pill text-[13px] px-5 py-2 rounded-full"
              >
                Masuk
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
