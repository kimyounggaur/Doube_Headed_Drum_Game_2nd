import type { BattleState } from '../game/types';
import { percent } from '../game/math';

interface BattleStatusBarProps {
  state: BattleState;
}

export function BattleStatusBar({ state }: BattleStatusBarProps) {
  const ally = state.battleBalance;
  const enemy = 100 - state.battleBalance;

  return (
    <div className="battle-status" aria-label="전황">
      <div className="battle-status-row">
        <strong>아군 {percent(ally)}</strong>
        <span>전황</span>
        <strong>적군 {percent(enemy)}</strong>
      </div>
      <div className="duel-gauge">
        <span className="duel-gauge-ally" style={{ width: `${ally}%` }} />
        <span className="duel-gauge-marker" style={{ left: `${ally}%` }} />
      </div>
      <div className="battle-mini">
        <span>아군 체력 {percent(state.allyHP)}</span>
        <span>사기 {percent(state.allyMorale)}</span>
        <span>적 압박 {percent(state.enemyPressure)}</span>
        <span>적 체력 {percent(state.enemyHP)}</span>
      </div>
      {state.alertGauge > 0 ? (
        <div className="alert-gauge" aria-label="경보">
          <span style={{ width: `${state.alertGauge}%` }} />
        </div>
      ) : null}
    </div>
  );
}
