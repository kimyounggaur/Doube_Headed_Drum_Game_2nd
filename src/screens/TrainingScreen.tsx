import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Headphones from 'lucide-react/dist/esm/icons/headphones';
import Play from 'lucide-react/dist/esm/icons/play';
import Swords from 'lucide-react/dist/esm/icons/swords';
import { useState } from 'react';
import type { LevelDefinition, RhythmChart } from '../game/types';
import { Button } from '../components/Button';
import { RhythmLegend } from '../components/RhythmLegend';
import { chartMap, rhythmCharts } from '../data/charts';

interface TrainingScreenProps {
  onBack: () => void;
  onStartTraining: (chart: RhythmChart, mode: 'follow' | 'battle') => void;
}

const trainingCharts = ['level-1-basic', 'byuldalgeori', 'hwimori', 'jajinmori'];

export function TrainingScreen({ onBack, onStartTraining }: TrainingScreenProps) {
  const [listenChart, setListenChart] = useState<RhythmChart | undefined>();

  return (
    <main className="app-screen">
      <header className="screen-header">
        <Button variant="ghost" icon={<ArrowLeft size={17} />} onClick={onBack}>
          돌아가기
        </Button>
        <div>
          <p className="eyebrow">무관 수련</p>
          <h1>장단 훈련</h1>
        </div>
      </header>
      <RhythmLegend />
      <section className="training-grid">
        {trainingCharts.map((chartId) => {
          const chart = chartMap[chartId];
          return (
            <article key={chart.id} className="training-card">
              <p className="eyebrow">{chart.timeSignature} / BPM {chart.bpm}</p>
              <h2>{chart.name}</h2>
              <p>{chart.description}</p>
              <div className="training-actions">
                <Button icon={<Headphones size={16} />} onClick={() => setListenChart(chart)}>
                  듣기
                </Button>
                <Button icon={<Play size={16} />} onClick={() => onStartTraining(chart, 'follow')}>
                  따라치기
                </Button>
                <Button variant="primary" icon={<Swords size={16} />} onClick={() => onStartTraining(chart, 'battle')}>
                  실전 적용
                </Button>
              </div>
            </article>
          );
        })}
        <article className="training-card formation-practice">
          <p className="eyebrow">진법 연습</p>
          <h2>학익진 패턴</h2>
          <p>다-따-다-따-궁-덩 순서로 입력하면 포위 섬멸 진법이 발동합니다.</p>
          <Button variant="primary" onClick={() => onStartTraining(chartMap['level-3-combo'], 'battle')}>
            진법 연습 시작
          </Button>
        </article>
      </section>
      {listenChart ? <ListenPanel chart={listenChart} onClose={() => setListenChart(undefined)} /> : null}
    </main>
  );
}

function ListenPanel({ chart, onClose }: { chart: RhythmChart; onClose: () => void }) {
  const labels = chart.notes.slice(0, 24).map((note) => note.type).join(' · ');
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-panel">
        <p className="eyebrow">듣기 모드</p>
        <h2>{chart.name}</h2>
        <p>{chart.description}</p>
        <div className="chant-line">{labels}</div>
        <p>자동 재생 대신 구음 흐름을 먼저 눈으로 익히는 간단 듣기 패널입니다. 실제 판정은 따라치기에서 시작됩니다.</p>
        <Button variant="primary" onClick={onClose}>
          닫기
        </Button>
      </div>
    </div>
  );
}

export function trainingLevelForChart(chart: RhythmChart, mode: 'follow' | 'battle'): LevelDefinition {
  return {
    id: `training-${chart.id}-${mode}`,
    chapter: 0,
    titleKo: mode === 'battle' ? `${chart.name} 실전 적용` : `${chart.name} 따라치기`,
    subtitle: '무관 수련',
    mode: 'training',
    backgroundKey: chart.id === 'hwimori' ? 'hwimori' : chart.id === 'jajinmori' ? 'jajinmori' : 'strokes',
    chartIds: [chart.id],
    enemyProfile: mode === 'battle' ? '훈련용 전장 시뮬레이션' : '박자 교관',
    objective: mode === 'battle' ? '장단을 전투 명령으로 연결하라.' : '판정선에 맞춰 장단을 따라 치라.',
    difficulty: chart.difficulty,
    trainingRhythm: chart.name,
    primaryCommands: ['Gung', 'Gu', 'Tta', 'Da', 'Dung', 'Deo'],
    reward: '훈련 XP',
    clearCondition: '차트 완료',
  };
}
