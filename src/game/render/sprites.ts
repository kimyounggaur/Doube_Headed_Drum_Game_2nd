import type { StrokeType } from '../types';
import { strokeMap } from '../../data/strokes';

export function noteColor(stroke: StrokeType): string {
  return strokeMap[stroke]?.colorHint ?? '#d9a63a';
}

export function noteLabel(stroke: StrokeType): string {
  return strokeMap[stroke]?.korean ?? stroke;
}
