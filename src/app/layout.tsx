import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
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
    <html lang="id" className={`${inter.variable} ${geistMono.variable}`}>
      <body className="bg-[#040506] text-white min-h-screen font-sans selection:bg-[#ff6363]/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
