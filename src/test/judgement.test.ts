import { describe, expect, it } from 'vitest';
import { judgeDeltaMs, judgementRankValue } from '../game/rhythm/Judgement';

describe('judgeDeltaMs', () => {
  it('grades timing windows from perfect to miss', () => {
    expect(judgeDeltaMs(0, 1).name).toBe('perfect');
    expect(judgeDeltaMs(70, 1).name).toBe('great');
    expect(judgeDeltaMs(-125, 1).name).toBe('good');
    expect(judgeDeltaMs(180, 1).name).toBe('miss');
  });

  it('widens windows when equipment or settings increase scale', () => {
    expect(judgeDeltaMs(160, 1.2).name).toBe('good');
    expect(judgeDeltaMs(180, 1.2).name).toBe('miss');
  });
});

describe('judgementRankValue', () => {
  it('orders better judgements higher than weaker ones', () => {
    expect(judgementRankValue('perfect')).toBeGreaterThan(judgementRankValue('great'));
    expect(judgementRankValue('good')).toBeGreaterThan(judgementRankValue('miss'));
  });
});
