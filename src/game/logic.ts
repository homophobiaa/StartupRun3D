import type { Stats, StatDelta, StatKey } from './types';

export const INITIAL_STATS: Stats = {
  cash: 1000,
  skill: 10,
  product: 0,
  users: 0,
  reputation: 10,
  stress: 0,
  legalRisk: 0,
  team: 1,
};

/** Min/max clamps per stat. users/cash are loosely bounded. */
const CLAMP: Record<StatKey, [number, number]> = {
  cash: [-5000, 9_999_999],
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

/** Apply a list of deltas to stats and return clamped result. */
export function applyDeltas(s: Stats, deltas: StatDelta[]): Stats {
  const out = { ...s };
  deltas.forEach((d) => {
    out[d.stat] += d.amount;
  });
  return clampStats(out);
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
  const v = m.prefix === '€' ? value.toLocaleString('en-US') : value.toLocaleString('en-US');
  return `${m.prefix ?? ''}${v}${m.suffix ?? ''}`;
}

export function formatDelta(d: StatDelta): string {
  const m = STAT_META[d.stat];
  const sign = d.amount > 0 ? '+' : '';
  const num = m.prefix === '€' ? `€${Math.abs(d.amount).toLocaleString('en-US')}` : `${Math.abs(d.amount)}`;
  return `${sign}${d.amount < 0 ? '-' : ''}${num} ${m.label}`;
}
