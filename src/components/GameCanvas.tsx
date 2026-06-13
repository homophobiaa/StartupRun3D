import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Group, Mesh, MathUtils } from 'three';
import Road from './Road';
import Runner from './Runner';
import Gate from './Gate';
import type { DecisionRow, GraphicsQuality } from '../game/types';
import { LANE_X, FULL_SPEED, APPROACH_DIST, HOLD_OFFSET, rowZ, CATEGORY } from './constants';

interface Props {
  rows: DecisionRow[];
  laneRef: React.MutableRefObject<number>;
  /** Row index the player has committed to pass (-1 = none). */
  commitRef: React.MutableRefObject<number>;
  currentRow: number;
  selectedLane: number;
  chosenLanes: number[];
  paused: boolean;
  quality: GraphicsQuality;
  reducedMotion: boolean;
  onResolveRow: (rowIndex: number, lane: number) => void;
  onDecide: (rowIndex: number | null) => void;
  onFinish: () => void;
}

function Scene({
  rows,
  laneRef,
  commitRef,
  currentRow,
  selectedLane,
  chosenLanes,
  paused,
  quality,
  reducedMotion,
  onResolveRow,
  onDecide,
  onFinish,
}: Props) {
  const player = useRef<Group>(null);
  const beam = useRef<Mesh>(null);
  const zRef = useRef(0);
  const nextRowRef = useRef(currentRow);
  const finishedRef = useRef(false);
  const lastDecideRef = useRef<number | null>(null);
  const total = rows.length;

  nextRowRef.current = currentRow;

  useFrame((state, delta) => {
    if (paused) return;
    const dt = Math.min(delta, 0.05);
    const next = nextRowRef.current;
    let speed = FULL_SPEED;
    let decidingIdx: number | null = null;

    if (next < total) {
      const holdZ = rowZ(next) - HOLD_OFFSET;
      const committed = commitRef.current === next;
      const distHold = holdZ - zRef.current;
      if (!committed && distHold <= APPROACH_DIST) {
        decidingIdx = next;
        if (distHold > 0.05) {
          const t = Math.max(0, Math.min(1, distHold / APPROACH_DIST));
          speed = MathUtils.lerp(0.4, FULL_SPEED, t * t); // cinematic ease to near-stop
        } else {
          speed = 0;
          zRef.current = holdZ; // hold at the decision point
        }
      }
    }

    if (decidingIdx !== lastDecideRef.current) {
      lastDecideRef.current = decidingIdx;
      onDecide(decidingIdx);
    }

    zRef.current += speed * dt;

    if (player.current) {
      const targetX = LANE_X[laneRef.current];
      const px = player.current.position.x;
      player.current.position.x = MathUtils.lerp(px, targetX, Math.min(1, dt * 9));
      player.current.position.z = zRef.current;
      player.current.position.y = reducedMotion ? 0.05 : Math.sin(state.clock.elapsedTime * 8) * 0.05;
      player.current.rotation.z = MathUtils.lerp(player.current.rotation.z, (px - targetX) * 0.18, Math.min(1, dt * 8));
    }

    if (beam.current) {
      if (next < total) {
        beam.current.visible = true;
        beam.current.position.x = MathUtils.lerp(beam.current.position.x, LANE_X[laneRef.current], Math.min(1, dt * 9));
        beam.current.position.z = rowZ(next) - APPROACH_DIST / 2;
      } else {
        beam.current.visible = false;
      }
    }

    // camera follow
    const cam = state.camera;
    const desiredX = (player.current?.position.x ?? 0) * 0.3;
    cam.position.x += (desiredX - cam.position.x) * Math.min(1, dt * 4);
    cam.position.y += (6.4 - cam.position.y) * Math.min(1, dt * 4);
    cam.position.z = zRef.current - 11.5;
    cam.lookAt(player.current?.position.x ?? 0, 1.6, zRef.current + 9);

    if (next < total && zRef.current >= rowZ(next)) {
      nextRowRef.current += 1;
      onResolveRow(next, laneRef.current);
    }

    if (!finishedRef.current && nextRowRef.current >= total && zRef.current >= rowZ(total - 1) + 18) {
      finishedRef.current = true;
      onFinish();
    }
  });

  const beamColor = CATEGORY[rows[Math.min(currentRow, total - 1)]?.gates[selectedLane]?.category ?? 'strategic'].color;

  return (
    <>
      <color attach="background" args={['#05060f']} />
      <fog attach="fog" args={['#05060f', 30, 78]} />
      <ambientLight intensity={0.5} />
      <hemisphereLight args={['#9bd5ff', '#0a0f24', 0.45]} />
      <directionalLight position={[6, 18, 6]} intensity={1.2} castShadow={quality === 'high'} shadow-mapSize={[1024, 1024]} />
      <pointLight position={[0, 7, 12]} intensity={50} color="#22d3ee" distance={55} />
      {quality !== 'low' && <pointLight position={[0, 5, -8]} intensity={28} color="#a78bfa" distance={45} />}

      <Road rowCount={total} quality={quality} reducedMotion={reducedMotion} />
      <Runner ref={player} castShadow={quality === 'high'} />

      {/* selected-lane floor beam leading into the chosen portal */}
      <mesh ref={beam} position={[0, 0.07, rowZ(currentRow) - APPROACH_DIST / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.8, APPROACH_DIST]} />
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
            active={ri === currentRow}
            selected={selectedLane === lane}
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
      camera={{ position: [0, 6.4, -11.5], fov: 58, near: 0.1, far: 240 }}
      gl={{ antialias: quality !== 'low', powerPreference: 'high-performance' }}
    >
      <Scene key={runId} quality={quality} {...rest} />
    </Canvas>
  );
}
