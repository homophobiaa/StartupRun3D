import { AnimatePresence, motion } from 'framer-motion';
import type { StatDelta } from '../game/types';
import { formatDelta, deltaIsGood } from '../game/logic';

export interface ResultData {
  id: number;
  label: string;
  deltas: StatDelta[];
}

/** One short result toast after a choice — e.g. "Big Launch: +240 Users". */
export default function ResultToast({ result }: { result: ResultData | null }) {
  return (
    <div className="absolute top-20 left-0 right-0 flex justify-center pointer-events-none z-20">
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="px-4 py-2 rounded-xl bg-black/65 border border-white/10 backdrop-blur-sm text-center"
          >
            <span className="text-sm font-bold text-white">{result.label}</span>
            <span className="ml-2 text-sm">
              {result.deltas.slice(0, 3).map((dlt, i) => (
                <span key={i} className={`font-bold ${deltaIsGood(dlt) ? 'text-emerald-300' : 'text-red-300'} ${i > 0 ? 'ml-2' : ''}`}>
                  {formatDelta(dlt)}
                </span>
              ))}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
