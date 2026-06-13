import type { GameEvent, StatDelta, StatKey } from './types';

const d = (stat: StatKey, amount: number): StatDelta => ({ stat, amount });

/**
 * Events checked at phase boundaries. Each fires at most once per run
 * (tracked by id in App state). Order matters: first matching wins per check.
 */
export const EVENTS: GameEvent[] = [
  {
    id: 'tax-inspection',
    title: 'Tax Inspection 📋',
    text: 'The authorities noticed your "creative" accounting. Penalty time.',
    tone: 'bad',
    condition: (s) => s.legalRisk > 50,
    effect: () => [d('cash', -1500), d('legalRisk', -20), d('stress', 15)],
  },
  {
    id: 'burnout',
    title: 'Burnout Week 🛌',
    text: 'You hit a wall. Forced rest tanks your momentum.',
    tone: 'bad',
    condition: (s) => s.stress > 75,
    effect: () => [d('stress', -25), d('users', -25), d('product', -5)],
  },
  {
    id: 'bad-reviews',
    title: 'Bad Reviews Wave ⭐💥',
    text: 'Lots of users, weak product. The reviews are brutal.',
    tone: 'bad',
    condition: (s) => s.users > 300 && s.product < 40,
    effect: () => [d('reputation', -20), d('users', -60)],
  },
  {
    id: 'debt-spiral',
    title: 'Debt Spiral 💸',
    text: 'You ran out of money. The bank is not your friend.',
    tone: 'bad',
    condition: (s) => s.cash < 0,
    effect: () => [d('stress', 20), d('reputation', -8)],
  },
  {
    id: 'organic-boost',
    title: 'Organic Growth Boost 🚀',
    text: 'Great product + great reputation = people tell their friends.',
    tone: 'good',
    condition: (s) => s.reputation > 70 && s.product > 60,
    effect: () => [d('users', 120), d('reputation', 6), d('stress', -5)],
  },
];
