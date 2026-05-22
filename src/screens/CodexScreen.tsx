import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Play from 'lucide-react/dist/esm/icons/play';
import type { RhythmChart } from '../game/types';
import { Button } from '../components/Button';
import { codexEntries } from '../data/codex';
import { assets } from '../data/assets';
import { chartMap } from '../data/charts';

interface CodexScreenProps {
  onBack: () => void;
  onPractice: (chart: RhythmChart) => void;
}

export function CodexScreen({ onBack, onPractice }: CodexScreenProps) {
  return (
    <main className="app-screen">
      <header className="screen-header">
        <Button variant="ghost" icon={<ArrowLeft size={17} />} onClick={onBack}>
          돌아가기
        </Button>
        <div>
          <p className="eyebrow">도감</p>
          <h1>군령과 장단</h1>
        </div>
      </header>
      <section className="codex-grid">
        {codexEntries.map((entry) => {
          const image = entry.imageKey ? assets[entry.imageKey] : undefined;
          const chart = entry.practiceChartId ? chartMap[entry.practiceChartId] : undefined;
          return (
            <article key={entry.id} className="codex-card">
              {image ? <img src={image.url} alt={image.title} /> : null}
              <p className="eyebrow">{entry.category}</p>
              <h2>{entry.title}</h2>
              <p>{entry.body}</p>
              {chart ? (
                <Button icon={<Play size={16} />} onClick={() => onPractice(chart)}>
                  연습
                </Button>
              ) : null}
            </article>
          );
        })}
      </section>
    </main>
  );
}
