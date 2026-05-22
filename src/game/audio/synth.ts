import type { StrokeType } from '../types';

export function strokeFrequency(stroke: StrokeType): number {
  switch (stroke) {
    case 'Gung':
      return 132;
    case 'Gu':
      return 176;
    case 'Tta':
      return 420;
    case 'Da':
      return 520;
    case 'Dung':
      return 96;
    case 'Deo':
      return 220;
    case 'Rest':
      return 0;
  }
}
