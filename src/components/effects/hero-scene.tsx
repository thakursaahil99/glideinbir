"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useRef } from "react";
import type { Mesh } from "three";

export type ShapeVariant = "icosahedron" | "octahedron" | "torus" | "dodecahedron" | "sphere";

function ShapeGeometry({ variant }: { variant: ShapeVariant }) {
  switch (variant) {
    case "octahedron":
      return <octahedronGeometry args={[1.5, 0]} />;
    case "torus":
      return <torusGeometry args={[1.1, 0.42, 16, 64]} />;
    case "dodecahedron":
      return <dodecahedronGeometry args={[1.3, 0]} />;
    case "sphere":
      return <sphereGeometry args={[1.3, 32, 32]} />;
    case "icosahedron":
    default:
      return <icosahedronGeometry args={[1.4, 0]} />;
  }
}

function FloatingShape({
  variant,
  color,
  emissive,
}: {
  variant: ShapeVariant;
  color: string;
  emissive: string;
}) {
  const meshRef = useRef<Mesh>(null);

  // Subtle mouse-parallax: the shape leans slightly toward the pointer
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
        <ShapeGeometry variant={variant} />
        <meshStandardMaterial
          color={color}
          roughness={0.15}
          metalness={0.6}
          emissive={emissive}
          emissiveIntensity={0.25}
        />
      </mesh>
    </Float>
  );
}

// Isolated Canvas so the ~150kb three.js/R3F bundle only loads on routes
// that actually import this file (dynamically, ssr:false, via
// HeroSceneLazy) — shared across pages as one cached chunk, not
// re-downloaded per page.
export function HeroScene({
  variant = "icosahedron",
  color = "#ff6a00",
  emissive = "#c94f00",
}: {
  variant?: ShapeVariant;
  color?: string;
  emissive?: string;
}) {
  return (
    <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 3, 4]} intensity={1.4} />
      <pointLight position={[-4, -2, 2]} intensity={0.6} color="#22d3ee" />
      <FloatingShape variant={variant} color={color} emissive={emissive} />
    </Canvas>
  );
}
