import { motion } from 'framer-motion';

interface Props {
  onStart: () => void;
  best: { title: string; emoji: string } | null;
}

export default function StartScreen({ onStart, best }: Props) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-gradient-to-b from-[#05060f] to-[#0a1228]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="text-5xl mb-2">🚀</div>
        <h1 className="text-4xl font-extrabold mb-1 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Startup Runner
        </h1>
        <p className="text-white/70 mb-5 text-sm">
          Run your startup from idea to exit. Pick a lane at every decision gate — your choices
          stack up into one of many endings. Build real skills or fake it till you break it.
        </p>

        <div className="text-left bg-white/5 rounded-xl p-4 mb-5 text-sm space-y-1.5">
          <div className="font-semibold text-cyan-300 mb-1">How to play</div>
          <div>🏃 You run forward automatically through 20 decisions.</div>
          <div>↔️ Steer with <b>A/D</b>, <b>← / →</b>, or <b>swipe</b> on mobile.</div>
          <div>🟢 green = solid · 🟠 orange = risky · 🔴 red = bad · 🟣 purple = neutral</div>
          <div>⚠️ Stats interact — a choice good today can wreck you later.</div>
        </div>

        {best && (
          <div className="text-xs text-white/50 mb-4">
            Best run: {best.emoji} <b className="text-white/80">{best.title}</b>
          </div>
        )}

        <button
          onClick={onStart}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-transform"
        >
          Start Building
        </button>
      </motion.div>
    </div>
  );
}
