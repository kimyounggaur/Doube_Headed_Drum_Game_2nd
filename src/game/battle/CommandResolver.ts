import type { BattleState, EnemyEventType, FormationRecipe, JudgementName, StrokeType } from '../types';
import { clamp, uid } from '../math';
import { strokeMap } from '../../data/strokes';

interface CommandContext {
  nowMs: number;
  levelId: string;
  commandPowerBonus?: number;
  defenseBonus?: number;
}

interface CommandResolution {
  state: BattleState;
  eventText: string;
  effectKind: 'shield' | 'arrow' | 'aim' | 'charge' | 'scatter' | 'cannon' | 'miss' | 'crowd';
}

const judgementPower: Record<JudgementName, number> = {
  perfect: 1.8,
  great: 1.35,
  good: 1,
  miss: 0,
};

export function createBattleState(alertGauge = 0): BattleState {
  return {
    battleBalance: 50,
    allyMorale: 58,
    enemyMorale: 58,
    allyHP: 100,
    enemyHP: 100,
    enemyPressure: 0,
    alertGauge,
    combo: 0,
    maxCombo: 0,
    fever: 0,
    activeFormationUntil: 0,
    recentCommands: [],
    buffs: {
      shieldUntil: 0,
      scatterReduction: 0,
      scatterUntil: 0,
      aimedShots: 0,
      chargeGuardUntil: 0,
      areaGuardUntil: 0,
      mobilityUntil: 0,
      noteSpeedBoostUntil: 0,
      comboGuard: 0,
      dungCooldownUntil: 0,
    },
  };
}

export function resolveCommand(
  previous: BattleState,
  stroke: StrokeType,
  judgement: JudgementName,
  context: CommandContext,
): CommandResolution {
  const state = cloneState(previous);
  const bonus = 1 + (context.commandPowerBonus ?? 0);

  if (judgement === 'miss') {
    const guardConsumed = state.buffs.comboGuard > 0;
    state.combo = guardConsumed ? Math.max(1, state.combo) : 0;
    state.buffs.comboGuard = guardConsumed ? state.buffs.comboGuard - 1 : state.buffs.comboGuard;
    state.battleBalance = clamp(state.battleBalance - 4, 0, 100);
    state.allyMorale = clamp(state.allyMorale - 5, 0, 100);
    state.allyHP = clamp(state.allyHP - 2.5, 0, 100);
    state.enemyPressure = clamp(state.enemyPressure + 8, 0, 100);
    state.recentCommands = appendCommand(state, stroke, judgement, context.nowMs, 0, '전열 흔들림');
    return { state, eventText: '전열 흔들림', effectKind: 'miss' };
  }

  const power = judgementPower[judgement] * bonus;
  state.combo += 1;
  state.maxCombo = Math.max(state.maxCombo, state.combo);
  state.enemyPressure = clamp(state.enemyPressure - power * 1.2, 0, 100);

  let eventText = strokeMap[stroke].commandName;
  let effectKind: CommandResolution['effectKind'] = 'crowd';
  let effectPower = power;

  switch (stroke) {
    case 'Gung': {
      state.battleBalance = clamp(state.battleBalance + 1.25 * power, 0, 100);
      state.allyMorale = clamp(state.allyMorale + 1.8 * power, 0, 100);
      state.buffs.shieldUntil = context.nowMs + (judgement === 'perfect' ? 4200 : 2600);
      eventText = '방패벽 전진!';
      effectKind = 'shield';
      break;
    }
    case 'Gu': {
      state.allyHP = clamp(state.allyHP + 1.2 * power, 0, 100);
      state.allyMorale = clamp(state.allyMorale + 1.1 * power, 0, 100);
      state.battleBalance = clamp(state.battleBalance + 0.35 * power, 0, 100);
      eventText = '대열 재정비!';
      effectKind = 'crowd';
      break;
    }
    case 'Tta': {
      const aimMultiplier = state.buffs.aimedShots > 0 ? 1.42 : 1;
      if (state.buffs.aimedShots > 0) {
        state.buffs.aimedShots -= 1;
      }
      const damage = 1.35 * power * aimMultiplier;
      state.enemyHP = clamp(state.enemyHP - damage, 0, 100);
      state.enemyMorale = clamp(state.enemyMorale - 0.9 * power, 0, 100);
      state.battleBalance = clamp(state.battleBalance + 0.8 * power, 0, 100);
      eventText = aimMultiplier > 1 ? '조준 사격!' : '일제 사격!';
      effectKind = 'arrow';
      effectPower = damage;
      break;
    }
    case 'Da': {
      const shots = judgement === 'perfect' ? 2 : 1;
      state.buffs.aimedShots = Math.min(3, state.buffs.aimedShots + shots);
      state.enemyMorale = clamp(state.enemyMorale - 0.8 * power, 0, 100);
      state.fever = clamp(state.fever + 1.8 * power, 0, 100);
      eventText = '조준 완료!';
      effectKind = 'aim';
      break;
    }
    case 'Dung': {
      const cooling = context.nowMs < state.buffs.dungCooldownUntil;
      const cooldownPenalty = cooling ? 0.45 : 1;
      const damage = 2.35 * power * cooldownPenalty;
      state.enemyHP = clamp(state.enemyHP - damage, 0, 100);
      state.battleBalance = clamp(state.battleBalance + 1.7 * power * cooldownPenalty, 0, 100);
      state.allyMorale = clamp(state.allyMorale + 1.8 * power, 0, 100);
      state.fever = clamp(state.fever + 4.5 * power, 0, 100);
      state.buffs.dungCooldownUntil = context.nowMs + 2000;
      eventText = cooling ? '총공격 재정비!' : '전군 총공격!';
      effectKind = 'cannon';
      effectPower = damage;
      break;
    }
    case 'Deo': {
      state.buffs.scatterReduction = judgement === 'perfect' ? 0.72 : judgement === 'great' ? 0.55 : 0.3;
      state.buffs.scatterUntil = context.nowMs + 5000;
      state.allyMorale = clamp(state.allyMorale + 1.2 * power, 0, 100);
      state.battleBalance = clamp(state.battleBalance + 0.45 * power, 0, 100);
      eventText = '전군 산개!';
      effectKind = 'scatter';
      break;
    }
    case 'Rest':
      break;
  }

  state.recentCommands = appendCommand(state, stroke, judgement, context.nowMs, effectPower, eventText);
  return { state, eventText, effectKind };
}

export function resolveFormation(previous: BattleState, recipe: FormationRecipe, nowMs: number): BattleState {
  const state = cloneState(previous);
  state.activeFormationId = recipe.id;
  state.activeFormationUntil = nowMs + 8000;

  if (recipe.id === 'iljajin') {
    state.buffs.chargeGuardUntil = nowMs + 8000;
    state.allyMorale = clamp(state.allyMorale + 8, 0, 100);
    state.battleBalance = clamp(state.battleBalance + 5, 0, 100);
  } else if (recipe.id === 'hakyikjin') {
    state.enemyHP = clamp(state.enemyHP - 12, 0, 100);
    state.enemyMorale = clamp(state.enemyMorale - 15, 0, 100);
    state.battleBalance = clamp(state.battleBalance + 10, 0, 100);
  } else if (recipe.id === 'jangsajin') {
    state.buffs.mobilityUntil = nowMs + 10_000;
    state.buffs.noteSpeedBoostUntil = nowMs + 10_000;
    state.battleBalance = clamp(state.battleBalance + 4, 0, 100);
  } else if (recipe.id === 'wonjin') {
    state.allyHP = clamp(state.allyHP + 5, 0, 100);
    state.buffs.areaGuardUntil = nowMs + 6000;
    state.buffs.comboGuard = Math.max(state.buffs.comboGuard, 1);
  }

  return state;
}

export function resolveEnemyEvent(previous: BattleState, type: EnemyEventType, nowMs: number, defenseBonus = 0): BattleState {
  const state = cloneState(previous);
  const baseDamage: Record<EnemyEventType, number> = {
    charge: 7,
    arrowRain: 6,
    cannon: 9,
    ambush: 7.5,
    moralePush: 3.5,
  };

  let damage = baseDamage[type] * (1 - defenseBonus);
  if (state.buffs.scatterUntil > nowMs && (type === 'arrowRain' || type === 'cannon')) {
    damage *= 1 - state.buffs.scatterReduction;
  }
  if (state.buffs.shieldUntil > nowMs && type === 'charge') {
    damage *= 0.48;
  }
  if (state.buffs.chargeGuardUntil > nowMs && type === 'charge') {
    damage *= 0.4;
  }
  if (state.buffs.areaGuardUntil > nowMs && (type === 'arrowRain' || type === 'cannon')) {
    damage *= 0.45;
  }
  if (state.buffs.mobilityUntil > nowMs && type === 'ambush') {
    damage *= 0.55;
  }

  state.allyHP = clamp(state.allyHP - damage, 0, 100);
  state.allyMorale = clamp(state.allyMorale - damage * 0.45, 0, 100);
  state.battleBalance = clamp(state.battleBalance - damage * 0.55, 0, 100);
  state.enemyPressure = clamp(state.enemyPressure + 6, 0, 100);
  return state;
}

function appendCommand(
  state: BattleState,
  stroke: StrokeType,
  judgement: JudgementName,
  timeMs: number,
  power: number,
  banner: string,
) {
  return [
    {
      timeMs,
      stroke,
      judgement,
      commandName: strokeMap[stroke].commandName,
      effectPower: power,
      banner,
    },
    ...state.recentCommands,
  ].slice(0, 8);
}

function cloneState(state: BattleState): BattleState {
  return {
    ...state,
    recentCommands: [...state.recentCommands],
    buffs: { ...state.buffs },
  };
}

export function createVisualEffectId(prefix: string): string {
  return uid(prefix);
}
