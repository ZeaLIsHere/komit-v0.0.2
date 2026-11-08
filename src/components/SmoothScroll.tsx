'use client';

import { useEffect } from 'react';

/**
 * SmoothScroll (Native Momentum Wheel Interpolator)
 * Menginterpolasi hentakan roll mouse mekanik (yang biasanya 100-120px per tick)
 * menjadi gerakan turun/naik halus dan kenyal menggunakan RequestAnimationFrame (Lerp).
 * 
 * - Zero external dependency.
 * - Tetap membiarkan touchpad laptop & mobile touch berjalan native 1:1.
 * - Mendukung prefers-reduced-motion.
 */
export default function SmoothScroll() {
  useEffect(() => {
    // 1. Hormati preferensi OS user jika mematikan motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // 2. Jangan bajak perangkat sentuh murni (layar hp/tablet)
    if ('ontouchstart' in window && navigator.maxTouchPoints > 1) {
      return;
    }

    let targetY = window.scrollY;
    let currentY = window.scrollY;
    let isRunning = false;
    let animId: number;

    const onWheel = (e: WheelEvent) => {
      // Deteksi: Abaikan scroll touchpad laptop halus (touchpad mengirim delta kecil berfrekuensi tinggi)
      // Mouse roll mekanik umumnya menghasilkan delta besar sekaligus (>= 50 atau deltaMode baris)
      const isMechanicalWheel = Math.abs(e.deltaY) >= 40 || e.deltaMode !== 0;
      if (!isMechanicalWheel) {
        // Sync posisi jika user menggunakan touchpad
        targetY = window.scrollY;
        currentY = window.scrollY;
        return;
      }

      // Cegah lonjakan patah-patah browser bawaan mouse
      e.preventDefault();

      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );

      // Akumulasikan jarak scroll secara responsif
      targetY = Math.max(0, Math.min(maxScroll, targetY + e.deltaY * 1.05));

      if (!isRunning) {
        isRunning = true;
        animId = requestAnimationFrame(updateScroll);
      }
    };

    const updateScroll = () => {
      const diff = targetY - currentY;

      // Lerp (Linear Interpolation) dengan faktor damping 0.095 untuk rasa meluncur lembut
      currentY += diff * 0.095;

      // Hentikan loop jika selisih sudah sangat tipis (< 0.5px)
      if (Math.abs(diff) < 0.5) {
        currentY = targetY;
        window.scrollTo(0, currentY);
        isRunning = false;
        return;
      }

      window.scrollTo(0, currentY);
      animId = requestAnimationFrame(updateScroll);
    };

    const onScroll = () => {
      // Sinkronisasi jika scroll digerakkan lewat drag scrollbar fisik atau navigasi anchor
      if (!isRunning) {
        targetY = window.scrollY;
        currentY = window.scrollY;
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(animId);
    };
  }, []);

  return null;
}
