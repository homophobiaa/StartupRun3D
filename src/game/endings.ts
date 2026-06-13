import type { Ending, Stats } from './types';

/**
 * Endings are scored against final stats; highest score wins. Each score
 * function returns -Infinity when the run clearly does not match, otherwise a
 * positive magnitude so the "most true" ending is picked.
 */
export const ENDINGS: Ending[] = [
  {
    id: 'unicorn',
    title: 'Unicorn Founder',
    emoji: '🦄',
    blurb: 'High users, strong product, sterling reputation, money in the bank. You actually did it. Suspicious.',
    score: (s) =>
      s.users > 350 && s.reputation > 60 && s.product > 60 && s.cash > 1000 && s.legalRisk < 40
        ? 1000 + s.users + s.reputation + s.product
        : -Infinity,
  },
  {
    id: 'tax-speedrun',
    title: 'Tax Problem Speedrun',
    emoji: '⚖️',
    blurb: 'You optimized for "ignore the law." The law did not ignore you. Any%, no assets.',
    score: (s) => (s.legalRisk > 60 ? 900 + s.legalRisk : -Infinity),
  },
  {
    id: 'broke-dreamer',
    title: 'Broke Dreamer',
    emoji: '🥲',
    blurb: 'Negative bank account, nobody using the thing. The dream was real. The runway was not.',
    score: (s) => (s.cash < 0 && s.users < 100 ? 850 - s.cash : -Infinity),
  },
  {
    id: 'burned-out',
    title: 'Burned Out Founder',
    emoji: '😵',
    blurb: 'Stress maxed, traction did not. You gave everything and the tank hit empty.',
    score: (s) => (s.stress > 70 && (s.product < 55 || s.users < 250) ? 800 + s.stress : -Infinity),
  },
  {
    id: 'viral-broken',
    title: 'Viral But Broken',
    emoji: '🔥',
    blurb: 'Tons of users on a product held together with tape. Reputation in freefall. Fun while it lasted.',
    score: (s) => (s.users > 300 && s.product < 45 && s.reputation < 45 ? 780 + s.users / 2 : -Infinity),
  },
  {
    id: 'fake-guru',
    title: 'Fake Guru',
    emoji: '🕶️',
    blurb: 'Big "audience," tiny product, allergic to substance. You sell courses now. Of course you do.',
    score: (s) => (s.product < 40 && s.users > 200 && s.reputation < 50 ? 760 + s.users / 3 : -Infinity),
  },
  {
    id: 'agency',
    title: 'Solid Agency Owner',
    emoji: '🏢',
    blurb: 'Real skills, a real team, a real reputation. Not a rocket ship, but a business that pays.',
    score: (s) => (s.skill > 50 && s.team > 2 && s.reputation > 55 ? 720 + s.skill + s.team * 10 : -Infinity),
  },
  {
    id: 'indie',
    title: 'Profitable Indie Founder',
    emoji: '🌱',
    blurb: 'Healthy cash, good product, sane stress, a loyal-if-small crowd. Quietly winning.',
    score: (s) => (s.cash > 800 && s.product > 50 && s.stress < 70 ? 700 + s.cash / 100 + s.product : -Infinity),
  },
];

const FALLBACK: Ending = {
  id: 'survivor',
  title: 'Scrappy Survivor',
  emoji: '🧗',
  blurb: 'No clean win, no spectacular crash. You are still standing and still building. That counts.',
  score: () => 0,
};

export function resolveEnding(s: Stats): Ending {
  let best: Ending = FALLBACK;
  let bestScore = -Infinity;
  for (const e of ENDINGS) {
    const sc = e.score(s);
    if (sc > bestScore) {
      bestScore = sc;
      best = e;
    }
  }
  return bestScore === -Infinity ? FALLBACK : best;
}
