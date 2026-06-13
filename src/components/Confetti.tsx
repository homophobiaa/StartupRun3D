import { useMemo } from 'react';

const COLORS = ['#22d3ee', '#34d399', '#a78bfa', '#fbbf24', '#f472b6'];

/** Lightweight CSS confetti burst. Renders nothing when disabled. */
export default function Confetti({ active }: { active: boolean }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 48 }).map((_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        dur: 1.6 + Math.random() * 1.4,
        color: COLORS[i % COLORS.length],
        size: 5 + Math.random() * 6,
        rot: Math.random() * 360,
      })),
    []
  );
  if (!active) return null;
  return (
    <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
      {pieces.map((p, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            top: '-5%',
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.6,
            background: p.color,
            transform: `rotate(${p.rot}deg)`,
            animation: `confettiFall ${p.dur}s linear ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
