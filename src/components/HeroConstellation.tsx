'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroConstellation() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const flareRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const flare = flareRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || 750;

    // 1. Three.js Scene & Perspective Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
    camera.position.z = 600;

    // 2. WebGL Renderer with Alpha & Device Pixel Ratio
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent canvas
    container.appendChild(renderer.domElement);

    // 3. Create 4x4 Alphanumeric Texture Atlas (0-9, a-f) in Offscreen Canvas
    const atlasCanvas = document.createElement('canvas');
    atlasCanvas.width = 512;
    atlasCanvas.height = 512;
    const atlasCtx = atlasCanvas.getContext('2d')!;
    atlasCtx.clearRect(0, 0, 512, 512);
    atlasCtx.fillStyle = '#ffffff';
    atlasCtx.font = 'bold 88px "GeistMono", monospace, sans-serif';
    atlasCtx.textAlign = 'center';
    atlasCtx.textBaseline = 'middle';

    const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
    for (let i = 0; i < 16; i++) {
      const col = i % 4;
      const row = Math.floor(i / 4);
      const x = col * 128 + 64;
      const y = row * 128 + 64;
      atlasCtx.fillText(chars[i], x, y);
    }

    const glyphTexture = new THREE.CanvasTexture(atlasCanvas);
    glyphTexture.minFilter = THREE.LinearMipMapLinearFilter;
    glyphTexture.magFilter = THREE.LinearFilter;

    // 4. Generate 20,000 Fluid Particles with varying streams & tendrils
    const particleCount = 20000;
    const geometry = new THREE.BufferGeometry();

    const positions = new Float32Array(particleCount * 3);
    const charIndices = new Float32Array(particleCount);
    const masses = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);

    const sphereRadius = 210.0;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < particleCount; i++) {
      const y = 1 - (i / (particleCount - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;

      // Organic fluid volume: some particles cluster in inner drops, some in outer streams
      const streamFactor = Math.sin(i * 0.05) * 0.18;
      const r = sphereRadius * (0.80 + Math.random() * 0.28 + streamFactor);

      const x = Math.cos(theta) * radiusAtY * r;
      const z = Math.sin(theta) * radiusAtY * r;

      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y * r;
      positions[i * 3 + 2] = z;

      charIndices[i] = i % 16;
      masses[i] = 0.6 + Math.random() * 2.2;
      phases[i] = Math.random() * Math.PI * 2;
      // Slightly more delicate particle sizes so negative space lets the fluid breathe
      sizes[i] = 7.0 + Math.random() * 7.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aCharIndex', new THREE.BufferAttribute(charIndices, 1));
    geometry.setAttribute('aMass', new THREE.BufferAttribute(masses, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    // 5. Custom GPU Shader Material (GLSL)
    const uniforms = {
      uTime: { value: 0 },
      uRadius: { value: sphereRadius },
      uTexture: { value: glyphTexture },
      uCollapse: { value: 0.0 },
    };

    const vertexShader = `
      uniform float uTime;
      uniform float uRadius;
      uniform float uCollapse;

      attribute float aCharIndex;
      attribute float aMass;
      attribute float aPhase;
      attribute float aSize;

      varying float vCharIndex;
      varying vec3 vColor;
      varying float vAlpha;

      // Simplex-inspired 3D fluid wave function
      vec3 computeFluidCurl(vec3 p, float t, float phase, float mass) {
        float f1 = sin(p.y * 0.012 + t * 1.6 + phase) * cos(p.z * 0.014 + t * 1.1);
        float f2 = sin(p.x * 0.015 - t * 1.3) * cos(p.y * 0.016 + t * 0.8 + phase);
        float f3 = sin(p.z * 0.018 + t * 1.9 + phase) * cos(p.x * 0.012 - t * 1.4);

        // Viscous undulating fluid blob ripples
        float blob = sin(t * 0.9 + length(p) * 0.018 + phase) * 22.0;

        return vec3(
          (f1 + f2 * 0.5) * 42.0,
          (f2 + f3 * 0.5) * 48.0 + blob * (1.0 / mass),
          (f3 + f1 * 0.5) * 38.0
        );
      }

      void main() {
        vCharIndex = aCharIndex;
        vec3 pos = position;

        // 1. Viscous Liquid Swirl (Mempercepat rotasi saat mengumpul menuju singularity)
        float distCenter = length(pos);
        float radialShear = (distCenter / uRadius);
        float spinBoost = 1.0 + uCollapse * 3.5;
        float orbitSpeed = (0.20 + (1.0 / aMass) * 0.14 + radialShear * 0.12) * spinBoost;
        float angle = uTime * orbitSpeed;
        float cosA = cos(angle);
        float sinA = sin(angle);

        vec3 rotated;
        rotated.x = pos.x * cosA - pos.z * sinA;
        rotated.z = pos.z * cosA + pos.x * sinA;
        rotated.y = pos.y;

        // 2. High-Amplitude Organic Fluid Curl (Peredam distorsi saat memadat)
        vec3 fluidCurl = computeFluidCurl(rotated, uTime, aPhase, aMass);
        rotated += fluidCurl * (1.0 - uCollapse * 0.75);

        // 3. Elastic Liquid Surface Tension Boundary
        float d = length(rotated);
        if (d > uRadius) {
          vec3 norm = normalize(rotated);
          float overflow = d - uRadius;
          rotated -= norm * (overflow * 0.75);
        }

        // 4. Singularity Collapse Core Transformation
        // Menarik seluruh partikel secara eksponensial ke titik pusat tengah
        vec3 finalPos = mix(rotated, vec3(0.0), uCollapse * 0.985);

        // 5. Camera View Transform
        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // Perspective-based point size with collapse scaling
        float sizeScale = (1.0 + sin(aPhase + uTime * 2.0) * 0.18) * mix(1.0, 0.45, uCollapse);
        gl_PointSize = (aSize * sizeScale) * (340.0 / -mvPosition.z);

        // 6. Color & Brightness: Saat mengumpul memancarkan pendaran putih/terang solid
        float zDepth = finalPos.z;
        float threshold = uRadius * 0.28;

        if (zDepth > threshold) {
          vColor = vec3(0.12, 0.12, 0.14);
          vAlpha = 0.85;
        } else if (zDepth < -threshold) {
          vColor = vec3(0.96, 0.95, 1.0);
          vAlpha = 0.98;
        } else {
          vColor = mod(aCharIndex, 2.0) == 0.0 ? vec3(0.42, 0.38, 0.95) : vec3(0.83, 0.83, 0.85);
          vAlpha = 0.80;
        }

        // Boost kecerahan saat memadat ke tengah
        vColor = mix(vColor, vec3(1.0, 0.98, 1.0), uCollapse * 0.85);
        vAlpha = mix(vAlpha, 1.0, uCollapse * 0.4);
      }
    `;

    const fragmentShader = `
      uniform sampler2D uTexture;
      uniform float uCollapse;
      varying float vCharIndex;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        // Calculate 4x4 atlas UV coordinates
        float col = mod(vCharIndex, 4.0);
        float row = floor(vCharIndex / 4.0);

        vec2 uv = gl_PointCoord;
        uv.x = (col + uv.x) * 0.25;
        uv.y = (row + (1.0 - uv.y)) * 0.25;

        vec4 texColor = texture2D(uTexture, uv);

        // Discard transparent pixels outside character glyph
        if (texColor.a < 0.15) discard;

        // Radiance flare boost: Meningkatkan intensitas cahaya partikel saat memadat
        float glowBoost = 1.25 + uCollapse * 3.2;
        gl_FragColor = vec4(vColor * glowBoost, texColor.a * vAlpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    const handleWindowResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleWindowResize);

    // 6. Render Loop with Continuous Looping Orbit & Singularity Collapse Interpolation
    let animId: number;
    const clock = new THREE.Clock();

    let targetCollapse = 0.0;
    let currentCollapse = 0.0;

    const handleCollapseEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ active?: boolean }>;
      targetCollapse = customEvent.detail?.active ? 1.0 : 0.0;
    };

    window.addEventListener('komit:collapse-particles', handleCollapseEvent);

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      uniforms.uTime.value = elapsedTime;

      // Smooth damping interpolation (lerp ~300ms)
      currentCollapse += (targetCollapse - currentCollapse) * 0.085;
      uniforms.uCollapse.value = currentCollapse;

      // Update atmospheric singularity glow secara 60 FPS
      if (flare) {
        flare.style.opacity = String(Math.min(1, currentCollapse * 1.2));
        flare.style.transform = `scale(${0.3 + currentCollapse * 0.9})`;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('komit:collapse-particles', handleCollapseEvent);
      cancelAnimationFrame(animId);

      renderer.dispose();
      geometry.dispose();
      material.dispose();
      glyphTexture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden flex items-center justify-center"
    >
      {/* Central Singularity Epic Glow (White Core + Sunset Amber Flare) */}
      <div
        ref={flareRef}
        style={{ opacity: 0, transform: 'scale(0.3)' }}
        className="absolute w-[260px] sm:w-[360px] h-[260px] sm:h-[360px] rounded-full pointer-events-none will-change-[transform,opacity] transition-opacity duration-75 flex items-center justify-center"
      >
        {/* Outer Solar Amber Halo (Saffron Spark #ffb829 & Sunset Orange) */}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,160,40,0.7)_0%,rgba(255,120,20,0.45)_35%,rgba(255,80,0,0.2)_55%,transparent_72%)] blur-[44px]" />
        {/* Middle Luminous Warm White Flare */}
        <div className="absolute w-[140px] h-[140px] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.95)_0%,rgba(255,210,120,0.8)_45%,transparent_75%)] blur-[20px] shadow-[0_0_50px_rgba(255,160,40,0.6)]" />
        {/* Intense White-Hot Singularity Point */}
        <div className="absolute w-[50px] h-[50px] rounded-full bg-white blur-[6px] shadow-[0_0_40px_#ffffff]" />
      </div>
    </div>
  );
}
