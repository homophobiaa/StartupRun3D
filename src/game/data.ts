import type { LevelConfig, StatDelta, StatKey, GateChoice, DecisionRow, LevelScaling } from './types';

const d = (stat: StatKey, amount: number): StatDelta => ({ stat, amount });

interface GateOpts {
  label: string;
  icon: string;
  tone: GateChoice['tone'];
  hint?: string;
  risk?: boolean;
  /** Static deltas, OR provide `effect` for conditional logic. */
  deltas?: StatDelta[];
  effect?: GateChoice['effect'];
  /** Preview shown on the gate (defaults to `deltas`). */
  preview?: StatDelta[];
}

function gate(o: GateOpts): GateChoice {
  return {
    label: o.label,
    icon: o.icon,
    tone: o.tone,
    hint: o.hint,
    risk: o.risk ?? o.tone === 'risky',
    preview: o.preview ?? o.deltas,
    effect: o.effect ?? (() => o.deltas ?? []),
  };
}

function row(title: string, gates: [GateChoice, GateChoice, GateChoice]): DecisionRow {
  return { title, gates };
}

// ── LEVEL 1 — Garage Phase ────────────────────────────────────────────
const LEVEL1: DecisionRow[] = [
  row('MVP Strategy', [
    gate({
      label: 'Build Focused MVP',
      icon: '🛠️',
      tone: 'good',
      hint: 'Real product, real grind',
      deltas: [d('product', 22), d('skill', 8), d('stress', 12)],
    }),
    gate({
      label: 'Outsource Cheap',
      icon: '🌍',
      tone: 'risky',
      hint: 'Fast, but risky if you cannot judge quality',
      effect: (s) =>
        s.skill < 20
          ? [d('cash', -500), d('product', 14), d('reputation', -6)]
          : [d('cash', -500), d('product', 16)],
      preview: [d('cash', -500), d('product', 14)],
    }),
    gate({
      label: 'Brand First',
      icon: '🎨',
      tone: 'neutral',
      hint: 'Looks legit, barely works',
      deltas: [d('cash', -300), d('reputation', 8), d('product', 4)],
    }),
  ]),
  row('Skill Up', [
    gate({
      label: 'Learn Deeply',
      icon: '📚',
      tone: 'good',
      hint: 'Slow but compounding',
      deltas: [d('skill', 16), d('product', 6), d('stress', 6)],
    }),
    gate({
      label: 'Copy-Paste Stack Overflow',
      icon: '📋',
      tone: 'risky',
      hint: 'Works until it does not',
      deltas: [d('product', 12), d('skill', 2), d('legalRisk', 6)],
    }),
    gate({
      label: 'Buy €600 Course',
      icon: '💸',
      tone: 'neutral',
      hint: 'Shortcut with a price tag',
      deltas: [d('cash', -600), d('skill', 10)],
    }),
  ]),
  row('Validate Idea', [
    gate({
      label: 'Talk To Real Users',
      icon: '🗣️',
      tone: 'good',
      hint: 'Where the gold hides',
      deltas: [d('reputation', 8), d('product', 6), d('skill', 4)],
    }),
    gate({
      label: 'Build In Silence',
      icon: '🤫',
      tone: 'risky',
      hint: 'Hope it lands',
      deltas: [d('product', 12), d('stress', 8), d('reputation', -4)],
    }),
    gate({
      label: 'Post Hot Takes Online',
      icon: '🔥',
      tone: 'bad',
      hint: 'Engagement, not validation',
      deltas: [d('users', 6), d('reputation', 2), d('stress', 6), d('legalRisk', 2)],
    }),
  ]),
  row('Money Setup', [
    gate({
      label: 'Track Finances',
      icon: '📒',
      tone: 'good',
      hint: 'Grown-up move',
      deltas: [d('cash', 150), d('legalRisk', -8), d('stress', 3)],
    }),
    gate({
      label: 'Ignore Taxes',
      icon: '🙈',
      tone: 'bad',
      hint: 'Future you cries',
      deltas: [d('cash', 300), d('legalRisk', 18)],
    }),
    gate({
      label: 'Dump Personal Savings',
      icon: '🏦',
      tone: 'risky',
      hint: 'All-in on yourself',
      deltas: [d('cash', 600), d('stress', 12)],
    }),
  ]),
];

// ── LEVEL 2 — First Users ─────────────────────────────────────────────
const LEVEL2: DecisionRow[] = [
  row('Launch Strategy', [
    gate({
      label: 'Soft Launch To Friends',
      icon: '👋',
      tone: 'good',
      hint: 'Safe, warm, low risk',
      deltas: [d('users', 30), d('reputation', 8), d('stress', 4)],
    }),
    gate({
      label: 'Big Public Launch',
      icon: '🚀',
      tone: 'risky',
      hint: 'Great if product is ready',
      effect: (s) =>
        s.product >= 35
          ? [d('users', 90), d('reputation', 8), d('stress', 8)]
          : [d('users', 30), d('reputation', -12), d('stress', 10)],
      preview: [d('users', 90), d('reputation', 8)],
    }),
    gate({
      label: 'Fake Hype Campaign',
      icon: '🎭',
      tone: 'bad',
      hint: 'Loud now, costly later',
      deltas: [d('users', 40), d('reputation', -6), d('legalRisk', 10)],
    }),
  ]),
  row('Onboarding', [
    gate({
      label: 'Fix Onboarding',
      icon: '🪜',
      tone: 'good',
      hint: 'Keep what you get (scales with users)',
      effect: (s) => [d('product', 12), d('users', 15 + Math.round(s.users * 0.25)), d('reputation', 6)],
      preview: [d('product', 12), d('users', 25)],
    }),
    gate({
      label: 'Add Tutorial Videos',
      icon: '🎬',
      tone: 'neutral',
      hint: 'Helps a little',
      deltas: [d('product', 4), d('reputation', 4), d('cash', -150)],
    }),
    gate({
      label: 'Let Them Figure It Out',
      icon: '🤷',
      tone: 'bad',
      hint: 'Churn incoming',
      deltas: [d('users', -10), d('reputation', -6), d('stress', -4)],
    }),
  ]),
  row('First Feedback', [
    gate({
      label: 'Listen & Iterate',
      icon: '👂',
      tone: 'good',
      hint: 'Loyalty engine',
      deltas: [d('product', 10), d('reputation', 8), d('users', 12)],
    }),
    gate({
      label: 'Argue With Users',
      icon: '😤',
      tone: 'bad',
      hint: 'You will lose',
      deltas: [d('reputation', -14), d('stress', 8)],
    }),
    gate({
      label: 'Buy Fake Reviews',
      icon: '⭐',
      tone: 'risky',
      hint: 'Time bomb',
      deltas: [d('reputation', 6), d('legalRisk', 14), d('users', 8)],
    }),
  ]),
  row('Growth Problem', [
    gate({
      label: 'Improve Retention',
      icon: '🔁',
      tone: 'good',
      hint: 'Plug the leaky bucket',
      effect: (s) => [d('product', 10), d('users', 12 + Math.round(s.users * 0.15)), d('reputation', 6)],
      preview: [d('product', 10), d('users', 20)],
    }),
    gate({
      label: 'Pump Paid Ads',
      icon: '📈',
      tone: 'risky',
      hint: 'Burns cash; needs a good product',
      effect: (s, m) => {
        const good = s.product >= 40;
        const users = Math.round((good ? 70 : 25) * m.marketingUserMult);
        const out = [d('users', users), d('cash', -500)];
        if (!good) out.push(d('reputation', -Math.round(12 * (1 - m.marketingRepProtect))));
        return out;
      },
      preview: [d('users', 70), d('cash', -500)],
    }),
    gate({
      label: 'Spam DMs',
      icon: '📨',
      tone: 'bad',
      hint: 'Everyone hates this',
      deltas: [d('users', 15), d('legalRisk', 8), d('reputation', -10)],
    }),
  ]),
];

// ── LEVEL 3 — Growing SaaS ────────────────────────────────────────────
const LEVEL3: DecisionRow[] = [
  row('Scaling Infra', [
    gate({
      label: 'Scale Servers',
      icon: '🖥️',
      tone: 'good',
      hint: 'Pays off at scale',
      effect: (s) =>
        s.users > 120
          ? [d('cash', -600), d('reputation', 8), d('product', 6)]
          : [d('cash', -600), d('product', 2)],
      preview: [d('cash', -600), d('reputation', 8)],
    }),
    gate({
      label: 'Cheap Hosting',
      icon: '🪤',
      tone: 'risky',
      hint: 'Fine until traffic spikes',
      effect: (s) =>
        s.users > 200
          ? [d('cash', 100), d('reputation', -12), d('users', -40)]
          : [d('cash', 100), d('product', -2)],
      preview: [d('cash', 100), d('users', -40)],
    }),
    gate({
      label: 'Blame The Users',
      icon: '🗯️',
      tone: 'bad',
      hint: 'Bold strategy',
      deltas: [d('reputation', -16), d('stress', 6)],
    }),
  ]),
  row('Hiring', [
    gate({
      label: 'Hire Senior Dev',
      icon: '👩‍💻',
      tone: 'good',
      hint: 'Powerful if you can afford it',
      effect: (s, m) =>
        s.cash >= 1500
          ? [d('product', Math.round(22 * m.teamMult)), d('cash', -1500), d('team', 1)]
          : [d('product', 8), d('cash', -1500), d('team', 1), d('stress', 14)],
      preview: [d('product', 22), d('cash', -1500), d('team', 1)],
    }),
    gate({
      label: 'Hire Cheap Friend',
      icon: '🧑‍🤝‍🧑',
      tone: 'risky',
      hint: 'Cheap, mixed results',
      effect: (s, m) => [
        d('team', 1),
        d('cash', -400),
        d('product', Math.round((s.skill > 30 ? 8 : -2) * m.teamMult)),
        d('reputation', -2),
      ],
      preview: [d('team', 1), d('cash', -400), d('product', 8)],
    }),
    gate({
      label: 'Stay Solo',
      icon: '🧍',
      tone: 'neutral',
      hint: 'Lean but tiring',
      deltas: [d('stress', 12), d('skill', 6)],
    }),
  ]),
  row('Monetize', [
    gate({
      label: 'Launch Subscriptions',
      icon: '💳',
      tone: 'good',
      hint: 'Revenue scales with users',
      effect: (s) => [d('cash', 200 + Math.round(s.users * 1.2)), d('reputation', 4), d('users', -10)],
      preview: [d('cash', 400), d('reputation', 4)],
    }),
    gate({
      label: 'Aggressive Paywall',
      icon: '🚧',
      tone: 'risky',
      hint: 'Squeeze now, churn later',
      effect: (s) => [d('cash', Math.round(s.users * 2)), d('users', -40), d('reputation', -10)],
      preview: [d('cash', 500), d('users', -40)],
    }),
    gate({
      label: 'Stay Free Forever',
      icon: '🆓',
      tone: 'bad',
      hint: 'Loved and broke',
      deltas: [d('users', 20), d('cash', -200), d('stress', 6)],
    }),
  ]),
  row('Funding Decision', [
    gate({
      label: 'Bootstrap Slowly',
      icon: '🥾',
      tone: 'good',
      hint: 'Steady and free',
      deltas: [d('cash', 300), d('stress', -4), d('skill', 4)],
    }),
    gate({
      label: 'Investor Pitch',
      icon: '🤝',
      tone: 'risky',
      hint: 'Need traction to land it',
      effect: (s) =>
        s.reputation + s.users / 10 > 60
          ? [d('cash', 5000), d('reputation', 6), d('stress', 8)]
          : [d('stress', 16), d('reputation', -4)],
      preview: [d('cash', 5000), d('reputation', 6)],
    }),
    gate({
      label: 'Take Shady Loan',
      icon: '🦈',
      tone: 'bad',
      hint: 'Desperate fuel',
      deltas: [d('cash', 3000), d('legalRisk', 18), d('stress', 12)],
    }),
  ]),
];

// ── LEVEL 4 — Public Launch ───────────────────────────────────────────
const LEVEL4: DecisionRow[] = [
  row('Big Launch Plan', [
    gate({
      label: 'Polished Launch',
      icon: '✨',
      tone: 'good',
      hint: 'Reward for a real product',
      effect: (s) =>
        s.product >= 50
          ? [d('users', 150), d('reputation', 12), d('cash', 1000)]
          : [d('users', 60), d('reputation', -8), d('stress', 10)],
      preview: [d('users', 150), d('reputation', 12)],
    }),
    gate({
      label: 'Overpromise Launch',
      icon: '📢',
      tone: 'risky',
      hint: 'Short-term spike, trust hit',
      deltas: [d('users', 120), d('reputation', -14), d('stress', 12)],
    }),
    gate({
      label: 'Sell A Success Course',
      icon: '🎓',
      tone: 'bad',
      hint: 'Guru pivot',
      deltas: [d('cash', 1500), d('reputation', -10), d('legalRisk', 6)],
    }),
  ]),
  row('PR & Media', [
    gate({
      label: 'Earn Press Honestly',
      icon: '📰',
      tone: 'good',
      hint: 'Slow burn credibility',
      effect: (s) => [d('reputation', 14), d('users', 20 + Math.round(s.reputation / 3))],
      preview: [d('reputation', 14), d('users', 30)],
    }),
    gate({
      label: 'Buy Influencer Hype',
      icon: '🤳',
      tone: 'risky',
      hint: 'Loud; backfires on weak product',
      effect: (s, m) => {
        const good = s.product >= 45;
        const users = Math.round((good ? 80 : 35) * m.marketingUserMult);
        const out = [d('users', users), d('cash', -600)];
        if (!good) out.push(d('reputation', -Math.round(10 * (1 - m.marketingRepProtect))));
        return out;
      },
      preview: [d('users', 80), d('cash', -600)],
    }),
    gate({
      label: 'Astroturf Forums',
      icon: '🌱',
      tone: 'bad',
      hint: 'Until someone screenshots it',
      deltas: [d('users', 30), d('legalRisk', 12), d('reputation', -8)],
    }),
  ]),
  row('Support At Scale', [
    gate({
      label: 'Build Support Team',
      icon: '🎧',
      tone: 'good',
      hint: 'Loyalty engine',
      effect: (_s, m) => [
        d('reputation', 12),
        d('users', 20),
        d('stress', 6),
        d('cash', -300),
        d('team', m.teamMult > 1.2 ? 1 : 0),
      ],
      preview: [d('reputation', 12), d('users', 20)],
    }),
    gate({
      label: 'Automate Support',
      icon: '🤖',
      tone: 'neutral',
      hint: 'Scales, less warm',
      deltas: [d('reputation', 4), d('cash', -400), d('stress', -6)],
    }),
    gate({
      label: 'Ignore Tickets',
      icon: '🎫',
      tone: 'bad',
      hint: 'Churn city',
      deltas: [d('reputation', -16), d('users', -25), d('stress', -4)],
    }),
  ]),
  row('Legal Pressure', [
    gate({
      label: 'Hire A Lawyer',
      icon: '👨‍⚖️',
      tone: 'good',
      hint: 'Sleep at night',
      deltas: [d('legalRisk', -25), d('cash', -800), d('stress', -4)],
    }),
    gate({
      label: 'DIY Compliance',
      icon: '📑',
      tone: 'risky',
      hint: 'Cheaper, stressful',
      deltas: [d('legalRisk', -10), d('stress', 10)],
    }),
    gate({
      label: 'Ignore The Letters',
      icon: '✉️',
      tone: 'bad',
      hint: 'They escalate',
      deltas: [d('legalRisk', 20), d('stress', 8)],
    }),
  ]),
];

// ── LEVEL 5 — Company Pressure ────────────────────────────────────────
const LEVEL5: DecisionRow[] = [
  row('Scale Or Die', [
    gate({
      label: 'Reinvest Profits',
      icon: '🌳',
      tone: 'good',
      hint: 'Long game',
      effect: (s) => [d('product', 14), d('users', 30 + Math.round(s.users * 0.1)), d('cash', -800)],
      preview: [d('product', 14), d('users', 30), d('cash', -800)],
    }),
    gate({
      label: 'Gamble Ad Budget',
      icon: '🎰',
      tone: 'risky',
      hint: 'All-in spin',
      effect: (_s, m) => [d('cash', -1200), d('users', Math.round(110 * m.marketingUserMult)), d('stress', 8)],
      preview: [d('cash', -1200), d('users', 110)],
    }),
    gate({
      label: 'Cash Out Early',
      icon: '🏃',
      tone: 'neutral',
      hint: 'Take the money',
      deltas: [d('cash', 1500), d('users', -20), d('reputation', -4)],
    }),
  ]),
  row('Team Culture', [
    gate({
      label: 'Build Real Culture',
      icon: '💛',
      tone: 'good',
      hint: 'Multiplier',
      deltas: [d('team', 1), d('reputation', 8), d('product', 8), d('stress', -6)],
    }),
    gate({
      label: 'Micromanage Everyone',
      icon: '🔬',
      tone: 'bad',
      hint: 'Trust collapse',
      deltas: [d('team', -1), d('stress', 14), d('product', -4)],
    }),
    gate({
      label: 'Crunch Mode',
      icon: '⏱️',
      tone: 'risky',
      hint: 'Output now, burnout soon',
      deltas: [d('product', 18), d('stress', 22), d('users', 30)],
    }),
  ]),
  row('Crisis', [
    gate({
      label: 'Fix Core Product',
      icon: '🧱',
      tone: 'good',
      hint: 'Substance wins',
      deltas: [d('product', 20), d('reputation', 8), d('stress', 8), d('cash', -300)],
    }),
    gate({
      label: 'Add AI Buzzword',
      icon: '🪄',
      tone: 'risky',
      hint: 'Hype train',
      effect: (_s, m) => [
        d('users', Math.round(45 * m.marketingUserMult)),
        d('reputation', -4),
        d('cash', -500),
        d('product', 2),
      ],
      preview: [d('users', 45), d('cash', -500)],
    }),
    gate({
      label: 'Pivot Randomly',
      icon: '🌀',
      tone: 'bad',
      hint: 'Throw it all away',
      deltas: [d('product', -14), d('users', -30), d('stress', 14)],
    }),
  ]),
  row('Endgame Move', [
    gate({
      label: 'Sustainable Finish',
      icon: '🧘',
      tone: 'good',
      hint: 'Healthy ending',
      deltas: [d('stress', -20), d('reputation', 6), d('product', 6)],
    }),
    gate({
      label: 'Final Sprint',
      icon: '🏁',
      tone: 'risky',
      hint: 'Empty the tank',
      deltas: [d('product', 16), d('users', 40), d('stress', 18)],
    }),
    gate({
      label: 'Sell The Company',
      icon: '💼',
      tone: 'neutral',
      hint: 'Cash out big',
      effect: (s) => [d('cash', Math.round(s.users * 4 + s.product * 40)), d('users', -50), d('reputation', -2)],
      preview: [d('cash', 4000), d('users', -50)],
    }),
  ]),
];

const BASE_LEVELS: { name: string; subtitle: string; scaling: LevelScaling; rows: DecisionRow[] }[] = [
  {
    name: 'Garage Phase',
    subtitle: 'A solo founder, an idea, and too much coffee.',
    scaling: { userUpside: 1.0, userDownside: 1.0, legalScale: 1.0, stressScale: 1.0 },
    rows: LEVEL1,
  },
  {
    name: 'First Real Users',
    subtitle: 'People are actually showing up. Do not blow it.',
    scaling: { userUpside: 1.1, userDownside: 1.05, legalScale: 1.05, stressScale: 1.05 },
    rows: LEVEL2,
  },
  {
    name: 'Growing SaaS',
    subtitle: 'Servers, hires, and the question of money.',
    scaling: { userUpside: 1.2, userDownside: 1.15, legalScale: 1.15, stressScale: 1.1 },
    rows: LEVEL3,
  },
  {
    name: 'Public Launch',
    subtitle: 'The world is watching. So are the lawyers.',
    scaling: { userUpside: 1.35, userDownside: 1.25, legalScale: 1.3, stressScale: 1.2 },
    rows: LEVEL4,
  },
  {
    name: 'Company Pressure',
    subtitle: 'A real company now — with real ways to break it.',
    scaling: { userUpside: 1.5, userDownside: 1.4, legalScale: 1.45, stressScale: 1.35 },
    rows: LEVEL5,
  },
];

export const MAX_BASE_LEVEL = BASE_LEVELS.length;

/** Get the config for a 1-based level. Levels past 5 loop with harder scaling. */
export function getLevel(level: number): LevelConfig {
  const idx = Math.min(level, MAX_BASE_LEVEL) - 1;
  const base = BASE_LEVELS[idx];
  if (level <= MAX_BASE_LEVEL) {
    return { index: level, name: base.name, subtitle: base.subtitle, scaling: base.scaling, rows: base.rows };
  }
  // Endless: escalate scaling further each loop past level 5.
  const over = level - MAX_BASE_LEVEL;
  const boost = 1 + over * 0.12;
  return {
    index: level,
    name: `Endless Run ${over}`,
    subtitle: 'Harder modifiers. Bigger swings. No mercy.',
    scaling: {
      userUpside: base.scaling.userUpside * boost,
      userDownside: base.scaling.userDownside * boost,
      legalScale: base.scaling.legalScale * boost,
      stressScale: base.scaling.stressScale * boost,
    },
    rows: base.rows,
  };
}
