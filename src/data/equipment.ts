import type { EquipmentDefinition } from '../game/types';

export const equipment: EquipmentDefinition[] = [
  {
    id: 'training-janggu',
    nameKo: '교련용 장구',
    slot: 'drum',
    description: '훈련소에서 지급되는 기본 장구. 균형 잡힌 소리를 낸다.',
    unlockXp: 0,
    effects: {},
  },
  {
    id: 'yonggo',
    nameKo: '용고',
    slot: 'drum',
    description: '어깨에 메고 치는 전장 북. 명령 위력이 오른다.',
    unlockXp: 450,
    effects: { commandPowerBonus: 0.08 },
  },
  {
    id: 'singijeon-drum',
    nameKo: '신기전 지원 장구',
    slot: 'drum',
    description: '진법 성공 후 포격 연출과 피버 상승이 강해진다.',
    unlockXp: 850,
    effects: { commandPowerBonus: 0.12 },
  },
  {
    id: 'cheollik',
    nameKo: '철릭',
    slot: 'robe',
    description: '기본 군복. 가볍고 움직임이 편하다.',
    unlockXp: 0,
    effects: {},
  },
  {
    id: 'dujeonggap',
    nameKo: '두정갑',
    slot: 'robe',
    description: '화살과 포격 피해를 줄이는 갑옷.',
    unlockXp: 320,
    effects: { defenseBonus: 0.08 },
  },
  {
    id: 'bamboo-stick',
    nameKo: '대나무 채',
    slot: 'stick',
    description: '가볍고 탄력 있는 채. 빠른 장단의 입력 부담을 줄인다.',
    unlockXp: 0,
    effects: { timingWindowBonus: 0.05 },
  },
  {
    id: 'horn-stick',
    nameKo: '물소뿔 채',
    slot: 'stick',
    description: '무겁지만 울림이 커서 판정 범위를 조금 넓힌다.',
    unlockXp: 580,
    effects: { timingWindowBonus: 0.1, noteSpeedBonus: -0.04 },
  },
];

export const equipmentMap = Object.fromEntries(equipment.map((item) => [item.id, item])) as Record<string, EquipmentDefinition>;
