import type { VisualEffect } from '../types';

export function drawOverlayEffects(ctx: CanvasRenderingContext2D, width: number, effects: VisualEffect[], now: number): void {
  const latest = effects.find((effect) => now - effect.createdAt < Math.min(effect.durationMs, 1200));
  if (!latest) {
    return;
  }

  const age = now - latest.createdAt;
  const alpha = Math.max(0, 1 - age / latest.durationMs);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = latest.kind === 'miss' ? 'rgba(47, 37, 31, 0.76)' : 'rgba(33, 48, 57, 0.78)';
  ctx.strokeStyle = latest.kind === 'formation' ? '#d9a63a' : '#f2dfb8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(width / 2 - 170, 92, 340, 58, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = latest.kind === 'miss' ? '#f2d7c2' : '#fff5cf';
  ctx.font = '800 25px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(latest.text, width / 2, 121);
  ctx.restore();
}
