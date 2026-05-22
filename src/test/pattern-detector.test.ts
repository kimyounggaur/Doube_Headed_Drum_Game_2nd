import { describe, expect, it } from 'vitest';
import { formationRecipes } from '../data/formations';
import { PatternDetector } from '../game/rhythm/PatternDetector';

describe('PatternDetector', () => {
  it('detects a formation from successful stroke sequence', () => {
    const detector = new PatternDetector(formationRecipes, ['hakyikjin'], () => 10_000);
    const result = ['Da', 'Tta', 'Da', 'Tta', 'Gung', 'Dung'].map((stroke, index) =>
      detector.record({
        stroke: stroke as never,
        judgement: 'great',
        beat: index,
      }),
    );

    expect(result.at(-1)?.formation?.id).toBe('hakyikjin');
  });

  it('clears progress on miss and respects cooldowns', () => {
    let now = 10_000;
    const detector = new PatternDetector(formationRecipes, ['wonjin'], () => now);
    detector.record({ stroke: 'Gung', judgement: 'great', beat: 0 });
    detector.record({ stroke: 'Tta', judgement: 'miss', beat: 1 });
    const failed = detector.record({ stroke: 'Gung', judgement: 'great', beat: 2 });
    expect(failed.candidate?.recipe.id).not.toBe('wonjin');

    ['Gung', 'Tta', 'Gung', 'Tta'].forEach((stroke, index) => {
      detector.record({ stroke: stroke as never, judgement: 'great', beat: 3 + index });
    });
    now = 10_300;
    const cooling = ['Gung', 'Tta', 'Gung', 'Tta'].map((stroke, index) =>
      detector.record({ stroke: stroke as never, judgement: 'perfect', beat: 10 + index }),
    );

    expect(cooling.at(-1)?.formation).toBeUndefined();
  });
});
