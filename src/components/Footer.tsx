import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#040506] border-t border-[#1b1c1e] py-16 text-[#6a6b6c] text-[13px]">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col gap-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <svg className="w-3.5 h-3.5 fill-[#ff6363]" viewBox="0 0 24 24">
              <path d="M12 2L2 12l10 10 10-10L12 2z" />
            </svg>
            <span className="text-[14px] font-medium text-white">Komit</span>
            <span className="text-[12px] text-[#6a6b6c] font-light">
              — Joki proyek kuliah berkelompok & cicil commit GitHub
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-[13px] text-[#9c9c9d]">
            <Link href="/order" className="hover:text-white transition-colors">
              Pesan Proyek
            </Link>
            <Link href="/project/demo-proyek-uas" className="hover:text-white transition-colors">
              Demo Dashboard
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
        </div>

        {/* Raycast signature footer metadata strip in Geist Mono */}
        <div className="border-t border-[#111214] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] font-mono text-[#6a6b6c]">
          <div>
            v2.104.0 <span className="mx-1 text-[#2f3031]">|</span> GitHub OAuth Scope: repo, workflow <span className="mx-1 text-[#2f3031]">|</span> N × Rp 50.000
          </div>
          <div>
            &copy; {new Date().getFullYear()} Komit Inc. Built for Computer Science Students.
          </div>
        </div>
      </div>
    </footer>
  );
}
