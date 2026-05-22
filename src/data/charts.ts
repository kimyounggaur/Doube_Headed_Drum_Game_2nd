import type { ChartNote, RhythmChart, StrokeType } from '../game/types';

type PatternToken = StrokeType | { type: StrokeType; accent?: boolean; ghost?: boolean; label?: string; commandHint?: string };

function makeNotes(pattern: PatternToken[], cycles = 1, beatStep = 1, startBeat = 0): ChartNote[] {
  const notes: ChartNote[] = [];
  const patternBeats = pattern.length * beatStep;

  for (let cycle = 0; cycle < cycles; cycle += 1) {
    pattern.forEach((token, index) => {
      const note = typeof token === 'string' ? { type: token } : token;
      if (note.type === 'Rest') {
        return;
      }
      const beat = startBeat + cycle * patternBeats + index * beatStep;
      notes.push({
        id: `n-${startBeat}-${cycle}-${index}-${note.type}`,
        beat,
        type: note.type,
        measure: Math.floor(beat / 4) + 1,
        subdivision: index % 4,
        accent: note.accent,
        ghost: note.ghost ?? (note.type === 'Da' || note.type === 'Deo'),
        label: note.label,
        commandHint: note.commandHint,
      });
    });
  }

  return notes;
}

const levelOnePattern: PatternToken[] = [
  { type: 'Gung', accent: true },
  'Rest',
  { type: 'Tta', accent: true },
  'Rest',
  'Gung',
  'Tta',
  { type: 'Dung', accent: true, commandHint: '전군 총공격' },
  'Rest',
];

const levelTwoPattern: PatternToken[] = [
  { type: 'Gu', ghost: true },
  'Rest',
  { type: 'Da', ghost: true },
  'Rest',
  'Gu',
  'Da',
  { type: 'Deo', ghost: true, commandHint: '산개' },
  'Rest',
  { type: 'Gu', ghost: true },
  { type: 'Gu', ghost: true },
  { type: 'Da', ghost: true },
  { type: 'Deo', ghost: true },
  { type: 'Gung', accent: true, commandHint: '긴급 방패벽' },
  'Rest',
  { type: 'Tta', accent: true, commandHint: '견제 사격' },
  'Rest',
];

const levelThreePattern: PatternToken[] = [
  { type: 'Da', ghost: true },
  { type: 'Tta', accent: true, commandHint: '돌격 견제' },
  { type: 'Da', ghost: true },
  { type: 'Tta', accent: true },
  { type: 'Gung', accent: true },
  { type: 'Dung', accent: true, commandHint: '학익진 후보' },
  'Rest',
  'Rest',
  { type: 'Gung', accent: true },
  { type: 'Tta', accent: true },
  { type: 'Gung', accent: true },
  { type: 'Tta', accent: true, commandHint: '원진 후보' },
  { type: 'Dung', accent: true },
  'Gung',
  'Tta',
  'Rest',
];

const byuldalPattern: PatternToken[] = [
  { type: 'Dung', accent: true, label: '덩' },
  'Rest',
  { type: 'Dung', accent: true, label: '덩' },
  'Rest',
  { type: 'Gung', accent: true, label: '궁' },
  { type: 'Tta', accent: true, label: '따' },
  'Gung',
  'Rest',
];

const hwimoriPattern: PatternToken[] = [
  { type: 'Dung', accent: true },
  { type: 'Da', ghost: true },
  { type: 'Da', ghost: true },
  { type: 'Gung', accent: true },
  { type: 'Tta', accent: true },
  'Gung',
  'Tta',
  'Rest',
];

const jajinmoriPattern: PatternToken[] = [
  { type: 'Dung', accent: true },
  'Rest',
  'Rest',
  { type: 'Dung', accent: true },
  'Rest',
  'Rest',
  { type: 'Gung', accent: true },
  { type: 'Tta', accent: true },
  'Gung',
  'Rest',
  'Rest',
  'Rest',
];

export const rhythmCharts: RhythmChart[] = [
  {
    id: 'level-1-basic',
    name: '신병 훈련소 기본 타법',
    timeSignature: '4/4',
    bpm: 80,
    subdivision: 4,
    notes: makeNotes(levelOnePattern, 5),
    description: '궁, 따, 덩을 익히며 성벽 앞 전열을 세운다.',
    tacticalUse: '방어와 사격의 기본 명령',
    difficulty: 1,
  },
  {
    id: 'level-2-dynamics',
    name: '첫 번째 보초 근무 강약 조절',
    timeSignature: '4/4',
    bpm: 72,
    subdivision: 4,
    notes: makeNotes(levelTwoPattern, 4),
    description: '작은 소리의 구, 다, 더로 경보를 낮추고 잠입을 막는다.',
    tacticalUse: '소리 없는 대기와 산개',
    difficulty: 2,
  },
  {
    id: 'level-3-combo',
    name: '왜구의 기습 진법 콤보',
    timeSignature: '4/4',
    bpm: 96,
    subdivision: 4,
    notes: makeNotes(levelThreePattern, 5, 0.75),
    description: '연속 장단으로 포위와 방어 진법을 실제 전투에 적용한다.',
    tacticalUse: '학익진, 원진, 장사진 발동',
    difficulty: 3,
  },
  {
    id: 'byuldalgeori',
    name: '별달거리',
    timeSignature: '4/4',
    bpm: 118,
    subdivision: 8,
    notes: makeNotes(byuldalPattern, 6, 0.5),
    description: '경쾌한 네 박 장단. 보너스와 피버 구간에 어울린다.',
    tacticalUse: '화차 지원과 사기 상승',
    difficulty: 3,
  },
  {
    id: 'hwimori',
    name: '휘모리',
    timeSignature: '4/4',
    bpm: 150,
    subdivision: 8,
    notes: makeNotes(hwimoriPattern, 7, 0.5),
    description: '빠르게 몰아치는 장단. 전투 절정의 총력전에 쓰인다.',
    tacticalUse: '행주 대첩 피날레, 빠른 돌파',
    difficulty: 5,
  },
  {
    id: 'jajinmori',
    name: '자진모리',
    timeSignature: '12/8',
    bpm: 108,
    subdivision: 12,
    notes: makeNotes(jajinmoriPattern, 5, 1 / 3),
    description: '12/8 셔플 흐름의 삼채형 장단. 선회와 포격 타이밍에 맞다.',
    tacticalUse: '한산도 선회와 포격 준비',
    difficulty: 4,
  },
  {
    id: 'hansando-beta',
    name: '한산도 대첩 선회 포격',
    timeSignature: '12/8',
    bpm: 112,
    subdivision: 12,
    notes: [...makeNotes(jajinmoriPattern, 3, 1 / 3), ...makeNotes(levelThreePattern, 2, 0.75, 16)],
    description: '판옥선의 선회와 포격, 학익진 전개를 베타 형태로 체험한다.',
    tacticalUse: '선회, 포격, 학익진',
    difficulty: 4,
  },
  {
    id: 'haengju-beta',
    name: '행주 대첩 휘모리 총력전',
    timeSignature: '4/4',
    bpm: 146,
    subdivision: 8,
    notes: [...makeNotes(jajinmoriPattern, 2, 1 / 3), ...makeNotes(hwimoriPattern, 5, 0.5, 10)],
    description: '자진모리로 시작해 휘모리 피날레로 밀어붙이는 방어전.',
    tacticalUse: '민병 지원과 피버 방어',
    difficulty: 5,
  },
];

export const chartMap = Object.fromEntries(rhythmCharts.map((chart) => [chart.id, chart])) as Record<string, RhythmChart>;
