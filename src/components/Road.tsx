import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';
import type { GraphicsQuality } from '../game/types';
import { LANE_X, ROAD_LENGTH, rowZ } from './constants';

const TONE_NEON = ['#22d3ee', '#a78bfa', '#34d399', '#fb7185', '#f59e0b'];

interface Props {
  rowCount: number;
  quality: GraphicsQuality;
  reducedMotion: boolean;
}

/** A neon runway with a (quality-scaled) skyline and floating shapes. */
function Road({ rowCount, quality, reducedMotion }: Props) {
  const shapes = useRef<Group>(null);
  const buildingStep = quality === 'low' ? 0 : quality === 'medium' ? 14 : 9;
  const floaterCount = quality === 'low' ? 0 : quality === 'medium' ? 7 : 14;

  const buildings = useMemo(() => {
    const out: { x: number; z: number; h: number; w: number; c: string }[] = [];
    if (!buildingStep) return out;
    let seed = 1234;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let z = -10; z < ROAD_LENGTH; z += buildingStep) {
      for (const side of [-1, 1]) {
        const h = 5 + rnd() * 18;
        out.push({ x: side * (9 + rnd() * 10), z: z + rnd() * 4, h, w: 1.6 + rnd() * 2.6, c: TONE_NEON[Math.floor(rnd() * TONE_NEON.length)] });
      }
    }
    return out;
  }, [buildingStep]);

  const floaters = useMemo(() => {
    const out: { x: number; y: number; z: number; c: string }[] = [];
    let seed = 99;
    const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < floaterCount; i++) {
      out.push({ x: (rnd() - 0.5) * 24, y: 7 + rnd() * 8, z: rnd() * ROAD_LENGTH, c: TONE_NEON[Math.floor(rnd() * TONE_NEON.length)] });
    }
    return out;
  }, [floaterCount]);

  useFrame((state) => {
    if (shapes.current && !reducedMotion) {
      shapes.current.rotation.y = state.clock.elapsedTime * 0.12;
    }
  });

  return (
    <group>
      {/* road surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, ROAD_LENGTH / 2 - 20]} receiveShadow>
        <planeGeometry args={[13, ROAD_LENGTH]} />
        <meshStandardMaterial color="#0a0f24" metalness={0.5} roughness={0.45} />
      </mesh>

      {/* outer glow rails */}
      {[-6.4, 6.4].map((x) => (
        <mesh key={x} position={[x, 0.06, ROAD_LENGTH / 2 - 20]}>
          <boxGeometry args={[0.16, 0.16, ROAD_LENGTH]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2.2} toneMapped={false} />
        </mesh>
      ))}

      {/* lane separators */}
      {[0, 1].map((i) => {
        const x = (LANE_X[i] + LANE_X[i + 1]) / 2;
        return (
          <mesh key={i} position={[x, 0.05, ROAD_LENGTH / 2 - 20]}>
            <boxGeometry args={[0.07, 0.07, ROAD_LENGTH]} />
            <meshStandardMaterial color="#1e90c0" emissive="#1e90c0" emissiveIntensity={1.2} toneMapped={false} />
          </mesh>
        );
      })}

      {/* checkpoint rings */}
      {Array.from({ length: rowCount }).map((_, i) => (
        <mesh key={i} position={[0, 0.04, rowZ(i)]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[6.0, 6.3, 40]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.45} toneMapped={false} />
        </mesh>
      ))}

      {/* finish portal */}
      <mesh position={[0, 4.5, rowZ(rowCount - 1) + 18]}>
        <torusGeometry args={[5, 0.2, 10, 36]} />
        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={2.5} toneMapped={false} />
      </mesh>

      {/* skyline */}
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]}>
          <boxGeometry args={[b.w, b.h, b.w]} />
          <meshStandardMaterial color="#0c1330" emissive={b.c} emissiveIntensity={0.3} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* floating shapes */}
      <group ref={shapes}>
        {floaters.map((f, i) => (
          <mesh key={i} position={[f.x, f.y, f.z]} rotation={[i, i * 0.5, 0]}>
            <octahedronGeometry args={[0.6, 0]} />
            <meshStandardMaterial color={f.c} emissive={f.c} emissiveIntensity={0.7} transparent opacity={0.45} toneMapped={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default Road;
