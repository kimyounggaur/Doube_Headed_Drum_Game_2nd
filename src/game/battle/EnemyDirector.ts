import type { EnemyEventType, LevelDefinition } from '../types';

const eventCycles: Record<string, EnemyEventType[]> = {
  busanjin: ['charge', 'moralePush', 'charge'],
  'night-watch': ['ambush', 'arrowRain', 'ambush'],
  'waegu-ambush': ['ambush', 'charge', 'arrowRain', 'charge'],
  hansando: ['arrowRain', 'cannon', 'charge'],
  haengju: ['charge', 'arrowRain', 'cannon', 'moralePush'],
};

export function enemyEventAt(level: LevelDefinition, elapsedMs: number, lastEventIndex: number): { event: EnemyEventType; index: number } | undefined {
  const interval = level.id === 'haengju' ? 5200 : level.id === 'waegu-ambush' ? 6500 : 7600;
  const index = Math.floor(elapsedMs / interval);
  if (index <= 0 || index === lastEventIndex) {
    return undefined;
  }

  const cycle = eventCycles[level.id] ?? eventCycles.busanjin;
  return { event: cycle[index % cycle.length], index };
}
