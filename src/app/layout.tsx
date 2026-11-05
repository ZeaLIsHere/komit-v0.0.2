import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="id" className={`${inter.variable}`}>
      <body className="bg-[#012624] text-[#bbc7c6] min-h-screen selection:bg-[#00827c] selection:text-white">
        {children}
      </body>
    </html>
  );
}
