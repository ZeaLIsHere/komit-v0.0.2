import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-white/[0.02] backdrop-blur-xl border-t border-white/10 py-20 text-white/70 text-[14px]">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
        <div className="flex flex-col gap-2 max-w-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#161616]" />
            </div>
            <span className="text-[16px] font-medium tracking-tight text-white font-sans">
              Komit
            </span>
          </div>
          <p className="text-[14px] text-white/70 leading-relaxed">
            Platform productized service untuk proyek kuliah IT berkelompok. Cicil commit GitHub terjadwal via akun asli mahasiswa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-8 text-[13px] text-white/70">
          <Link href="/order" className="hover:text-white transition-colors">
            Order Proyek
          </Link>
          <Link href="/admin" className="hover:text-white transition-colors">
            Joki Panel
          </Link>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            WhatsApp Support
          </a>
        </div>

        <div className="text-[12px] text-white/50 font-mono">
          &copy; {new Date().getFullYear()} Komit Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
