import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

function read(relativePath: string): string {
  return readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');
}

describe('reference visual theme', () => {
  test('defines the scroll, brush, and wood UI language from the design boards', () => {
    const css = read('styles/global.css');

    expect(css).toContain('--scroll-edge');
    expect(css).toContain('--brush-red');
    expect(css).toContain('.title-band::before');
    expect(css).toContain('.panel::after');
    expect(css).toContain('.brush-label');
    expect(css).toContain('.battle-stage::before');
  });

  test('renders the battle stage with naval waves and warship silhouettes', () => {
    const battleRenderer = read('game/render/drawBattlefield.ts');
    const laneRenderer = read('game/render/drawRhythmLane.ts');

    expect(battleRenderer).toContain('drawPanokseonFleet');
    expect(battleRenderer).toContain('drawWaterRibbon');
    expect(battleRenderer).toContain('drawWarship');
    expect(laneRenderer).toContain('drawCommandIcon');
    expect(laneRenderer).toContain('drawGlowingHitLine');
  });
});
