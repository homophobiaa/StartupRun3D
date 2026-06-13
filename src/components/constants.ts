/** Shared 3D scene constants. */

/**
 * Lane X positions indexed by lane 0/1/2 (left/center/right as the player
 * reads them). The camera looks down +Z, which mirrors world X on screen, so
 * lane 0 ("left") maps to +X and lane 2 ("right") maps to -X. This is what
 * makes A/← move visually LEFT and D/→ move visually RIGHT.
 */
export const LANE_X: [number, number, number] = [3.0, 0, -3.0];
export const ROW_GAP = 22; // Z distance between decision rows (readable spacing)
export const FIRST_ROW_Z = 22; // Z of the first row
export const PLAYER_SPEED = 9; // units per second
export const ROAD_LENGTH = 320;

/** Z position of a row by its index within the current level. */
export const rowZ = (index: number) => FIRST_ROW_Z + index * ROW_GAP;

/** Tone -> color palette. */
export const TONE_COLOR: Record<string, string> = {
  good: '#34d399',
  risky: '#fbbf24',
  bad: '#f87171',
  neutral: '#a78bfa',
};
