import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="text-[#bbc7c6] min-h-screen flex flex-col items-center justify-center p-6 text-center gap-6">
      <span className="text-[12px] font-medium uppercase tracking-[0.15em] text-[#edfffe]">
        404 • Halaman Tidak Ditemukan
      </span>
      <h1 className="text-[40px] sm:text-[56px] font-medium leading-[1.0] text-white tracking-[-0.03em]">
        Halaman tidak tersedia di kedalaman ini.
      </h1>
      <p className="text-[16px] text-[#bbc7c6] max-w-md">
        Tautan yang Anda tuju mungkin sudah dipindahkan atau URL salah diketik.
      </p>
      <Link
        href="/"
        className="btn-aurora text-[13px] px-6 py-3 rounded-[6px] transition-all"
      >
        Kembali ke Beranda ↗
      </Link>
    </div>
  );
}
