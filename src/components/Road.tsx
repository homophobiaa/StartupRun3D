import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import { LANE_X, ROAD_LENGTH, rowZ } from './constants';

const TONE_NEON = ['#22d3ee', '#a78bfa', '#34d399', '#fb7185', '#f59e0b'];

/** A glowing neon runway with a scrolling city skyline and floating shapes. */
export default function Road({ rowCount, reducedMotion }: { rowCount: number; reducedMotion: boolean }) {
  const shapes = useRef<Group>(null);

  // Deterministic skyline of side buildings.
  const buildings = useMemo(() => {
    const out: { x: number; z: number; h: number; w: number; c: string }[] = [];
    let seed = 1234;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let z = -10; z < ROAD_LENGTH; z += 9) {
      for (const side of [-1, 1]) {
        const h = 4 + rnd() * 16;
        out.push({
          x: side * (8 + rnd() * 9),
          z: z + rnd() * 4,
          h,
          w: 1.4 + rnd() * 2.4,
          c: TONE_NEON[Math.floor(rnd() * TONE_NEON.length)],
        });
      }
    }
    return out;
  }, []);

  // Floating abstract tech shapes that bob.
  const floaters = useMemo(() => {
    const out: { x: number; y: number; z: number; c: string }[] = [];
    let seed = 99;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 16; i++) {
      out.push({
        x: (rnd() - 0.5) * 22,
        y: 6 + rnd() * 8,
        z: rnd() * ROAD_LENGTH,
        c: TONE_NEON[Math.floor(rnd() * TONE_NEON.length)],
      });
    }
    return out;
  }, []);

  useFrame((state) => {
    if (shapes.current && !reducedMotion) {
      shapes.current.rotation.y = state.clock.elapsedTime * 0.15;
      shapes.current.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.4;
    }
  });

  return (
    <group>
      {/* main road surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, ROAD_LENGTH / 2 - 20]} receiveShadow>
        <planeGeometry args={[11, ROAD_LENGTH]} />
        <meshStandardMaterial color="#0a0f24" metalness={0.4} roughness={0.5} />
      </mesh>

      {/* outer glow rails */}
      {[-5.4, 5.4].map((x) => (
        <mesh key={x} position={[x, 0.06, ROAD_LENGTH / 2 - 20]}>
          <boxGeometry args={[0.14, 0.14, ROAD_LENGTH]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2.2} toneMapped={false} />
        </mesh>
      ))}

      {/* lane separators */}
      {[0, 1].map((i) => {
        const x = (LANE_X[i] + LANE_X[i + 1]) / 2;
        return (
          <mesh key={i} position={[x, 0.05, ROAD_LENGTH / 2 - 20]}>
            <boxGeometry args={[0.06, 0.06, ROAD_LENGTH]} />
            <meshStandardMaterial color="#1e90c0" emissive="#1e90c0" emissiveIntensity={1.2} toneMapped={false} />
          </mesh>
        );
      })}

      {/* checkpoint markers at each decision row */}
      {Array.from({ length: rowCount }).map((_, i) => (
        <mesh key={i} position={[0, 0.04, rowZ(i)]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[5.0, 5.3, 48]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.5} toneMapped={false} />
        </mesh>
      ))}

      {/* finish portal */}
      <mesh position={[0, 4, rowZ(rowCount - 1) + 14]}>
        <torusGeometry args={[4.5, 0.18, 12, 40]} />
        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={2.5} toneMapped={false} />
      </mesh>

      {/* city skyline */}
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]}>
          <boxGeometry args={[b.w, b.h, b.w]} />
          <meshStandardMaterial color="#0c1330" emissive={b.c} emissiveIntensity={0.35} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* floating abstract shapes */}
      <group ref={shapes}>
        {floaters.map((f, i) => (
          <mesh key={i} position={[f.x, f.y, f.z]} rotation={[i, i * 0.5, 0]}>
            <octahedronGeometry args={[0.6, 0]} />
            <meshStandardMaterial color={f.c} emissive={f.c} emissiveIntensity={0.8} transparent opacity={0.5} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
