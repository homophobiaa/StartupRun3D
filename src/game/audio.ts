/** Tiny WebAudio SFX — no external files. Respects the SFX setting. */

let ctx: AudioContext | null = null;
let enabled = true;

export function setSfxEnabled(on: boolean) {
  enabled = on;
}

/** Must be called from a user gesture (e.g. Start button) to unlock audio. */
export function initAudio() {
  if (ctx) return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
  } catch {
    ctx = null;
  }
}

function blip(freq: number, dur: number, type: OscillatorType, gain: number, slideTo?: number) {
  if (!enabled || !ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const sfx = {
  move: () => blip(420, 0.06, 'square', 0.05),
  good: () => blip(540, 0.16, 'triangle', 0.09, 880),
  bad: () => blip(240, 0.22, 'sawtooth', 0.08, 110),
  finish: () => {
    blip(523, 0.14, 'triangle', 0.09);
    setTimeout(() => blip(659, 0.14, 'triangle', 0.09), 110);
    setTimeout(() => blip(784, 0.22, 'triangle', 0.1), 220);
  },
};
