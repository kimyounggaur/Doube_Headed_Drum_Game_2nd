import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Lock from 'lucide-react/dist/esm/icons/lock';
import Play from 'lucide-react/dist/esm/icons/play';
import Star from 'lucide-react/dist/esm/icons/star';
import type { GameProgress, LevelDefinition } from '../game/types';
import { Button } from '../components/Button';
import { levels } from '../data/levels';
import { chartMap } from '../data/charts';
import { strokeMap } from '../data/strokes';
import { assets } from '../data/assets';

interface CampaignScreenProps {
  progress: GameProgress;
  onBack: () => void;
  onStart: (level: LevelDefinition) => void;
}

export function CampaignScreen({ progress, onBack, onStart }: CampaignScreenProps) {
  return (
    <main className="app-screen">
      <header className="screen-header">
        <Button variant="ghost" icon={<ArrowLeft size={17} />} onClick={onBack}>
          돌아가기
        </Button>
        <div>
          <p className="eyebrow">역사 속 전장</p>
          <h1>캠페인</h1>
        </div>
      </header>
      <section className="campaign-list">
        {levels.map((level) => {
          const unlocked = progress.unlockedLevels.includes(level.id) || level.beta;
          const image = assets[level.backgroundKey] ?? assets.campaign;
          const chart = chartMap[level.chartIds[0]];
          return (
            <article key={level.id} className={`campaign-card ${unlocked ? '' : 'locked'}`}>
              <img src={image.url} alt={image.title} />
              <div className="campaign-body">
                <div className="campaign-heading">
                  <p className="eyebrow">제{level.chapter}장 {level.beta ? 'Beta' : ''}</p>
                  <h2>{level.titleKo}</h2>
                  <span className="grade-pill">{progress.bestGrades[level.id] ?? '-'}</span>
                </div>
                <p>{level.subtitle}</p>
                <dl className="meta-grid">
                  <div>
                    <dt>학습 장단</dt>
                    <dd>{level.trainingRhythm}</dd>
                  </div>
                  <div>
                    <dt>BPM</dt>
                    <dd>{chart?.bpm ?? '-'}</dd>
                  </div>
                  <div>
                    <dt>주요 군령</dt>
                    <dd>{level.primaryCommands.map((stroke) => strokeMap[stroke].korean).join(' ')}</dd>
                  </div>
                  <div>
                    <dt>보상</dt>
                    <dd>{level.reward}</dd>
                  </div>
                </dl>
                <p className="objective">{level.objective}</p>
                <Button
                  variant={unlocked ? 'primary' : 'secondary'}
                  icon={unlocked ? <Play size={17} /> : <Lock size={17} />}
                  disabled={!unlocked}
                  onClick={() => onStart(level)}
                >
                  {unlocked ? '시작' : '잠김'}
                </Button>
              </div>
              <div className="difficulty" aria-label={`난이도 ${level.difficulty}`}>
                {Array.from({ length: level.difficulty }, (_, index) => (
                  <Star key={index} size={14} fill="currentColor" />
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
