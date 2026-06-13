import { Html } from '@react-three/drei';
import type { GateChoice } from '../game/types';
import { TONE_COLOR } from './constants';
import { STAT_META } from '../game/logic';

interface Props {
  choice: GateChoice;
  x: number;
  z: number;
  resolved: boolean;
  chosen: boolean;
  /** Show the Html info card (only for upcoming/active rows). */
  showCard: boolean;
  showPreview: boolean;
}

const inverse = (stat: string) => stat === 'stress' || stat === 'legalRisk';

/** A glowing portal gate with a camera-facing Html choice card. */
export default function Gate({ choice, x, z, resolved, chosen, showCard, showPreview }: Props) {
  const color = TONE_COLOR[choice.tone] ?? '#a78bfa';
  const dim = resolved && !chosen;
  const intensity = dim ? 0.12 : chosen ? 3 : 1.5;
  const opacity = dim ? 0.22 : 1;

  return (
    <group position={[x, 0, z]}>
      {/* posts */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 1.25, 1.7, 0]}>
          <boxGeometry args={[0.2, 3.4, 0.2]} />
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
      <mesh position={[0, 3.45, 0]}>
        <boxGeometry args={[2.9, 0.2, 0.2]} />
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
      <mesh position={[0, 1.7, 0]}>
        <planeGeometry args={[2.6, 3.3]} />
        <meshBasicMaterial color={color} transparent opacity={dim ? 0.03 : chosen ? 0.22 : 0.1} toneMapped={false} />
      </mesh>
      {/* floor glow pad */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.6, 2.2]} />
        <meshBasicMaterial color={color} transparent opacity={dim ? 0.04 : 0.14} toneMapped={false} />
      </mesh>

      {/* camera-facing choice card */}
      {showCard && !resolved && (
        <Html position={[0, 4.1, 0]} center distanceFactor={16} zIndexRange={[10, 0]} pointerEvents="none">
          <div
            className="select-none text-center"
            style={{
              width: 150,
              transform: 'translateY(-50%)',
              filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))',
            }}
          >
            <div
              className="rounded-xl px-2 py-1.5 border"
              style={{
                background: 'rgba(8,12,28,0.82)',
                borderColor: color,
                boxShadow: `0 0 14px ${color}55`,
              }}
            >
              <div className="flex items-center justify-center gap-1">
                <span style={{ fontSize: 18 }}>{choice.icon}</span>
                {choice.risk && (
                  <span style={{ fontSize: 11, color: '#fbbf24' }} title="Risky">
                    ⚠
                  </span>
                )}
              </div>
              <div className="font-bold leading-tight" style={{ color: '#fff', fontSize: 13 }}>
                {choice.label}
              </div>
              {showPreview && choice.preview && (
                <div className="mt-1 flex flex-wrap justify-center gap-x-1.5 gap-y-0.5">
                  {choice.preview.slice(0, 3).map((p, i) => {
                    const good = inverse(p.stat) ? p.amount < 0 : p.amount > 0;
                    return (
                      <span
                        key={i}
                        style={{ fontSize: 10, color: good ? '#34d399' : '#f87171', fontWeight: 700 }}
                      >
                        {p.amount > 0 ? '+' : '-'}
                        {STAT_META[p.stat].icon}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
