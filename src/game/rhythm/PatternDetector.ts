import type { FormationRecipe, JudgementName, StrokeType } from '../types';
import { averageJudgementRank, judgementRankValue } from './Judgement';

export interface PatternInput {
  stroke: StrokeType;
  judgement: JudgementName;
  beat: number;
}

export interface PatternCandidate {
  recipe: FormationRecipe;
  progress: number;
}

export interface PatternDetectionResult {
  formation?: FormationRecipe;
  candidate?: PatternCandidate;
  buffer: PatternInput[];
}

export class PatternDetector {
  private buffer: PatternInput[] = [];
  private cooldowns = new Map<string, number>();

  constructor(
    private readonly recipes: FormationRecipe[],
    private unlockedIds: string[],
    private readonly now: () => number,
  ) {}

  setUnlocked(unlockedIds: string[]): void {
    this.unlockedIds = unlockedIds;
  }

  record(input: PatternInput): PatternDetectionResult {
    if (input.judgement === 'miss') {
      this.buffer = [];
      return { buffer: [] };
    }

    this.buffer.push(input);
    this.buffer = this.buffer.slice(-8);

    const unlockedRecipes = this.recipes.filter((recipe) => this.unlockedIds.includes(recipe.id));
    const formation = unlockedRecipes.find((recipe) => this.matchesRecipe(recipe));
    if (formation && !this.isCoolingDown(formation)) {
      this.cooldowns.set(formation.id, this.now() + formation.cooldownMs);
      this.buffer = [];
      return { formation, buffer: [] };
    }

    return {
      candidate: this.bestCandidate(unlockedRecipes),
      buffer: [...this.buffer],
    };
  }

  getCooldownRemaining(recipeId: string): number {
    return Math.max(0, (this.cooldowns.get(recipeId) ?? 0) - this.now());
  }

  getBuffer(): PatternInput[] {
    return [...this.buffer];
  }

  private isCoolingDown(recipe: FormationRecipe): boolean {
    return this.getCooldownRemaining(recipe.id) > 0;
  }

  private matchesRecipe(recipe: FormationRecipe): boolean {
    if (this.buffer.length < recipe.sequence.length) {
      return false;
    }

    const slice = this.buffer.slice(-recipe.sequence.length);
    const sequenceMatches = slice.every((input, index) => input.stroke === recipe.sequence[index]);
    if (!sequenceMatches) {
      return false;
    }

    const minRank = judgementRankValue(recipe.minAverageJudgement);
    const avgRank = averageJudgementRank(slice.map((input) => input.judgement));
    const gapsAreTight = slice.every((input, index) => index === 0 || input.beat - slice[index - 1].beat <= recipe.maxGapBeats);

    return avgRank >= minRank && gapsAreTight;
  }

  private bestCandidate(recipes: FormationRecipe[]): PatternCandidate | undefined {
    let best: PatternCandidate | undefined;

    recipes.forEach((recipe) => {
      const maxPrefix = Math.min(recipe.sequence.length, this.buffer.length);
      for (let prefixLength = maxPrefix; prefixLength > 0; prefixLength -= 1) {
        if (prefixLength < 2) {
          continue;
        }
        const tail = this.buffer.slice(-prefixLength);
        const matches = tail.every((input, index) => input.stroke === recipe.sequence[index]);
        if (!matches) {
          continue;
        }

        const candidate = {
          recipe,
          progress: prefixLength / recipe.sequence.length,
        };
        if (!best || candidate.progress > best.progress) {
          best = candidate;
        }
        break;
      }
    });

    return best;
  }
}
