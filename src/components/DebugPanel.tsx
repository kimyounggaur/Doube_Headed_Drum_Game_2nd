import type { BattleState, VisualEffect } from '../game/types';

interface DebugPanelProps {
  currentTime: number;
  currentBeat: number;
  offsetMs: number;
  activeNotes: number;
  recentInput: string;
  battleState: BattleState;
  patternBuffer: string;
  fps: number;
  effects: VisualEffect[];
}

export function DebugPanel({
  currentTime,
  currentBeat,
  offsetMs,
  activeNotes,
  recentInput,
  battleState,
  patternBuffer,
  fps,
  effects,
}: DebugPanelProps) {
  return (
    <aside className="debug-panel">
      <strong>Debug</strong>
      <span>time {Math.round(currentTime)}ms</span>
      <span>beat {currentBeat.toFixed(2)}</span>
      <span>offset {offsetMs}ms</span>
      <span>active notes {activeNotes}</span>
      <span>input {recentInput}</span>
      <span>balance {battleState.battleBalance.toFixed(1)}</span>
      <span>HP {battleState.allyHP.toFixed(1)} / {battleState.enemyHP.toFixed(1)}</span>
      <span>pattern {patternBuffer}</span>
      <span>effects {effects.length}</span>
      <span>fps {Math.round(fps)}</span>
    </aside>
  );
}
