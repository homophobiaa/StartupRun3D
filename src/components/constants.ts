import type { PortalCategory } from '../game/types';

/** Shared 3D scene constants. */

/**
 * Lane X positions indexed by lane 0/1/2 (left/center/right as the player
 * reads them). The camera looks down +Z, which mirrors world X on screen, so
 * lane 0 ("left") maps to +X and lane 2 ("right") maps to -X. This is what
 * makes A/← move visually LEFT and D/→ move visually RIGHT.
 */
export const LANE_X: [number, number, number] = [3.4, 0, -3.4];
export const ROW_GAP = 56; // huge spacing: only one row dominates at a time
export const FIRST_ROW_Z = 34;
export const FULL_SPEED = 15; // cruising units/sec
export const APPROACH_DIST = 22; // distance at which the decision window opens
export const HOLD_OFFSET = 7; // runner halts this far before the row to decide
export const AUTO_CONFIRM_MS = 4200; // calm auto-commit if player does nothing
export const ROAD_LENGTH = 420;

/** Z position of a row by its index within the current level. */
export const rowZ = (index: number) => FIRST_ROW_Z + index * ROW_GAP;

/** Tone -> color palette (used for floor beams / chips). */
export const TONE_COLOR: Record<string, string> = {
  good: '#34d399',
  risky: '#fb923c',
  bad: '#f87171',
  neutral: '#38bdf8',
};

/** Portal category -> color + emblem shape. Drives the 3D portal identity. */
export const CATEGORY: Record<PortalCategory, { color: string; emblem: 'shield' | 'rocket' | 'warning' | 'coins' | 'cube' | 'broadcast' | 'stamp' }> = {
  strategic: { color: '#38bdf8', emblem: 'shield' },
  growth: { color: '#fb923c', emblem: 'rocket' },
  danger: { color: '#f87171', emblem: 'warning' },
  finance: { color: '#34d399', emblem: 'coins' },
  product: { color: '#22d3ee', emblem: 'cube' },
  marketing: { color: '#f472b6', emblem: 'broadcast' },
  legal: { color: '#fbbf24', emblem: 'stamp' },
};
