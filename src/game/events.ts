import type { GameEvent, StatDelta, StatKey } from './types';

const d = (stat: StatKey, amount: number): StatDelta => ({ stat, amount });

/**
 * Rare end-of-run events. At most one fires per run (first match wins),
 * so they stay special. Keep copy short — one line each.
 */
export const EVENTS: GameEvent[] = [
  {
    id: 'tax-inspection',
    title: '⚖️ Tax Inspection',
    text: 'Your "creative" accounting got noticed.',
    tone: 'bad',
    condition: (s) => s.legalRisk > 55,
    effect: () => [d('cash', -1500), d('legalRisk', -20), d('stress', 15)],
  },
  {
    id: 'burnout',
    title: '🛌 Burnout Week',
    text: 'You hit a wall and had to stop.',
    tone: 'bad',
    condition: (s) => s.stress > 78,
    effect: () => [d('stress', -25), d('users', -25)],
  },
  {
    id: 'bad-reviews',
    title: '⭐💥 Bad Reviews',
    text: 'Lots of users, weak product. Ouch.',
    tone: 'bad',
    condition: (s) => s.users > 300 && s.product < 40,
    effect: () => [d('reputation', -20), d('users', -60)],
  },
  {
    id: 'organic-boost',
    title: '🚀 Organic Growth',
    text: 'Great product + rep = word of mouth.',
    tone: 'good',
    condition: (s) => s.reputation > 70 && s.product > 60,
    effect: () => [d('users', 120), d('reputation', 6)],
  },
];
