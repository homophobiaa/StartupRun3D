import type {
  Upgrade,
  UpgradeId,
  UpgradeState,
  Modifiers,
  Progress,
  GameSettings,
  Stats,
  RunReward,
  BestEnding,
} from './types';

const STORAGE_KEY = 'startup-runner-progress-v2';

// ── Upgrades ──────────────────────────────────────────────────────────

export const UPGRADES: Upgrade[] = [
  {
    id: 'startingCash',
    name: 'Starting Cash',
    icon: '💰',
    description: 'Begin every run with extra runway.',
    maxLevel: 8,
    baseCost: 80,
    costGrowth: 1.55,
    effectLabel: (l) => `+€${l * 300} starting cash`,
  },
  {
    id: 'codingSkill',
    name: 'Coding Skill',
    icon: '🧠',
    description: 'Your product work pays off harder.',
    maxLevel: 6,
    baseCost: 110,
    costGrowth: 1.6,
    effectLabel: (l) => `+${l * 12}% product gains`,
  },
  {
    id: 'marketingBrain',
    name: 'Marketing Brain',
    icon: '📣',
    description: 'More users from growth, softer ad backlash.',
    maxLevel: 6,
    baseCost: 110,
    costGrowth: 1.6,
    effectLabel: (l) => `+${l * 12}% ad users, -${Math.min(60, l * 9)}% ad rep loss`,
  },
  {
    id: 'legalAwareness',
    name: 'Legal Awareness',
    icon: '⚖️',
    description: 'Shady moves raise less legal risk.',
    maxLevel: 6,
    baseCost: 100,
    costGrowth: 1.55,
    effectLabel: (l) => `-${Math.min(70, l * 11)}% legal risk gain`,
  },
  {
    id: 'stressResistance',
    name: 'Stress Resistance',
    icon: '🧘',
    description: 'You take pressure better.',
    maxLevel: 6,
    baseCost: 100,
    costGrowth: 1.55,
    effectLabel: (l) => `-${Math.min(70, l * 11)}% stress gain`,
  },
  {
    id: 'teamManagement',
    name: 'Team Management',
    icon: '🧑‍🤝‍🧑',
    description: 'Hires and team plays land bigger.',
    maxLevel: 6,
    baseCost: 120,
    costGrowth: 1.6,
    effectLabel: (l) => `+${l * 15}% team effects`,
  },
  {
    id: 'serverInfra',
    name: 'Server Infrastructure',
    icon: '🖥️',
    description: 'Downtime and churn hurt less.',
    maxLevel: 6,
    baseCost: 110,
    costGrowth: 1.6,
    effectLabel: (l) => `-${Math.min(75, l * 12)}% user loss`,
  },
  {
    id: 'reputationShield',
    name: 'Reputation Shield',
    icon: '🛡️',
    description: 'Reputation drops are cushioned.',
    maxLevel: 6,
    baseCost: 110,
    costGrowth: 1.6,
    effectLabel: (l) => `-${Math.min(70, l * 11)}% reputation loss`,
  },
];

export const UPGRADE_MAP: Record<UpgradeId, Upgrade> = Object.fromEntries(
  UPGRADES.map((u) => [u.id, u])
) as Record<UpgradeId, Upgrade>;

export function upgradeCost(id: UpgradeId, currentLevel: number): number {
  const u = UPGRADE_MAP[id];
  return Math.round(u.baseCost * Math.pow(u.costGrowth, currentLevel));
}

export function emptyUpgrades(): UpgradeState {
  return {
    startingCash: 0,
    codingSkill: 0,
    marketingBrain: 0,
    legalAwareness: 0,
    stressResistance: 0,
    teamManagement: 0,
    serverInfra: 0,
    reputationShield: 0,
  };
}

/** Derive gameplay modifiers from owned upgrade levels. */
export function computeModifiers(u: UpgradeState): Modifiers {
  return {
    startCashBonus: u.startingCash * 300,
    codingMult: 1 + u.codingSkill * 0.12,
    marketingUserMult: 1 + u.marketingBrain * 0.12,
    marketingRepProtect: Math.min(0.6, u.marketingBrain * 0.09),
    legalReduce: Math.min(0.7, u.legalAwareness * 0.11),
    stressReduce: Math.min(0.7, u.stressResistance * 0.11),
    teamMult: 1 + u.teamManagement * 0.15,
    serverReduce: Math.min(0.75, u.serverInfra * 0.12),
    repShield: Math.min(0.7, u.reputationShield * 0.11),
  };
}

// ── Run scoring ───────────────────────────────────────────────────────

export function computeReward(s: Stats, levelIndex: number): RunReward {
  const revenue = Math.max(0, Math.round(s.users * (s.product / 100) * 3 + s.cash * 0.1));
  const valuationRaw =
    s.users * 12 +
    s.product * 60 +
    s.reputation * 50 +
    s.team * 250 +
    s.cash -
    s.stress * 40 -
    s.legalRisk * 80;
  const valuation = Math.max(0, Math.round(valuationRaw));
  const xp = levelIndex * 60 + Math.round(valuation / 200);
  const cashEarned = Math.round(valuation / 120) + levelIndex * 40;
  return { revenue, valuation, grade: gradeFor(valuation, levelIndex), xp, cashEarned };
}

function gradeFor(valuation: number, levelIndex: number): string {
  const scaled = valuation / Math.max(1, levelIndex);
  if (scaled > 6000) return 'S';
  if (scaled > 4000) return 'A';
  if (scaled > 2500) return 'B';
  if (scaled > 1400) return 'C';
  if (scaled > 600) return 'D';
  return 'F';
}

// ── Persistence ───────────────────────────────────────────────────────

export const DEFAULT_SETTINGS: GameSettings = {
  music: true,
  sfx: true,
  reducedMotion: false,
  showPreviews: true,
};

export function defaultProgress(): Progress {
  return {
    upgrades: emptyUpgrades(),
    wallet: 0,
    xp: 0,
    level: 1,
    bestValuation: 0,
    bestEnding: null,
    totalRuns: 0,
    settings: { ...DEFAULT_SETTINGS },
  };
}

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    const parsed = JSON.parse(raw) as Partial<Progress>;
    const base = defaultProgress();
    return {
      ...base,
      ...parsed,
      upgrades: { ...base.upgrades, ...(parsed.upgrades ?? {}) },
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
    };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export function resetProgress(): Progress {
  const fresh = defaultProgress();
  saveProgress(fresh);
  return fresh;
}

/** Fold a finished run's reward + ending into stored progress. */
export function recordRun(
  p: Progress,
  reward: RunReward,
  ending: { id: string; title: string; emoji: string },
  levelIndex: number
): Progress {
  const beatsBest = reward.valuation > p.bestValuation;
  const bestEnding: BestEnding | null = beatsBest
    ? { id: ending.id, title: ending.title, emoji: ending.emoji, valuation: reward.valuation }
    : p.bestEnding;
  return {
    ...p,
    wallet: p.wallet + reward.cashEarned,
    xp: p.xp + reward.xp,
    level: Math.max(p.level, levelIndex + 1),
    bestValuation: Math.max(p.bestValuation, reward.valuation),
    bestEnding,
    totalRuns: p.totalRuns + 1,
  };
}
