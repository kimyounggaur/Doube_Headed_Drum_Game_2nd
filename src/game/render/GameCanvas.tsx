import { useEffect, useRef } from 'react';
import type { BattleState, GameSettings, LevelDefinition, RhythmChart, VisualEffect } from '../types';
import type { VisibleNote } from '../rhythm/ChartPlayer';
import { drawBattlefield } from './drawBattlefield';
import { drawRhythmLane } from './drawRhythmLane';
import { drawOverlayEffects } from './drawEffects';

interface GameCanvasProps {
  chart: RhythmChart;
  level: LevelDefinition;
  battleState: BattleState;
  currentTimeMs: number;
  visibleNotes: VisibleNote[];
  effects: VisualEffect[];
  settings: GameSettings;
}

export function GameCanvas({ chart, level, battleState, currentTimeMs, visibleNotes, effects, settings }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    drawBattlefield({
      ctx,
      width: rect.width,
      height: rect.height,
      state: battleState,
      level,
      effects,
      now: currentTimeMs,
      reducedMotion: settings.reducedMotion,
    });
    drawRhythmLane({
      ctx,
      width: rect.width,
      height: rect.height,
      chart,
      visibleNotes,
      currentTimeMs,
      noteSpeed: settings.noteSpeed,
      effects,
    });
    drawOverlayEffects(ctx, rect.width, effects, currentTimeMs);
  }, [battleState, chart, currentTimeMs, effects, level, settings, visibleNotes]);

  return <canvas ref={canvasRef} className="game-canvas" aria-label="전장과 리듬 노트" />;
}
