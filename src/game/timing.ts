import type { ChartNote, RhythmChart } from './types';

export function beatToMs(beat: number, bpm: number): number {
  return (beat * 60_000) / bpm;
}

export function noteTimeMs(note: ChartNote, chart: RhythmChart): number {
  return beatToMs(note.beat, chart.bpm);
}

export function chartDurationMs(chart: RhythmChart): number {
  const lastBeat = chart.notes.reduce((max, note) => Math.max(max, note.beat + (note.durationBeats ?? 0)), 0);
  return beatToMs(lastBeat + 4, chart.bpm);
}

export function currentBeat(timeMs: number, chart: RhythmChart): number {
  return (timeMs / 60_000) * chart.bpm;
}
