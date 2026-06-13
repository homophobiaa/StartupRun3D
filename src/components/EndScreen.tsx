import { motion } from 'framer-motion';
import type { Ending, Stats, StatKey } from '../game/types';
import { STAT_META, formatStat } from '../game/logic';

interface Props {
  ending: Ending;
  stats: Stats;
  isBest: boolean;
  onRestart: () => void;
}

const ORDER: StatKey[] = ['cash', 'users', 'product', 'reputation', 'skill', 'team', 'stress', 'legalRisk'];

export default function EndScreen({ ending, stats, isBest, onRestart }: Props) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="max-w-md w-full text-center bg-[#0a1228] border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        <div className="text-6xl mb-2">{ending.emoji}</div>
        <h2 className="text-3xl font-extrabold mb-1 text-white">{ending.title}</h2>
        {isBest && <div className="text-xs text-emerald-400 font-semibold mb-2">🏆 New best run!</div>}
        <p className="text-white/70 text-sm mb-5">{ending.blurb}</p>

        <div className="grid grid-cols-4 gap-2 mb-5">
          {ORDER.map((s) => (
            <div key={s} className="bg-white/5 rounded-lg py-2">
              <div className="text-[11px] text-white/50">{STAT_META[s].icon}</div>
              <div className="text-sm font-bold">{formatStat(s, stats[s])}</div>
              <div className="text-[10px] text-white/40">{STAT_META[s].label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={onRestart}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-transform"
        >
          Run Again
        </button>
      </motion.div>
    </div>
  );
}
