import { forwardRef } from 'react';
import { Group } from 'three';

interface Props {
  castShadow?: boolean;
}

/** Low-poly founder: capsule body, head, laptop, glow ring. Position driven by parent. */
const Runner = forwardRef<Group, Props>(({ castShadow }, ref) => {
  return (
    <group ref={ref}>
      <mesh position={[0, 0.85, 0]} castShadow={castShadow}>
        <capsuleGeometry args={[0.32, 0.7, 8, 16]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow={castShadow}>
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0, 0.95, 0.34]} rotation={[-0.4, 0, 0]}>
        <boxGeometry args={[0.4, 0.28, 0.03]} />
        <meshStandardMaterial color="#e2e8f0" emissive="#22d3ee" emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.6, 24]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.5} toneMapped={false} />
      </mesh>
    </group>
  );
});

Runner.displayName = 'Runner';
export default Runner;
