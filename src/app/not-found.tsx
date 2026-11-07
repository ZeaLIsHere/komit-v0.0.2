import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="text-[#ededed] min-h-screen flex flex-col items-center justify-center p-6 text-center gap-6 font-sans">
      <span className="text-[12px] font-medium uppercase tracking-wider text-white/60 font-mono">
        404 • Halaman Tidak Ditemukan
      </span>
      <h1 className="text-[40px] sm:text-[56px] font-medium leading-[1.1] text-white tracking-[-0.03em]">
        Halaman tidak tersedia di kedalaman ini.
      </h1>
      <p className="text-[16px] text-[#c2c2c2] max-w-md leading-relaxed">
        Tautan yang Anda tuju mungkin sudah dipindahkan atau URL salah diketik.
      </p>
      <Link
        href="/"
        className="btn-white-pill text-[13px] px-6 py-2.5 rounded-full"
      >
        Kembali ke Beranda ↗
      </Link>
    </div>
  );
}
