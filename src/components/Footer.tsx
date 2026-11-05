import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#000000] border-t border-white/5 py-16 text-[#9a9a9a] text-[14px]">
      <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <span className="text-[20px] font-normal tracking-[-0.04em] text-[#ffffff] block mb-2">
            Komit<span className="text-[#8052ff]">.</span>
          </span>
          <p className="text-[14px] text-[#9a9a9a] max-w-sm font-extralight leading-relaxed">
            Platform Productized Service & SaaS joki proyek kuliah IT berkelompok dengan cicil commit terjadwal via akun GitHub asli mahasiswa.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-8 text-[14px]">
          <Link href="/order" className="hover:text-[#ffffff] transition-colors">
            Order Proyek
          </Link>
          <Link href="/project/demo-proyek-uas" className="hover:text-[#ffffff] transition-colors">
            Live Preview
          </Link>
          <Link href="/admin" className="hover:text-[#ffffff] transition-colors">
            Joki Panel
          </Link>
          <a
            href="https://wa.me/6281234567890"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#ffb829] transition-colors"
          >
            Konsultasi WhatsApp
          </a>
        </div>

        <div className="text-[12px] text-[#9a9a9a] tabular-nums">
          &copy; {new Date().getFullYear()} Komit-V2. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
