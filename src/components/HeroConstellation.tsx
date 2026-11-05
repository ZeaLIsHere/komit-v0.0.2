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
    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Generate points on a sphere (Fibonacci sphere algorithm)
    const count = 120;
    const radius = Math.min(width, height) * 0.38;
    const colors = ['#00827c', '#cbfffc', '#ffffff', '#fde9ff', '#edfffe'];

    const points: Point3D[] = [];
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      points.push({
        x: x * radius,
        y: y * radius,
        z: z * radius,
        color: colors[i % colors.length],
        size: Math.random() * 1.5 + 1.5,
      });
    }

    let angleX = 0.002;
    let angleY = 0.004;
    const fov = 350;

    const render = () => {
      ctx.fillStyle = '#012624';
      ctx.fillRect(0, 0, width, height);

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

      // Draw faint bioluminescent connecting lines for near points
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].px - projected[j].px;
          const dy = projected[i].py - projected[j].py;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 55) {
            const alpha = (1 - dist / 55) * 0.15;
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
        ctx.globalAlpha = Math.max(0.2, (p.pz + radius) / (2 * radius));
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
    <div className="relative w-full h-[360px] md:h-[480px] overflow-hidden rounded-[16px] bg-[#003734]/30 border border-[#003734]">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="pointer-events-none absolute inset-0 bg-radial-gradient from-transparent to-[#012624] opacity-40" />
      <div className="absolute bottom-4 left-6 text-[11px] font-mono uppercase tracking-[0.12em] text-[#bbc7c6]">
        Bioluminescent Commit Sphere • Autonomous Synchronizer
      </div>
    </div>
  );
}
