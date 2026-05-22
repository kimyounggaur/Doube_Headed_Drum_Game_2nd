export interface CodexEntry {
  id: string;
  category: 'rhythm' | 'history' | 'formation' | 'command';
  title: string;
  body: string;
  imageKey?: string;
  practiceChartId?: string;
}

export const codexEntries: CodexEntry[] = [
  {
    id: 'janggu-signal',
    category: 'command',
    title: '장구 리듬은 군령이다',
    body: '이 데모에서 궁편은 방어와 이동, 채편은 공격과 사격을 뜻한다. 정확한 장단은 점수가 아니라 실제 부대 행동으로 이어진다.',
    imageKey: 'strokes',
  },
  {
    id: 'byuldalgeori',
    category: 'rhythm',
    title: '별달거리',
    body: '경쾌한 네 박 계열 장단이다. 게임에서는 피버와 화차 지원을 준비하는 보너스 구간으로 연결된다.',
    imageKey: 'campaign',
    practiceChartId: 'byuldalgeori',
  },
  {
    id: 'hwimori',
    category: 'rhythm',
    title: '휘모리',
    body: '매우 빠르게 몰아치는 장단이다. 행주 대첩 피날레처럼 전투가 최고조에 달했을 때 쓰인다.',
    imageKey: 'hwimori',
    practiceChartId: 'hwimori',
  },
  {
    id: 'jajinmori',
    category: 'rhythm',
    title: '자진모리',
    body: '12/8 셔플 느낌의 장단이다. 한산도 해전에서는 선회와 포격 사이의 호흡으로 쓰인다.',
    imageKey: 'jajinmori',
    practiceChartId: 'jajinmori',
  },
  {
    id: 'hakyikjin',
    category: 'formation',
    title: '학익진',
    body: '양 날개를 펼치듯 아군이 반원으로 벌어져 적을 감싸는 전술이다. 다-따-다-따-궁-덩 패턴으로 발동한다.',
    imageKey: 'formationReference',
  },
  {
    id: 'busanjin',
    category: 'history',
    title: '부산진 전투',
    body: '초반 튜토리얼은 성벽 방어전의 맥락으로 기본 군령을 익히도록 구성했다.',
    imageKey: 'level1',
  },
  {
    id: 'hansando',
    category: 'history',
    title: '한산도 대첩',
    body: '해전 베타 레벨은 판옥선 선회, 포격 준비, 학익진 전개를 리듬으로 연결한다.',
    imageKey: 'panokseon',
  },
];
