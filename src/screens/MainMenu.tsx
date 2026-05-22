import BookOpen from 'lucide-react/dist/esm/icons/book-open';
import Drum from 'lucide-react/dist/esm/icons/drum';
import Map from 'lucide-react/dist/esm/icons/map';
import Settings from 'lucide-react/dist/esm/icons/settings';
import Shield from 'lucide-react/dist/esm/icons/shield';
import Swords from 'lucide-react/dist/esm/icons/swords';
import type { GameProgress } from '../game/types';
import { Button } from '../components/Button';
import { Panel } from '../components/Panel';
import { RankBadge } from '../components/RankBadge';
import { assets } from '../data/assets';

interface MainMenuProps {
  progress: GameProgress;
  onNavigate: (screen: 'campaign' | 'training' | 'codex' | 'equipment' | 'settings') => void;
}

export function MainMenu({ progress, onNavigate }: MainMenuProps) {
  return (
    <main className="menu-screen">
      <section className="title-band">
        <div className="title-copy">
          <p className="eyebrow">장구 리듬 전략 액션 RPG</p>
          <h1>조선의 북소리: 전장의 지휘자</h1>
          <p>궁편은 방어와 이동, 채편은 공격과 사격. 정확한 장단으로 부대를 움직이고 진법을 완성하세요.</p>
          <div className="menu-actions">
            <Button variant="primary" icon={<Swords size={18} />} onClick={() => onNavigate('campaign')}>
              캠페인
            </Button>
            <Button icon={<Drum size={18} />} onClick={() => onNavigate('training')}>
              훈련
            </Button>
          </div>
        </div>
        <div className="hero-emblem" aria-hidden="true">
          <div className="drum-mark">궁</div>
          <div className="drum-mark right">따</div>
          <div className="flag-mark">令</div>
        </div>
      </section>

      <section className="menu-grid">
        <Panel title="전장 진행" eyebrow="Campaign">
          <div className="thumbnail-strip">
            <img src={assets.campaign.url} alt={assets.campaign.title} />
          </div>
          <p>부산진 전투부터 행주 대첩 베타까지, 장단이 전술로 연결되는 흐름을 따라갑니다.</p>
          <Button icon={<Map size={17} />} onClick={() => onNavigate('campaign')}>
            전장 선택
          </Button>
        </Panel>
        <Panel title="무관 수련" eyebrow="Training">
          <p>기본 타법, 별달거리, 휘모리, 자진모리를 듣기/따라치기/실전 적용 단계로 연습합니다.</p>
          <Button icon={<Drum size={17} />} onClick={() => onNavigate('training')}>
            장단 연습
          </Button>
        </Panel>
        <Panel title="도감" eyebrow="Codex">
          <p>구음, 진법, 장단, 역사 전장 설명을 간결하게 확인하고 바로 연습으로 이동합니다.</p>
          <Button icon={<BookOpen size={17} />} onClick={() => onNavigate('codex')}>
            도감 열기
          </Button>
        </Panel>
        <Panel title="성장과 장비" eyebrow="RPG">
          <RankBadge progress={progress} />
          <Button icon={<Shield size={17} />} onClick={() => onNavigate('equipment')}>
            장비 관리
          </Button>
        </Panel>
      </section>

      <div className="bottom-bar">
        <Button variant="ghost" icon={<Settings size={17} />} onClick={() => onNavigate('settings')}>
          설정
        </Button>
      </div>
    </main>
  );
}
