'use client';

import React, { useEffect, useRef } from 'react';

interface Point3D {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
}

export default function HeroConstellation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Fibonacci sphere algorithm: 140 bioluminescent points
    const count = 140;
    const radius = Math.min(width, height) * 0.42;
    const colors = ['#00827c', '#cbfffc', '#ffffff', '#fde9ff', '#edfffe'];

    const points: Point3D[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      points.push({
        x: x * radius,
        y: y * radius,
        z: z * radius,
        color: colors[i % colors.length],
        size: Math.random() * 1.5 + 1.2,
      });
    }

    let angleX = 0.0018;
    let angleY = 0.0035;
    const fov = 380;

    const render = () => {
      // Clear canvas with transparency to allow natural background blending
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Project and sort points by Z
      const projected = points.map((p) => {
        // Rotate around Y
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const x1 = p.x * cosY - p.z * sinY;
        const z1 = p.z * cosY + p.x * sinY;

        // Rotate around X
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + p.y * sinX;

        p.x = x1;
        p.y = y2;
        p.z = z2;

        const scale = fov / (fov + z2);
        return {
          px: cx + x1 * scale,
          py: cy + y2 * scale,
          pz: z2,
          scale,
          color: p.color,
          size: p.size * scale,
        };
      });

      projected.sort((a, b) => a.pz - b.pz);

      // Draw faint bioluminescent connecting filaments
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].px - projected[j].px;
          const dy = projected[i].py - projected[j].py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 60) {
            const alpha = (1 - dist / 60) * 0.16;
            ctx.strokeStyle = `rgba(203, 255, 252, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(projected[i].px, projected[i].py);
            ctx.lineTo(projected[j].px, projected[j].py);
            ctx.stroke();
          }
        }
      }

      // Draw glowing sphere nodes
      for (const p of projected) {
        ctx.fillStyle = p.color;
        // Higher alpha in front, softer in back
        ctx.globalAlpha = Math.max(0.15, (p.pz + radius) / (2 * radius));
        ctx.beginPath();
        ctx.arc(p.px, p.py, Math.max(1, p.size), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block opacity-70" />
      {/* Soft radial fade out to the canvas edges */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#012624]/40 to-[#012624]" />
    </div>
  );
}
