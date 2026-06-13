import type { Stats } from '../game/types';
import { formatStat } from '../game/logic';

interface Props {
  stats: Stats;
  levelName: string;
  levelIndex: number;
  currentRow: number;
  totalRows: number;
  onPause: () => void;
}

function Pill({ icon, label, value, danger, bar }: { icon: string; label: string; value: string; danger?: boolean; bar?: number }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-black/45 border border-white/10 backdrop-blur-sm">
      <span className="text-base leading-none">{icon}</span>
      <div className="leading-none">
        <div className="text-[9px] uppercase tracking-wide text-white/45">{label}</div>
        <div className={`text-sm font-extrabold ${danger ? 'text-red-300' : 'text-white'}`}>{value}</div>
        {bar !== undefined && (
          <div className="w-12 h-1 mt-0.5 rounded bg-white/10 overflow-hidden">
            <div className={`h-full rounded ${danger ? 'bg-red-400' : 'bg-gradient-to-r from-cyan-400 to-emerald-400'}`} style={{ width: `${Math.max(0, Math.min(100, bar))}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}

/** Minimal at-a-glance HUD: Cash/Users left, progress center, Product/Stress right. */
export default function HUD({ stats, levelName, levelIndex, currentRow, totalRows, onPause }: Props) {
  const progress = Math.min(100, (currentRow / totalRows) * 100);
  return (
    <div className="absolute top-0 left-0 right-0 p-2.5 sm:p-3 pointer-events-none">
      <div className="flex items-start justify-between gap-2">
        {/* left: cash + users */}
        <div className="flex gap-1.5">
          <Pill icon="💶" label="Cash" value={formatStat('cash', stats.cash)} />
          <Pill icon="👥" label="Users" value={formatStat('users', stats.users)} />
        </div>

        {/* center: progress */}
        <div className="hidden sm:block flex-1 max-w-[260px] mt-1">
          <div className="flex items-center justify-between text-[10px] mb-1">
            <span className="text-cyan-300 font-semibold uppercase tracking-wide">Lvl {levelIndex} · {levelName}</span>
            <span className="text-white/50">{Math.min(currentRow, totalRows)}/{totalRows}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* right: product + stress + pause */}
        <div className="flex gap-1.5 items-start">
          <Pill icon="🛠️" label="Product" value={`${stats.product}`} bar={stats.product} />
          <Pill icon="🔥" label="Stress" value={`${stats.stress}`} danger={stats.stress > 60} bar={stats.stress} />
          <button
            onClick={onPause}
            className="pointer-events-auto px-2.5 py-1.5 rounded-xl bg-black/45 border border-white/10 hover:bg-white/15 active:scale-95 text-sm transition backdrop-blur-sm"
            aria-label="Pause"
          >
            ⏸
          </button>
        </div>
      </div>

      {/* mobile-only slim progress */}
      <div className="sm:hidden mt-2">
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="text-cyan-300 font-semibold">Lvl {levelIndex} · {levelName}</span>
          <span className="text-white/50">{Math.min(currentRow, totalRows)}/{totalRows}</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
