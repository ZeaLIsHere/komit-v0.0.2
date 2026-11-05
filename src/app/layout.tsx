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
      <body className="bg-[#000000] text-[#ffffff] min-h-screen selection:bg-[#8052ff] selection:text-[#ffffff]">
        {children}
      </body>
    </html>
  );
}
