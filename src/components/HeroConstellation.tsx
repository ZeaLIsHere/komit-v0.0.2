'use client';

import React, { useEffect, useRef } from 'react';

interface FluidParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  mass: number;
  char: string;
  size: number;
  dropDelay: number; // Staggered cascade timing
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
    let height = (canvas.height = canvas.parentElement?.clientHeight || 800);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse coordinate & momentum
    let mouseX = 0;
    let mouseY = 0;
    let mouseSpeedX = 0;
    let mouseSpeedY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left - width / 2);
      const ny = (e.clientY - rect.top - height / 2);
      mouseSpeedX = nx - mouseX;
      mouseSpeedY = ny - mouseY;
      mouseX = nx;
      mouseY = ny;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const nx = (e.touches[0].clientX - rect.left - width / 2);
        const ny = (e.touches[0].clientY - rect.top - height / 2);
        mouseSpeedX = nx - mouseX;
        mouseSpeedY = ny - mouseY;
        mouseX = nx;
        mouseY = ny;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    // Characters for data-fluid matrix look
    const glyphs = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'x', '•'];
    const particleCount = 1350;
    const sphereRadius = Math.min(width, height) * 0.38;
    const particles: FluidParticle[] = [];

    // Initialize particles adhering to outer shell of sphere
    for (let i = 0; i < particleCount; i++) {
      const phi = Math.random() * Math.PI * 2;
      const costheta = Math.random() * 2 - 1;
      const theta = Math.acos(costheta);
      const r = sphereRadius * (0.86 + Math.random() * 0.14);

      const px = r * Math.sin(theta) * Math.cos(phi);
      const py = r * Math.sin(theta) * Math.sin(phi);
      const pz = r * Math.cos(theta);

      particles.push({
        x: px,
        y: py,
        z: pz,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        vz: (Math.random() - 0.5) * 1.5,
        mass: 0.8 + Math.random() * 1.6,
        char: glyphs[i % glyphs.length],
        size: Math.random() * 5 + 12, // Larger particle size (12px - 17px)
        dropDelay: Math.random() * 0.8,
      });
    }

    let time = 0;
    const fov = 420;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      time += 0.016;

      // Periodic Gravity Drop: Rare & Brief (Siklus 12 detik, jatuh hanya ~1.2 detik)
      // 0.0 - 9.8s: Stabil berputar di dinding luar bola (vortex liquid shell)
      // 9.8 - 11.0s: Curahan gravitasi singkat ke bawah sebagai variasi
      // 11.0 - 12.0s: Tersapu kembali naik ke putaran keliling
      const cycleLength = 12.0;
      const cycleTime = time % cycleLength;

      let gravity = 0;
      if (cycleTime > 9.8 && cycleTime < 11.0) {
        const dropPhase = (cycleTime - 9.8) / 1.2;
        // Smooth sine wave burst
        gravity = Math.sin(dropPhase * Math.PI) * 7.5;
      }

      // Swirl strength weakens during gravity drop, strengthens during sweep-up
      const swirlFactor = 1.0 - Math.min(0.7, gravity * 0.07);

      mouseSpeedX *= 0.90;
      mouseSpeedY *= 0.90;

      const cx = width / 2;
      const cy = height / 2;
      const projected = [];

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];

        // 1. Vortex Swirl Motion: Tangential velocity around inclined Y-axis
        // Clings to outer perimeter
        const distFromCenter = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
        const dist2D = Math.sqrt(p.x * p.x + p.z * p.z) || 1;

        // Tangent vectors for perimeter rotation
        const tx = -p.z / dist2D;
        const tz = p.x / dist2D;

        const baseOrbitSpeed = 3.2 * swirlFactor;
        p.vx += tx * baseOrbitSpeed * 0.05;
        p.vz += tz * baseOrbitSpeed * 0.05;

        // Centrifugal force pushing towards sphere radius
        if (distFromCenter < sphereRadius * 0.92 && gravity === 0) {
          const push = 0.45;
          p.vx += (p.x / distFromCenter) * push;
          p.vy += (p.y / distFromCenter) * push;
          p.vz += (p.z / distFromCenter) * push;
        }

        // 2. Periodic Gravity Cascade (Water Falling Downwards)
        if (gravity > 0) {
          // Staggered drop based on delay & mass
          const effectiveGravity = Math.max(0, gravity - p.dropDelay * 1.5) * (p.mass * 0.85);
          p.vy += effectiveGravity * 0.18;

          // Droplets experience slight turbulent drag/spray as they fall
          p.vx += (Math.sin(p.y * 0.04 + time * 3) * 0.8);
          p.vz += (Math.cos(p.x * 0.04 + time * 3) * 0.8);
        }

        // 3. Mouse Interaction: Cursor stir & push
        const dx = p.x - mouseX;
        const dy = p.y - mouseY;
        const distMouse = Math.sqrt(dx * dx + dy * dy);
        if (distMouse < 220) {
          const force = (1 - distMouse / 220) * 4.5;
          p.vx += (dx / (distMouse || 1)) * force + mouseSpeedX * 0.08;
          p.vy += (dy / (distMouse || 1)) * force + mouseSpeedY * 0.08;
        }

        // 4. Update Position with Friction/Drag
        const fluidFriction = 0.94;
        p.vx *= fluidFriction;
        p.vy *= fluidFriction;
        p.vz *= fluidFriction;

        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // 5. Spherical Glass Boundary Container Constraint
        // Particles cannot escape sphereRadius
        const currentDist = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
        if (currentDist > sphereRadius) {
          const nx = p.x / currentDist;
          const ny = p.y / currentDist;
          const nz = p.z / currentDist;

          // Clamp to boundary
          p.x = nx * sphereRadius;
          p.y = ny * sphereRadius;
          p.z = nz * sphereRadius;

          // Reflect velocity with bounce damping and curve deflection
          const dot = p.vx * nx + p.vy * ny + p.vz * nz;
          if (dot > 0) {
            p.vx = (p.vx - 1.5 * dot * nx) * 0.75;
            p.vy = (p.vy - 1.5 * dot * ny) * 0.75;
            p.vz = (p.vz - 1.5 * dot * nz) * 0.75;

            // When droplets hit bottom of container during gravity fall,
            // deflect them tangentially to sweep back up along sides
            if (p.y > sphereRadius * 0.65) {
              p.vx += (p.x > 0 ? 1 : -1) * 2.2;
              p.vy -= 1.8; // Upward kick
            }
          }
        }

        // 6. 3D Camera Projection
        const scale = fov / (fov + p.z);
        projected.push({
          px: cx + p.x * scale,
          py: cy + p.y * scale,
          pz: p.z,
          scale,
          char: p.char,
          size: p.size * scale,
        });
      }

      // Sort back-to-front (Painter's algorithm)
      projected.sort((a, b) => a.pz - b.pz);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 7. Depth Layering Color Mapping:
      // Front (pz > 60): Putih Kehijauan (#ffffff, #edfffe)
      // Mid (-60 <= pz <= 60): Hijau Web Auros (#00f5d4, #00b4a7, #cbfffc)
      // Back (pz < -60): Hijau Gelap (#003734, #014d48, #002a28)
      const threshold = sphereRadius * 0.28;

      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];

        let color = '#00f5d4';
        let alpha = 0.85;

        if (p.pz > threshold) {
          // LAYER DEPAN: Putih Kehijauan
          color = p.pz > threshold * 1.8 ? '#ffffff' : '#edfffe';
          alpha = 0.95;
        } else if (p.pz < -threshold) {
          // LAYER BELAKANG: Hijau Gelap
          color = p.pz < -threshold * 1.8 ? '#002a28' : '#014d48';
          alpha = 0.35;
        } else {
          // LAYER TENGAH: Hijau Web Auros
          color = i % 2 === 0 ? '#00f5d4' : '#00b4a7';
          alpha = 0.75;
        }

        ctx.font = `${Math.max(9.5, Math.round(p.size))}px 'GeistMono', monospace, sans-serif`;
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;

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
      <canvas ref={canvasRef} className="w-full h-full block opacity-95" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#012624]/10 to-[#012624] pointer-events-none" />
    </div>
  );
}
