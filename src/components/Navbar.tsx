import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#012624]/95 backdrop-blur-lg border-b border-[#003734]/80">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 py-7 min-h-[96px] flex items-center justify-between gap-6">
        {/* Logo Lockup with generous breathing room */}
        <Link href="/" className="flex items-center gap-3.5 group shrink-0">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#00827c] to-[#cbfffc] flex items-center justify-center shadow-[0_0_12px_rgba(203,255,252,0.3)]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#012624]" />
          </div>
          <span className="text-[20px] font-medium tracking-tight text-white uppercase">
            Komit
          </span>
        </Link>

        {/* Ghost Navigation Links: 13px uppercase, 0.12em letter spacing */}
        <nav className="hidden lg:flex items-center gap-8 text-[13px] uppercase tracking-[0.12em] text-[#bbc7c6]">
          <Link href="/#layanan" className="hover:text-white transition-colors">
            Layanan
          </Link>
          <Link href="/#cara-kerja" className="hover:text-white transition-colors">
            Cara Kerja
          </Link>
          <Link href="/#harga" className="hover:text-white transition-colors">
            Biaya
          </Link>
          <Link href="/project/demo-proyek-uas" className="hover:text-white transition-colors">
            Demo Dashboard
          </Link>
          <Link href="/admin" className="hover:text-white transition-colors">
            Joki Panel
          </Link>
        </nav>

        {/* Primary Action Button: Signature Aurora Gradient, 6px radius, proportional height */}
        <div className="flex items-center gap-4 shrink-0">
          <Link
            href="/order"
            className="btn-aurora text-[13px] px-6 py-3 rounded-[6px] inline-flex items-center justify-center leading-none"
          >
            Pesan Proyek ↗
          </Link>
        </div>
      </div>
    </header>
  );
}
