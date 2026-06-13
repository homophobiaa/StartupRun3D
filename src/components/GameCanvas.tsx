import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Group, Mesh, MathUtils } from 'three';
import Road from './Road';
import Runner from './Runner';
import Gate from './Gate';
import type { DecisionRow, GraphicsQuality } from '../game/types';
import { LANE_X, FULL_SPEED, SLOW_SPEED, APPROACH_DIST, rowZ, TONE_COLOR } from './constants';

interface Props {
  rows: DecisionRow[];
  laneRef: React.MutableRefObject<number>;
  currentRow: number;
  chosenLanes: number[];
  paused: boolean;
  quality: GraphicsQuality;
  reducedMotion: boolean;
  showPreviews: boolean;
  onResolveRow: (rowIndex: number, lane: number) => void;
  onNear: (rowIndex: number | null) => void;
  onFinish: () => void;
}

function Scene({
  rows,
  laneRef,
  currentRow,
  chosenLanes,
  paused,
  quality,
  reducedMotion,
  showPreviews,
  onResolveRow,
  onNear,
  onFinish,
}: Props) {
  const player = useRef<Group>(null);
  const beam = useRef<Mesh>(null);
  const zRef = useRef(0);
  const nextRowRef = useRef(currentRow);
  const finishedRef = useRef(false);
  const lastNearRef = useRef<number | null>(null);
  const total = rows.length;

  nextRowRef.current = currentRow;

  useFrame((state, delta) => {
    if (paused) return;
    const dt = Math.min(delta, 0.05);
    const z = zRef.current;
    const nextRow = nextRowRef.current;

    // slow down inside the approach zone before each decision row
    let speed = FULL_SPEED;
    let nearIdx: number | null = null;
    if (nextRow < total) {
      const dist = rowZ(nextRow) - z;
      if (dist < APPROACH_DIST && dist > 0) {
        const t = dist / APPROACH_DIST; // 1 far -> 0 at row
        speed = MathUtils.lerp(SLOW_SPEED, FULL_SPEED, t * t);
        nearIdx = nextRow;
      }
    }
    if (nearIdx !== lastNearRef.current) {
      lastNearRef.current = nearIdx;
      onNear(nearIdx);
    }

    zRef.current += speed * dt;

    if (player.current) {
      const targetX = LANE_X[laneRef.current];
      const px = player.current.position.x;
      player.current.position.x = MathUtils.lerp(px, targetX, Math.min(1, dt * 9));
      player.current.position.z = zRef.current;
      player.current.position.y = reducedMotion ? 0.05 : Math.sin(state.clock.elapsedTime * 9) * 0.05;
      // lean into the movement
      player.current.rotation.z = MathUtils.lerp(player.current.rotation.z, (px - targetX) * 0.18, Math.min(1, dt * 8));
    }

    // selected-lane beam slides to the targeted lane at the upcoming row
    if (beam.current) {
      if (nextRow < total) {
        beam.current.visible = true;
        beam.current.position.x = MathUtils.lerp(beam.current.position.x, LANE_X[laneRef.current], Math.min(1, dt * 9));
        beam.current.position.z = rowZ(nextRow) - APPROACH_DIST / 2 + 1;
      } else {
        beam.current.visible = false;
      }
    }

    // camera follow
    const cam = state.camera;
    const desiredX = (player.current?.position.x ?? 0) * 0.35;
    cam.position.x += (desiredX - cam.position.x) * Math.min(1, dt * 4);
    cam.position.y += (6.2 - cam.position.y) * Math.min(1, dt * 4);
    cam.position.z = zRef.current - 11;
    cam.lookAt(player.current?.position.x ?? 0, 1.5, zRef.current + 9);

    // resolve a row when reached
    if (nextRow < total && zRef.current >= rowZ(nextRow)) {
      nextRowRef.current += 1;
      onResolveRow(nextRow, laneRef.current);
    }

    // finish past the last row
    if (!finishedRef.current && nextRowRef.current >= total && zRef.current >= rowZ(total - 1) + 18) {
      finishedRef.current = true;
      onFinish();
    }
  });

  const beamColor = TONE_COLOR[rows[Math.min(currentRow, total - 1)]?.gates[laneRef.current]?.tone ?? 'neutral'];

  return (
    <>
      <color attach="background" args={['#05060f']} />
      <fog attach="fog" args={['#05060f', 30, 95]} />
      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#9bd5ff', '#0a0f24', 0.45]} />
      <directionalLight
        position={[6, 18, 6]}
        intensity={1.2}
        castShadow={quality === 'high'}
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[0, 7, 12]} intensity={50} color="#22d3ee" distance={55} />
      {quality !== 'low' && <pointLight position={[0, 5, -8]} intensity={28} color="#a78bfa" distance={45} />}

      <Road rowCount={total} quality={quality} reducedMotion={reducedMotion} />
      <Runner ref={player} castShadow={quality === 'high'} />

      {/* selected-lane floor beam leading into the chosen portal */}
      <mesh ref={beam} position={[0, 0.07, rowZ(currentRow) - APPROACH_DIST / 2 + 1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.6, APPROACH_DIST]} />
        <meshBasicMaterial color={beamColor} transparent opacity={0.22} toneMapped={false} />
      </mesh>

      {rows.map((r, ri) =>
        r.gates.map((g, lane) => (
          <Gate
            key={`${ri}-${lane}`}
            choice={g}
            x={LANE_X[lane]}
            z={rowZ(ri)}
            resolved={ri < currentRow}
            chosen={chosenLanes[ri] === lane}
            near={ri >= currentRow && ri <= currentRow + 1}
            showChips={showPreviews}
          />
        ))
      )}
    </>
  );
}

export default function GameCanvas(props: Props & { runId: number }) {
  const { runId, quality, ...rest } = props;
  const dpr: [number, number] = quality === 'low' ? [0.7, 1] : quality === 'medium' ? [1, 1.5] : [1, 2];
  return (
    <Canvas
      shadows={quality === 'high'}
      dpr={dpr}
      camera={{ position: [0, 6.2, -11], fov: 60, near: 0.1, far: 220 }}
      gl={{ antialias: quality !== 'low', powerPreference: 'high-performance' }}
    >
      <Scene key={runId} quality={quality} {...rest} />
    </Canvas>
  );
}
