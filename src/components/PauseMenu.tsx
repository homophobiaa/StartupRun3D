import { useState } from 'react';
import { motion } from 'framer-motion';
import type { GameSettings, GraphicsQuality, Stats } from '../game/types';
import type { LogEntry } from './ChoiceLog';
import { STAT_META } from '../game/logic';

interface Props {
  settings: GameSettings;
  stats: Stats;
  log: LogEntry[];
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  onChange: (s: GameSettings) => void;
  onReset: () => void;
}

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition">
      <span className="text-sm text-white/85">{label}</span>
      <span className={`w-10 h-5 rounded-full relative transition ${on ? 'bg-emerald-500' : 'bg-white/20'}`}>
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${on ? 'left-5' : 'left-0.5'}`} />
      </span>
    </button>
  );
}

const QUALITIES: GraphicsQuality[] = ['low', 'medium', 'high'];

export default function PauseMenu({ settings, stats, log, onResume, onRestart, onQuit, onChange, onReset }: Props) {
  const [view, setView] = useState<'main' | 'settings' | 'stats'>('main');
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const set = (patch: Partial<GameSettings>) => onChange({ ...settings, ...patch });

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-[#0a1228] border border-white/10 rounded-2xl p-5 shadow-2xl"
      >
        {view === 'main' && (
          <>
            <h2 className="text-2xl font-black text-center mb-4">Paused</h2>
            <div className="space-y-2">
              <button onClick={onResume} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 font-bold hover:scale-[1.02] active:scale-95 transition">▶ Resume</button>
              {!confirmRestart ? (
                <button onClick={() => setConfirmRestart(true)} className="w-full py-3 rounded-xl bg-white/8 border border-white/10 font-semibold hover:bg-white/12 active:scale-95 transition">🔄 Restart Run</button>
              ) : (
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-xs text-white/70 mb-2 text-center">Restart this level from the top?</div>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmRestart(false)} className="flex-1 py-2 rounded-lg bg-white/10 text-sm font-semibold">Cancel</button>
                    <button onClick={onRestart} className="flex-1 py-2 rounded-lg bg-cyan-500 text-sm font-bold">Restart</button>
                  </div>
                </div>
              )}
              <button onClick={() => setView('stats')} className="w-full py-3 rounded-xl bg-white/8 border border-white/10 font-semibold hover:bg-white/12 active:scale-95 transition">📊 Stats & Log</button>
              <button onClick={() => setView('settings')} className="w-full py-3 rounded-xl bg-white/8 border border-white/10 font-semibold hover:bg-white/12 active:scale-95 transition">⚙️ Settings</button>
              <button onClick={onQuit} className="w-full py-3 rounded-xl bg-white/8 border border-white/10 font-semibold hover:bg-white/12 active:scale-95 transition">🏠 Quit to Menu</button>
            </div>
          </>
        )}

        {view === 'stats' && (
          <>
            <h2 className="text-2xl font-black text-center mb-4">Stats</h2>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {(Object.keys(STAT_META) as (keyof Stats)[]).map((k) => (
                <div key={k} className="bg-white/5 rounded-lg py-2 text-center">
                  <div className="text-sm">{STAT_META[k].icon}</div>
                  <div className="text-sm font-bold">{stats[k].toLocaleString()}</div>
                  <div className="text-[9px] text-white/40">{STAT_META[k].label}</div>
                </div>
              ))}
            </div>
            <div className="text-xs text-white/50 mb-1">Recent choices</div>
            <div className="space-y-1 max-h-32 overflow-y-auto mb-4">
              {log.slice(-6).reverse().map((e, i) => (
                <div key={i} className="text-xs px-2 py-1 rounded bg-white/5 text-white/75">{e.label}</div>
              ))}
              {log.length === 0 && <div className="text-xs text-white/30">No choices yet.</div>}
            </div>
            <button onClick={() => setView('main')} className="w-full py-2.5 rounded-xl bg-white/8 border border-white/10 font-semibold hover:bg-white/12 transition">← Back</button>
          </>
        )}

        {view === 'settings' && (
          <>
            <h2 className="text-2xl font-black text-center mb-4">Settings</h2>
            <div className="space-y-2">
              {/* graphics quality */}
              <div className="px-3 py-2.5 rounded-xl bg-white/5">
                <div className="text-sm text-white/85 mb-2">🎮 Graphics</div>
                <div className="flex gap-1.5">
                  {QUALITIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => set({ quality: q })}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold capitalize transition ${settings.quality === q ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white' : 'bg-white/8 text-white/60 hover:bg-white/15'}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
              <Toggle label="🎵 Music" on={settings.music} onClick={() => set({ music: !settings.music })} />
              <Toggle label="🔊 Sound Effects" on={settings.sfx} onClick={() => set({ sfx: !settings.sfx })} />
              <Toggle label="🎞️ Reduced Motion" on={settings.reducedMotion} onClick={() => set({ reducedMotion: !settings.reducedMotion })} />
              <Toggle label="👁️ Show Effect Chips" on={settings.showPreviews} onClick={() => set({ showPreviews: !settings.showPreviews })} />

              {!confirmReset ? (
                <button onClick={() => setConfirmReset(true)} className="w-full mt-1 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-semibold hover:bg-red-500/25 transition">Reset All Progress</button>
              ) : (
                <div className="mt-1 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                  <div className="text-xs text-red-200 mb-2 text-center">Erase upgrades, wallet & records?</div>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmReset(false)} className="flex-1 py-2 rounded-lg bg-white/10 text-sm font-semibold">Cancel</button>
                    <button onClick={() => { onReset(); setConfirmReset(false); }} className="flex-1 py-2 rounded-lg bg-red-500 text-sm font-bold">Erase</button>
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setView('main')} className="w-full mt-4 py-2.5 rounded-xl bg-white/8 border border-white/10 font-semibold hover:bg-white/12 transition">← Back</button>
          </>
        )}
      </motion.div>
    </div>
  );
}
