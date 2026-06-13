import { AnimatePresence, motion } from 'framer-motion';
import type { DecisionRow } from '../game/types';
import { CATEGORY, AUTO_CONFIRM_MS } from './constants';
import { chipLabel, deltaIsGood } from '../game/logic';

interface Props {
  /** The row being decided, or null when just running. */
  row: DecisionRow | null;
  rowIndex: number;
  lane: number;
  reducedMotion: boolean;
  showChips: boolean;
  onConfirm: () => void;
}

/** The focused decision panel — the primary way the player reads a choice. */
export default function SelectedPreview({ row, rowIndex, lane, reducedMotion, showChips, onConfirm }: Props) {
  const choice = row?.gates[lane] ?? null;
  return (
    <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center px-4 pointer-events-none z-20">
      <AnimatePresence>
        {row && choice && (
          <motion.div
            key={rowIndex}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.22 }}
            className="w-full max-w-sm pointer-events-auto"
          >
            <div className="text-center text-sm font-semibold text-white/80 mb-2">{row.title}</div>
            <div
              className="rounded-2xl px-4 pt-3 pb-2.5 border backdrop-blur-md"
              style={{ background: 'rgba(8,12,28,0.82)', borderColor: CATEGORY[choice.category].color, boxShadow: `0 0 30px ${CATEGORY[choice.category].color}55` }}
            >
              {/* selected option */}
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <span className="text-3xl">{choice.icon}</span>
                <span className="text-2xl font-black text-white">{choice.label}</span>
              </div>

              {/* one-sentence explanation */}
              {choice.detail && <div className="text-sm text-white/75 text-center leading-snug mb-2">{choice.detail}</div>}

              {/* effect chips + risk */}
              {showChips && (
              <div className="flex flex-wrap justify-center gap-1.5 mb-2.5">
                {choice.preview?.slice(0, 3).map((p, i) => {
                  const good = deltaIsGood(p);
                  return (
                    <span key={i} className="px-2 py-0.5 rounded-md text-xs font-bold" style={{ background: good ? 'rgba(52,211,153,0.16)' : 'rgba(248,113,113,0.16)', color: good ? '#6ee7b7' : '#fca5a5' }}>
                      {chipLabel(p)}
                    </span>
                  );
                })}
                {choice.risk && <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-400/15 text-amber-300">⚠ Risk</span>}
              </div>
              )}

              {/* auto-confirm window (keyed by row so it does not reset on lane switch) */}
              <div className="h-1 rounded-full bg-white/10 overflow-hidden mb-2">
                {!reducedMotion && (
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ animation: `decideBar ${AUTO_CONFIRM_MS}ms linear forwards` }} />
                )}
              </div>

              <button onClick={onConfirm} className="w-full py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 font-bold text-sm active:scale-95 transition">
                Go ▶
              </button>
            </div>
            <div className="mt-1.5 text-center text-[11px] text-white/45">A / D · ← / → to switch &nbsp;·&nbsp; Space to commit</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
