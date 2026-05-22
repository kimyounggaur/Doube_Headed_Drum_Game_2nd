import { APPROACH_TIME_MS } from '../constants';
import type { RhythmChart, VisualEffect } from '../types';
import type { VisibleNote } from '../rhythm/ChartPlayer';
import { noteColor, noteLabel } from './sprites';

interface DrawRhythmLaneParams {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  chart: RhythmChart;
  visibleNotes: VisibleNote[];
  currentTimeMs: number;
  noteSpeed: number;
  effects: VisualEffect[];
}

export function drawRhythmLane({ ctx, width, height, chart, visibleNotes, currentTimeMs, noteSpeed, effects }: DrawRhythmLaneParams): void {
  const top = height * 0.56;
  const laneHeight = height - top;
  const hitY = top + laneHeight * 0.78;
  const laneLeftX = width * 0.31;
  const laneRightX = width * 0.69;
  const laneBothX = width * 0.5;

  ctx.save();
  ctx.fillStyle = '#ead9b8';
  ctx.fillRect(0, top, width, laneHeight);
  ctx.fillStyle = 'rgba(55, 35, 24, 0.08)';
  ctx.fillRect(width * 0.48, top, width * 0.04, laneHeight);
  ctx.strokeStyle = '#745b37';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, hitY);
  ctx.lineTo(width, hitY);
  ctx.stroke();

  drawBeatGrid(ctx, width, top, hitY, chart, currentTimeMs);
  drawZoneLabel(ctx, laneLeftX, top + 30, '궁편 방어/이동');
  drawZoneLabel(ctx, laneRightX, top + 30, '채편 공격/사격');
  drawZoneLabel(ctx, laneBothX, top + laneHeight - 24, '양편 동시');

  visibleNotes.forEach(({ note, timeMs }) => {
    const delta = timeMs - currentTimeMs;
    const y = hitY - (delta / (APPROACH_TIME_MS / noteSpeed)) * (laneHeight * 0.78);
    const x = note.type === 'Dung' || note.type === 'Deo' ? laneBothX : note.type === 'Gung' || note.type === 'Gu' ? laneLeftX : laneRightX;
    drawNote(ctx, x, y, note.type, note.accent, note.ghost);
  });

  effects.forEach((effect) => {
    const age = currentTimeMs - effect.createdAt;
    const alpha = Math.max(0, 1 - age / effect.durationMs);
    if (effect.kind === 'aim') {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#30251f';
      ctx.font = '700 16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('조준 완료', laneRightX, hitY - 70);
      ctx.restore();
    }
  });

  ctx.restore();
}

function drawBeatGrid(ctx: CanvasRenderingContext2D, width: number, top: number, hitY: number, chart: RhythmChart, currentTimeMs: number): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(84, 62, 37, 0.18)';
  ctx.lineWidth = 1;
  const beatMs = 60_000 / chart.bpm;
  for (let i = -4; i < 16; i += 1) {
    const beatTime = Math.floor(currentTimeMs / beatMs) * beatMs + i * beatMs;
    const delta = beatTime - currentTimeMs;
    const y = hitY - (delta / APPROACH_TIME_MS) * (hitY - top);
    if (y > top && y < hitY + 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function drawZoneLabel(ctx: CanvasRenderingContext2D, x: number, y: number, text: string): void {
  ctx.save();
  ctx.fillStyle = '#60472b';
  ctx.font = '700 13px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawNote(ctx: CanvasRenderingContext2D, x: number, y: number, stroke: RhythmChart['notes'][number]['type'], accent?: boolean, ghost?: boolean): void {
  const radius = stroke === 'Dung' ? 24 : stroke === 'Deo' ? 20 : accent ? 22 : ghost ? 12 : 17;
  ctx.save();
  ctx.globalAlpha = ghost ? 0.72 : 1;
  ctx.fillStyle = noteColor(stroke);
  ctx.strokeStyle = stroke === 'Dung' || stroke === 'Deo' ? '#f8e5a6' : '#fff4cf';
  ctx.lineWidth = accent ? 4 : 2;
  if (stroke === 'Dung' || stroke === 'Deo') {
    ctx.beginPath();
    ctx.roundRect(x - 88, y - radius, 176, radius * 2, radius);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = '#1a1713';
  ctx.font = `800 ${radius}px system-ui`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(noteLabel(stroke), x, y + 1);
  ctx.restore();
}
