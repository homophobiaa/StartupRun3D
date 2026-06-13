import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Progress, UpgradeId } from '../game/types';
import { UPGRADES, UPGRADE_MAP, RECOMMENDED_UPGRADES, upgradeCost } from '../game/progression';

interface Props {
  progress: Progress;
  onBuy: (id: UpgradeId) => void;
  onStart: () => void;
  onBack: () => void;
}

function Card({ id, progress, onBuy }: { id: UpgradeId; progress: Progress; onBuy: (id: UpgradeId) => void }) {
  const u = UPGRADE_MAP[id];
  const lvl = progress.upgrades[id];
  const maxed = lvl >= u.maxLevel;
  const cost = upgradeCost(id, lvl);
  const affordable = !maxed && progress.wallet >= cost;
  return (
    <div
      className={`rounded-2xl p-3 border flex flex-col transition ${affordable ? 'bg-white/5 border-emerald-400/40 shadow-[0_0_18px_rgba(52,211,153,0.18)]' : 'bg-white/5 border-white/8'}`}
    >
      <div className="flex items-start gap-2">
        <span className="text-2xl">{u.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-white text-sm">{u.name}</span>
            <span className="text-[10px] text-cyan-300 font-semibold shrink-0">Lv {lvl}/{u.maxLevel}</span>
          </div>
          <div className="text-[11px] text-emerald-300/90 leading-tight">
            {lvl > 0 ? u.effectLabel(lvl) : u.description}
          </div>
        </div>
      </div>
      <div className="flex gap-1 mt-2 mb-2">
        {Array.from({ length: u.maxLevel }).map((_, i) => (
          <div key={i} className={`h-1.5 flex-1 rounded ${i < lvl ? 'bg-gradient-to-r from-cyan-400 to-emerald-400' : 'bg-white/10'}`} />
        ))}
      </div>
      <button
        disabled={maxed || !affordable}
        onClick={() => onBuy(id)}
        className={`mt-auto w-full py-2 rounded-xl text-sm font-bold transition active:scale-95 ${
          maxed ? 'bg-white/5 text-white/40 cursor-default' : affordable ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white hover:scale-[1.02]' : 'bg-white/5 text-white/40 cursor-not-allowed'
        }`}
      >
        {maxed ? 'Maxed Out' : `Upgrade · €${cost.toLocaleString()}`}
      </button>
    </div>
  );
}

export default function UpgradeScreen({ progress, onBuy, onStart, onBack }: Props) {
  const [showMore, setShowMore] = useState(false);
  const more = UPGRADES.filter((u) => !RECOMMENDED_UPGRADES.includes(u.id)).map((u) => u.id);

  return (
    <div className="absolute inset-0 z-40 flex flex-col bg-gradient-to-b from-[#05060f] to-[#0a1430]">
      <div className="shrink-0 px-4 pt-4 pb-2 flex items-center justify-between max-w-2xl w-full mx-auto">
        <div>
          <h2 className="text-2xl font-black text-white">Upgrades</h2>
          <p className="text-xs text-white/50">Permanent boosts. They carry across every run.</p>
        </div>
        <div className="text-right">
          <div className="text-[11px] text-white/50">Wallet</div>
          <div className="text-xl font-black text-emerald-300">€{progress.wallet.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-2">
        <div className="max-w-2xl mx-auto">
          <div className="text-[11px] uppercase tracking-widest text-cyan-300/70 mb-2">Recommended</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
            {RECOMMENDED_UPGRADES.map((id) => (
              <Card key={id} id={id} progress={progress} onBuy={onBuy} />
            ))}
          </div>

          <button
            onClick={() => setShowMore((s) => !s)}
            className="w-full py-2 mb-3 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold text-white/70 hover:bg-white/10 transition"
          >
            {showMore ? '▲ Hide extra upgrades' : '▼ More upgrades'}
          </button>

          {showMore && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {more.map((id) => (
                <Card key={id} id={id} progress={progress} onBuy={onBuy} />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <div className="shrink-0 px-4 py-3 border-t border-white/10 bg-black/30">
        <div className="max-w-2xl mx-auto flex gap-2">
          <button onClick={onBack} className="px-5 py-3 rounded-xl bg-white/8 border border-white/10 font-semibold hover:bg-white/12 active:scale-95 transition">Back</button>
          <button onClick={onStart} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 font-bold text-lg shadow-lg hover:scale-[1.01] active:scale-95 transition">
            Start Next Run · Level {progress.level} →
          </button>
        </div>
      </div>
    </div>
  );
}
