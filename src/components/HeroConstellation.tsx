'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  baseX: number;
  baseY: number;
  baseZ: number;
  char: string;
  color: string;
  size: number;
  phase: number;
  speed: number;
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
    let height = (canvas.height = canvas.parentElement?.clientHeight || 750);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse coordinates with smooth damping
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      // Normalized coordinates from -1 to 1
      mouseX = (clientX / width) * 2 - 1;
      mouseY = (clientY / height) * 2 - 1;

      targetRotY = mouseX * 0.8;
      targetRotX = -mouseY * 0.8;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches[0].clientX - rect.left;
        const clientY = e.touches[0].clientY - rect.top;
        mouseX = (clientX / width) * 2 - 1;
        mouseY = (clientY / height) * 2 - 1;
        targetRotY = mouseX * 0.8;
        targetRotX = -mouseY * 0.8;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    // Particles Setup: 1,400 alphanumeric/binary characters
    const glyphs = ['0', '1', '7', 'f', 'a', '8', '9', 'c', '3', 'b', 'e', '4', 'x', '•'];
    const colors = [
      '#00f5d4', // electric cyan
      '#00b4a7', // deep aqua
      '#cbfffc', // pale aqua
      '#ffffff', // platinum
      '#edfffe', // liquid mist
      '#fde9ff', // lavender phosphor accent
    ];

    const particleCount = 1400;
    const baseRadius = Math.min(width, height) * 0.42;
    const particles: Particle[] = [];

    // Fibonacci sphere algorithm with slight volume thickness
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle

    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      // Add random depth variation for cloud-like fluid volume
      const r = baseRadius * (0.88 + Math.random() * 0.24);

      const x = Math.cos(theta) * radiusAtY * r;
      const z = Math.sin(theta) * radiusAtY * r;

      particles.push({
        baseX: x,
        baseY: y * r,
        baseZ: z,
        char: glyphs[i % glyphs.length],
        color: colors[i % colors.length],
        size: Math.random() * 3 + 8,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.8,
      });
    }

    let time = 0;
    const fov = 420;

    const render = () => {
      // Clear canvas with full transparency
      ctx.clearRect(0, 0, width, height);

      time += 0.015;

      // Smooth camera interpolation towards mouse target
      currentRotX += (targetRotX - currentRotX) * 0.05;
      currentRotY += (targetRotY - currentRotY) * 0.05;

      // Base idle rotation + mouse offset
      const rotY = currentRotY + time * 0.25;
      const rotX = currentRotX + Math.sin(time * 0.3) * 0.08;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const cx = width / 2;
      const cy = height / 2;

      // Calculate fluid wave displacement and 3D projection
      const projected = [];

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];

        // Fluid displacement: sinusoidal surface waves like liquid ripples
        const wave =
          Math.sin(p.phase + time * 1.8 * p.speed) * 8 +
          Math.cos(p.baseX * 0.01 + p.baseY * 0.01 + time * 1.4) * 12 +
          Math.sin(p.baseZ * 0.015 + time) * 6;

        const currentR = 1 + wave / baseRadius;
        const wx = p.baseX * currentR;
        const wy = p.baseY * currentR;
        const wz = p.baseZ * currentR;

        // 3D Rotation around Y then X
        const x1 = wx * cosY - wz * sinY;
        const z1 = wz * cosY + wx * sinY;

        const y2 = wy * cosX - z1 * sinX;
        const z2 = z1 * cosX + wy * sinX;

        const scale = fov / (fov + z2);

        projected.push({
          px: cx + x1 * scale,
          py: cy + y2 * scale,
          pz: z2,
          scale,
          char: p.char,
          color: p.color,
          size: p.size * scale,
        });
      }

      // Painter's algorithm: sort back-to-front
      projected.sort((a, b) => a.pz - b.pz);

      // Render characters and glow
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];

        // Alpha based on depth: front particles are vivid, rear particles are faint
        const normalizedZ = (p.pz + baseRadius) / (baseRadius * 2);
        const alpha = Math.min(1.0, Math.max(0.12, normalizedZ * 1.1));

        ctx.font = `${Math.max(7, Math.round(p.size))}px 'GeistMono', monospace, sans-serif`;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;

        // Draw character glyph
        ctx.fillText(p.char, p.px, p.py);
      }

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full block opacity-85" />
      {/* Ambient center illumination and soft edge vignette */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#012624]/20 to-[#012624] pointer-events-none" />
    </div>
  );
}
