import type { Stats, StatDelta, StatKey, Modifiers, LevelScaling } from './types';

/** Base starting stats before the Starting Cash upgrade is applied. */
export const BASE_STATS: Stats = {
  cash: 1000,
  skill: 10,
  product: 0,
  users: 0,
  reputation: 10,
  stress: 0,
  legalRisk: 0,
  team: 1,
};

/** Build the run's opening stats, including upgrade bonuses. */
export function initialStats(m: Modifiers): Stats {
  return { ...BASE_STATS, cash: BASE_STATS.cash + m.startCashBonus };
}

/** Min/max clamps per stat. users/cash are loosely bounded. */
const CLAMP: Record<StatKey, [number, number]> = {
  cash: [-9000, 9_999_999],
  skill: [0, 100],
  product: [0, 100],
  users: [0, 9_999_999],
  reputation: [0, 100],
  stress: [0, 100],
  legalRisk: [0, 100],
  team: [0, 999],
};

export function clampStats(s: Stats): Stats {
  const out = { ...s };
  (Object.keys(CLAMP) as StatKey[]).forEach((k) => {
    const [lo, hi] = CLAMP[k];
    out[k] = Math.round(Math.max(lo, Math.min(hi, out[k])));
  });
  return out;
}

const NO_SCALING: LevelScaling = { userUpside: 1, userDownside: 1, legalScale: 1, stressScale: 1 };

/**
 * Apply passive upgrade modifiers + level scaling to a single delta.
 * Contextual modifiers (marketing/team) are handled inside the gate effects
 * themselves, so they are intentionally NOT re-applied here.
 */
function transformDelta(dlt: StatDelta, m: Modifiers, sc: LevelScaling): StatDelta {
  let a = dlt.amount;
  switch (dlt.stat) {
    case 'product':
      if (a > 0) a *= m.codingMult;
      break;
    case 'stress':
      if (a > 0) a *= (1 - m.stressReduce) * sc.stressScale;
      break;
    case 'legalRisk':
      if (a > 0) a *= (1 - m.legalReduce) * sc.legalScale;
      break;
    case 'reputation':
      if (a < 0) a *= 1 - m.repShield;
      break;
    case 'users':
      if (a > 0) a *= sc.userUpside;
      else a *= (1 - m.serverReduce) * sc.userDownside;
      break;
  }
  return { stat: dlt.stat, amount: Math.round(a) };
}

/** Apply a list of deltas (with modifiers + scaling) and return clamped result. */
export function applyDeltas(
  s: Stats,
  deltas: StatDelta[],
  m: Modifiers,
  sc: LevelScaling = NO_SCALING
): { next: Stats; applied: StatDelta[] } {
  const applied = deltas.map((dlt) => transformDelta(dlt, m, sc)).filter((dlt) => dlt.amount !== 0);
  const out = { ...s };
  applied.forEach((dlt) => {
    out[dlt.stat] += dlt.amount;
  });
  return { next: clampStats(out), applied };
}

export const STAT_META: Record<StatKey, { label: string; icon: string; suffix?: string; prefix?: string }> = {
  cash: { label: 'Cash', icon: '💶', prefix: '€' },
  skill: { label: 'Skill', icon: '🧠' },
  product: { label: 'Product', icon: '🛠️' },
  users: { label: 'Users', icon: '👥' },
  reputation: { label: 'Rep', icon: '⭐' },
  stress: { label: 'Stress', icon: '🔥' },
  legalRisk: { label: 'Legal', icon: '⚖️' },
  team: { label: 'Team', icon: '🧑‍🤝‍🧑' },
};

export function formatStat(stat: StatKey, value: number): string {
  const m = STAT_META[stat];
  return `${m.prefix ?? ''}${value.toLocaleString('en-US')}${m.suffix ?? ''}`;
}

/** Is an increase in this stat good for the player? */
export function deltaIsGood(dlt: StatDelta): boolean {
  const bad = dlt.stat === 'stress' || dlt.stat === 'legalRisk';
  return bad ? dlt.amount < 0 : dlt.amount > 0;
}

/** Short chip like "+Users" / "-Cash" for gates. */
export function chipLabel(dlt: StatDelta): string {
  return `${dlt.amount >= 0 ? '+' : '-'}${STAT_META[dlt.stat].label}`;
}

export function formatDelta(dlt: StatDelta): string {
  const m = STAT_META[dlt.stat];
  const sign = dlt.amount > 0 ? '+' : '-';
  const num = m.prefix === '€' ? `€${Math.abs(dlt.amount).toLocaleString('en-US')}` : `${Math.abs(dlt.amount)}`;
  return `${sign}${num} ${m.label}`;
}
