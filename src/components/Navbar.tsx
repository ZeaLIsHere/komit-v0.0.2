import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-5 z-50 w-full max-w-[1160px] mx-auto px-4 sm:px-6">
      <div className="h-[60px] bg-[#161616]/85 backdrop-blur-md border border-[#e5e5e5]/10 rounded-full px-5 flex items-center justify-between gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
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
        <nav className="hidden md:flex items-center gap-6 text-[14px] text-white/85 font-normal">
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
            Preview
          </Link>
          <Link href="/admin" className="hover:text-white transition-colors">
            Admin
          </Link>
        </nav>

        {/* White Pill CTA */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/order"
            className="btn-white-pill text-[13px] px-5 py-2 rounded-full"
          >
            Pesan Proyek
          </Link>
        </div>
      </div>
    </header>
  );
}
