import type { Metadata } from "next";
import { DM_Sans, Geist } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Komit — Joki Proyek Kuliah Berkelompok & Cicil Commit GitHub",
  description:
    "Layanan pengerjaan proyek kuliah IT, cicil commit terjadwal atas nama akun GitHub anggota kelompok hingga UAS, makalah, dan PPT presentasi.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${dmSans.variable} ${geist.variable}`}>
      <body className="bg-[#0a0a0a] text-[#ededed] min-h-screen font-sans selection:bg-[#6b62f2]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
