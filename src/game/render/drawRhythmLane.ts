import { APPROACH_TIME_MS } from '../constants';
import type { RhythmChart, StrokeType, VisualEffect } from '../types';
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
  const top = height * 0.58;
  const laneHeight = height - top;
  const hitY = top + laneHeight * 0.78;
  const laneLeftX = width * 0.3;
  const laneRightX = width * 0.7;
  const laneBothX = width * 0.5;

  ctx.save();
  drawWoodCommandDeck(ctx, width, top, laneHeight);
  drawBeatGrid(ctx, width, top, hitY, chart, currentTimeMs);
  drawCommandIcon(ctx, laneLeftX, top + laneHeight * 0.38, '궁편', '방어/이동', '#65d6f0');
  drawCommandIcon(ctx, laneRightX, top + laneHeight * 0.38, '채편', '포격/사격', '#ffc04a');
  drawZoneLabel(ctx, laneBothX, top + laneHeight - 22, '양편 동시 입력');
  drawGlowingHitLine(ctx, width, hitY);

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
      ctx.fillStyle = '#fff2c6';
      ctx.font = '900 16px system-ui';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ffb43d';
      ctx.shadowBlur = 10;
      ctx.fillText('조준 완료', laneRightX, hitY - 76);
      ctx.restore();
    }
  });

  ctx.restore();
}

function drawWoodCommandDeck(ctx: CanvasRenderingContext2D, width: number, top: number, laneHeight: number): void {
  const wood = ctx.createLinearGradient(0, top, 0, top + laneHeight);
  wood.addColorStop(0, '#765338');
  wood.addColorStop(0.48, '#5a3926');
  wood.addColorStop(1, '#2f2018');
  ctx.fillStyle = wood;
  ctx.fillRect(0, top, width, laneHeight);

  ctx.fillStyle = 'rgba(255, 232, 180, 0.08)';
  for (let x = -40; x < width; x += 84) {
    ctx.fillRect(x, top, 16, laneHeight);
  }

  ctx.strokeStyle = 'rgba(255, 219, 152, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2, top + 36);
  ctx.lineTo(width / 2, top + laneHeight - 36);
  ctx.stroke();

  ctx.strokeStyle = '#23150d';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, top + 4);
  ctx.lineTo(width, top + 4);
  ctx.stroke();
}

function drawBeatGrid(ctx: CanvasRenderingContext2D, width: number, top: number, hitY: number, chart: RhythmChart, currentTimeMs: number): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 239, 201, 0.14)';
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

function drawCommandIcon(ctx: CanvasRenderingContext2D, x: number, y: number, title: string, subtitle: string, accent: string): void {
  ctx.save();
  ctx.textAlign = 'center';

  ctx.fillStyle = 'rgba(15, 19, 28, 0.42)';
  ctx.beginPath();
  ctx.arc(x, y - 18, 42, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = accent;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 13;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#fff1cf';
  ctx.font = '950 24px system-ui';
  ctx.shadowColor = '#0f0b08';
  ctx.shadowBlur = 3;
  ctx.fillText(title, x, y + 42);
  ctx.font = '900 14px system-ui';
  ctx.fillText(`(${subtitle})`, x, y + 64);
  ctx.restore();
}

function drawGlowingHitLine(ctx: CanvasRenderingContext2D, width: number, y: number): void {
  ctx.save();
  ctx.shadowColor = '#ffd64f';
  ctx.shadowBlur = 20;
  ctx.strokeStyle = '#ffd64f';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.fillStyle = '#ffd64f';
  ctx.font = '950 20px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('Hit Line', width / 2, y + 34);
  ctx.restore();
}

function drawZoneLabel(ctx: CanvasRenderingContext2D, x: number, y: number, text: string): void {
  ctx.save();
  ctx.fillStyle = '#f7d79a';
  ctx.font = '900 13px system-ui';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#21140c';
  ctx.shadowBlur = 4;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawNote(ctx: CanvasRenderingContext2D, x: number, y: number, stroke: StrokeType, accent?: boolean, ghost?: boolean): void {
  const radius = stroke === 'Dung' ? 24 : stroke === 'Deo' ? 20 : accent ? 22 : ghost ? 12 : 17;
  const color = noteColor(stroke);
  ctx.save();
  ctx.globalAlpha = ghost ? 0.72 : 1;
  ctx.shadowColor = color;
  ctx.shadowBlur = accent ? 16 : 10;
  ctx.fillStyle = color;
  ctx.strokeStyle = stroke === 'Dung' || stroke === 'Deo' ? '#fff1b8' : '#fff6d7';
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
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#17120d';
  ctx.font = `950 ${radius}px system-ui`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(noteLabel(stroke), x, y + 1);
  ctx.restore();
}
