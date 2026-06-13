import { motion } from 'framer-motion';
import type { Progress } from '../game/types';

interface Props {
  progress: Progress;
  onStart: () => void;
  onUpgrades: () => void;
  onSettings: () => void;
}

export default function StartScreen({ progress, onStart, onUpgrades, onSettings }: Props) {
  const continuing = progress.level > 1;
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-gradient-to-b from-[#05060f] via-[#080d20] to-[#0a1430]">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm w-full text-center">
        <div className="text-6xl mb-3">🚀</div>
        <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
          Startup Runner
        </h1>
        <p className="text-white/65 mb-7 text-base">Pick startup decisions, grow your stats, survive the run.</p>

        <button
          onClick={onStart}
          className="w-full px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 font-black text-xl shadow-lg shadow-cyan-500/25 hover:scale-[1.02] active:scale-95 transition-transform"
        >
          {continuing ? `Continue · Level ${progress.level}` : 'Start Run'}
        </button>

        <div className="flex gap-2 mt-3">
          <button onClick={onUpgrades} className="flex-1 px-4 py-2.5 rounded-xl bg-white/8 border border-white/10 font-semibold hover:bg-white/12 active:scale-95 transition">
            🛠️ Upgrades
          </button>
          <button onClick={onSettings} className="flex-1 px-4 py-2.5 rounded-xl bg-white/8 border border-white/10 font-semibold hover:bg-white/12 active:scale-95 transition">
            ⚙️ Settings
          </button>
        </div>

        {progress.wallet > 0 && <div className="mt-3 text-sm text-emerald-300/90 font-semibold">€{progress.wallet.toLocaleString()} to spend on upgrades</div>}
        {progress.bestEnding && (
          <div className="mt-1 text-xs text-white/45">Best: {progress.bestEnding.emoji} {progress.bestEnding.title}</div>
        )}
      </motion.div>
    </div>
  );
}
