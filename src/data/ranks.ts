import type { RankDefinition } from '../game/types';

export const ranks: RankDefinition[] = [
  { id: 'militia', nameKo: '의병 고수', minXp: 0, description: '전장의 북소리를 배우기 시작했다.' },
  { id: 'signalman', nameKo: '군령 고수', minXp: 180, description: '기본 군령을 안정적으로 전달한다.' },
  { id: 'officer', nameKo: '훈련도감 장교', minXp: 480, description: '진법과 장단으로 부대를 이끈다.' },
  { id: 'commander', nameKo: '전장의 지휘자', minXp: 900, description: '북소리만으로 전황을 바꿀 수 있다.' },
];

export function rankForXp(xp: number): RankDefinition {
  return [...ranks].reverse().find((rank) => xp >= rank.minXp) ?? ranks[0];
}
