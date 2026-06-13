import { motion } from 'framer-motion';
import type { Ending, Stats, StatKey, RunReward } from '../game/types';
import { STAT_META, formatStat } from '../game/logic';
import Confetti from './Confetti';

interface Props {
  ending: Ending;
  reward: RunReward;
  stats: Stats;
  levelIndex: number;
  isBest: boolean;
  reducedMotion: boolean;
  onContinue: () => void;
  onRetry: () => void;
}

const ORDER: StatKey[] = ['cash', 'users', 'product', 'reputation', 'skill', 'team', 'stress', 'legalRisk'];
const GRADE_COLOR: Record<string, string> = {
  S: '#fbbf24',
  A: '#34d399',
  B: '#22d3ee',
  C: '#a78bfa',
  D: '#fb923c',
  F: '#f87171',
};

export default function EndScreen({ ending, reward, stats, levelIndex, isBest, reducedMotion, onContinue, onRetry }: Props) {
  const celebrate = !reducedMotion && reward.grade !== 'F' && reward.grade !== 'D';
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <Confetti active={celebrate} />
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="max-w-md w-full text-center bg-[#0a1228] border border-white/10 rounded-2xl p-6 shadow-2xl my-auto"
      >
        <div className="text-xs uppercase tracking-widest text-cyan-300/70 mb-1">Level {levelIndex} complete</div>
        <div className="text-6xl mb-1">{ending.emoji}</div>
        <h2 className="text-3xl font-black mb-1 text-white">{ending.title}</h2>
        {isBest && <div className="text-xs text-emerald-400 font-semibold mb-1">🏆 New best valuation!</div>}
        <p className="text-white/70 text-sm mb-4">{ending.blurb}</p>

        {/* grade + headline numbers */}
        <div className="flex items-stretch gap-2 mb-3">
          <div
            className="flex flex-col items-center justify-center w-20 rounded-xl"
            style={{ background: `${GRADE_COLOR[reward.grade]}22`, border: `1px solid ${GRADE_COLOR[reward.grade]}55` }}
          >
            <div className="text-[10px] text-white/50">Grade</div>
            <div className="text-4xl font-black" style={{ color: GRADE_COLOR[reward.grade] }}>
              {reward.grade}
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/5 py-1.5">
              <div className="text-[10px] text-white/50">Valuation</div>
              <div className="text-sm font-bold text-white">€{reward.valuation.toLocaleString()}</div>
            </div>
            <div className="rounded-xl bg-white/5 py-1.5">
              <div className="text-[10px] text-white/50">Revenue</div>
              <div className="text-sm font-bold text-white">€{reward.revenue.toLocaleString()}</div>
            </div>
            <div className="rounded-xl bg-emerald-500/10 py-1.5">
              <div className="text-[10px] text-white/50">Cash Earned</div>
              <div className="text-sm font-bold text-emerald-300">+€{reward.cashEarned.toLocaleString()}</div>
            </div>
            <div className="rounded-xl bg-cyan-500/10 py-1.5">
              <div className="text-[10px] text-white/50">XP</div>
              <div className="text-sm font-bold text-cyan-300">+{reward.xp.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* final stats */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {ORDER.map((s) => (
            <div key={s} className="bg-white/5 rounded-lg py-2">
              <div className="text-[11px] text-white/50">{STAT_META[s].icon}</div>
              <div className="text-sm font-bold">{formatStat(s, stats[s])}</div>
              <div className="text-[10px] text-white/40">{STAT_META[s].label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onRetry}
            className="px-5 py-3 rounded-xl bg-white/8 border border-white/10 font-semibold hover:bg-white/12 active:scale-95 transition"
          >
            Retry
          </button>
          <button
            onClick={onContinue}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 font-bold text-lg shadow-lg hover:scale-[1.01] active:scale-95 transition"
          >
            Upgrade & Continue →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
