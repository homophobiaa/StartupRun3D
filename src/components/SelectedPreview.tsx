import { AnimatePresence, motion } from 'framer-motion';
import type { DecisionRow } from '../game/types';
import { TONE_COLOR } from './constants';
import { chipLabel, deltaIsGood } from '../game/logic';

interface Props {
  row: DecisionRow | null;
  lane: number;
}

/** Bottom-center focused panel for the currently selected lane near a row. */
export default function SelectedPreview({ row, lane }: Props) {
  const choice = row?.gates[lane] ?? null;
  return (
    <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center px-4 pointer-events-none z-20">
      <AnimatePresence mode="wait">
        {row && choice && (
          <motion.div
            key={`${row.title}-${lane}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.16 }}
            className="w-full max-w-sm text-center"
          >
            <div className="text-[11px] uppercase tracking-widest text-white/60 mb-1.5">{row.title}</div>
            <div
              className="rounded-2xl px-4 py-3 border backdrop-blur-md"
              style={{ background: 'rgba(8,12,28,0.78)', borderColor: TONE_COLOR[choice.tone], boxShadow: `0 0 26px ${TONE_COLOR[choice.tone]}44` }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-2xl">{choice.icon}</span>
                <span className="text-xl font-black text-white">{choice.label}</span>
                {choice.risk && <span className="text-amber-300 text-sm font-bold">⚠ RISK</span>}
              </div>
              {choice.preview && choice.preview.length > 0 && (
                <div className="flex justify-center gap-2 my-1.5">
                  {choice.preview.slice(0, 2).map((p, i) => {
                    const good = deltaIsGood(p);
                    return (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md text-xs font-bold"
                        style={{ background: good ? 'rgba(52,211,153,0.15)' : 'rgba(248,113,113,0.15)', color: good ? '#6ee7b7' : '#fca5a5' }}
                      >
                        {chipLabel(p)}
                      </span>
                    );
                  })}
                </div>
              )}
              {choice.detail && <div className="text-xs text-white/70 leading-snug">{choice.detail}</div>}
            </div>
            <div className="mt-1.5 text-[10px] text-white/40">◀ A / D ▶ to switch lane</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
