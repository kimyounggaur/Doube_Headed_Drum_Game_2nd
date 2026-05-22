import { DEFAULT_SETTINGS, SAVE_VERSION } from '../game/constants';
import type { BattleResult, EquipmentDefinition, GameProgress, GameSettings, LevelDefinition } from '../game/types';
import { equipment } from '../data/equipment';
import { rankForXp } from '../data/ranks';

const progressKey = 'joseon-drum-commander:progress';
const settingsKey = 'joseon-drum-commander:settings';

export function defaultProgress(): GameProgress {
  return {
    version: SAVE_VERSION,
    xp: 0,
    completedLevels: [],
    unlockedLevels: ['busanjin'],
    unlockedFormations: [],
    unlockedEquipment: ['training-janggu', 'cheollik', 'bamboo-stick'],
    equipped: {
      drum: 'training-janggu',
      robe: 'cheollik',
      stick: 'bamboo-stick',
    },
    bestGrades: {},
  };
}

export function loadProgress(): GameProgress {
  try {
    const raw = window.localStorage.getItem(progressKey);
    if (!raw) {
      return defaultProgress();
    }

    const parsed = JSON.parse(raw) as GameProgress;
    if (parsed.version !== SAVE_VERSION) {
      return { ...defaultProgress(), xp: parsed.xp ?? 0 };
    }
    return { ...defaultProgress(), ...parsed };
  } catch {
    return defaultProgress();
  }
}

export function saveProgress(progress: GameProgress): void {
  window.localStorage.setItem(progressKey, JSON.stringify(progress));
}

export function loadSettings(): GameSettings {
  try {
    const raw = window.localStorage.getItem(settingsKey);
    if (!raw) {
      return { ...DEFAULT_SETTINGS };
    }
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<GameSettings>) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: GameSettings): void {
  window.localStorage.setItem(settingsKey, JSON.stringify(settings));
}

export function applyBattleResult(progress: GameProgress, result: BattleResult, level: LevelDefinition): GameProgress {
  const next = {
    ...progress,
    xp: progress.xp + result.xpGained,
    completedLevels: result.victory ? unique([...progress.completedLevels, level.id]) : progress.completedLevels,
    unlockedLevels: [...progress.unlockedLevels],
    unlockedFormations: [...progress.unlockedFormations],
    unlockedEquipment: [...progress.unlockedEquipment],
    bestGrades: { ...progress.bestGrades },
    lastPlayedLevelId: level.id,
  };

  if (result.victory) {
    next.bestGrades[level.id] = bestGrade(next.bestGrades[level.id], result.grade);
    level.unlocks?.forEach((unlock) => {
      if (unlock.endsWith('-stick') || unlock.endsWith('-drum') || unlock === 'yonggo') {
        next.unlockedEquipment = unique([...next.unlockedEquipment, unlock]);
      } else if (['iljajin', 'hakyikjin', 'jangsajin', 'wonjin'].includes(unlock)) {
        next.unlockedFormations = unique([...next.unlockedFormations, unlock]);
      } else {
        next.unlockedLevels = unique([...next.unlockedLevels, unlock]);
      }
    });
  }

  equipment.forEach((item) => {
    if (next.xp >= item.unlockXp) {
      next.unlockedEquipment = unique([...next.unlockedEquipment, item.id]);
    }
  });

  return next;
}

export function equippedEffects(progress: GameProgress): Required<EquipmentDefinition['effects']> {
  const equippedItems = equipment.filter((item) => Object.values(progress.equipped).includes(item.id));
  return equippedItems.reduce(
    (effects, item) => ({
      timingWindowBonus: effects.timingWindowBonus + (item.effects.timingWindowBonus ?? 0),
      commandPowerBonus: effects.commandPowerBonus + (item.effects.commandPowerBonus ?? 0),
      defenseBonus: effects.defenseBonus + (item.effects.defenseBonus ?? 0),
      noteSpeedBonus: effects.noteSpeedBonus + (item.effects.noteSpeedBonus ?? 0),
    }),
    {
      timingWindowBonus: 0,
      commandPowerBonus: 0,
      defenseBonus: 0,
      noteSpeedBonus: 0,
    },
  );
}

export function currentRankName(progress: GameProgress): string {
  return rankForXp(progress.xp).nameKo;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

const gradeOrder = ['D', 'C', 'B', 'A', 'S'];

function bestGrade(current: string | undefined, incoming: string): string {
  if (!current) {
    return incoming;
  }
  return gradeOrder.indexOf(incoming) > gradeOrder.indexOf(current) ? incoming : current;
}
