"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";

function FloatingCrystal() {
  const meshRef = useRef<Mesh>(null);

  // Subtle mouse-parallax: the crystal leans slightly toward the pointer
  // (state.pointer is normalized -1..1 by R3F) on top of its own spin.
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.003;
    meshRef.current.rotation.x = state.pointer.y * 0.15;
    meshRef.current.rotation.z = -state.pointer.x * 0.1;
  });

  return (
    <Float speed={1.6} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.4, 0]} />
        <meshStandardMaterial
          color="#ff6a00"
          roughness={0.15}
          metalness={0.6}
          emissive="#c94f00"
          emissiveIntensity={0.25}
        />
      </mesh>
    </Float>
  );
}

// Isolated Canvas so the ~150kb three.js/R3F bundle only loads on the route
// that imports this file (dynamically, ssr:false) — never on other pages.
export function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 3, 4]} intensity={1.4} />
      <pointLight position={[-4, -2, 2]} intensity={0.6} color="#22d3ee" />
      <FloatingCrystal />
    </Canvas>
  );
}
