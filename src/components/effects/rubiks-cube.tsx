"use client";

import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { BoxGeometry, EdgesGeometry, MeshStandardMaterial } from "three";
import type { Group } from "three";

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

// The centerpiece: brushed silver, drag with the mouse/touch to spin it
// around (idles with a slow auto-rotation, a little residual momentum on
// release). Colour picking is handled by real HTML swatches below the
// canvas (BrandColorPicker), not by clicking the 3D object.
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
      position={[0, 0, 0]}
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

export function RubiksCubeScene() {
  return (
    <Canvas camera={{ position: [0, 0, 8], fov: 42 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={1} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <pointLight position={[-4, -2, 3]} intensity={0.6} color="#22d3ee" />
      <DraggableCube />
    </Canvas>
  );
}
