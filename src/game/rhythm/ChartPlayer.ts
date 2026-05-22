import { APPROACH_TIME_MS } from '../constants';
import { chartDurationMs, noteTimeMs } from '../timing';
import type { ChartNote, RhythmChart } from '../types';

export interface VisibleNote {
  note: ChartNote;
  timeMs: number;
  progress: number;
}

export function getVisibleNotes(chart: RhythmChart, currentTimeMs: number, resolvedIds: Set<string>, approachTimeMs = APPROACH_TIME_MS): VisibleNote[] {
  return chart.notes
    .filter((note) => !resolvedIds.has(note.id))
    .map((note) => {
      const timeMs = noteTimeMs(note, chart);
      return {
        note,
        timeMs,
        progress: 1 - (timeMs - currentTimeMs) / approachTimeMs,
      };
    })
    .filter(({ progress }) => progress > -0.12 && progress < 1.25);
}

export function isChartFinished(chart: RhythmChart, currentTimeMs: number): boolean {
  return currentTimeMs >= chartDurationMs(chart);
}
