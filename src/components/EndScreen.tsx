import { motion } from 'framer-motion';
import type { Ending, Stats, RunReward } from '../game/types';
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

const GRADE_COLOR: Record<string, string> = { S: '#fbbf24', A: '#34d399', B: '#22d3ee', C: '#a78bfa', D: '#fb923c', F: '#f87171' };

/** Three short outcome bullets — no wall of text. */
function summarize(stats: Stats): string[] {
  const out: string[] = [];
  out.push(`👥 ${stats.users.toLocaleString()} users · 🛠️ ${stats.product} product`);
  out.push(stats.cash >= 0 ? `💶 €${stats.cash.toLocaleString()} in the bank` : `💸 €${Math.abs(stats.cash).toLocaleString()} in the red`);
  if (stats.legalRisk > 55) out.push('⚖️ Lawyers are circling.');
  else if (stats.stress > 70) out.push('🔥 You are running on fumes.');
  else if (stats.reputation > 60) out.push('⭐ A reputation people respect.');
  else out.push(`⭐ Reputation ${stats.reputation} · 🔥 Stress ${stats.stress}`);
  return out.slice(0, 3);
}

export default function EndScreen({ ending, reward, stats, levelIndex, isBest, reducedMotion, onContinue, onRetry }: Props) {
  const celebrate = !reducedMotion && reward.grade !== 'F' && reward.grade !== 'D';
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
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
        {isBest && <div className="text-xs text-emerald-400 font-semibold mb-2">🏆 New best valuation!</div>}

        {/* grade + headline numbers */}
        <div className="flex items-stretch gap-2 my-4">
          <div className="flex flex-col items-center justify-center w-20 rounded-xl" style={{ background: `${GRADE_COLOR[reward.grade]}22`, border: `1px solid ${GRADE_COLOR[reward.grade]}55` }}>
            <div className="text-[10px] text-white/50">Grade</div>
            <div className="text-4xl font-black" style={{ color: GRADE_COLOR[reward.grade] }}>{reward.grade}</div>
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

        {/* 3-bullet summary */}
        <div className="text-left space-y-1.5 mb-5">
          {summarize(stats).map((b, i) => (
            <div key={i} className="text-sm text-white/80 bg-white/5 rounded-lg px-3 py-1.5">{b}</div>
          ))}
        </div>

        <div className="flex gap-2">
          <button onClick={onRetry} className="px-5 py-3 rounded-xl bg-white/8 border border-white/10 font-semibold hover:bg-white/12 active:scale-95 transition">Retry</button>
          <button onClick={onContinue} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 font-bold text-lg shadow-lg hover:scale-[1.01] active:scale-95 transition">Upgrade & Continue →</button>
        </div>
      </motion.div>
    </div>
  );
}
