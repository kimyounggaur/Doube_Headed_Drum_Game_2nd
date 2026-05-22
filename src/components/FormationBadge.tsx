import { formationRecipes } from '../data/formations';

interface FormationBadgeProps {
  activeId?: string;
  candidateId?: string;
  progress?: number;
}

export function FormationBadge({ activeId, candidateId, progress = 0 }: FormationBadgeProps) {
  const active = formationRecipes.find((recipe) => recipe.id === activeId);
  const candidate = formationRecipes.find((recipe) => recipe.id === candidateId);

  return (
    <div className="formation-badge">
      <span>진법</span>
      <strong>{active?.nameKo ?? candidate?.nameKo ?? '대기'}</strong>
      <div className="formation-progress">
        <span style={{ width: `${active ? 100 : Math.round(progress * 100)}%` }} />
      </div>
      <small>{active?.effectDescription ?? candidate?.effectDescription ?? '장단을 이어 진법을 완성하세요.'}</small>
    </div>
  );
}
