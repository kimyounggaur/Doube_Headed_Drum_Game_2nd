import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import Check from 'lucide-react/dist/esm/icons/check';
import Lock from 'lucide-react/dist/esm/icons/lock';
import type { EquipmentDefinition, GameProgress } from '../game/types';
import { Button } from '../components/Button';
import { Panel } from '../components/Panel';
import { RankBadge } from '../components/RankBadge';
import { equipment } from '../data/equipment';
import { ranks } from '../data/ranks';

interface EquipmentScreenProps {
  progress: GameProgress;
  onBack: () => void;
  onEquip: (item: EquipmentDefinition) => void;
}

export function EquipmentScreen({ progress, onBack, onEquip }: EquipmentScreenProps) {
  return (
    <main className="app-screen">
      <header className="screen-header">
        <Button variant="ghost" icon={<ArrowLeft size={17} />} onClick={onBack}>
          돌아가기
        </Button>
        <div>
          <p className="eyebrow">성장</p>
          <h1>승진과 장비</h1>
        </div>
      </header>
      <section className="equipment-layout">
        <Panel title="승진 현황" eyebrow="Rank">
          <RankBadge progress={progress} />
          <ol className="rank-list">
            {ranks.map((rank) => (
              <li key={rank.id} className={progress.xp >= rank.minXp ? 'unlocked' : ''}>
                <strong>{rank.nameKo}</strong>
                <span>{rank.minXp} XP</span>
                <p>{rank.description}</p>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="장비 구성" eyebrow="Equipment">
          <div className="equipment-grid">
            {equipment.map((item) => {
              const unlocked = progress.unlockedEquipment.includes(item.id) || progress.xp >= item.unlockXp;
              const equipped = progress.equipped[item.slot] === item.id;
              return (
                <article key={item.id} className={`equipment-card ${equipped ? 'equipped' : ''}`}>
                  <div>
                    <p className="eyebrow">{slotName(item.slot)}</p>
                    <h3>{item.nameKo}</h3>
                    <p>{item.description}</p>
                    <small>{effectText(item)}</small>
                  </div>
                  <Button
                    variant={equipped ? 'primary' : 'secondary'}
                    icon={unlocked ? <Check size={16} /> : <Lock size={16} />}
                    disabled={!unlocked}
                    onClick={() => onEquip(item)}
                  >
                    {equipped ? '장착 중' : unlocked ? '장착' : `${item.unlockXp} XP`}
                  </Button>
                </article>
              );
            })}
          </div>
        </Panel>
      </section>
    </main>
  );
}

function slotName(slot: EquipmentDefinition['slot']): string {
  return slot === 'drum' ? '악기' : slot === 'robe' ? '복장' : '채';
}

function effectText(item: EquipmentDefinition): string {
  const effects = item.effects;
  const parts = [
    effects.timingWindowBonus ? `판정 +${Math.round(effects.timingWindowBonus * 100)}%` : '',
    effects.commandPowerBonus ? `명령 +${Math.round(effects.commandPowerBonus * 100)}%` : '',
    effects.defenseBonus ? `방어 +${Math.round(effects.defenseBonus * 100)}%` : '',
    effects.noteSpeedBonus ? `속도 ${Math.round(effects.noteSpeedBonus * 100)}%` : '',
  ].filter(Boolean);
  return parts.join(' / ') || '기본 성능';
}
