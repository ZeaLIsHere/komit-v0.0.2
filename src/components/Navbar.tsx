import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#000000]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-[1280px] mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* Logo Lockup */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-[24px] font-normal tracking-[-0.04em] text-[#ffffff]">
            Komit<span className="text-[#8052ff]">.</span>
          </span>
          <span className="text-[12px] uppercase tracking-[0.15em] text-[#9a9a9a] px-2 py-0.5 rounded-full border border-white/10 hidden sm:inline-block">
            V2
          </span>
        </Link>

        {/* Ghost Text Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-[14px] text-[#9a9a9a]">
          <Link href="/#layanan" className="hover:text-[#ffffff] transition-colors">
            Layanan
          </Link>
          <Link href="/#cara-kerja" className="hover:text-[#ffffff] transition-colors">
            Cara Kerja
          </Link>
          <Link href="/#harga" className="hover:text-[#ffffff] transition-colors">
            Harga
          </Link>
          <Link href="/project/demo-proyek-uas" className="hover:text-[#ffffff] transition-colors">
            Demo Dashboard
          </Link>
          <Link href="/admin" className="hover:text-[#ffffff] transition-colors text-[#ffb829]">
            Admin
          </Link>
        </nav>

        {/* Primary Action Button (The sole interactive CTA pill) */}
        <div className="flex items-center gap-4">
          <Link
            href="/order"
            className="inline-flex items-center justify-center bg-[#8052ff] hover:bg-[#7042ef] text-[#ffffff] text-[14px] font-normal uppercase tracking-[0.025em] px-6 py-2.5 rounded-full transition-all duration-200 shadow-none"
          >
            Mulai Pesan
          </Link>
        </div>
      </div>
    </header>
  );
}
