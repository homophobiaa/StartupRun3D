import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Group } from 'three';
import Road from './Road';
import Runner from './Runner';
import Gate from './Gate';
import { FLAT_ROWS, TOTAL_ROWS } from '../game/data';
import { LANE_X, PLAYER_SPEED, rowZ } from './constants';

interface Props {
  /** Current target lane 0/1/2 (read live via ref). */
  laneRef: React.MutableRefObject<number>;
  /** Index of next unresolved row. */
  currentRow: number;
  /** Which lane was chosen for each already-resolved row. */
  chosenLanes: number[];
  onResolveRow: (rowIndex: number, lane: number) => void;
  onFinish: () => void;
}

/** Inner scene: advances the player, follows with the camera, resolves rows. */
function Scene({ laneRef, currentRow, chosenLanes, onResolveRow, onFinish }: Props) {
  const player = useRef<Group>(null);
  const zRef = useRef(0);
  const nextRowRef = useRef(currentRow);
  const finishedRef = useRef(false);

  // keep refs honest if parent re-mounts mid-run (restart)
  nextRowRef.current = currentRow;

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    zRef.current += PLAYER_SPEED * dt;
    const z = zRef.current;

    if (player.current) {
      // smooth lane switch
      const targetX = LANE_X[laneRef.current];
      player.current.position.x += (targetX - player.current.position.x) * Math.min(1, dt * 10);
      player.current.position.z = z;
      // subtle bob
      player.current.position.y = Math.sin(state.clock.elapsedTime * 10) * 0.04;
    }

    // camera follow from behind + above
    const cam = state.camera;
    const desiredX = (player.current?.position.x ?? 0) * 0.5;
    cam.position.x += (desiredX - cam.position.x) * Math.min(1, dt * 4);
    cam.position.y += (5.2 - cam.position.y) * Math.min(1, dt * 4);
    cam.position.z = z - 8;
    cam.lookAt(player.current?.position.x ?? 0, 1.2, z + 6);

    // resolve a row when the player reaches its Z
    if (nextRowRef.current < TOTAL_ROWS && z >= rowZ(nextRowRef.current)) {
      const idx = nextRowRef.current;
      nextRowRef.current += 1;
      onResolveRow(idx, laneRef.current);
    }

    // finish a bit after the last row
    if (!finishedRef.current && nextRowRef.current >= TOTAL_ROWS && z >= rowZ(TOTAL_ROWS - 1) + 8) {
      finishedRef.current = true;
      onFinish();
    }
  });

  return (
    <>
      <color attach="background" args={['#05060f']} />
      <fog attach="fog" args={['#05060f', 18, 60]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 12, 4]} intensity={1.1} castShadow />
      <pointLight position={[0, 6, 8]} intensity={40} color="#22d3ee" distance={40} />

      <Road />
      <Runner ref={player} />

      {FLAT_ROWS.map((row, ri) =>
        row.gates.map((g, lane) => (
          <Gate
            key={`${ri}-${lane}`}
            choice={g}
            x={LANE_X[lane]}
            z={rowZ(ri)}
            resolved={ri < currentRow}
            chosen={chosenLanes[ri] === lane}
          />
        ))
      )}
    </>
  );
}

export default function GameCanvas(props: Props) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 5.2, -8], fov: 60, near: 0.1, far: 200 }}
      gl={{ antialias: true }}
    >
      <Scene {...props} />
    </Canvas>
  );
}
