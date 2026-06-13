import { AnimatePresence, motion } from 'framer-motion';
import { TONE_COLOR } from './constants';
import type { GateTone } from '../game/types';

export interface LogEntry {
  label: string;
  tone: GateTone;
}

/** A single small "last choice" toast that fades — no wall of logs during play. */
export default function ChoiceLog({ entries }: { entries: LogEntry[] }) {
  const last = entries[entries.length - 1];
  return (
    <div className="absolute top-16 sm:top-14 left-0 right-0 flex justify-center pointer-events-none z-10">
      <AnimatePresence mode="wait">
        {last && (
          <motion.div
            key={entries.length}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="px-3 py-1 rounded-full text-xs font-semibold bg-black/55 border backdrop-blur-sm"
            style={{ borderColor: TONE_COLOR[last.tone], color: '#fff' }}
          >
            {last.label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
