import type { GameProgress } from '../game/types';
import { rankForXp } from '../data/ranks';

interface RankBadgeProps {
  progress: GameProgress;
}

export function RankBadge({ progress }: RankBadgeProps) {
  const rank = rankForXp(progress.xp);

  return (
    <div className="rank-badge">
      <span>계급</span>
      <strong>{rank.nameKo}</strong>
      <small>{progress.xp} XP</small>
    </div>
  );
}
