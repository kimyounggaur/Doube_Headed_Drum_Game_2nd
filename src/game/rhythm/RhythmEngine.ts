import { JUDGEMENT_WINDOWS_MS } from '../constants';
import { currentBeat, noteTimeMs } from '../timing';
import type { ChartNote, JudgementName, RhythmChart, StrokeType } from '../types';
import { judgeDeltaMs, type JudgementResult } from './Judgement';

export interface HitResult {
  note?: ChartNote;
  inputStroke: StrokeType;
  judgement: JudgementName;
  deltaMs: number;
  score: number;
  beat: number;
  wrongStroke?: boolean;
}

export class RhythmEngine {
  private readonly resolvedIds = new Set<string>();

  constructor(private readonly chart: RhythmChart) {}

  hit(inputStroke: StrokeType, currentTimeMs: number, offsetMs: number, windowScale: number): HitResult {
    const correctedTime = currentTimeMs + offsetMs;
    const nearest = this.findNearest(correctedTime);
    const beat = currentBeat(correctedTime, this.chart);

    if (!nearest) {
      return { inputStroke, judgement: 'miss', deltaMs: Number.POSITIVE_INFINITY, score: 0, beat };
    }

    const judgement = judgeDeltaMs(correctedTime - nearest.timeMs, windowScaleForNote(nearest.note, windowScale));
    const wrongStroke = nearest.note.type !== inputStroke;

    if (judgement.name === 'miss' || wrongStroke) {
      this.resolvedIds.add(nearest.note.id);
      return {
        note: nearest.note,
        inputStroke,
        judgement: 'miss',
        deltaMs: correctedTime - nearest.timeMs,
        score: 0,
        beat,
        wrongStroke,
      };
    }

    this.resolvedIds.add(nearest.note.id);
    return {
      note: nearest.note,
      inputStroke,
      judgement: judgement.name,
      deltaMs: judgement.deltaMs,
      score: judgement.score,
      beat,
    };
  }

  collectMisses(currentTimeMs: number, offsetMs: number, windowScale: number): HitResult[] {
    const correctedTime = currentTimeMs + offsetMs;
    const misses: HitResult[] = [];

    this.chart.notes.forEach((note) => {
      if (this.resolvedIds.has(note.id)) {
        return;
      }
      const timeMs = noteTimeMs(note, this.chart);
      const goodWindow = JUDGEMENT_WINDOWS_MS.good * windowScaleForNote(note, windowScale);
      if (correctedTime > timeMs + goodWindow) {
        this.resolvedIds.add(note.id);
        misses.push({
          note,
          inputStroke: note.type,
          judgement: 'miss',
          deltaMs: correctedTime - timeMs,
          score: 0,
          beat: currentBeat(timeMs, this.chart),
        });
      }
    });

    return misses;
  }

  getResolvedIds(): Set<string> {
    return new Set(this.resolvedIds);
  }

  reset(): void {
    this.resolvedIds.clear();
  }

  private findNearest(currentTimeMs: number): { note: ChartNote; timeMs: number; judgement: JudgementResult } | undefined {
    return this.chart.notes
      .filter((note) => !this.resolvedIds.has(note.id))
      .map((note) => {
        const timeMs = noteTimeMs(note, this.chart);
        return {
          note,
          timeMs,
          judgement: judgeDeltaMs(currentTimeMs - timeMs, windowScaleForNote(note, 1.25)),
        };
      })
      .filter((candidate) => Math.abs(currentTimeMs - candidate.timeMs) <= JUDGEMENT_WINDOWS_MS.good * windowScaleForNote(candidate.note, 1.45))
      .sort((a, b) => Math.abs(currentTimeMs - a.timeMs) - Math.abs(currentTimeMs - b.timeMs))[0];
  }
}

function windowScaleForNote(note: ChartNote, baseScale: number): number {
  return baseScale + (note.ghost ? 0.12 : 0);
}
