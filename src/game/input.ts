import type { StrokeType } from './types';

export type InputSide = 'left' | 'right';
export type InputStrength = 'strong' | 'soft';

const directKeyMap: Record<string, StrokeType | undefined> = {
  ' ': 'Dung',
  Enter: 'Deo',
};

export function keyToSideStrength(key: string): { side: InputSide; strength: InputStrength } | undefined {
  const normalized = key.toLowerCase();
  if (normalized === 'f' || normalized === 'a') {
    return { side: 'left', strength: 'strong' };
  }
  if (normalized === 'd' || normalized === 's') {
    return { side: 'left', strength: 'soft' };
  }
  if (normalized === 'j' || normalized === 'l') {
    return { side: 'right', strength: 'strong' };
  }
  if (normalized === 'k' || key === ';') {
    return { side: 'right', strength: 'soft' };
  }
  return undefined;
}

export function directKeyStroke(key: string): StrokeType | undefined {
  return directKeyMap[key];
}

export function strokeFromTouch(side: InputSide | 'both', strength: InputStrength): StrokeType {
  if (side === 'both') {
    return strength === 'strong' ? 'Dung' : 'Deo';
  }
  if (side === 'left') {
    return strength === 'strong' ? 'Gung' : 'Gu';
  }
  return strength === 'strong' ? 'Tta' : 'Da';
}
