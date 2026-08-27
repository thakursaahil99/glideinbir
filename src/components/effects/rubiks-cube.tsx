"use client";

import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BoxGeometry, EdgesGeometry, MeshStandardMaterial, type Mesh } from "three";
import type { Group } from "three";
import { applyBrandColor } from "@/lib/theme-color";

type FaceColors = {
  right: string;
  left: string;
  top: string;
  bottom: string;
  front: string;
  back: string;
};

const INNER = "#141414";
const SILVER = "#c9ccd3";
const SILVER_FACES: FaceColors = {
  right: SILVER,
  left: SILVER,
  top: SILVER,
  bottom: SILVER,
  front: SILVER,
  back: SILVER,
};

function buildCubieMaterials(
  colors: FaceColors,
  roughness: number,
  metalness: number,
  x: number,
  y: number,
  z: number,
) {
  const pick = (cond: boolean, color: string) =>
    new MeshStandardMaterial({
      color: cond ? color : INNER,
      roughness: cond ? roughness : roughness + 0.2,
      metalness: cond ? metalness : 0.1,
    });
  return [
    pick(x === 1, colors.right),
    pick(x === -1, colors.left),
    pick(y === 1, colors.top),
    pick(y === -1, colors.bottom),
    pick(z === 1, colors.front),
    pick(z === -1, colors.back),
  ];
}

const cubieEdges = new EdgesGeometry(new BoxGeometry(0.94, 0.94, 0.94));

const CUBIE_POSITIONS: [number, number, number][] = (() => {
  const list: [number, number, number][] = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        list.push([x, y, z]);
      }
    }
  }
  return list;
})();

function Cubie({
  position,
  colors,
  roughness,
  metalness,
}: {
  position: [number, number, number];
  colors: FaceColors;
  roughness: number;
  metalness: number;
}) {
  const materials = useMemo(
    () => buildCubieMaterials(colors, roughness, metalness, ...position),
    [position, colors, roughness, metalness],
  );
  return (
    <mesh position={position} material={materials}>
      <boxGeometry args={[0.94, 0.94, 0.94]} />
      <lineSegments geometry={cubieEdges}>
        <lineBasicMaterial color="#0a0a0a" />
      </lineSegments>
    </mesh>
  );
}

// Grabbing any face applies its color — the material actually clicked, not
// a color baked onto the whole object, so a fully-silver cube and a
// multicolor one both "just work" through the same handler.
function pickColorFromFace(e: ThreeEvent<PointerEvent>) {
  if (!e.face || typeof e.face.materialIndex !== "number") return;
  const materials = (e.object as Mesh).material;
  const mat = Array.isArray(materials) ? materials[e.face.materialIndex] : undefined;
  if (mat && "color" in mat) {
    const hex = `#${(mat as MeshStandardMaterial).color.getHexString()}`;
    if (hex.toLowerCase() !== INNER) applyBrandColor(hex);
  }
}

// The centerpiece: brushed silver, drag with the mouse/touch to spin it
// around (idles with a slow auto-rotation, a little residual momentum on
// release). Grabbing it also picks silver as the site's theme color.
function DraggableCube() {
  const groupRef = useRef<Group>(null);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });

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
    pickColorFromFace(e);
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
      position={[0, 1, 0]}
      rotation={[0.45, 0.6, 0]}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerOut={onUp}
    >
      {CUBIE_POSITIONS.map((pos, i) => (
        <Cubie key={i} position={pos} colors={SILVER_FACES} roughness={0.22} metalness={0.85} />
      ))}
    </group>
  );
}

// Back to a single row of small solid-color cubes — the multicolor
// mini-Rubik's-cube grid was fiddly to tell apart at a glance and felt busy.
// A flat, unambiguous color per cube, one row, each one just spins in place.
const PALETTE_COLORS = [
  "#ff6a00", // brand orange (default)
  "#ef4444", // red
  "#3b82f6", // blue
  "#22c55e", // green
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // teal
  "#f59e0b", // amber
];

const paletteEdges = new EdgesGeometry(new BoxGeometry(0.55, 0.55, 0.55));

// Each swatch spins in place on its own axis/speed (alternating direction
// for variety, same "always turning" feel as the centerpiece) and pops
// slightly on hover; grabbing it picks its (one, unambiguous) color
// instantly — no per-face lookup needed, unlike the multicolor centerpiece.
function PaletteCube({
  position,
  color,
  spinSpeed,
}: {
  position: [number, number, number];
  color: string;
  spinSpeed: number;
}) {
  const groupRef = useRef<Group>(null);
  const hovered = useRef(false);
  const material = useMemo(
    () => new MeshStandardMaterial({ color, roughness: 0.28, metalness: 0.15 }),
    [color],
  );

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    group.rotation.y += spinSpeed;
    group.rotation.x += spinSpeed * 0.6;
    const target = hovered.current ? 1.3 : 1;
    const next = group.scale.x + (target - group.scale.x) * 0.25;
    group.scale.set(next, next, next);
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0.5, 0.7, 0]}
      onPointerOver={() => {
        hovered.current = true;
      }}
      onPointerOut={() => {
        hovered.current = false;
      }}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        applyBrandColor(color);
      }}
    >
      <mesh material={material}>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        <lineSegments geometry={paletteEdges}>
          <lineBasicMaterial color="#0a0a0a" />
        </lineSegments>
      </mesh>
    </group>
  );
}

function ColorPalette() {
  const spacing = 0.62;
  const startX = -((PALETTE_COLORS.length - 1) * spacing) / 2;
  return (
    <group position={[0, -1.9, 0]}>
      {PALETTE_COLORS.map((color, i) => (
        <PaletteCube
          key={color}
          color={color}
          position={[startX + i * spacing, 0, 0]}
          spinSpeed={(i % 2 === 0 ? 1 : -1) * (0.01 + (i % 3) * 0.004)}
        />
      ))}
    </group>
  );
}

export function RubiksCubeScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={1} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <pointLight position={[-4, -2, 3]} intensity={0.6} color="#22d3ee" />
      <DraggableCube />
      <ColorPalette />
    </Canvas>
  );
}
