/** Shared 3D scene constants. */
export const LANE_X: [number, number, number] = [-2.4, 0, 2.4];
export const ROW_GAP = 14; // Z distance between decision rows
export const FIRST_ROW_Z = 16; // Z of the first row
export const PLAYER_SPEED = 8; // units per second
export const ROAD_LENGTH = 400;

/** Z position of a row by its flat index. */
export const rowZ = (index: number) => FIRST_ROW_Z + index * ROW_GAP;

/** Tone -> color palette. */
export const TONE_COLOR: Record<string, string> = {
  good: '#34d399',
  risky: '#fb923c',
  bad: '#f87171',
  neutral: '#a78bfa',
};
