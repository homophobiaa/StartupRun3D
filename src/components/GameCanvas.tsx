import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Group } from 'three';
import Road from './Road';
import Runner from './Runner';
import Gate from './Gate';
import type { DecisionRow } from '../game/types';
import { LANE_X, PLAYER_SPEED, rowZ } from './constants';

interface Props {
  rows: DecisionRow[];
  laneRef: React.MutableRefObject<number>;
  currentRow: number;
  chosenLanes: number[];
  paused: boolean;
  reducedMotion: boolean;
  showPreviews: boolean;
  onResolveRow: (rowIndex: number, lane: number) => void;
  onFinish: () => void;
}

/** Inner scene: advances the player, follows with the camera, resolves rows. */
function Scene({
  rows,
  laneRef,
  currentRow,
  chosenLanes,
  paused,
  reducedMotion,
  showPreviews,
  onResolveRow,
  onFinish,
}: Props) {
  const player = useRef<Group>(null);
  const zRef = useRef(0);
  const nextRowRef = useRef(currentRow);
  const finishedRef = useRef(false);
  const total = rows.length;

  nextRowRef.current = currentRow;

  useFrame((state, delta) => {
    if (paused) return;
    const dt = Math.min(delta, 0.05);
    zRef.current += PLAYER_SPEED * dt;
    const z = zRef.current;

    if (player.current) {
      const targetX = LANE_X[laneRef.current];
      player.current.position.x += (targetX - player.current.position.x) * Math.min(1, dt * 10);
      player.current.position.z = z;
      player.current.position.y = reducedMotion ? 0.05 : Math.sin(state.clock.elapsedTime * 10) * 0.05;
    }

    // camera follow from behind + above
    const cam = state.camera;
    const desiredX = (player.current?.position.x ?? 0) * 0.4;
    cam.position.x += (desiredX - cam.position.x) * Math.min(1, dt * 4);
    cam.position.y += (6 - cam.position.y) * Math.min(1, dt * 4);
    cam.position.z = z - 10;
    cam.lookAt(player.current?.position.x ?? 0, 1.4, z + 8);

    // resolve a row when the player reaches its Z
    if (nextRowRef.current < total && z >= rowZ(nextRowRef.current)) {
      const idx = nextRowRef.current;
      nextRowRef.current += 1;
      onResolveRow(idx, laneRef.current);
    }

    // finish a bit after the last row
    if (!finishedRef.current && nextRowRef.current >= total && z >= rowZ(total - 1) + 14) {
      finishedRef.current = true;
      onFinish();
    }
  });

  return (
    <>
      <color attach="background" args={['#05060f']} />
      <fog attach="fog" args={['#05060f', 26, 80]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#9bd5ff', '#0a0f24', 0.5]} />
      <directionalLight position={[6, 16, 6]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
      <pointLight position={[0, 7, 10]} intensity={50} color="#22d3ee" distance={50} />
      <pointLight position={[0, 5, -6]} intensity={30} color="#a78bfa" distance={40} />

      <Road rowCount={total} reducedMotion={reducedMotion} />
      <Runner ref={player} />

      {rows.map((r, ri) =>
        r.gates.map((g, lane) => (
          <Gate
            key={`${ri}-${lane}`}
            choice={g}
            x={LANE_X[lane]}
            z={rowZ(ri)}
            resolved={ri < currentRow}
            chosen={chosenLanes[ri] === lane}
            showCard={ri >= currentRow && ri <= currentRow + 2}
            showPreview={showPreviews}
          />
        ))
      )}
    </>
  );
}

export default function GameCanvas(props: Props & { runId: number }) {
  const { runId, ...rest } = props;
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 6, -10], fov: 60, near: 0.1, far: 200 }}
      gl={{ antialias: true }}
    >
      <Scene key={runId} {...rest} />
    </Canvas>
  );
}
