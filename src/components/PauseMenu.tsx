import { useState } from 'react';
import { motion } from 'framer-motion';
import type { GameSettings } from '../game/types';

interface Props {
  settings: GameSettings;
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  onChange: (s: GameSettings) => void;
  onReset: () => void;
}

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition"
    >
      <span className="text-sm text-white/85">{label}</span>
      <span
        className={`w-10 h-5 rounded-full relative transition ${on ? 'bg-emerald-500' : 'bg-white/20'}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${on ? 'left-5' : 'left-0.5'}`}
        />
      </span>
    </button>
  );
}

export default function PauseMenu({ settings, onResume, onRestart, onQuit, onChange, onReset }: Props) {
  const [showSettings, setShowSettings] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const set = (patch: Partial<GameSettings>) => onChange({ ...settings, ...patch });

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm bg-[#0a1228] border border-white/10 rounded-2xl p-5 shadow-2xl"
      >
        {!showSettings ? (
          <>
            <h2 className="text-2xl font-black text-center mb-4">Paused</h2>
            <div className="space-y-2">
              <button onClick={onResume} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 font-bold hover:scale-[1.02] active:scale-95 transition">
                ▶ Resume
              </button>
              <button onClick={onRestart} className="w-full py-3 rounded-xl bg-white/8 border border-white/10 font-semibold hover:bg-white/12 active:scale-95 transition">
                🔄 Restart Run
              </button>
              <button onClick={() => setShowSettings(true)} className="w-full py-3 rounded-xl bg-white/8 border border-white/10 font-semibold hover:bg-white/12 active:scale-95 transition">
                ⚙️ Settings
              </button>
              <button onClick={onQuit} className="w-full py-3 rounded-xl bg-white/8 border border-white/10 font-semibold hover:bg-white/12 active:scale-95 transition">
                🏠 Quit to Menu
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-black text-center mb-4">Settings</h2>
            <div className="space-y-2">
              <Toggle label="🎵 Music" on={settings.music} onClick={() => set({ music: !settings.music })} />
              <Toggle label="🔊 Sound Effects" on={settings.sfx} onClick={() => set({ sfx: !settings.sfx })} />
              <Toggle label="🎞️ Reduced Motion" on={settings.reducedMotion} onClick={() => set({ reducedMotion: !settings.reducedMotion })} />
              <Toggle label="👁️ Show Stat Previews" on={settings.showPreviews} onClick={() => set({ showPreviews: !settings.showPreviews })} />

              {!confirmReset ? (
                <button onClick={() => setConfirmReset(true)} className="w-full mt-1 py-2.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-sm font-semibold hover:bg-red-500/25 transition">
                  Reset All Progress
                </button>
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
            <button onClick={() => setShowSettings(false)} className="w-full mt-4 py-2.5 rounded-xl bg-white/8 border border-white/10 font-semibold hover:bg-white/12 transition">
              ← Back
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
