import { AnimatePresence, motion } from 'framer-motion';
import type { GameEvent } from '../game/types';
import { TONE_COLOR } from './constants';

/** Big centered event card shown when a checkpoint event fires. */
export default function EventToast({ event }: { event: GameEvent | null }) {
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, scale: 0.7, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        >
          <div
            className="px-5 py-4 rounded-2xl bg-black/80 border-2 shadow-2xl text-center max-w-[320px]"
            style={{ borderColor: TONE_COLOR[event.tone], boxShadow: `0 0 40px ${TONE_COLOR[event.tone]}66` }}
          >
            <div className="text-lg font-bold mb-1" style={{ color: TONE_COLOR[event.tone] }}>
              {event.title}
            </div>
            <div className="text-sm text-white/80">{event.text}</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
