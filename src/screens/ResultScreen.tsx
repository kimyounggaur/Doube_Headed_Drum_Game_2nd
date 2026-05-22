import Home from 'lucide-react/dist/esm/icons/home';
import RotateCcw from 'lucide-react/dist/esm/icons/rotate-ccw';
import type { BattleResult } from '../game/types';
import { Button } from '../components/Button';
import { Panel } from '../components/Panel';

interface ResultScreenProps {
  result: BattleResult;
  onHome: () => void;
  onRetry: () => void;
}

export function ResultScreen({ result, onHome, onRetry }: ResultScreenProps) {
  return (
    <main className="app-screen compact result-screen">
      <Panel eyebrow={result.victory ? 'Victory' : 'Defeat'} title={result.levelTitle}>
        <div className={`result-grade ${result.victory ? 'win' : 'lose'}`}>{result.grade}</div>
        <dl className="result-stats">
          <div>
            <dt>점수</dt>
            <dd>{result.score.toLocaleString()}</dd>
          </div>
          <div>
            <dt>정확도</dt>
            <dd>{Math.round(result.accuracy)}%</dd>
          </div>
          <div>
            <dt>최대 콤보</dt>
            <dd>{result.maxCombo}</dd>
          </div>
          <div>
            <dt>XP</dt>
            <dd>+{result.xpGained}</dd>
          </div>
        </dl>
        {result.unlocked.length > 0 ? <p className="unlock-line">해금: {result.unlocked.join(', ')}</p> : null}
        <div className="menu-actions">
          <Button variant="primary" icon={<Home size={17} />} onClick={onHome}>
            메인
          </Button>
          <Button icon={<RotateCcw size={17} />} onClick={onRetry}>
            다시 도전
          </Button>
        </div>
      </Panel>
    </main>
  );
}
