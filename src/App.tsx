import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import StartScreen from './components/StartScreen';
import EndScreen from './components/EndScreen';
import UpgradeScreen from './components/UpgradeScreen';
import PauseMenu from './components/PauseMenu';
import EventToast from './components/EventToast';
import ChoiceLog, { type LogEntry } from './components/ChoiceLog';
import FloatingDeltas, { type FloatBatch } from './components/FloatingDeltas';
import SelectedPreview from './components/SelectedPreview';
import { initialStats, applyDeltas } from './game/logic';
import { getLevel } from './game/data';
import { EVENTS } from './game/events';
import { resolveEnding } from './game/endings';
import {
  loadProgress,
  saveProgress,
  resetProgress,
  computeModifiers,
  computeReward,
  recordRun,
  upgradeCost,
  UPGRADE_MAP,
} from './game/progression';
import { initAudio, setSfxEnabled, sfx } from './game/audio';
import type {
  GamePhase,
  Stats,
  Ending,
  GameEvent,
  Progress,
  RunReward,
  UpgradeId,
  GameSettings,
  StatDelta,
} from './game/types';

export default function App() {
  const [progress, setProgress] = useState<Progress>(() => loadProgress());
  const [phase, setPhase] = useState<GamePhase>('start');
  const [playLevel, setPlayLevel] = useState(1);
  const [runId, setRunId] = useState(0);

  const [stats, setStats] = useState<Stats>(() => initialStats(computeModifiers(progress.upgrades)));
  const [currentRow, setCurrentRow] = useState(0);
  const [selectedLane, setSelectedLane] = useState(1);
  const [nearRow, setNearRow] = useState<number | null>(null);
  const [chosenLanes, setChosenLanes] = useState<number[]>([]);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [floats, setFloats] = useState<FloatBatch[]>([]);
  const [activeEvent, setActiveEvent] = useState<GameEvent | null>(null);
  const [ending, setEnding] = useState<Ending | null>(null);
  const [reward, setReward] = useState<RunReward | null>(null);
  const [isBest, setIsBest] = useState(false);
  const [flash, setFlash] = useState<'bad' | 'good' | null>(null);
  const [shake, setShake] = useState(false);
  const [paused, setPaused] = useState(false);

  const level = useMemo(() => getLevel(playLevel), [playLevel]);
  const modifiers = useMemo(() => computeModifiers(progress.upgrades), [progress.upgrades]);
  const totalRows = level.rows.length;
  const settings = progress.settings;

  const laneRef = useRef(1);
  const statsRef = useRef(stats);
  statsRef.current = stats;
  const modRef = useRef(modifiers);
  modRef.current = modifiers;
  const scalingRef = useRef(level.scaling);
  scalingRef.current = level.scaling;
  const firedEvents = useRef<Set<string>>(new Set());
  const floatId = useRef(0);
  const moveAtRef = useRef(0);

  useEffect(() => saveProgress(progress), [progress]);
  useEffect(() => setSfxEnabled(settings.sfx), [settings.sfx]);

  const moveLane = useCallback(
    (dir: -1 | 1) => {
      if (phase !== 'playing' || paused) return;
      const now = performance.now();
      if (now - moveAtRef.current < 90) return; // debounce accidental double-moves
      const target = Math.max(0, Math.min(2, laneRef.current + dir));
      if (target === laneRef.current) return;
      moveAtRef.current = now;
      laneRef.current = target;
      setSelectedLane(target);
      sfx.move();
    },
    [phase, paused]
  );

  // keyboard: WASD + arrows, Esc to pause; ignore while typing
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      if (e.key === 'Escape') {
        if (phase === 'playing') setPaused((p) => !p);
        return;
      }
      if (phase !== 'playing' || paused) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        moveLane(-1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        moveLane(1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, paused, moveLane]);

  // swipe
  const touchStart = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(dx) > 30) moveLane(dx < 0 ? -1 : 1);
    touchStart.current = null;
  };

  const startRun = useCallback((lvl: number) => {
    initAudio();
    setPlayLevel(lvl);
    setStats(initialStats(modRef.current));
    setCurrentRow(0);
    setSelectedLane(1);
    setNearRow(null);
    setChosenLanes([]);
    setLog([]);
    setFloats([]);
    setActiveEvent(null);
    setEnding(null);
    setReward(null);
    setIsBest(false);
    firedEvents.current = new Set();
    laneRef.current = 1;
    setPaused(false);
    setRunId((r) => r + 1);
    setPhase('playing');
  }, []);

  const triggerFeedback = (kind: 'bad' | 'good') => {
    if (settings.reducedMotion) return;
    setFlash(kind);
    setTimeout(() => setFlash(null), 350);
    if (kind === 'bad') {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  };

  const pushFloat = (deltas: StatDelta[]) => {
    const id = floatId.current++;
    setFloats((f) => [...f, { id, deltas }]);
    setTimeout(() => setFloats((f) => f.filter((b) => b.id !== id)), 1400);
  };

  const handleResolveRow = useCallback(
    (rowIndex: number, lane: number) => {
      const row = level.rows[rowIndex];
      const choice = row.gates[lane];
      const raw = choice.effect(statsRef.current, modRef.current);
      const { next, applied } = applyDeltas(statsRef.current, raw, modRef.current, scalingRef.current);
      setStats(next);
      pushFloat(applied);
      setLog((l) => [...l, { label: `${choice.icon} ${choice.label}`, tone: choice.tone }]);
      setChosenLanes((c) => {
        const copy = [...c];
        copy[rowIndex] = lane;
        return copy;
      });
      setCurrentRow(rowIndex + 1);
      const bad = choice.tone === 'bad';
      triggerFeedback(bad ? 'bad' : 'good');
      if (bad) sfx.bad();
      else sfx.good();

      if (rowIndex + 1 >= totalRows) {
        const ev = EVENTS.find((e) => !firedEvents.current.has(e.id) && e.condition(next));
        if (ev) {
          firedEvents.current.add(ev.id);
          const res = applyDeltas(next, ev.effect(next), modRef.current, scalingRef.current);
          setStats(res.next);
          setActiveEvent(ev);
          setTimeout(() => setActiveEvent(null), 2600);
          pushFloat(res.applied);
          triggerFeedback(ev.tone === 'bad' ? 'bad' : 'good');
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [level, totalRows, settings.reducedMotion]
  );

  const handleFinish = useCallback(() => {
    const finalStats = statsRef.current;
    const result = resolveEnding(finalStats);
    const rw = computeReward(finalStats, playLevel);
    setEnding(result);
    setReward(rw);
    setIsBest(rw.valuation > progress.bestValuation);
    setProgress((p) => recordRun(p, rw, result, playLevel));
    sfx.finish();
    setPhase('end');
  }, [playLevel, progress.bestValuation]);

  const buyUpgrade = (id: UpgradeId) => {
    setProgress((p) => {
      const lvl = p.upgrades[id];
      if (lvl >= UPGRADE_MAP[id].maxLevel) return p;
      const cost = upgradeCost(id, lvl);
      if (p.wallet < cost) return p;
      sfx.good();
      return { ...p, wallet: p.wallet - cost, upgrades: { ...p.upgrades, [id]: lvl + 1 } };
    });
  };

  const changeSettings = (s: GameSettings) => setProgress((p) => ({ ...p, settings: s }));
  const doReset = () => {
    const fresh = resetProgress();
    setProgress(fresh);
    setPaused(false);
    setPhase('start');
  };

  const previewRow = nearRow !== null && !paused ? level.rows[nearRow] : null;

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${shake ? 'shake' : ''}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {(phase === 'playing' || phase === 'end') && (
        <GameCanvas
          runId={runId}
          rows={level.rows}
          laneRef={laneRef}
          currentRow={currentRow}
          chosenLanes={chosenLanes}
          paused={paused || phase === 'end'}
          quality={settings.quality}
          reducedMotion={settings.reducedMotion}
          showPreviews={settings.showPreviews}
          onResolveRow={handleResolveRow}
          onNear={setNearRow}
          onFinish={handleFinish}
        />
      )}

      {phase === 'playing' && (
        <>
          <HUD stats={stats} levelName={level.name} levelIndex={level.index} currentRow={currentRow} totalRows={totalRows} onPause={() => setPaused(true)} />
          <ChoiceLog entries={log} />
          <FloatingDeltas batches={floats} />
          <EventToast event={activeEvent} />
          <SelectedPreview row={previewRow} lane={selectedLane} />

          {/* mobile tap zones */}
          {!paused && (
            <>
              <div className="absolute inset-y-0 left-0 w-1/4 sm:hidden" onClick={() => moveLane(-1)} />
              <div className="absolute inset-y-0 right-0 w-1/4 sm:hidden" onClick={() => moveLane(1)} />
            </>
          )}
        </>
      )}

      {flash && (
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ background: flash === 'bad' ? 'rgba(248,113,113,0.40)' : 'rgba(52,211,153,0.28)', animation: 'badFlash 0.35s ease-out forwards' }}
        />
      )}

      {phase === 'playing' && paused && (
        <PauseMenu
          settings={settings}
          stats={stats}
          log={log}
          onResume={() => setPaused(false)}
          onRestart={() => startRun(playLevel)}
          onQuit={() => {
            setPaused(false);
            setPhase('start');
          }}
          onChange={changeSettings}
          onReset={doReset}
        />
      )}

      {phase === 'start' && (
        <StartScreen progress={progress} onStart={() => startRun(progress.level)} onUpgrades={() => setPhase('upgrades')} />
      )}

      {phase === 'upgrades' && (
        <UpgradeScreen progress={progress} onBuy={buyUpgrade} onStart={() => startRun(progress.level)} onBack={() => setPhase('start')} />
      )}

      {phase === 'end' && ending && reward && (
        <EndScreen
          ending={ending}
          reward={reward}
          stats={stats}
          levelIndex={playLevel}
          isBest={isBest}
          reducedMotion={settings.reducedMotion}
          onContinue={() => setPhase('upgrades')}
          onRetry={() => startRun(playLevel)}
        />
      )}
    </div>
  );
}
