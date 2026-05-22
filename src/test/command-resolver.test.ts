import { describe, expect, it } from 'vitest';
import { createBattleState, resolveCommand, resolveEnemyEvent } from '../game/battle/CommandResolver';

describe('CommandResolver', () => {
  it('makes rhythm commands change battle state in distinct tactical ways', () => {
    const base = createBattleState();
    const aimed = resolveCommand(base, 'Da', 'perfect', { nowMs: 0, levelId: 'busanjin' }).state;
    const shot = resolveCommand(aimed, 'Tta', 'perfect', { nowMs: 700, levelId: 'busanjin' }).state;
    const guarded = resolveCommand(base, 'Gung', 'perfect', { nowMs: 0, levelId: 'busanjin' }).state;

    expect(shot.enemyHP).toBeLessThan(guarded.enemyHP);
    expect(guarded.battleBalance).toBeGreaterThan(base.battleBalance);
    expect(shot.buffs.aimedShots).toBe(1);
  });

  it('punishes misses and lets Deo reduce the next enemy attack', () => {
    const missed = resolveCommand(createBattleState(), 'Gung', 'miss', { nowMs: 0, levelId: 'busanjin' }).state;
    const scattered = resolveCommand(missed, 'Deo', 'perfect', { nowMs: 300, levelId: 'busanjin' }).state;
    const afterArrow = resolveEnemyEvent(scattered, 'arrowRain', 500);

    expect(missed.battleBalance).toBeLessThan(50);
    expect(missed.enemyPressure).toBeGreaterThan(0);
    expect(afterArrow.allyHP).toBeGreaterThan(missed.allyHP - 8);
  });
});
