import { TONE_COLOR } from './constants';
import type { GateTone } from '../game/types';

export interface LogEntry {
  label: string;
  tone: GateTone;
}

/** Shows the last 3 choices in the bottom-left corner. */
export default function ChoiceLog({ entries }: { entries: LogEntry[] }) {
  const last = entries.slice(-3);
  if (last.length === 0) return null;
  return (
    <div className="absolute bottom-3 left-3 flex flex-col gap-1 pointer-events-none">
      {last.map((e, i) => (
        <div
          key={i}
          className="text-xs px-2 py-1 rounded-md bg-black/50 border-l-2"
          style={{ borderColor: TONE_COLOR[e.tone], opacity: 0.5 + (i / last.length) * 0.5 }}
        >
          {e.label}
        </div>
      ))}
    </div>
  );
}
