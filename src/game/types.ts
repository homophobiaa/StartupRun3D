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
 * the player's upgrade-derived modifiers so it can branch (e.g. paid ads check
 * product + marketing level). Returns the raw deltas to apply.
 */
export interface GateChoice {
  label: string;
  icon: string;
  tone: GateTone;
  /** One-line explanation shown in the focused preview panel. */
  detail?: string;
  /** Approximate effect chips (max ~2 shown on the gate). */
  preview?: StatDelta[];
  /** Marks an explicitly risky choice for the risk indicator. */
  risk?: boolean;
  effect: (s: Stats, m: Modifiers) => StatDelta[];
}

export interface DecisionRow {
  /** The decision moment, e.g. "MVP Strategy". */
  title: string;
  /** 0=left, 1=center, 2=right gates. Always length 3. */
  gates: [GateChoice, GateChoice, GateChoice];
}

/** Per-level difficulty scaling applied on top of every delta. */
export interface LevelScaling {
  userUpside: number;
  userDownside: number;
  legalScale: number;
  stressScale: number;
}

export interface LevelConfig {
  index: number; // 1-based
  name: string;
  subtitle: string;
  scaling: LevelScaling;
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

// ── Progression ───────────────────────────────────────────────────────

export type UpgradeId =
  | 'startingCash'
  | 'codingSkill'
  | 'marketingBrain'
  | 'legalAwareness'
  | 'stressResistance'
  | 'teamManagement'
  | 'serverInfra'
  | 'reputationShield';

export interface Upgrade {
  id: UpgradeId;
  name: string;
  icon: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costGrowth: number;
  /** Human-readable effect at a given level. */
  effectLabel: (level: number) => string;
}

export type UpgradeState = Record<UpgradeId, number>;

/** Derived gameplay multipliers from the player's upgrades. */
export interface Modifiers {
  startCashBonus: number;
  codingMult: number; // positive product *
  marketingUserMult: number; // positive users * (ads/marketing gates)
  marketingRepProtect: number; // 0..1 reduces ad reputation loss
  legalReduce: number; // 0..1 reduces +legalRisk
  stressReduce: number; // 0..1 reduces +stress
  teamMult: number; // hiring / team effects *
  serverReduce: number; // 0..1 reduces user crash penalties
  repShield: number; // 0..1 reduces reputation losses
}

export interface RunReward {
  revenue: number;
  valuation: number;
  grade: string;
  xp: number;
  cashEarned: number;
}

export type GraphicsQuality = 'low' | 'medium' | 'high';

export interface GameSettings {
  music: boolean;
  sfx: boolean;
  reducedMotion: boolean;
  showPreviews: boolean;
  quality: GraphicsQuality;
}

export interface BestEnding {
  id: string;
  title: string;
  emoji: string;
  valuation: number;
}

export interface Progress {
  upgrades: UpgradeState;
  wallet: number; // spendable cash for upgrades
  xp: number; // lifetime xp
  level: number; // next level to play (1-based)
  bestValuation: number;
  bestEnding: BestEnding | null;
  totalRuns: number;
  settings: GameSettings;
}

export type GamePhase = 'start' | 'playing' | 'upgrades' | 'end';
