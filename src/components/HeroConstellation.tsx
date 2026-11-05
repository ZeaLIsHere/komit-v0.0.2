'use client';

import React, { useEffect, useRef } from 'react';

interface Particle3D {
  // Rest position on sphere
  ox: number;
  oy: number;
  oz: number;
  // Current dynamic position
  x: number;
  y: number;
  z: number;
  // Velocity
  vx: number;
  vy: number;
  vz: number;
  // Physical traits
  mass: number;
  drag: number;
  spring: number;
  char: string;
  color: string;
  size: number;
  curlOffset: number;
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

    // Mouse position & velocity tracking for physical momentum
    let mouseX = 0;
    let mouseY = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let mouseVelX = 0;
    let mouseVelY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const currentX = (e.clientX - rect.left - width / 2);
      const currentY = (e.clientY - rect.top - height / 2);

      mouseVelX = currentX - mouseX;
      mouseVelY = currentY - mouseY;

      mouseX = currentX;
      mouseY = currentY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        const currentX = (e.touches[0].clientX - rect.left - width / 2);
        const currentY = (e.touches[0].clientY - rect.top - height / 2);

        mouseVelX = currentX - mouseX;
        mouseVelY = currentY - mouseY;

        mouseX = currentX;
        mouseY = currentY;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    // Characters & Auros bioluminescent color spectrum
    const glyphs = ['0', '1', '7', 'f', 'a', '8', '9', 'c', '3', 'b', 'e', '4', 'x', '•'];
    const colors = [
      '#00f5d4', // electric cyan
      '#00b4a7', // deep aqua
      '#cbfffc', // pale aqua
      '#ffffff', // platinum
      '#edfffe', // liquid mist
      '#fde9ff', // lavender phosphor accent
    ];

    const particleCount = 1450;
    const baseRadius = Math.min(width, height) * 0.40;
    const particles: Particle3D[] = [];

    // Fibonacci sphere with layered depth volume
    const phi = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      // Layered thickness (not a hollow sphere shell, creates fluid density)
      const depthFactor = 0.82 + Math.random() * 0.36;
      const r = baseRadius * depthFactor;

      const px = Math.cos(theta) * radiusAtY * r;
      const py = y * r;
      const pz = Math.sin(theta) * radiusAtY * r;

      // Random mass variance: heavy particles lag behind, light particles swirl outwards
      const mass = 0.8 + Math.random() * 1.8;

      particles.push({
        ox: px,
        oy: py,
        oz: pz,
        x: px,
        y: py,
        z: pz,
        vx: 0,
        vy: 0,
        vz: 0,
        mass,
        drag: 0.89 + Math.random() * 0.05,
        spring: 0.045 + Math.random() * 0.025,
        char: glyphs[i % glyphs.length],
        color: colors[i % colors.length],
        size: Math.random() * 3.5 + 8,
        curlOffset: Math.random() * Math.PI * 2,
      });
    }

    let time = 0;
    let sphereRotX = 0;
    let sphereRotY = 0;
    const fov = 420;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      time += 0.018;

      // Decay mouse velocity
      mouseVelX *= 0.92;
      mouseVelY *= 0.92;

      // Sphere rotation driven by idle drift + mouse drag
      sphereRotY += 0.003 + mouseVelX * 0.0008;
      sphereRotX += mouseVelY * 0.0008;

      const cosY = Math.cos(sphereRotY);
      const sinY = Math.sin(sphereRotY);
      const cosX = Math.cos(sphereRotX);
      const sinX = Math.sin(sphereRotX);

      const cx = width / 2;
      const cy = height / 2;

      const mouseSpeed = Math.sqrt(mouseVelX * mouseVelX + mouseVelY * mouseVelY);
      const projected = [];

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];

        // 1. Calculate ideal rotated resting point
        const rx1 = p.ox * cosY - p.oz * sinY;
        const rz1 = p.oz * cosY + p.ox * sinY;
        const ry2 = p.oy * cosX - rz1 * sinX;
        const rz2 = rz1 * cosX + p.oy * sinX;

        // 2. Fluid turbulence & vortex shear:
        // Distance from center causes rotational shear (twist like vortex/swirl in screenshot)
        const distFromAxis = Math.sqrt(rx1 * rx1 + ry2 * ry2);
        const swirlAngle = (distFromAxis / baseRadius) * 0.8 + time * 1.2;

        const fluidCurlX = Math.sin(swirlAngle + p.curlOffset) * 18;
        const fluidCurlY = Math.cos(swirlAngle * 1.4 + p.curlOffset) * 16;
        const fluidCurlZ = Math.sin(p.ox * 0.015 + time) * 14;

        // 3. Mouse repulsion/drag impulse:
        // When mouse approaches or moves fast, fluid pushes away and distorts into a teardrop
        const dx = rx1 - mouseX;
        const dy = ry2 - mouseY;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);
        let impulseX = 0;
        let impulseY = 0;

        if (distToMouse < 260) {
          const force = (1 - distToMouse / 260) * (25 + mouseSpeed * 2.5);
          impulseX = (dx / (distToMouse || 1)) * force;
          impulseY = (dy / (distToMouse || 1)) * force;
        }

        // Target position in 3D space
        const targetX = rx1 + fluidCurlX + impulseX;
        const targetY = ry2 + fluidCurlY + impulseY;
        const targetZ = rz2 + fluidCurlZ;

        // 4. Spring-Mass-Damper Physics (Weight & Inertia):
        // F = -k * (x - target), a = F / mass
        const ax = (targetX - p.x) * (p.spring / p.mass);
        const ay = (targetY - p.y) * (p.spring / p.mass);
        const az = (targetZ - p.z) * (p.spring / p.mass);

        p.vx = (p.vx + ax) * p.drag;
        p.vy = (p.vy + ay) * p.drag;
        p.vz = (p.vz + az) * p.drag;

        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // 5. 3D Perspective Projection
        const scale = fov / (fov + p.z);

        projected.push({
          px: cx + p.x * scale,
          py: cy + p.y * scale,
          pz: p.z,
          scale,
          char: p.char,
          color: p.color,
          size: p.size * scale,
          speed: Math.sqrt(p.vx * p.vx + p.vy * p.vy + p.vz * p.vz),
        });
      }

      // Painter's algorithm: sort back-to-front
      projected.sort((a, b) => a.pz - b.pz);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // 6. Draw dynamic particles
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];

        // Alpha based on Z-depth + motion stretch glow
        const normalizedZ = (p.pz + baseRadius) / (baseRadius * 2);
        const baseAlpha = Math.min(1.0, Math.max(0.12, normalizedZ * 1.15));
        const motionBoost = Math.min(0.3, p.speed * 0.04);
        const alpha = Math.min(1.0, baseAlpha + motionBoost);

        ctx.font = `${Math.max(6.5, Math.round(p.size))}px 'GeistMono', monospace, sans-serif`;
        ctx.fillStyle = p.color;
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
      <canvas ref={canvasRef} className="w-full h-full block opacity-90" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#012624]/10 to-[#012624] pointer-events-none" />
    </div>
  );
}
