"use client";

import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BoxGeometry, EdgesGeometry, MeshStandardMaterial, type Mesh } from "three";
import type { Group } from "three";
import { applyBrandColor } from "@/lib/theme-color";

// Classic cube colors, mapped per outward-facing side. Faces that point
// inward (between cubies) stay dark — same trick real Rubik's cube
// renderers use instead of modeling 26 separate stickered pieces. Clicking
// one of these (not the dark inner faces) re-themes the whole site to it.
const FACE_COLOR = {
  right: "#c1121f",
  left: "#f77f00",
  top: "#f8f9fa",
  bottom: "#ffd60a",
  front: "#2b9348",
  back: "#1d3557",
  inner: "#161616",
};

function cubieMaterials(x: number, y: number, z: number) {
  const pick = (cond: boolean, color: string) => new MeshStandardMaterial({ color: cond ? color : FACE_COLOR.inner, roughness: 0.35, metalness: 0.05 });
  return [
    pick(x === 1, FACE_COLOR.right),
    pick(x === -1, FACE_COLOR.left),
    pick(y === 1, FACE_COLOR.top),
    pick(y === -1, FACE_COLOR.bottom),
    pick(z === 1, FACE_COLOR.front),
    pick(z === -1, FACE_COLOR.back),
  ];
}

const cubieEdges = new EdgesGeometry(new BoxGeometry(0.94, 0.94, 0.94));

function Cubie({ position }: { position: [number, number, number] }) {
  const materials = useMemo(() => cubieMaterials(...position), [position]);
  return (
    <mesh position={position} material={materials}>
      <boxGeometry args={[0.94, 0.94, 0.94]} />
      <lineSegments geometry={cubieEdges}>
        <lineBasicMaterial color="#0a0a0a" />
      </lineSegments>
    </mesh>
  );
}

// Drag with the mouse/touch to spin the whole cube around (idles with a
// slow auto-rotation and a little residual momentum when you let go).
// Grabbing a colored face — the moment you press down on it, which is also
// what stops the spin — re-themes the site to that color immediately, so
// it's "whichever side you catch it on," not a separate careful click.
function DraggableCube() {
  const groupRef = useRef<Group>(null);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });

  const cubies = useMemo(() => {
    const list: [number, number, number][] = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          list.push([x, y, z]);
        }
      }
    }
    return list;
  }, []);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    if (dragging.current) return;
    group.rotation.y += 0.005 + velocity.current.y;
    group.rotation.x += velocity.current.x;
    velocity.current.x *= 0.94;
    velocity.current.y *= 0.94;
  });

  function onDown(e: ThreeEvent<PointerEvent>) {
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
    (e.target as { setPointerCapture?: (id: number) => void }).setPointerCapture?.(e.pointerId);

    // Grabbing a face is what picks its color — right away, not on release.
    if (e.face && typeof e.face.materialIndex === "number") {
      const materials = (e.object as Mesh).material;
      const mat = Array.isArray(materials) ? materials[e.face.materialIndex] : undefined;
      if (mat && "color" in mat) {
        const hex = `#${(mat as MeshStandardMaterial).color.getHexString()}`;
        if (hex.toLowerCase() !== FACE_COLOR.inner) applyBrandColor(hex);
      }
    }
  }
  function onMove(e: ThreeEvent<PointerEvent>) {
    if (!dragging.current || !groupRef.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    groupRef.current.rotation.y += dx * 0.01;
    groupRef.current.rotation.x += dy * 0.01;
    velocity.current = { x: dy * 0.0006, y: dx * 0.0006 };
    last.current = { x: e.clientX, y: e.clientY };
  }
  function onUp() {
    dragging.current = false;
  }

  return (
    <group
      ref={groupRef}
      rotation={[0.45, 0.6, 0]}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerOut={onUp}
    >
      {cubies.map((pos, i) => (
        <Cubie key={i} position={pos} />
      ))}
    </group>
  );
}

export function RubiksCubeScene() {
  return (
    <Canvas camera={{ position: [0, 0, 6.2], fov: 40 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={1.3} />
      <pointLight position={[-4, -2, 3]} intensity={0.5} color="#22d3ee" />
      <DraggableCube />
    </Canvas>
  );
}
