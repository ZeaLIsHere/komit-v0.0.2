import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="sticky top-4 z-50 w-full max-w-[1200px] mx-auto px-6">
      <div className="h-[52px] bg-[#07080a]/80 backdrop-blur-[48px] border border-[#363739] rounded-lg px-4 flex items-center justify-between">
        {/* Logo Lockup: Coral red diamond + wordmark */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <svg className="w-3.5 h-3.5 fill-[#ff6363]" viewBox="0 0 24 24">
            <path d="M12 2L2 12l10 10 10-10L12 2z" />
          </svg>
          <span className="text-[13px] font-medium text-white tracking-[0.01em]">
            Komit
          </span>
          <span className="text-[10px] font-mono uppercase tracking-[0.05em] text-[#6a6b6c] bg-[#1b1c1e] px-1.5 py-0.5 rounded-[6px]">
            v2.0
          </span>
        </Link>

        {/* Ghost Nav Links in Ash (#9c9c9d) */}
        <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[#9c9c9d]">
          <Link href="/#layanan" className="hover:text-white transition-colors">
            Layanan
          </Link>
          <Link href="/#cara-kerja" className="hover:text-white transition-colors">
            Cara Kerja
          </Link>
          <Link href="/#harga" className="hover:text-white transition-colors">
            Harga
          </Link>
          <Link href="/project/demo-proyek-uas" className="hover:text-white transition-colors">
            Preview
          </Link>
          <Link href="/admin" className="hover:text-white transition-colors">
            Admin
          </Link>
        </nav>

        {/* Neutral Filled Button (Mist #e6e6e6 fill, Iron #454647 text, 8px radius) */}
        <div className="flex items-center gap-3">
          <Link
            href="/order"
            className="inline-flex items-center justify-center bg-[#e6e6e6] hover:bg-[#ffffff] text-[#454647] text-[13px] font-medium rounded-lg px-3.5 py-1.5 transition-all shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
          >
            Pesan Proyek
          </Link>
        </div>
      </div>
    </header>
  );
}
