import { Text } from '@react-three/drei';
import type { GateChoice } from '../game/types';
import { TONE_COLOR } from './constants';

interface Props {
  choice: GateChoice;
  x: number;
  z: number;
  resolved: boolean;
  chosen: boolean;
}

/** A single glowing archway gate with a billboarded text label. */
export default function Gate({ choice, x, z, resolved, chosen }: Props) {
  const color = TONE_COLOR[choice.tone] ?? '#a78bfa';
  const dim = resolved && !chosen;
  const intensity = dim ? 0.15 : chosen ? 3 : 1.4;
  const opacity = dim ? 0.25 : 1;

  return (
    <group position={[x, 0, z]}>
      {/* posts */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.05, 1.4, 0]}>
          <boxGeometry args={[0.18, 2.8, 0.18]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={intensity}
            transparent
            opacity={opacity}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* top bar */}
      <mesh position={[0, 2.85, 0]}>
        <boxGeometry args={[2.4, 0.18, 0.18]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={intensity}
          transparent
          opacity={opacity}
          toneMapped={false}
        />
      </mesh>
      {/* translucent fill panel */}
      <mesh position={[0, 1.4, 0]}>
        <planeGeometry args={[2.1, 2.7]} />
        <meshBasicMaterial color={color} transparent opacity={dim ? 0.04 : 0.12} toneMapped={false} />
      </mesh>

      {/* label */}
      <Text
        position={[0, 3.5, 0]}
        fontSize={0.42}
        color={dim ? '#5b6478' : '#ffffff'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#05060f"
        maxWidth={3}
        textAlign="center"
      >
        {choice.label}
      </Text>
      {choice.hint && (
        <Text
          position={[0, 0.55, 0]}
          fontSize={0.22}
          color={dim ? '#3b4356' : color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.015}
          outlineColor="#05060f"
          maxWidth={2.6}
          textAlign="center"
        >
          {choice.hint}
        </Text>
      )}
    </group>
  );
}
