import type { Metadata } from "next";
import { DM_Sans, Geist } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

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
  title: "Komit",
  description:
    "Layanan pengerjaan proyek kuliah IT, cicil commit terjadwal atas nama akun GitHub anggota kelompok hingga UAS, makalah, dan PPT presentasi.",
  icons: {
    icon: [
      { url: "/icon.svg?v=2", type: "image/svg+xml" },
      { url: "/favicon.ico?v=2", sizes: "32x32" },
    ],
    shortcut: "/icon.svg?v=2",
    apple: "/icon.svg?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${dmSans.variable} ${geist.variable}`}>
      <body className="text-[#ededed] min-h-screen font-sans selection:bg-[#6b62f2]/30 selection:text-white">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
