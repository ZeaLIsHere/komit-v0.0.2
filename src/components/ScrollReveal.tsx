'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // dalam milidetik
  yOffset?: number; // jarak geser awal (px)
}

export default function ScrollReveal({
  children,
  className = '',
  delay = 0,
  yOffset = 24,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Hormati preferensi aksesibilitas jika user mematikan animasi di OS
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDuration: '700ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delay}ms`,
        transform: isVisible ? 'translateY(0)' : `translateY(${yOffset}px)`,
        opacity: isVisible ? 1 : 0,
      }}
      className={`transition-[transform,opacity] will-change-[transform,opacity] ${className}`}
    >
      {children}
    </div>
  );
}
