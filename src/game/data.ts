import type { LevelConfig, StatDelta, StatKey, GateChoice, DecisionRow, LevelScaling, PortalCategory } from './types';

const d = (stat: StatKey, amount: number): StatDelta => ({ stat, amount });

interface GateOpts {
  label: string;
  icon: string;
  tone: GateChoice['tone'];
  detail: string;
  risk?: boolean;
  /** Force a portal category; otherwise derived from effects. */
  cat?: PortalCategory;
  /** Static deltas, OR provide `effect` for conditional logic. */
  deltas?: StatDelta[];
  effect?: GateChoice['effect'];
  /** Effect chips shown in the panel (defaults to first 2 of `deltas`). */
  preview?: StatDelta[];
}

/** Pick a portal identity from the choice's tone + dominant effect. */
function deriveCategory(tone: GateChoice['tone'], chips: StatDelta[]): PortalCategory {
  if (tone === 'bad') return 'danger';
  if (chips.some((c) => c.stat === 'legalRisk' && c.amount > 0)) return 'legal';
  const ranked = [...chips].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount));
  const top = ranked[0]?.stat;
  if (top === 'cash') return 'finance';
  if (top === 'users') return 'marketing';
  if (top === 'product' || top === 'skill') return 'product';
  return tone === 'risky' ? 'growth' : 'strategic';
}

function gate(o: GateOpts): GateChoice {
  const preview = (o.preview ?? o.deltas ?? []).slice(0, 3);
  return {
    label: o.label,
    icon: o.icon,
    tone: o.tone,
    category: o.cat ?? deriveCategory(o.tone, preview),
    detail: o.detail,
    risk: o.risk ?? o.tone === 'risky',
    preview,
    effect: o.effect ?? (() => o.deltas ?? []),
  };
}

function row(title: string, gates: [GateChoice, GateChoice, GateChoice]): DecisionRow {
  return { title, gates };
}

// ── LEVEL 1 — Garage Phase ────────────────────────────────────────────
const LEVEL1: DecisionRow[] = [
  row('Pick your MVP strategy', [
    gate({ label: 'Build MVP', icon: '🛠️', tone: 'good', detail: 'Slow grind, real product. Builds skill but adds stress.', deltas: [d('product', 22), d('skill', 8), d('stress', 12)] }),
    gate({
      label: 'Cheap Freelancer', icon: '🌍', tone: 'risky',
      detail: 'Fast and cheap — but reputation suffers if your skill is too low to judge quality.',
      effect: (s) => (s.skill < 20 ? [d('cash', -500), d('product', 14), d('reputation', -6)] : [d('cash', -500), d('product', 16)]),
      preview: [d('product', 14), d('cash', -500)],
    }),
    gate({ label: 'Logo First', icon: '🎨', tone: 'neutral', detail: 'Looks legit, barely works. Buys a little reputation.', deltas: [d('reputation', 8), d('cash', -300)] }),
  ]),
  row('How do you learn?', [
    gate({ label: 'Learn Deep', icon: '📚', tone: 'good', detail: 'Compounding skill. Worth it long-term.', deltas: [d('skill', 16), d('product', 6)] }),
    gate({ label: 'Copy Code', icon: '📋', tone: 'risky', detail: 'Ship fast by pasting from the internet. Raises legal risk.', deltas: [d('product', 12), d('legalRisk', 6)] }),
    gate({ label: 'Buy Course', icon: '💸', tone: 'neutral', detail: 'A €600 shortcut to some real skill.', deltas: [d('skill', 10), d('cash', -600)] }),
  ]),
  row('Validate the idea', [
    gate({ label: 'Talk to Users', icon: '🗣️', tone: 'good', detail: 'Where the gold hides. Builds product and reputation.', deltas: [d('reputation', 8), d('product', 6)] }),
    gate({ label: 'Build Blind', icon: '🤫', tone: 'risky', detail: 'Heads-down, hope it lands. No feedback loop.', deltas: [d('product', 12), d('stress', 8)] }),
    gate({ label: 'Post Hot Takes', icon: '🔥', tone: 'bad', detail: 'Engagement bait, not validation. Cheap attention, real stress.', deltas: [d('users', 6), d('stress', 6)] }),
  ]),
  row('Sort out the money', [
    gate({ label: 'Track Money', icon: '📒', tone: 'good', detail: 'Grown-up move. Lowers legal risk.', deltas: [d('cash', 150), d('legalRisk', -8)] }),
    gate({ label: 'Skip Taxes', icon: '🙈', tone: 'bad', detail: 'Cash now, big legal risk later.', deltas: [d('cash', 300), d('legalRisk', 18)] }),
    gate({ label: 'All-In Savings', icon: '🏦', tone: 'risky', detail: 'Dump your savings in. More runway, more stress.', deltas: [d('cash', 600), d('stress', 12)] }),
  ]),
];

// ── LEVEL 2 — First Users ─────────────────────────────────────────────
const LEVEL2: DecisionRow[] = [
  row('Choose your launch', [
    gate({ label: 'Soft Launch', icon: '👋', tone: 'good', detail: 'Quiet launch to friends. Safe, warm, low risk.', deltas: [d('users', 30), d('reputation', 8)] }),
    gate({
      label: 'Big Launch', icon: '🚀', tone: 'risky',
      detail: 'Go loud. Huge if the product is ready (Product ≥ 35), painful if not.',
      effect: (s) => (s.product >= 35 ? [d('users', 90), d('reputation', 8), d('stress', 8)] : [d('users', 30), d('reputation', -12), d('stress', 10)]),
      preview: [d('users', 90), d('reputation', 8)],
    }),
    gate({ label: 'Fake Hype', icon: '🎭', tone: 'bad', detail: 'Manufacture buzz. Loud now, legal risk later.', deltas: [d('users', 40), d('legalRisk', 10)] }),
  ]),
  row('Fix the funnel', [
    gate({
      label: 'Fix Onboarding', icon: '🪜', tone: 'good',
      detail: 'Plug the leaky bucket. User gain scales with how many you already have.',
      effect: (s) => [d('product', 12), d('users', 15 + Math.round(s.users * 0.25)), d('reputation', 6)],
      preview: [d('product', 12), d('users', 25)],
    }),
    gate({ label: 'Add Tutorials', icon: '🎬', tone: 'neutral', detail: 'Helps a little. Costs a little.', deltas: [d('product', 4), d('cash', -150)] }),
    gate({ label: 'Ignore Users', icon: '🤷', tone: 'bad', detail: 'Let them figure it out. Churn incoming.', deltas: [d('users', -10), d('reputation', -6)] }),
  ]),
  row('First feedback', [
    gate({ label: 'Listen & Iterate', icon: '👂', tone: 'good', detail: 'Loyalty engine. Improves product, rep and users.', deltas: [d('product', 10), d('reputation', 8)] }),
    gate({ label: 'Argue', icon: '😤', tone: 'bad', detail: 'Fight your users online. You will lose.', deltas: [d('reputation', -14), d('stress', 8)] }),
    gate({ label: 'Fake Reviews', icon: '⭐', tone: 'risky', detail: 'Buy 5-star reviews. A ticking legal time bomb.', deltas: [d('reputation', 6), d('legalRisk', 14)] }),
  ]),
  row('Crack growth', [
    gate({
      label: 'Retention', icon: '🔁', tone: 'good',
      detail: 'Keep the users you earn. Scales with your base.',
      effect: (s) => [d('product', 10), d('users', 12 + Math.round(s.users * 0.15)), d('reputation', 6)],
      preview: [d('product', 10), d('users', 20)],
    }),
    gate({
      label: 'Paid Ads', icon: '📈', tone: 'risky',
      detail: 'Burns cash for users. Great if Product ≥ 40, backfires on rep if not. Marketing upgrades help.',
      effect: (s, m) => {
        const good = s.product >= 40;
        const users = Math.round((good ? 70 : 25) * m.marketingUserMult);
        const out = [d('users', users), d('cash', -500)];
        if (!good) out.push(d('reputation', -Math.round(12 * (1 - m.marketingRepProtect))));
        return out;
      },
      preview: [d('users', 70), d('cash', -500)],
    }),
    gate({ label: 'Spam DMs', icon: '📨', tone: 'bad', detail: 'Cold-DM everyone. Everyone hates this. Legal risk up.', deltas: [d('users', 15), d('reputation', -10)] }),
  ]),
];

// ── LEVEL 3 — Growing SaaS ────────────────────────────────────────────
const LEVEL3: DecisionRow[] = [
  row('Handle the load', [
    gate({
      label: 'Scale Servers', icon: '🖥️', tone: 'good',
      detail: 'Costs cash now, pays off once you have real traffic (Users > 120).',
      effect: (s) => (s.users > 120 ? [d('cash', -600), d('reputation', 8), d('product', 6)] : [d('cash', -600), d('product', 2)]),
      preview: [d('reputation', 8), d('cash', -600)],
    }),
    gate({
      label: 'Cheap Hosting', icon: '🪤', tone: 'risky',
      detail: 'Save money — fine until a traffic spike takes you down (Users > 200).',
      effect: (s) => (s.users > 200 ? [d('cash', 100), d('reputation', -12), d('users', -40)] : [d('cash', 100), d('product', -2)]),
      preview: [d('cash', 100), d('users', -40)],
    }),
    gate({ label: 'Blame Users', icon: '🗯️', tone: 'bad', detail: 'Tell users the outage is their fault. Bold strategy.', deltas: [d('reputation', -16), d('stress', 6)] }),
  ]),
  row('Grow the team', [
    gate({
      label: 'Hire Dev', icon: '👩‍💻', tone: 'good',
      detail: 'A real engineer. Big product boost if you can afford it (Cash ≥ €1,500).',
      effect: (s, m) => (s.cash >= 1500 ? [d('product', Math.round(22 * m.teamMult)), d('cash', -1500), d('team', 1)] : [d('product', 8), d('cash', -1500), d('team', 1), d('stress', 14)]),
      preview: [d('product', 22), d('team', 1)],
    }),
    gate({
      label: 'Hire Friend', icon: '🧑‍🤝‍🧑', tone: 'risky',
      detail: 'Cheap hire, mixed results. Pays off only if your skill is high.',
      effect: (s, m) => [d('team', 1), d('cash', -400), d('product', Math.round((s.skill > 30 ? 8 : -2) * m.teamMult))],
      preview: [d('team', 1), d('cash', -400)],
    }),
    gate({ label: 'Solo Grind', icon: '🧍', tone: 'neutral', detail: 'Stay lean and alone. Tiring, but you learn.', deltas: [d('skill', 6), d('stress', 12)] }),
  ]),
  row('Start charging', [
    gate({
      label: 'Subscriptions', icon: '💳', tone: 'good',
      detail: 'Recurring revenue that scales with your user base. A few users churn.',
      effect: (s) => [d('cash', 200 + Math.round(s.users * 1.2)), d('users', -10)],
      preview: [d('cash', 400), d('users', -10)],
    }),
    gate({
      label: 'Hard Paywall', icon: '🚧', tone: 'risky',
      detail: 'Squeeze cash now, lose users and reputation later.',
      effect: (s) => [d('cash', Math.round(s.users * 2)), d('users', -40), d('reputation', -10)],
      preview: [d('cash', 500), d('users', -40)],
    }),
    gate({ label: 'Stay Free', icon: '🆓', tone: 'bad', detail: 'Loved by all, broke forever.', deltas: [d('users', 20), d('cash', -200)] }),
  ]),
  row('Find fuel', [
    gate({ label: 'Bootstrap', icon: '🥾', tone: 'good', detail: 'Slow, steady, and free of strings.', deltas: [d('cash', 300), d('stress', -4)] }),
    gate({
      label: 'Pitch VCs', icon: '🤝', tone: 'risky',
      detail: 'Raise big — but only if you have real traction (rep + users).',
      effect: (s) => (s.reputation + s.users / 10 > 60 ? [d('cash', 5000), d('reputation', 6), d('stress', 8)] : [d('stress', 16), d('reputation', -4)]),
      preview: [d('cash', 5000), d('reputation', 6)],
    }),
    gate({ label: 'Shady Loan', icon: '🦈', tone: 'bad', detail: 'Fast cash from scary people. Big legal risk.', deltas: [d('cash', 3000), d('legalRisk', 18)] }),
  ]),
];

// ── LEVEL 4 — Public Launch ───────────────────────────────────────────
const LEVEL4: DecisionRow[] = [
  row('Plan the big launch', [
    gate({
      label: 'Polished Launch', icon: '✨', tone: 'good',
      detail: 'Pays off massively for a real product (Product ≥ 50). Flat if rushed.',
      effect: (s) => (s.product >= 50 ? [d('users', 150), d('reputation', 12), d('cash', 1000)] : [d('users', 60), d('reputation', -8), d('stress', 10)]),
      preview: [d('users', 150), d('reputation', 12)],
    }),
    gate({ label: 'Overpromise', icon: '📢', tone: 'risky', detail: 'Promise the moon. Big spike, trust takes a hit.', deltas: [d('users', 120), d('reputation', -14)] }),
    gate({ label: 'Sell a Course', icon: '🎓', tone: 'bad', detail: 'Pivot to guru. Cash up, reputation down.', deltas: [d('cash', 1500), d('reputation', -10)] }),
  ]),
  row('Get the word out', [
    gate({
      label: 'Earn Press', icon: '📰', tone: 'good',
      detail: 'Honest coverage. Slow-burn credibility that pulls users.',
      effect: (s) => [d('reputation', 14), d('users', 20 + Math.round(s.reputation / 3))],
      preview: [d('reputation', 14), d('users', 30)],
    }),
    gate({
      label: 'Influencers', icon: '🤳', tone: 'risky',
      detail: 'Pay for hype. Loud — backfires hard on a weak product (Product ≥ 45).',
      effect: (s, m) => {
        const good = s.product >= 45;
        const users = Math.round((good ? 80 : 35) * m.marketingUserMult);
        const out = [d('users', users), d('cash', -600)];
        if (!good) out.push(d('reputation', -Math.round(10 * (1 - m.marketingRepProtect))));
        return out;
      },
      preview: [d('users', 80), d('cash', -600)],
    }),
    gate({ label: 'Astroturf', icon: '🌱', tone: 'bad', detail: 'Fake grassroots buzz. Until someone screenshots it.', deltas: [d('users', 30), d('legalRisk', 12)] }),
  ]),
  row('Support at scale', [
    gate({
      label: 'Support Team', icon: '🎧', tone: 'good',
      detail: 'Real humans helping users. Loyalty engine; team grows with management upgrades.',
      effect: (_s, m) => [d('reputation', 12), d('users', 20), d('cash', -300), d('team', m.teamMult > 1.2 ? 1 : 0)],
      preview: [d('reputation', 12), d('users', 20)],
    }),
    gate({ label: 'Automate', icon: '🤖', tone: 'neutral', detail: 'Bots scale support, less warmth. Saves stress.', deltas: [d('reputation', 4), d('stress', -6)] }),
    gate({ label: 'Ignore Tickets', icon: '🎫', tone: 'bad', detail: 'Let the inbox burn. Churn city.', deltas: [d('reputation', -16), d('users', -25)] }),
  ]),
  row('Deal with lawyers', [
    gate({ label: 'Hire Lawyer', icon: '👨‍⚖️', tone: 'good', detail: 'Expensive peace of mind. Slashes legal risk.', deltas: [d('legalRisk', -25), d('cash', -800)] }),
    gate({ label: 'DIY Compliance', icon: '📑', tone: 'risky', detail: 'Handle it yourself. Cheaper, but stressful.', deltas: [d('legalRisk', -10), d('stress', 10)] }),
    gate({ label: 'Ignore Letters', icon: '✉️', tone: 'bad', detail: 'Pretend you did not see them. They escalate.', deltas: [d('legalRisk', 20), d('stress', 8)] }),
  ]),
];

// ── LEVEL 5 — Company Pressure ────────────────────────────────────────
const LEVEL5: DecisionRow[] = [
  row('Scale or die', [
    gate({
      label: 'Reinvest', icon: '🌳', tone: 'good',
      detail: 'Plow profit back in. Long game: product + users grow.',
      effect: (s) => [d('product', 14), d('users', 30 + Math.round(s.users * 0.1)), d('cash', -800)],
      preview: [d('product', 14), d('users', 30)],
    }),
    gate({
      label: 'Gamble Ads', icon: '🎰', tone: 'risky',
      detail: 'All-in ad spin. Big users if marketing is strong, big cash burn.',
      effect: (_s, m) => [d('cash', -1200), d('users', Math.round(110 * m.marketingUserMult)), d('stress', 8)],
      preview: [d('users', 110), d('cash', -1200)],
    }),
    gate({ label: 'Cash Out', icon: '🏃', tone: 'neutral', detail: 'Take money off the table. Lose some users.', deltas: [d('cash', 1500), d('users', -20)] }),
  ]),
  row('Set the culture', [
    gate({ label: 'Build Culture', icon: '💛', tone: 'good', detail: 'Invest in people. A multiplier on everything.', deltas: [d('team', 1), d('product', 8), d('stress', -6)] }),
    gate({ label: 'Micromanage', icon: '🔬', tone: 'bad', detail: 'Control everything. Trust collapses.', deltas: [d('team', -1), d('stress', 14)] }),
    gate({ label: 'Crunch', icon: '⏱️', tone: 'risky', detail: 'Push hard now. Output now, burnout soon.', deltas: [d('product', 18), d('stress', 22)] }),
  ]),
  row('Handle the crisis', [
    gate({ label: 'Fix Core', icon: '🧱', tone: 'good', detail: 'Substance wins. Big product and reputation gain.', deltas: [d('product', 20), d('reputation', 8)] }),
    gate({
      label: 'AI Buzzword', icon: '🪄', tone: 'risky',
      detail: 'Slap "AI" on it. Hype users, thin substance.',
      effect: (_s, m) => [d('users', Math.round(45 * m.marketingUserMult)), d('cash', -500), d('reputation', -4)],
      preview: [d('users', 45), d('cash', -500)],
    }),
    gate({ label: 'Pivot', icon: '🌀', tone: 'bad', detail: 'Throw it all away and start over. Chaos.', deltas: [d('product', -14), d('users', -30)] }),
  ]),
  row('The endgame', [
    gate({ label: 'Sustainable', icon: '🧘', tone: 'good', detail: 'Healthy finish. Recover stress, steady gains.', deltas: [d('stress', -20), d('reputation', 6)] }),
    gate({ label: 'Final Sprint', icon: '🏁', tone: 'risky', detail: 'Empty the tank for one last push.', deltas: [d('product', 16), d('users', 40), d('stress', 18)] }),
    gate({
      label: 'Sell Company', icon: '💼', tone: 'neutral',
      detail: 'Cash out big based on users and product. The exit.',
      effect: (s) => [d('cash', Math.round(s.users * 4 + s.product * 40)), d('users', -50)],
      preview: [d('cash', 4000), d('users', -50)],
    }),
  ]),
];

const BASE_LEVELS: { name: string; subtitle: string; scaling: LevelScaling; rows: DecisionRow[] }[] = [
  { name: 'Garage Phase', subtitle: 'A solo founder, an idea, and too much coffee.', scaling: { userUpside: 1.0, userDownside: 1.0, legalScale: 1.0, stressScale: 1.0 }, rows: LEVEL1 },
  { name: 'First Real Users', subtitle: 'People are actually showing up. Do not blow it.', scaling: { userUpside: 1.1, userDownside: 1.05, legalScale: 1.05, stressScale: 1.05 }, rows: LEVEL2 },
  { name: 'Growing SaaS', subtitle: 'Servers, hires, and the question of money.', scaling: { userUpside: 1.2, userDownside: 1.15, legalScale: 1.15, stressScale: 1.1 }, rows: LEVEL3 },
  { name: 'Public Launch', subtitle: 'The world is watching. So are the lawyers.', scaling: { userUpside: 1.35, userDownside: 1.25, legalScale: 1.3, stressScale: 1.2 }, rows: LEVEL4 },
  { name: 'Company Pressure', subtitle: 'A real company now — with real ways to break it.', scaling: { userUpside: 1.5, userDownside: 1.4, legalScale: 1.45, stressScale: 1.35 }, rows: LEVEL5 },
];

export const MAX_BASE_LEVEL = BASE_LEVELS.length;

/** Get the config for a 1-based level. Levels past 5 loop with harder scaling. */
export function getLevel(level: number): LevelConfig {
  const idx = Math.min(level, MAX_BASE_LEVEL) - 1;
  const base = BASE_LEVELS[idx];
  if (level <= MAX_BASE_LEVEL) {
    return { index: level, name: base.name, subtitle: base.subtitle, scaling: base.scaling, rows: base.rows };
  }
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
