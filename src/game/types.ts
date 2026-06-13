export interface Stats {
  cash: number;
  skill: number;
  product: number;
  users: number;
  reputation: number;
  stress: number;
  legalRisk: number;
  team: number;
}

export type StatKey = keyof Stats;

/** Visual / semantic tone of a gate. Drives color. */
export type GateTone = 'good' | 'risky' | 'bad' | 'neutral';

/** A single floating delta produced when a choice resolves. */
export interface StatDelta {
  stat: StatKey;
  amount: number;
}

/**
 * A choice in one lane of a decision row. `effect` receives current stats and
 * returns the deltas to apply. Keeping it a function lets effects depend on
 * current stats (conditional logic) as the prompt requires.
 */
export interface GateChoice {
  label: string;
  tone: GateTone;
  /** Optional short hint shown under the label. */
  hint?: string;
  effect: (s: Stats) => StatDelta[];
}

export interface DecisionRow {
  /** 0=left, 1=center, 2=right gates. Always length 3. */
  gates: [GateChoice, GateChoice, GateChoice];
}

export interface Phase {
  name: string;
  rows: DecisionRow[];
}

export interface GameEvent {
  id: string;
  title: string;
  text: string;
  tone: GateTone;
  /** Triggers when this returns true. Fired at most once per run. */
  condition: (s: Stats) => boolean;
  effect: (s: Stats) => StatDelta[];
}

export interface Ending {
  id: string;
  title: string;
  emoji: string;
  blurb: string;
  /** Higher score wins. Return -Infinity to disqualify. */
  score: (s: Stats) => number;
}

export type GamePhase = 'start' | 'playing' | 'end';
