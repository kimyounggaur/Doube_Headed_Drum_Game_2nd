export const APPROACH_TIME_MS = 1800;
export const SIMULTANEOUS_INPUT_MS = 75;
export const RESULT_DELAY_MS = 1400;

export const JUDGEMENT_WINDOWS_MS = {
  perfect: 45,
  great: 90,
  good: 140,
};

export const SAVE_VERSION = 2;

export const DEFAULT_SETTINGS = {
  offsetMs: 0,
  volume: 0.75,
  muted: false,
  reducedMotion: false,
  noteSpeed: 1,
  judgementScale: 1,
} as const;
