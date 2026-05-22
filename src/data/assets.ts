export interface AssetEntry {
  key: string;
  url: string;
  title: string;
  fallback: string;
}

export const assets: Record<string, AssetEntry> = {
  wireframe: {
    key: 'wireframe',
    url: 'assets/source/battlefield-wireframe.jpg',
    title: '전투 UI 와이어프레임',
    fallback: '전장 배치도',
  },
  level1: {
    key: 'level1',
    url: 'assets/source/level-1-training.jpg',
    title: '신병 훈련소',
    fallback: '성벽 훈련소',
  },
  level2: {
    key: 'level2',
    url: 'assets/source/level-2-watch.png',
    title: '첫 번째 보초 근무',
    fallback: '야간 보초',
  },
  level3: {
    key: 'level3',
    url: 'assets/source/level-3-ambush.png',
    title: '왜구의 기습',
    fallback: '마을 방어전',
  },
  strokes: {
    key: 'strokes',
    url: 'assets/source/signal-strokes.png',
    title: '구음별 군령',
    fallback: '군령 표',
  },
  formations: {
    key: 'formations',
    url: 'assets/source/signal-formations.png',
    title: '리듬 패턴과 진법',
    fallback: '진법 도감',
  },
  growth: {
    key: 'growth',
    url: 'assets/source/rpg-growth.png',
    title: '승진과 장비',
    fallback: '장비 대장간',
  },
  campaign: {
    key: 'campaign',
    url: 'assets/source/campaign-map.png',
    title: '역사 속 전장',
    fallback: '전장 두루마리',
  },
  panokseon: {
    key: 'panokseon',
    url: 'assets/source/panokseon.png',
    title: '판옥선',
    fallback: '아군 판옥선',
  },
  enemyShip: {
    key: 'enemyShip',
    url: 'assets/source/enemy-ship.png',
    title: '적 기함',
    fallback: '적선',
  },
  formationReference: {
    key: 'formationReference',
    url: 'assets/source/formations-reference.png',
    title: '학익진과 일자진',
    fallback: '진법 참고도',
  },
  hwimori: {
    key: 'hwimori',
    url: 'assets/source/hwimori.png',
    title: '휘모리',
    fallback: '빠른 장단',
  },
  jajinmori: {
    key: 'jajinmori',
    url: 'assets/source/jajinmori.png',
    title: '자진모리',
    fallback: '삼채 장단',
  },
};
