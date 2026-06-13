import { formatDelta } from '../game/logic';
import type { StatDelta } from '../game/types';

export interface FloatBatch {
  id: number;
  deltas: StatDelta[];
}

/** CSS-animated floating stat changes near the center of the screen. */
export default function FloatingDeltas({ batches }: { batches: FloatBatch[] }) {
  return (
    <div className="absolute top-28 left-0 right-0 flex items-start justify-center pointer-events-none z-20">
      {batches.map((b) => (
        <div key={b.id} className="absolute flex flex-col items-center gap-1" style={{ animation: 'floatUp 1.4s ease-out forwards' }}>
          {b.deltas.map((d, i) => {
            const positive = d.amount >= 0;
            // for stress/legalRisk, "up" is bad
            const inverse = d.stat === 'stress' || d.stat === 'legalRisk';
            const good = inverse ? !positive : positive;
            return (
              <div
                key={i}
                className={`text-lg font-extrabold drop-shadow-lg ${good ? 'text-emerald-400' : 'text-red-400'}`}
                style={{ textShadow: '0 1px 4px #000' }}
              >
                {formatDelta(d)}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
