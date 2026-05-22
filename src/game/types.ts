export type StrokeType = 'Gung' | 'Gu' | 'Tta' | 'Da' | 'Dung' | 'Deo' | 'Rest';

export type Lane = 'left' | 'right' | 'both' | 'none';
export type Strength = 'strong' | 'soft' | 'rest';

export type JudgementName = 'perfect' | 'great' | 'good' | 'miss';

export type EnemyEventType = 'charge' | 'arrowRain' | 'cannon' | 'ambush' | 'moralePush';

export interface StrokeDefinition {
  id: StrokeType;
  korean: string;
  roman: string;
  lane: Lane;
  strength: Strength;
  commandName: string;
  commandDescription: string;
  tacticalRole: string;
  colorHint: string;
  keyboard: string[];
  touchLabel: string;
}

export interface ChartNote {
  id: string;
  beat: number;
  type: StrokeType;
  durationBeats?: number;
  label?: string;
  commandHint?: string;
  measure?: number;
  subdivision?: number;
  accent?: boolean;
  ghost?: boolean;
}

export interface RhythmChart {
  id: string;
  name: string;
  timeSignature: string;
  bpm: number;
  subdivision: number;
  notes: ChartNote[];
  description: string;
  tacticalUse: string;
  difficulty: number;
}

export interface FormationRecipe {
  id: string;
  nameKo: string;
  nameHanja?: string;
  nameEn: string;
  role: string;
  sequence: StrokeType[];
  maxGapBeats: number;
  minAverageJudgement: 'perfect' | 'great' | 'good';
  effectDescription: string;
  cooldownMs: number;
  unlockLevelId?: string;
  bannerText: string;
}

export interface TutorialStep {
  title: string;
  body: string;
}

export interface LevelDefinition {
  id: string;
  chapter: number;
  titleKo: string;
  subtitle: string;
  mode: 'campaign' | 'training' | 'boss';
  backgroundKey: string;
  chartIds: string[];
  enemyProfile: string;
  objective: string;
  difficulty: number;
  trainingRhythm: string;
  primaryCommands: StrokeType[];
  reward: string;
  beta?: boolean;
  alertGauge?: boolean;
  unlocks?: string[];
  tutorialSteps?: TutorialStep[];
  clearCondition: string;
}

export interface CommandEvent {
  timeMs: number;
  stroke: StrokeType;
  judgement: JudgementName;
  commandName: string;
  effectPower: number;
  banner: string;
}

export interface BattleBuffs {
  shieldUntil: number;
  scatterReduction: number;
  scatterUntil: number;
  aimedShots: number;
  chargeGuardUntil: number;
  areaGuardUntil: number;
  mobilityUntil: number;
  noteSpeedBoostUntil: number;
  comboGuard: number;
  dungCooldownUntil: number;
}

export interface BattleState {
  battleBalance: number;
  allyMorale: number;
  enemyMorale: number;
  allyHP: number;
  enemyHP: number;
  enemyPressure: number;
  alertGauge: number;
  combo: number;
  maxCombo: number;
  fever: number;
  activeFormationId?: string;
  activeFormationUntil: number;
  recentCommands: CommandEvent[];
  buffs: BattleBuffs;
}

export interface EquipmentDefinition {
  id: string;
  nameKo: string;
  slot: 'drum' | 'robe' | 'stick';
  description: string;
  unlockXp: number;
  effects: {
    timingWindowBonus?: number;
    commandPowerBonus?: number;
    defenseBonus?: number;
    noteSpeedBonus?: number;
  };
}

export interface RankDefinition {
  id: string;
  nameKo: string;
  minXp: number;
  description: string;
}

export interface GameProgress {
  version: number;
  xp: number;
  completedLevels: string[];
  unlockedLevels: string[];
  unlockedFormations: string[];
  unlockedEquipment: string[];
  equipped: Record<EquipmentDefinition['slot'], string>;
  bestGrades: Record<string, string>;
  lastPlayedLevelId?: string;
}

export interface GameSettings {
  offsetMs: number;
  volume: number;
  muted: boolean;
  reducedMotion: boolean;
  noteSpeed: number;
  judgementScale: number;
}

export interface BattleResult {
  levelId: string;
  levelTitle: string;
  victory: boolean;
  score: number;
  accuracy: number;
  maxCombo: number;
  grade: string;
  xpGained: number;
  unlocked: string[];
}

export interface VisualEffect {
  id: string;
  kind: 'shield' | 'arrow' | 'aim' | 'charge' | 'scatter' | 'cannon' | 'formation' | 'miss' | 'crowd';
  text: string;
  createdAt: number;
  durationMs: number;
  lane?: Lane;
}
