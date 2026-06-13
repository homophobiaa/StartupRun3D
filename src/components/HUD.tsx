import type { Stats, StatKey } from '../game/types';
import { STAT_META, formatStat } from '../game/logic';

interface Props {
  stats: Stats;
  levelName: string;
  levelIndex: number;
  currentRow: number;
  totalRows: number;
  rowTitle: string;
  nextRowTitle: string | null;
  onPause: () => void;
}

/** A 0-100 stat shown as a labelled bar. */
function StatBar({ stat, value, danger }: { stat: StatKey; value: number; danger?: boolean }) {
  const m = STAT_META[stat];
  const pct = Math.max(0, Math.min(100, value));
  const isDanger = danger && value > 60;
  return (
    <div className="flex-1 min-w-[70px]">
      <div className="flex items-center justify-between text-[10px] leading-none mb-0.5">
        <span className="text-white/60">
          {m.icon} {m.label}
        </span>
        <span className={`font-bold ${isDanger ? 'text-red-400' : 'text-white/90'}`}>{value}</span>
      </div>
      <div className="h-1.5 rounded bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded transition-all duration-300 ${isDanger ? 'bg-red-400' : 'bg-gradient-to-r from-cyan-400 to-emerald-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** A free-number stat (cash/users) shown as a compact chip. */
function StatNum({ stat, value }: { stat: StatKey; value: number }) {
  const m = STAT_META[stat];
  return (
    <div className="flex flex-col items-center px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
      <div className="text-[10px] text-white/55 leading-none">
        {m.icon} {m.label}
      </div>
      <div className="text-sm font-extrabold text-white leading-tight">{formatStat(stat, value)}</div>
    </div>
  );
}

export default function HUD({
  stats,
  levelName,
  levelIndex,
  currentRow,
  totalRows,
  rowTitle,
  nextRowTitle,
  onPause,
}: Props) {
  const progress = Math.min(100, (currentRow / totalRows) * 100);
  return (
    <div className="absolute top-0 left-0 right-0 p-2 sm:p-3 pointer-events-none">
      <div className="max-w-3xl mx-auto">
        {/* level + pause */}
        <div className="flex items-center justify-between mb-1.5">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-cyan-300/80">Level {levelIndex}</div>
            <div className="text-sm sm:text-base font-bold text-white leading-tight">{levelName}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-white/55">
              Decision {Math.min(currentRow + 1, totalRows)} / {totalRows}
            </div>
            <button
              onClick={onPause}
              className="pointer-events-auto mt-0.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-semibold transition"
            >
              ⏸ Pause
            </button>
          </div>
        </div>

        {/* progress */}
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-1.5">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* current objective */}
        <div className="flex items-center gap-2 mb-2 text-xs">
          <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-200 font-semibold">▶ {rowTitle}</span>
          {nextRowTitle && <span className="text-white/40">next: {nextRowTitle}</span>}
        </div>

        {/* primary stats */}
        <div className="flex gap-1.5 mb-1.5">
          <StatNum stat="cash" value={stats.cash} />
          <StatNum stat="users" value={stats.users} />
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5 px-2 py-1.5 rounded-xl bg-black/30 border border-white/5">
          <StatBar stat="product" value={stats.product} />
          <StatBar stat="reputation" value={stats.reputation} />
          <StatBar stat="stress" value={stats.stress} danger />
          <StatBar stat="legalRisk" value={stats.legalRisk} danger />
        </div>

        {/* secondary stats */}
        <div className="flex gap-3 mt-1 px-1 text-[11px] text-white/50">
          <span>
            {STAT_META.skill.icon} Skill <b className="text-white/80">{stats.skill}</b>
          </span>
          <span>
            {STAT_META.team.icon} Team <b className="text-white/80">{stats.team}</b>
          </span>
        </div>
      </div>
    </div>
  );
}
