import type { Ending, Stats } from './types';

/**
 * Endings are scored against final stats; highest score wins. Each score
 * function returns -Infinity when the run clearly does not match, otherwise a
 * positive magnitude so the "most true" ending is picked.
 */
export const ENDINGS: Ending[] = [
  {
    id: 'rocketship',
    title: 'Funded Rocketship',
    emoji: '🦄',
    blurb: 'Strong product, loyal crowd, sterling reputation, money in the bank. Investors are calling you now.',
    score: (s) =>
      s.users > 300 && s.reputation > 60 && s.product > 60 && s.cash > 1500 && s.legalRisk < 40
        ? 1000 + s.users + s.reputation + s.product
        : -Infinity,
  },
  {
    id: 'legal-disaster',
    title: 'Legal Disaster',
    emoji: '⚖️',
    blurb: 'You optimized for "ignore the law." The law did not ignore you. Any%, no assets.',
    score: (s) => (s.legalRisk > 60 ? 900 + s.legalRisk : -Infinity),
  },
  {
    id: 'burnout-crash',
    title: 'Burnout Crash',
    emoji: '😵',
    blurb: 'Stress maxed, traction did not. You gave everything and the tank hit empty.',
    score: (s) => (s.stress > 75 && (s.product < 55 || s.users < 250) ? 850 + s.stress : -Infinity),
  },
  {
    id: 'viral-mess',
    title: 'Viral Mess',
    emoji: '🔥',
    blurb: 'Tons of users on a product held together with tape. Reputation in freefall. Fun while it lasted.',
    score: (s) => (s.users > 300 && s.product < 45 && s.reputation < 50 ? 800 + s.users / 2 : -Infinity),
  },
  {
    id: 'fake-guru',
    title: 'Fake Guru Arc',
    emoji: '🕶️',
    blurb: 'Big "audience," tiny product, allergic to substance. You sell courses now. Of course you do.',
    score: (s) => (s.product < 40 && s.users > 180 && s.reputation < 55 ? 760 + s.users / 3 : -Infinity),
  },
  {
    id: 'broke-skilled',
    title: 'Broke But Skilled',
    emoji: '🥲',
    blurb: 'Empty bank account, full brain. You learned a ton. Next run hits different.',
    score: (s) => (s.cash < 300 && s.skill > 45 ? 740 + s.skill : -Infinity),
  },
  {
    id: 'boring-business',
    title: 'Profitable Boring Business',
    emoji: '🏢',
    blurb: 'No rocket ship. Just real skills, a real team, and a business that quietly pays the bills.',
    score: (s) => (s.cash > 1500 && s.reputation > 50 && s.stress < 70 ? 720 + s.cash / 100 : -Infinity),
  },
  {
    id: 'indie-win',
    title: 'Clean Indie Win',
    emoji: '🌱',
    blurb: 'Good product, sane stress, a loyal-if-small crowd, money to spare. Quietly winning.',
    score: (s) => (s.product > 50 && s.stress < 65 && s.users > 120 ? 700 + s.product + s.users / 4 : -Infinity),
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
