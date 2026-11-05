import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#011d1c] border-t border-[#003734] py-24 text-[#bbc7c6] text-[14px]">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-10">
        <div className="flex flex-col gap-2 max-w-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#00827c] to-[#cbfffc]" />
            <span className="text-[16px] font-medium tracking-tight text-white uppercase">
              Komit
            </span>
          </div>
          <p className="text-[14px] text-[#bbc7c6] leading-relaxed">
            Platform productized service untuk proyek kuliah IT berkelompok. Cicil commit GitHub terjadwal via akun autentik mahasiswa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-8 text-[12px] uppercase tracking-[0.12em] text-[#bbc7c6]">
          <Link href="/order" className="hover:text-white transition-colors">
            Order Proyek
          </Link>
          <Link href="/project/demo-proyek-uas" className="hover:text-white transition-colors">
            Live Preview
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

        <div className="text-[12px] text-[#707777] font-mono">
          &copy; {new Date().getFullYear()} Komit-V2. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
