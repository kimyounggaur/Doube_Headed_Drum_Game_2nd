import { JUDGEMENT_WINDOWS_MS } from '../constants';
import type { JudgementName } from '../types';

export interface JudgementResult {
  name: JudgementName;
  deltaMs: number;
  score: number;
  accuracyWeight: number;
}

const judgementScores: Record<JudgementName, number> = {
  perfect: 1000,
  great: 750,
  good: 450,
  miss: 0,
};

const rankValues: Record<JudgementName, number> = {
  perfect: 3,
  great: 2,
  good: 1,
  miss: 0,
};

export function judgeDeltaMs(deltaMs: number, windowScale = 1): JudgementResult {
  const absolute = Math.abs(deltaMs);
  let name: JudgementName = 'miss';

  if (absolute <= JUDGEMENT_WINDOWS_MS.perfect * windowScale) {
    name = 'perfect';
  } else if (absolute <= JUDGEMENT_WINDOWS_MS.great * windowScale) {
    name = 'great';
  } else if (absolute <= JUDGEMENT_WINDOWS_MS.good * windowScale) {
    name = 'good';
  }

  return {
    name,
    deltaMs,
    score: judgementScores[name],
    accuracyWeight: rankValues[name] / 3,
  };
}

export function judgementRankValue(name: JudgementName): number {
  return rankValues[name];
}

export function averageJudgementRank(names: JudgementName[]): number {
  if (names.length === 0) {
    return 0;
  }

  return names.reduce((sum, name) => sum + rankValues[name], 0) / names.length;
}
