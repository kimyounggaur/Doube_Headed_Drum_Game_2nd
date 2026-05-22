import type { BattleState, LevelDefinition, VisualEffect } from '../types';

interface DrawBattlefieldParams {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  state: BattleState;
  level: LevelDefinition;
  effects: VisualEffect[];
  now: number;
  reducedMotion: boolean;
}

export function drawBattlefield({ ctx, width, height, state, level, effects, now, reducedMotion }: DrawBattlefieldParams): void {
  const fieldHeight = height * 0.56;
  const terrain = terrainForLevel(level.id);

  ctx.save();
  ctx.fillStyle = terrain.sky;
  ctx.fillRect(0, 0, width, fieldHeight);
  ctx.fillStyle = terrain.ground;
  ctx.fillRect(0, fieldHeight * 0.62, width, fieldHeight * 0.38);

  if (level.id === 'hansando') {
    drawWaves(ctx, width, fieldHeight, now, reducedMotion);
  } else {
    drawDust(ctx, width, fieldHeight, now, reducedMotion);
  }

  const allyX = width * (0.18 + state.battleBalance * 0.0012);
  const enemyX = width * (0.82 - state.battleBalance * 0.0012);
  drawArmy(ctx, allyX, fieldHeight * 0.68, '#2f8ee8', '아군', state.allyMorale, level.id === 'hansando');
  drawArmy(ctx, enemyX, fieldHeight * 0.68, '#d84b42', '적군', state.enemyMorale, level.id === 'hansando');

  if (state.buffs.shieldUntil > now) {
    drawShieldWall(ctx, allyX + 46, fieldHeight * 0.62);
  }

  effects.forEach((effect) => {
    const age = now - effect.createdAt;
    const alpha = Math.max(0, 1 - age / effect.durationMs);
    if (effect.kind === 'arrow' || effect.kind === 'cannon') {
      drawProjectile(ctx, allyX + 70, enemyX - 70, fieldHeight * 0.45, alpha, effect.kind);
    }
    if (effect.kind === 'scatter') {
      drawScatter(ctx, allyX, fieldHeight * 0.68, alpha);
    }
    if (effect.kind === 'formation') {
      drawFormation(ctx, width, fieldHeight, alpha, state.activeFormationId);
    }
    if (effect.kind === 'miss') {
      drawShakeMarks(ctx, allyX, fieldHeight * 0.48, alpha);
    }
  });

  ctx.restore();
}

function terrainForLevel(levelId: string) {
  if (levelId === 'hansando') {
    return { sky: '#17364c', ground: '#1f6d7b' };
  }
  if (levelId === 'night-watch') {
    return { sky: '#131d2b', ground: '#25333c' };
  }
  if (levelId === 'haengju') {
    return { sky: '#2b2433', ground: '#584832' };
  }
  return { sky: '#19304a', ground: '#4c4734' };
}

function drawArmy(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  label: string,
  morale: number,
  ship: boolean,
): void {
  ctx.save();
  ctx.fillStyle = color;
  if (ship) {
    ctx.beginPath();
    ctx.moveTo(x - 72, y + 18);
    ctx.lineTo(x + 72, y + 18);
    ctx.lineTo(x + 48, y + 44);
    ctx.lineTo(x - 50, y + 44);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#efe2c3';
    ctx.fillRect(x - 36, y - 18, 72, 26);
  } else {
    for (let i = 0; i < 7; i += 1) {
      ctx.beginPath();
      ctx.arc(x + (i - 3) * 16, y + (i % 2) * 8, 6 + morale / 40, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#cda55a';
    ctx.fillRect(x - 4, y - 58, 8, 52);
    ctx.fillStyle = color;
    ctx.fillRect(x + 2, y - 56, 34, 20);
  }
  ctx.fillStyle = '#f7efd7';
  ctx.font = '600 13px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(label, x, y + 68);
  ctx.restore();
}

function drawShieldWall(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.save();
  ctx.strokeStyle = '#8bd3ff';
  ctx.lineWidth = 4;
  for (let i = 0; i < 5; i += 1) {
    ctx.strokeRect(x + i * 12, y - 38, 10, 46);
  }
  ctx.restore();
}

function drawProjectile(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  toX: number,
  y: number,
  alpha: number,
  kind: 'arrow' | 'cannon',
): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = kind === 'arrow' ? '#f4d39b' : '#d9a63a';
  ctx.lineWidth = kind === 'arrow' ? 2 : 5;
  for (let i = 0; i < (kind === 'arrow' ? 5 : 2); i += 1) {
    const offset = (i - 2) * 12;
    ctx.beginPath();
    ctx.moveTo(fromX, y + offset);
    ctx.quadraticCurveTo((fromX + toX) / 2, y - 70 + offset, toX, y + offset * 0.4);
    ctx.stroke();
  }
  ctx.restore();
}

function drawScatter(ctx: CanvasRenderingContext2D, x: number, y: number, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#c7d1d8';
  ctx.lineWidth = 2;
  for (let i = 0; i < 8; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(i) * 80, y + Math.sin(i) * 28);
    ctx.stroke();
  }
  ctx.restore();
}

function drawFormation(ctx: CanvasRenderingContext2D, width: number, fieldHeight: number, alpha: number, id?: string): void {
  ctx.save();
  ctx.globalAlpha = alpha * 0.9;
  ctx.strokeStyle = '#d9a63a';
  ctx.lineWidth = 4;
  if (id === 'hakyikjin') {
    ctx.beginPath();
    ctx.arc(width / 2, fieldHeight * 0.66, 130, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
  } else if (id === 'wonjin') {
    ctx.beginPath();
    ctx.arc(width * 0.34, fieldHeight * 0.66, 70, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(width * 0.25, fieldHeight * 0.62);
    ctx.lineTo(width * 0.55, fieldHeight * 0.62);
    ctx.stroke();
  }
  ctx.restore();
}

function drawShakeMarks(ctx: CanvasRenderingContext2D, x: number, y: number, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#30251f';
  ctx.lineWidth = 3;
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x - 54 + i * 20, y);
    ctx.lineTo(x - 44 + i * 20, y + 22);
    ctx.lineTo(x - 60 + i * 20, y + 42);
    ctx.stroke();
  }
  ctx.restore();
}

function drawWaves(ctx: CanvasRenderingContext2D, width: number, height: number, now: number, reducedMotion: boolean): void {
  ctx.save();
  ctx.strokeStyle = 'rgba(215, 238, 242, 0.35)';
  ctx.lineWidth = 2;
  const phase = reducedMotion ? 0 : now / 600;
  for (let row = 0; row < 5; row += 1) {
    ctx.beginPath();
    const y = height * 0.68 + row * 18;
    for (let x = 0; x <= width; x += 20) {
      const wave = Math.sin(x / 28 + phase + row) * 5;
      if (x === 0) {
        ctx.moveTo(x, y + wave);
      } else {
        ctx.lineTo(x, y + wave);
      }
    }
    ctx.stroke();
  }
  ctx.restore();
}

function drawDust(ctx: CanvasRenderingContext2D, width: number, height: number, now: number, reducedMotion: boolean): void {
  ctx.save();
  ctx.fillStyle = 'rgba(230, 211, 170, 0.12)';
  const drift = reducedMotion ? 0 : (now / 80) % 30;
  for (let i = 0; i < 16; i += 1) {
    ctx.beginPath();
    ctx.arc((i * 83 + drift) % width, height * 0.72 + (i % 4) * 18, 5 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
