import { motion } from 'framer-motion';
import type { Progress } from '../game/types';

interface Props {
  progress: Progress;
  onStart: () => void;
  onUpgrades: () => void;
}

export default function StartScreen({ progress, onStart, onUpgrades }: Props) {
  const continuing = progress.level > 1;
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-gradient-to-b from-[#05060f] via-[#080d20] to-[#0a1430] overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center my-auto"
      >
        <div className="text-6xl mb-2">🚀</div>
        <h1 className="text-5xl font-black mb-1 bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
          Startup Runner
        </h1>
        <p className="text-white/70 mb-5 text-sm">
          Steer through a startup's life — one decision lane at a time. Survive five levels, earn cash,
          buy upgrades, and come back stronger. Build it real or fake it till you break it.
        </p>

        <button
          onClick={onStart}
          className="w-full px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-emerald-500 font-bold text-lg shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-transform"
        >
          {continuing ? `Continue · Level ${progress.level}` : 'Start Run'}
        </button>

        <button
          onClick={onUpgrades}
          className="w-full mt-2.5 px-8 py-3 rounded-2xl bg-white/8 border border-white/10 font-semibold hover:bg-white/12 active:scale-95 transition"
        >
          🛠️ Upgrades <span className="text-emerald-300 font-bold">€{progress.wallet.toLocaleString()}</span> available
        </button>

        <div className="text-left bg-white/5 rounded-2xl p-4 mt-5 text-sm space-y-1.5 border border-white/5">
          <div className="font-semibold text-cyan-300 mb-1">Controls</div>
          <div>⌨️ Steer with <b>A / D</b> or <b>← / →</b></div>
          <div>📱 Swipe or tap left / right on mobile</div>
          <div>⏸ Press <b>Esc</b> (or the pause button) anytime</div>
          <div className="pt-1 text-white/60">
            🟢 solid · 🟡 risky · 🔴 bad · 🟣 neutral — and ⚠ marks a gamble.
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-4 text-xs text-white/50">
          {progress.bestEnding && (
            <span>
              Best: {progress.bestEnding.emoji} <b className="text-white/80">{progress.bestEnding.title}</b>
            </span>
          )}
          {progress.totalRuns > 0 && <span>Runs: {progress.totalRuns}</span>}
        </div>
      </motion.div>
    </div>
  );
}
