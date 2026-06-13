import { memo } from 'react';
import { Text, Billboard } from '@react-three/drei';
import type { GateChoice } from '../game/types';
import { TONE_COLOR, TONE_KIND } from './constants';
import { chipLabel, deltaIsGood } from '../game/logic';

interface Props {
  choice: GateChoice;
  x: number;
  z: number;
  resolved: boolean;
  chosen: boolean;
  /** Near rows reveal title + chips; far rows are silhouettes. */
  near: boolean;
  showChips: boolean;
}

/** Small emissive token mesh that signals the choice type at a glance. */
function IconToken({ kind, color }: { kind: 'safe' | 'growth' | 'danger'; color: string }) {
  const mat = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} toneMapped={false} />;
  if (kind === 'growth')
    return (
      <mesh position={[0, 3.0, 0]} rotation={[0, 0, 0]}>
        <coneGeometry args={[0.42, 0.9, 5]} />
        {mat}
      </mesh>
    );
  if (kind === 'danger')
    return (
      <mesh position={[0, 3.0, 0]} rotation={[0, 0, Math.PI]}>
        <tetrahedronGeometry args={[0.55, 0]} />
        {mat}
      </mesh>
    );
  return (
    <mesh position={[0, 3.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.4, 0.13, 10, 24]} />
      {mat}
    </mesh>
  );
}

/** A stylized decision portal: glowing frame, type token, big title + chips. */
function Gate({ choice, x, z, resolved, chosen, near, showChips }: Props) {
  const color = TONE_COLOR[choice.tone] ?? '#38bdf8';
  const kind = TONE_KIND[choice.tone] ?? 'safe';
  const dim = resolved && !chosen;
  const intensity = dim ? 0.1 : chosen ? 3 : near ? 1.8 : 0.7;
  const opacity = dim ? 0.18 : 1;
  const chips = choice.preview?.slice(0, 2) ?? [];

  return (
    <group position={[x, 0, z]}>
      {/* frame posts */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.45, 1.9, 0]}>
          <boxGeometry args={[0.26, 3.8, 0.26]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} transparent opacity={opacity} toneMapped={false} />
        </mesh>
      ))}
      {/* top bar */}
      <mesh position={[0, 3.85, 0]}>
        <boxGeometry args={[3.4, 0.26, 0.26]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={intensity} transparent opacity={opacity} toneMapped={false} />
      </mesh>
      {/* fill panel */}
      <mesh position={[0, 1.9, -0.02]}>
        <planeGeometry args={[3.0, 3.7]} />
        <meshBasicMaterial color={color} transparent opacity={dim ? 0.03 : chosen ? 0.26 : 0.1} toneMapped={false} />
      </mesh>
      {/* floor pad */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.0, 2.6]} />
        <meshBasicMaterial color={color} transparent opacity={dim ? 0.04 : 0.16} toneMapped={false} />
      </mesh>

      {!dim && <IconToken kind={kind} color={color} />}

      {/* labels — only when near, billboarded so always camera-facing & readable */}
      {near && !resolved && (
        <Billboard position={[0, 5.0, 0]}>
          <Text fontSize={0.92} color="#ffffff" anchorX="center" anchorY="middle" outlineWidth={0.04} outlineColor="#04060f" maxWidth={6}>
            {choice.label}
          </Text>
          {showChips && chips.length > 0 && (
            <Text
              position={[0, -0.75, 0]}
              fontSize={0.42}
              color={chips.every((c) => deltaIsGood(c)) ? '#6ee7b7' : '#fca5a5'}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="#04060f"
            >
              {chips.map((c) => chipLabel(c)).join('   ')}
            </Text>
          )}
        </Billboard>
      )}
    </group>
  );
}

export default memo(Gate);
