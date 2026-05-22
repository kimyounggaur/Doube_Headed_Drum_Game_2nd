import type { BattleState, LevelDefinition } from '../types';

export function hasBattleEnded(level: LevelDefinition, state: BattleState, elapsedMs: number, chartFinished: boolean): 'victory' | 'defeat' | undefined {
  if (state.allyHP <= 0 || state.battleBalance <= 0 || state.alertGauge >= 100) {
    return 'defeat';
  }

  if (state.enemyHP <= 0 || state.battleBalance >= 92) {
    return 'victory';
  }

  if (chartFinished || elapsedMs > 95_000) {
    if (level.alertGauge && state.alertGauge >= 70) {
      return 'defeat';
    }
    return state.battleBalance >= 45 && state.allyHP > 0 ? 'victory' : 'defeat';
  }

  return undefined;
}

export function gradeForResult(victory: boolean, accuracy: number, maxCombo: number): string {
  if (!victory) {
    return 'D';
  }
  if (accuracy >= 94 && maxCombo >= 32) {
    return 'S';
  }
  if (accuracy >= 84) {
    return 'A';
  }
  if (accuracy >= 72) {
    return 'B';
  }
  return 'C';
}
