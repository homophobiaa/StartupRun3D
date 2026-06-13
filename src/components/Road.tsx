import { LANE_X, ROAD_LENGTH } from './constants';

/** Static 3D-ish runway: a long dark plane with glowing lane dividers. */
export default function Road() {
  return (
    <group>
      {/* main road surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, ROAD_LENGTH / 2 - 20]} receiveShadow>
        <planeGeometry args={[9, ROAD_LENGTH]} />
        <meshStandardMaterial color="#0b1024" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* outer glow rails */}
      {[-4.3, 4.3].map((x) => (
        <mesh key={x} position={[x, 0.05, ROAD_LENGTH / 2 - 20]}>
          <boxGeometry args={[0.12, 0.12, ROAD_LENGTH]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={2} toneMapped={false} />
        </mesh>
      ))}

      {/* lane divider dashes */}
      {[LANE_X[0], LANE_X[1], LANE_X[2]].slice(0, 2).map((_, i) => {
        const x = (LANE_X[i] + LANE_X[i + 1]) / 2;
        return (
          <group key={i}>
            {Array.from({ length: Math.floor(ROAD_LENGTH / 4) }).map((__, j) => (
              <mesh key={j} position={[x, 0.04, j * 4 - 18]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.1, 1.6]} />
                <meshStandardMaterial color="#1e3a5f" emissive="#1e3a5f" emissiveIntensity={0.8} />
              </mesh>
            ))}
          </group>
        );
      })}
    </group>
  );
}
