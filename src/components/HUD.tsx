import type { Stats, StatKey } from '../game/types';
import { STAT_META, formatStat } from '../game/logic';
import { TOTAL_ROWS } from '../game/data';

interface Props {
  stats: Stats;
  phaseName: string;
  rowNumber: number; // 1-based current row
}

const BAR_STATS: StatKey[] = ['skill', 'product', 'reputation', 'stress', 'legalRisk'];

function StatChip({ stat, value }: { stat: StatKey; value: number }) {
  const m = STAT_META[stat];
  const bar = BAR_STATS.includes(stat);
  const pct = Math.max(0, Math.min(100, value));
  const danger = (stat === 'stress' || stat === 'legalRisk') && value > 60;
  return (
    <div className="flex flex-col items-center px-2 py-1 rounded-lg bg-white/5 min-w-[60px]">
      <div className="text-[11px] text-white/60 leading-none">
        {m.icon} {m.label}
      </div>
      <div className={`text-sm font-bold leading-tight ${danger ? 'text-red-400' : 'text-white'}`}>
        {formatStat(stat, value)}
      </div>
      {bar && (
        <div className="w-full h-1 mt-0.5 rounded bg-white/10 overflow-hidden">
          <div
            className={`h-full ${danger ? 'bg-red-400' : 'bg-cyan-400'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function HUD({ stats, phaseName, rowNumber }: Props) {
  const progress = Math.min(100, (rowNumber / TOTAL_ROWS) * 100);
  return (
    <div className="absolute top-0 left-0 right-0 p-2 sm:p-3 pointer-events-none">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="text-xs sm:text-sm font-semibold text-cyan-300 uppercase tracking-wider">
          {phaseName}
        </div>
        <div className="text-xs text-white/60">
          Row {Math.min(rowNumber, TOTAL_ROWS)} / {TOTAL_ROWS}
        </div>
      </div>

      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
        <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-1.5 justify-center">
        <StatChip stat="cash" value={stats.cash} />
        <StatChip stat="users" value={stats.users} />
        <StatChip stat="team" value={stats.team} />
        <StatChip stat="skill" value={stats.skill} />
        <StatChip stat="product" value={stats.product} />
        <StatChip stat="reputation" value={stats.reputation} />
        <StatChip stat="stress" value={stats.stress} />
        <StatChip stat="legalRisk" value={stats.legalRisk} />
      </div>
    </div>
  );
}
