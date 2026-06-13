/** Shared 3D scene constants. */

/**
 * Lane X positions indexed by lane 0/1/2 (left/center/right as the player
 * reads them). The camera looks down +Z, which mirrors world X on screen, so
 * lane 0 ("left") maps to +X and lane 2 ("right") maps to -X. This is what
 * makes A/← move visually LEFT and D/→ move visually RIGHT.
 */
export const LANE_X: [number, number, number] = [3.4, 0, -3.4];
export const ROW_GAP = 38; // Z distance between rows — lots of room to read & think
export const FIRST_ROW_Z = 30;
export const FULL_SPEED = 13; // cruising units/sec
export const SLOW_SPEED = 4.5; // speed inside a decision approach zone
export const APPROACH_DIST = 20; // distance at which we start slowing + focus
export const ROAD_LENGTH = 360;

/** Z position of a row by its index within the current level. */
export const rowZ = (index: number) => FIRST_ROW_Z + index * ROW_GAP;

/** Tone -> color palette. */
export const TONE_COLOR: Record<string, string> = {
  good: '#34d399',
  risky: '#fb923c',
  bad: '#f87171',
  neutral: '#38bdf8',
};

/** Tone -> simple meaning used for the icon token shape. */
export const TONE_KIND: Record<string, 'safe' | 'growth' | 'danger'> = {
  good: 'safe',
  neutral: 'safe',
  risky: 'growth',
  bad: 'danger',
};
