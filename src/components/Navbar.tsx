import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#012624]/90 backdrop-blur-md border-b border-[#003734]">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 h-20 flex items-center justify-between">
        {/* Logo Lockup */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#00827c] to-[#cbfffc] flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#012624]" />
          </div>
          <span className="text-[18px] font-medium tracking-tight text-white uppercase">
            Komit
          </span>
          <span className="text-[10px] uppercase tracking-[0.12em] text-[#bbc7c6] border border-[#003734] px-1.5 py-0.5 rounded-[6px]">
            V2
          </span>
        </Link>

        {/* Ghost Navigation Links: 12px uppercase, 0.12em letter spacing */}
        <nav className="hidden md:flex items-center gap-6 text-[12px] uppercase tracking-[0.12em] text-[#bbc7c6]">
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

        {/* Primary Action Button: Signature Aurora Gradient, 6px radius */}
        <div className="flex items-center gap-4">
          <Link
            href="/order"
            className="btn-aurora text-[13px] px-5 py-2.5 rounded-[6px] shadow-none"
          >
            Pesan Proyek
          </Link>
        </div>
      </div>
    </header>
  );
}
