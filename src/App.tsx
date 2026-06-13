import { useCallback, useEffect, useRef, useState } from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import StartScreen from './components/StartScreen';
import EndScreen from './components/EndScreen';
import EventToast from './components/EventToast';
import ChoiceLog, { type LogEntry } from './components/ChoiceLog';
import FloatingDeltas, { type FloatBatch } from './components/FloatingDeltas';
import { INITIAL_STATS, applyDeltas } from './game/logic';
import { FLAT_ROWS, TOTAL_ROWS } from './game/data';
import { EVENTS } from './game/events';
import { resolveEnding } from './game/endings';
import type { GameEvent, GamePhase, Stats, Ending } from './game/types';

const BEST_KEY = 'startup-runner-best';

interface BestRun {
  id: string;
  title: string;
  emoji: string;
}

export default function App() {
  const [phase, setPhase] = useState<GamePhase>('start');
  const [stats, setStats] = useState<Stats>(INITIAL_STATS);
  const [currentRow, setCurrentRow] = useState(0);
  const [chosenLanes, setChosenLanes] = useState<number[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [floats, setFloats] = useState<FloatBatch[]>([]);
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [ending, setEnding] = useState<Ending | null>(null);
  const [isBest, setIsBest] = useState(false);
  const [flash, setFlash] = useState<'bad' | 'good' | null>(null);
  const [shake, setShake] = useState(false);
  const [best, setBest] = useState<BestRun | null>(null);

  const laneRef = useRef(1);
  const statsRef = useRef(stats);
  statsRef.current = stats;
  const firedEvents = useRef<Set<string>>(new Set());
  const floatId = useRef(0);

  // load best run
  useEffect(() => {
    try {
      const raw = localStorage.getItem(BEST_KEY);
      if (raw) setBest(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  // keyboard controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== 'playing') return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        laneRef.current = Math.max(0, laneRef.current - 1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        laneRef.current = Math.min(2, laneRef.current + 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  // touch / swipe controls
  const touchStart = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 30) {
      if (dx < 0) laneRef.current = Math.max(0, laneRef.current - 1);
      else laneRef.current = Math.min(2, laneRef.current + 1);
    }
    touchStart.current = null;
  };

  const startGame = useCallback(() => {
    setStats(INITIAL_STATS);
    setCurrentRow(0);
    setChosenLanes([]);
    setLog([]);
    setFloats([]);
    setActiveEvent(null);
    setEnding(null);
    setIsBest(false);
    firedEvents.current = new Set();
    laneRef.current = 1;
    setPhase('playing');
  }, []);

  const triggerFeedback = (kind: 'bad' | 'good') => {
    setFlash(kind);
    setTimeout(() => setFlash(null), 350);
    if (kind === 'bad') {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const handleResolveRow = useCallback((rowIndex: number, lane: number) => {
    const row = FLAT_ROWS[rowIndex];
    const choice = row.gates[lane];
    const deltas = choice.effect(statsRef.current);
    const next = applyDeltas(statsRef.current, deltas);
    setStats(next);

    // floating deltas
    const id = floatId.current++;
    setFloats((f) => [...f, { id, deltas }]);
    setTimeout(() => setFloats((f) => f.filter((b) => b.id !== id)), 1400);

    // log + chosen lane
    setLog((l) => [...l, { label: choice.label, tone: choice.tone }]);
    setChosenLanes((c) => {
      const copy = [...c];
      copy[rowIndex] = lane;
      return copy;
    });
    setCurrentRow(rowIndex + 1);

    // feedback
    triggerFeedback(choice.tone === 'bad' ? 'bad' : 'good');

    // event check at phase boundaries (last row of a phase)
    const isPhaseEnd = rowIndex + 1 >= TOTAL_ROWS || FLAT_ROWS[rowIndex + 1].phaseIndex !== row.phaseIndex;
    if (isPhaseEnd) {
      const ev = EVENTS.find((e) => !firedEvents.current.has(e.id) && e.condition(next));
      if (ev) {
        firedEvents.current.add(ev.id);
        const evDeltas = ev.effect(next);
        const after = applyDeltas(next, evDeltas);
        setStats(after);
        setActiveEvent(ev);
        setTimeout(() => setActiveEvent(null), 2600);
        const eid = floatId.current++;
        setFloats((f) => [...f, { id: eid, deltas: evDeltas }]);
        setTimeout(() => setFloats((f) => f.filter((b) => b.id !== eid)), 1400);
        triggerFeedback(ev.tone === 'bad' ? 'bad' : 'good');
      }
    }
  }, []);

  const handleFinish = useCallback(() => {
    const finalStats = statsRef.current;
    const result = resolveEnding(finalStats);
    setEnding(result);

    // best run = first unicorn/indie/agency beats others; simple: store latest "good" by ranking
    try {
      const raw = localStorage.getItem(BEST_KEY);
      const prev: BestRun | null = raw ? JSON.parse(raw) : null;
      const rank = (id: string) =>
        ['survivor', 'broke-dreamer', 'tax-speedrun', 'burned-out', 'viral-broken', 'fake-guru', 'agency', 'indie', 'unicorn'].indexOf(id);
      if (!prev || rank(result.id) >= rank(prev.id)) {
        const nb = { id: result.id, title: result.title, emoji: result.emoji };
        localStorage.setItem(BEST_KEY, JSON.stringify(nb));
        setBest(nb);
        setIsBest(true);
      }
    } catch {
      /* ignore */
    }

    setPhase('end');
  }, []);

  const phaseName = currentRow < TOTAL_ROWS ? FLAT_ROWS[Math.min(currentRow, TOTAL_ROWS - 1)].phaseName : 'Endgame';

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${shake ? 'shake' : ''}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {(phase === 'playing' || phase === 'end') && (
        <GameCanvas
          laneRef={laneRef}
          currentRow={currentRow}
          chosenLanes={chosenLanes}
          onResolveRow={handleResolveRow}
          onFinish={handleFinish}
        />
      )}

      {phase === 'playing' && (
        <>
          <HUD stats={stats} phaseName={phaseName} rowNumber={currentRow + 1} />
          <ChoiceLog entries={log} />
          <FloatingDeltas batches={floats} />
          <EventToast event={activeEvent} />

          {/* mobile tap zones */}
          <div className="absolute inset-y-0 left-0 w-1/3 sm:hidden" onClick={() => (laneRef.current = Math.max(0, laneRef.current - 1))} />
          <div className="absolute inset-y-0 right-0 w-1/3 sm:hidden" onClick={() => (laneRef.current = Math.min(2, laneRef.current + 1))} />
        </>
      )}

      {/* screen flash */}
      {flash && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: flash === 'bad' ? 'rgba(248,113,113,0.45)' : 'rgba(52,211,153,0.30)',
            animation: 'badFlash 0.35s ease-out forwards',
          }}
        />
      )}

      {phase === 'start' && <StartScreen onStart={startGame} best={best} />}
      {phase === 'end' && ending && (
        <EndScreen ending={ending} stats={stats} isBest={isBest} onRestart={startGame} />
      )}
    </div>
  );
}
