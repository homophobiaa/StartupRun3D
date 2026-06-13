import type { Phase, StatDelta, StatKey, GateChoice } from './types';

/** Tiny helper to build a delta. */
const d = (stat: StatKey, amount: number): StatDelta => ({ stat, amount });

/** Sugar: a fixed-effect gate. */
function gate(
  label: string,
  tone: GateChoice['tone'],
  deltas: StatDelta[],
  hint?: string
): GateChoice {
  return { label, tone, hint, effect: () => deltas };
}

/** Sugar: a conditional gate. */
function smartGate(
  label: string,
  tone: GateChoice['tone'],
  effect: GateChoice['effect'],
  hint?: string
): GateChoice {
  return { label, tone, hint, effect };
}

export const PHASES: Phase[] = [
  // ── PHASE 1: FOUNDATION ─────────────────────────────────────────────
  {
    name: 'Foundation',
    rows: [
      {
        gates: [
          gate('Learn React', 'good', [d('skill', 15), d('stress', 5)], 'Real skills, slow grind'),
          gate('Motivation Videos', 'neutral', [d('skill', 2), d('stress', -3)], 'Feels good, does little'),
          gate('Buy €600 Course', 'risky', [d('skill', 8), d('cash', -600)], 'Pricey shortcut'),
        ],
      },
      {
        gates: [
          smartGate(
            'Build MVP Yourself',
            'good',
            (s) => [d('product', s.skill > 20 ? 25 : 14), d('skill', 6), d('stress', 12)],
            'Skill makes this pay off'
          ),
          gate('Hire Freelancer', 'risky', [d('product', 12), d('cash', -500), d('team', 1)], 'Cash for speed'),
          gate('Perfect the Logo', 'bad', [d('product', 2), d('stress', 6), d('cash', -100)], 'Procrastination deluxe'),
        ],
      },
      {
        gates: [
          gate('Validate Idea', 'good', [d('reputation', 8), d('skill', 4), d('product', 5)], 'Talk before you build'),
          gate('Build Blindly', 'bad', [d('product', 8), d('stress', 8), d('reputation', -4)], 'Hope it lands'),
          gate('Copy Competitor', 'risky', [d('product', 10), d('reputation', -6), d('legalRisk', 10)], 'Fast but shady'),
        ],
      },
    ],
  },

  // ── PHASE 2: FIRST LAUNCH ───────────────────────────────────────────
  {
    name: 'First Launch',
    rows: [
      {
        gates: [
          smartGate(
            'Launch Early',
            'risky',
            (s) =>
              s.product >= 35
                ? [d('users', 60), d('reputation', 6), d('stress', 6)]
                : [d('users', 20), d('reputation', -12), d('stress', 10)],
            'Great if product is ready'
          ),
          gate('Keep Polishing', 'neutral', [d('product', 12), d('stress', 6), d('users', 0)], 'Safe, slow'),
          gate('Fake "Coming Soon"', 'risky', [d('users', 25), d('reputation', -4), d('stress', 4)], 'Hype with nothing'),
        ],
      },
      {
        gates: [
          gate('Fix Bugs', 'good', [d('product', 16), d('reputation', 8), d('cash', -150), d('stress', 4)], 'Boring but vital'),
          gate('Add Flashy Animations', 'neutral', [d('product', 4), d('reputation', 3), d('cash', -200)], 'Looks > works'),
          gate('Ignore Feedback', 'bad', [d('reputation', -10), d('product', -2), d('stress', -2)], 'Ostrich mode'),
        ],
      },
      {
        gates: [
          gate('Talk to Users', 'good', [d('reputation', 10), d('product', 8), d('users', 10)], 'Where gold hides'),
          gate('Argue with Users', 'bad', [d('reputation', -14), d('stress', 8)], 'You will lose'),
          gate('Buy Fake Reviews', 'risky', [d('reputation', 6), d('legalRisk', 14), d('users', 8)], 'Time bomb'),
        ],
      },
    ],
  },

  // ── PHASE 3: GROWTH ─────────────────────────────────────────────────
  {
    name: 'Growth',
    rows: [
      {
        gates: [
          smartGate(
            'Organic Content',
            'good',
            (s) => [d('users', 30 + Math.round(s.reputation / 2)), d('reputation', 5), d('stress', 6)],
            'Compounds with reputation'
          ),
          smartGate(
            'Paid Ads',
            'risky',
            (s) =>
              s.product >= 40
                ? [d('users', 90), d('cash', -700)]
                : [d('users', 25), d('cash', -700), d('reputation', -10)],
            'Burns cash if product weak'
          ),
          gate('Spam DMs', 'bad', [d('users', 35), d('reputation', -16), d('legalRisk', 8)], 'Everyone hates this'),
        ],
      },
      {
        gates: [
          gate('Improve Onboarding', 'good', [d('product', 12), d('users', 25), d('reputation', 6)], 'Keep what you get'),
          gate('Add Random Features', 'bad', [d('product', -6), d('stress', 10), d('cash', -200)], 'Bloat city'),
          gate('Redesign Everything', 'risky', [d('product', 6), d('stress', 14), d('cash', -300)], 'Shiny reset trap'),
        ],
      },
      {
        gates: [
          gate('Ask for Referrals', 'good', [d('users', 40), d('reputation', 4)], 'Cheap honest growth'),
          gate('Giveaway Campaign', 'risky', [d('users', 70), d('cash', -500), d('reputation', 3)], 'Buys attention'),
          gate('Buy Fake Followers', 'bad', [d('users', 50), d('reputation', -14), d('legalRisk', 10)], 'Vanity poison'),
        ],
      },
    ],
  },

  // ── PHASE 4: OPERATIONS ─────────────────────────────────────────────
  {
    name: 'Operations',
    rows: [
      {
        gates: [
          gate('Track Finances', 'good', [d('cash', 100), d('legalRisk', -10), d('stress', 3)], 'Grown-up move'),
          gate('Ignore Taxes', 'bad', [d('cash', 400), d('legalRisk', 22)], 'Future you cries'),
          gate('Buy Founder BMW', 'bad', [d('cash', -3000), d('reputation', 4), d('stress', 6)], 'Status over runway'),
        ],
      },
      {
        gates: [
          smartGate(
            'Hire Developer',
            'good',
            (s) =>
              s.cash >= 1500
                ? [d('product', 22), d('cash', -1500), d('team', 1)]
                : [d('product', 8), d('cash', -1500), d('team', 1), d('stress', 14)],
            'Powerful if you can afford it'
          ),
          smartGate(
            'Hire Friend Cheap',
            'risky',
            (s) => [d('team', 1), d('cash', -400), d('product', s.skill > 30 ? 8 : -2), d('reputation', -2)],
            'Cheap, mixed results'
          ),
          gate('Stay Solo', 'neutral', [d('stress', 10), d('cash', 0), d('skill', 6)], 'Lean but tiring'),
        ],
      },
      {
        gates: [
          smartGate(
            'Scale Servers',
            'good',
            (s) =>
              s.users > 150
                ? [d('cash', -600), d('reputation', 8), d('product', 6)]
                : [d('cash', -600), d('product', 2)],
            'Pays off at scale'
          ),
          smartGate(
            'Cheap Hosting',
            'risky',
            (s) => (s.users > 200 ? [d('cash', 100), d('reputation', -12), d('product', -6)] : [d('cash', 100)]),
            'Fine until it is not'
          ),
          gate('Blame Users', 'bad', [d('reputation', -16), d('stress', 6)], 'Bold strategy'),
        ],
      },
    ],
  },

  // ── PHASE 5: PRESSURE ───────────────────────────────────────────────
  {
    name: 'Pressure',
    rows: [
      {
        gates: [
          smartGate(
            'Investor Pitch',
            'risky',
            (s) =>
              s.reputation + s.users / 10 > 60
                ? [d('cash', 5000), d('reputation', 6), d('stress', 8)]
                : [d('cash', 0), d('stress', 16), d('reputation', -4)],
            'Need traction to land it'
          ),
          gate('Bootstrap Slowly', 'good', [d('cash', 300), d('stress', -4), d('skill', 4)], 'Steady & free'),
          gate('Take Shady Loan', 'bad', [d('cash', 3000), d('legalRisk', 18), d('stress', 12)], 'Desperate fuel'),
        ],
      },
      {
        gates: [
          gate('Customer Support', 'good', [d('reputation', 12), d('users', 20), d('stress', 6), d('cash', -200)], 'Loyalty engine'),
          gate('Automate Support', 'neutral', [d('reputation', 4), d('cash', -400), d('stress', -6)], 'Scales, less warm'),
          gate('Ignore Tickets', 'bad', [d('reputation', -16), d('users', -20), d('stress', -4)], 'Churn incoming'),
        ],
      },
      {
        gates: [
          gate('Fix Core Product', 'good', [d('product', 20), d('reputation', 8), d('stress', 8), d('cash', -300)], 'Substance wins'),
          gate('Add AI Buzzword', 'risky', [d('users', 40), d('reputation', -4), d('cash', -500), d('product', 2)], 'Hype train'),
          gate('Pivot Randomly', 'bad', [d('product', -14), d('users', -30), d('stress', 14)], 'Throw it all away'),
        ],
      },
    ],
  },

  // ── PHASE 6: ENDGAME ────────────────────────────────────────────────
  {
    name: 'Endgame',
    rows: [
      {
        gates: [
          gate('Focus Niche', 'good', [d('reputation', 12), d('product', 8), d('users', 15)], 'Own a corner'),
          smartGate(
            'Go Mass Market',
            'risky',
            (s) => (s.product >= 55 ? [d('users', 120), d('cash', -400)] : [d('users', 40), d('reputation', -10)]),
            'Needs a strong product'
          ),
          gate('Chase Every Trend', 'bad', [d('product', -8), d('stress', 12), d('users', 20)], 'No identity'),
        ],
      },
      {
        gates: [
          gate('Build Team Culture', 'good', [d('team', 1), d('reputation', 8), d('product', 8), d('stress', -6)], 'Multiplier'),
          gate('Micromanage Everyone', 'bad', [d('team', -1), d('stress', 14), d('product', -4)], 'Trust collapse'),
          gate('Party Like a CEO', 'risky', [d('cash', -1000), d('stress', -10), d('reputation', 4)], 'Morale or money'),
        ],
      },
      {
        gates: [
          smartGate(
            'Serious Launch',
            'good',
            (s) =>
              s.product >= 50
                ? [d('users', 150), d('reputation', 12), d('cash', 1000)]
                : [d('users', 50), d('reputation', -8), d('stress', 10)],
            'Reward for a real product'
          ),
          gate('Overpromise Launch', 'risky', [d('users', 110), d('reputation', -14), d('stress', 12)], 'Short-term spike'),
          gate('Sell Success Course', 'bad', [d('cash', 1500), d('reputation', -10), d('legalRisk', 6)], 'Guru pivot'),
        ],
      },
      {
        gates: [
          gate('Reinvest Profits', 'good', [d('product', 14), d('users', 30), d('cash', -800)], 'Long game'),
          gate('Cash Out Early', 'neutral', [d('cash', 1500), d('users', -20), d('reputation', -4)], 'Take the money'),
          gate('Gamble Ad Budget', 'risky', [d('cash', -1200), d('users', 90), d('stress', 8)], 'All-in spin'),
        ],
      },
      {
        gates: [
          gate('Final Sprint', 'risky', [d('product', 16), d('users', 40), d('stress', 18)], 'Empty the tank'),
          gate('Rest & Stabilize', 'good', [d('stress', -20), d('reputation', 4), d('product', 4)], 'Sustainable finish'),
          gate('Panic Rebuild', 'bad', [d('product', -10), d('stress', 20), d('users', -20)], 'Last-minute chaos'),
        ],
      },
    ],
  },
];

/** Flattened rows in play order, plus their phase index. */
export interface FlatRow {
  phaseName: string;
  phaseIndex: number;
  rowIndex: number;
  gates: GateChoice[];
}

export const FLAT_ROWS: FlatRow[] = PHASES.flatMap((p, pi) =>
  p.rows.map((r, ri) => ({
    phaseName: p.name,
    phaseIndex: pi,
    rowIndex: ri,
    gates: r.gates,
  }))
);

export const TOTAL_ROWS = FLAT_ROWS.length;
