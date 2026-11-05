'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HeroConstellation() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
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

    // 4. Generate 32,000 Particles distributed in Fibonacci Spherical Shell
    const particleCount = 32000;
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

      // Volumetric shell thickness (creates dense liquid depth)
      const r = sphereRadius * (0.84 + Math.random() * 0.20);

      const x = Math.cos(theta) * radiusAtY * r;
      const z = Math.sin(theta) * radiusAtY * r;

      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = y * r;
      positions[i * 3 + 2] = z;

      charIndices[i] = i % 16;
      masses[i] = 0.7 + Math.random() * 1.6;
      phases[i] = Math.random() * Math.PI * 2;
      sizes[i] = 9.0 + Math.random() * 8.0;
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
      uGravity: { value: 0.0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uMouseVel: { value: new THREE.Vector2(0, 0) },
    };

    const vertexShader = `
      uniform float uTime;
      uniform float uRadius;
      uniform float uGravity;
      uniform vec2 uMouse;
      uniform vec2 uMouseVel;

      attribute float aCharIndex;
      attribute float aMass;
      attribute float aPhase;
      attribute float aSize;

      varying float vCharIndex;
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        vCharIndex = aCharIndex;
        vec3 pos = position;

        // 1. Vortex Cyclonic Rotation along outer perimeter
        float orbitSpeed = (0.28 + (1.0 / aMass) * 0.12) * (1.0 - uGravity * 0.65);
        float angle = uTime * orbitSpeed;
        float cosA = cos(angle);
        float sinA = sin(angle);

        vec3 rotated;
        rotated.x = pos.x * cosA - pos.z * sinA;
        rotated.z = pos.z * cosA + pos.x * sinA;
        rotated.y = pos.y;

        // 2. Fluid Wave Turbulence & Swirl Shear
        float distCenter = length(rotated);
        float swirl = (distCenter / uRadius) * 0.75 + uTime * 1.4;
        rotated.x += sin(swirl + aPhase) * 12.0;
        rotated.y += cos(swirl * 1.3 + aPhase) * 10.0;
        rotated.z += sin(pos.x * 0.02 + uTime) * 11.0;

        // 3. Periodic Gravity Waterfall Cascade
        if (uGravity > 0.001) {
          float dropForce = uGravity * aMass * 26.0;
          rotated.y -= dropForce;
          // Spray wave as water falls
          rotated.x += sin(rotated.y * 0.04 + uTime * 4.0) * 8.0;
        }

        // 4. Spherical Container Boundary (Glass Barrier Constraint)
        float d = length(rotated);
        if (d > uRadius) {
          vec3 norm = normalize(rotated);
          rotated = norm * uRadius;
          // When water hits bottom of sphere during drop, deflect upwards/sideways
          if (rotated.y < -uRadius * 0.6) {
            rotated.y += 18.0 * uGravity;
            rotated.x += (norm.x > 0.0 ? 1.0 : -1.0) * 14.0 * uGravity;
          }
        }

        // 5. Mouse Interaction Push & Swirl
        vec2 screenDist = vec2(rotated.x - uMouse.x, rotated.y - uMouse.y);
        float mouseDist = length(screenDist);
        if (mouseDist < 160.0) {
          float push = (1.0 - mouseDist / 160.0) * 35.0;
          rotated.xy += normalize(screenDist) * push;
        }

        // 6. Camera View Transform
        vec4 mvPosition = modelViewMatrix * vec4(rotated, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // Perspective-based point size
        gl_PointSize = aSize * (350.0 / -mvPosition.z);

        // 7. Depth Layering Color Logic (Inverted as requested):
        // Layer Depan (Z > threshold): Hijau Gelap
        // Layer Belakang (Z < -threshold): Putih Kehijauan Terang (Luminous Glow)
        // Layer Tengah: Hijau Web Auros
        float zDepth = rotated.z;
        float threshold = uRadius * 0.28;

        if (zDepth > threshold) {
          // DEPAN: Hijau Gelap
          vColor = vec3(0.004, 0.21, 0.18);
          vAlpha = 0.85;
        } else if (zDepth < -threshold) {
          // BELAKANG: Putih Kehijauan Luminous Glow
          vColor = vec3(0.93, 1.0, 0.99);
          vAlpha = 0.95;
        } else {
          // TENGAH: Hijau Web Auros (Cyan / Aqua)
          vColor = mod(aCharIndex, 2.0) == 0.0 ? vec3(0.0, 0.96, 0.83) : vec3(0.0, 0.71, 0.65);
          vAlpha = 0.78;
        }
      }
    `;

    const fragmentShader = `
      uniform sampler2D uTexture;
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

        gl_FragColor = vec4(vColor * 1.25, texColor.a * vAlpha);
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

    // 6. Interactive Mouse & Velocity Tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let curMouseX = 0;
    let curMouseY = 0;
    let prevX = 0;
    let prevY = 0;

    const onPointerMove = (e: MouseEvent | Touch) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / height) * 2 - 1);

      targetMouseX = x * (sphereRadius * 1.15);
      targetMouseY = y * (sphereRadius * 1.15);
    };

    const handleMouseMove = (e: MouseEvent) => onPointerMove(e);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) onPointerMove(e.touches[0]);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    const handleWindowResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleWindowResize);

    // 7. Render Loop with 60+ FPS GPU Acceleration
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();
      uniforms.uTime.value = elapsedTime;

      // Smooth mouse interpolation
      curMouseX += (targetMouseX - curMouseX) * 0.08;
      curMouseY += (targetMouseY - curMouseY) * 0.08;

      const velX = curMouseX - prevX;
      const velY = curMouseY - prevY;
      prevX = curMouseX;
      prevY = curMouseY;

      uniforms.uMouse.value.set(curMouseX, curMouseY);
      uniforms.uMouseVel.value.set(velX, velY);

      // Periodic Gravity Drop: Cycle every 12 seconds, brief ~1.2s cascade
      const cycleTime = elapsedTime % 12.0;
      let grav = 0.0;
      if (cycleTime > 9.8 && cycleTime < 11.0) {
        const dropPhase = (cycleTime - 9.8) / 1.2;
        grav = Math.sin(dropPhase * Math.PI);
      }
      uniforms.uGravity.value = grav;

      // Subtle tilt of sphere with cursor
      pointCloud.rotation.y = curMouseX * 0.0012;
      pointCloud.rotation.x = -curMouseY * 0.0012;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
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
      {/* Center atmospheric glow and radial fade */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#012624]/20 to-[#012624] pointer-events-none" />
    </div>
  );
}
