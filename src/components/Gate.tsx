import { memo } from 'react';
import type { GateChoice, PortalCategory } from '../game/types';
import { CATEGORY } from './constants';

interface Props {
  choice: GateChoice;
  x: number;
  z: number;
  resolved: boolean;
  chosen: boolean;
  /** Is this portal in the row currently being decided? */
  active: boolean;
  /** Is this the lane the player currently has selected? */
  selected: boolean;
}

type Emblem = (typeof CATEGORY)[PortalCategory]['emblem'];

/** Symbolic emblem mesh — communicates the category with shape alone. */
function EmblemMesh({ emblem, color }: { emblem: Emblem; color: string }) {
  const mat = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.8} toneMapped={false} />;
  switch (emblem) {
    case 'rocket':
      return (
        <mesh position={[0, 2.4, 0]}>
          <coneGeometry args={[0.55, 1.3, 6]} />
          {mat}
        </mesh>
      );
    case 'warning':
      return (
        <mesh position={[0, 2.4, 0]} rotation={[0, 0, Math.PI]}>
          <tetrahedronGeometry args={[0.8, 0]} />
          {mat}
        </mesh>
      );
    case 'coins':
      return (
        <group position={[0, 2.0, 0]}>
          {[0, 0.34, 0.68].map((y) => (
            <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.5, 0.5, 0.18, 18]} />
              {mat}
            </mesh>
          ))}
        </group>
      );
    case 'cube':
      return (
        <mesh position={[0, 2.4, 0]} rotation={[0.5, 0.6, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          {mat}
        </mesh>
      );
    case 'broadcast':
      return (
        <group position={[0, 2.4, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.5, 1.1, 16]} />
            {mat}
          </mesh>
          <mesh position={[0.85, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.45, 0.07, 8, 20, Math.PI]} />
            {mat}
          </mesh>
        </group>
      );
    case 'stamp':
      return (
        <mesh position={[0, 2.4, 0]} rotation={[-0.3, 0, 0.2]}>
          <boxGeometry args={[1.1, 0.16, 0.8]} />
          {mat}
        </mesh>
      );
    case 'shield':
    default:
      return (
        <mesh position={[0, 2.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.6, 0.16, 12, 28]} />
          {mat}
        </mesh>
      );
  }
}

/** A symbolic decision portal. No text — shape + color + glow tell the story. */
function Gate({ choice, x, z, resolved, chosen, active, selected }: Props) {
  const { color, emblem } = CATEGORY[choice.category];
  const dim = resolved ? !chosen : active ? !selected : false;
  const highlight = (active && selected) || chosen;
  const intensity = resolved ? (chosen ? 2.2 : 0.08) : highlight ? 3 : active ? 1.4 : 0.6;
  const opacity = dim ? 0.16 : 1;
  const scale = highlight && !resolved ? 1.12 : dim ? 0.92 : 1;
  const angular = choice.category === 'growth' || choice.category === 'danger';

  return (
    <group position={[x, 0, z]} scale={scale}>
      {/* frame posts (slightly tilted for aggressive categories) */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.55, 2.0, 0]} rotation={[0, 0, angular ? s * 0.09 : 0]}>
          <boxGeometry args={[0.3, 4.0, 0.3]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} transparent opacity={opacity} toneMapped={false} />
        </mesh>
      ))}
      {/* top bar */}
      <mesh position={[0, 4.05, 0]}>
        <boxGeometry args={[3.7, 0.3, 0.3]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} transparent opacity={opacity} toneMapped={false} />
      </mesh>
      {/* hologram fill */}
      <mesh position={[0, 2.0, -0.05]}>
        <planeGeometry args={[3.2, 4.0]} />
        <meshBasicMaterial color={color} transparent opacity={dim ? 0.03 : highlight ? 0.24 : 0.1} toneMapped={false} />
      </mesh>
      {/* floor pad */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 2.8]} />
        <meshBasicMaterial color={color} transparent opacity={dim ? 0.04 : 0.18} toneMapped={false} />
      </mesh>

      {!resolved && <EmblemMesh emblem={emblem} color={color} />}
    </group>
  );
}

export default memo(Gate);
