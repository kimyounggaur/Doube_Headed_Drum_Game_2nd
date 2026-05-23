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
  const fieldHeight = height * 0.58;
  const isNaval = level.id === 'hansando';

  ctx.save();
  drawSkyAndSea(ctx, width, fieldHeight, isNaval);
  drawWaterRibbon(ctx, width, fieldHeight, now, reducedMotion);

  const allyX = width * (0.2 + state.battleBalance * 0.001);
  const enemyX = width * (0.8 - state.battleBalance * 0.001);

  if (isNaval) {
    drawPanokseonFleet(ctx, width, fieldHeight, allyX, enemyX, state, now, reducedMotion);
  } else {
    drawLandFormation(ctx, width, fieldHeight, allyX, enemyX, state, level.id, now, reducedMotion);
  }

  if (state.buffs.shieldUntil > now) {
    drawShieldWall(ctx, allyX + 50, fieldHeight * 0.69);
  }

  effects.forEach((effect) => {
    const age = now - effect.createdAt;
    const alpha = Math.max(0, 1 - age / effect.durationMs);
    if (effect.kind === 'arrow' || effect.kind === 'cannon') {
      drawProjectile(ctx, allyX + 70, enemyX - 70, fieldHeight * 0.42, alpha, effect.kind);
    }
    if (effect.kind === 'scatter') {
      drawScatter(ctx, allyX, fieldHeight * 0.7, alpha);
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

function drawSkyAndSea(ctx: CanvasRenderingContext2D, width: number, fieldHeight: number, naval: boolean): void {
  const sky = ctx.createLinearGradient(0, 0, 0, fieldHeight);
  sky.addColorStop(0, naval ? '#071849' : '#10233d');
  sky.addColorStop(0.5, naval ? '#122e74' : '#1b3349');
  sky.addColorStop(1, naval ? '#071845' : '#25333c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, width, fieldHeight);

  const sea = ctx.createLinearGradient(0, fieldHeight * 0.48, 0, fieldHeight);
  sea.addColorStop(0, naval ? '#183c83' : '#35553f');
  sea.addColorStop(1, naval ? '#08194c' : '#584832');
  ctx.fillStyle = sea;
  ctx.fillRect(0, fieldHeight * 0.48, width, fieldHeight * 0.52);

  ctx.fillStyle = 'rgba(255, 245, 211, 0.9)';
  ctx.font = '900 18px system-ui';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#05070e';
  ctx.shadowBlur = 5;
  ctx.fillText(naval ? '해전 지휘' : '전장 지휘', width / 2, 28);
  ctx.shadowBlur = 0;
}

function drawPanokseonFleet(
  ctx: CanvasRenderingContext2D,
  width: number,
  fieldHeight: number,
  allyX: number,
  enemyX: number,
  state: BattleState,
  now: number,
  reducedMotion: boolean,
): void {
  const bob = reducedMotion ? 0 : Math.sin(now / 560) * 4;
  const enemyRowY = fieldHeight * 0.31 + bob;
  const allyRowY = fieldHeight * 0.73 - bob;

  for (let i = 0; i < 5; i += 1) {
    const x = width * (0.16 + i * 0.17) + (enemyX - width * 0.8) * 0.24;
    drawWarship(ctx, x, enemyRowY + (i % 2) * 10, '#d84b42', 0.86, '적선', state.enemyMorale / 100);
  }

  for (let i = 0; i < 5; i += 1) {
    const x = width * (0.16 + i * 0.17) + (allyX - width * 0.2) * 0.24;
    drawWarship(ctx, x, allyRowY + (i % 2) * 8, '#2f9caa', 0.92, '판옥선', state.allyMorale / 100);
  }
}

function drawWarship(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  scale: number,
  label: string,
  moraleRatio: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.globalAlpha = 0.55 + moraleRatio * 0.45;
  ctx.strokeStyle = '#351514';
  ctx.lineWidth = 4;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-74, 8);
  ctx.lineTo(72, 8);
  ctx.lineTo(48, 35);
  ctx.lineTo(-52, 35);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#814b2a';
  ctx.fillRect(-54, -11, 108, 24);
  ctx.strokeRect(-54, -11, 108, 24);

  ctx.fillStyle = '#ead9b8';
  ctx.beginPath();
  ctx.moveTo(-16, -66);
  ctx.lineTo(46, -52);
  ctx.lineTo(46, -12);
  ctx.lineTo(-16, -20);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = '#452315';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-16, -70);
  ctx.lineTo(-16, 0);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255, 239, 201, 0.58)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    ctx.beginPath();
    ctx.moveTo(-52 + i * 24, 36);
    ctx.lineTo(-70 + i * 24, 52);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.fillStyle = '#fff2d2';
  ctx.font = '900 13px system-ui';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#08080b';
  ctx.shadowBlur = 4;
  ctx.fillText(label, 0, 70);
  ctx.restore();
}

function drawLandFormation(
  ctx: CanvasRenderingContext2D,
  width: number,
  fieldHeight: number,
  allyX: number,
  enemyX: number,
  state: BattleState,
  levelId: string,
  now: number,
  reducedMotion: boolean,
): void {
  const drift = reducedMotion ? 0 : Math.sin(now / 700) * 5;
  drawFortress(ctx, width, fieldHeight, levelId);
  drawInfantry(ctx, allyX, fieldHeight * 0.7 + drift, '#2f8ee8', '아군', state.allyMorale);
  drawInfantry(ctx, enemyX, fieldHeight * 0.36 - drift, '#d84b42', '적군', state.enemyMorale);
}

function drawFortress(ctx: CanvasRenderingContext2D, width: number, fieldHeight: number, levelId: string): void {
  ctx.save();
  ctx.globalAlpha = levelId === 'night-watch' ? 0.38 : 0.24;
  ctx.fillStyle = '#1b1615';
  ctx.fillRect(0, fieldHeight * 0.48, width, fieldHeight * 0.09);
  for (let x = 0; x < width; x += 42) {
    ctx.fillRect(x, fieldHeight * 0.43, 24, fieldHeight * 0.08);
  }
  ctx.restore();
}

function drawInfantry(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, label: string, morale: number): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = '#101016';
  ctx.lineWidth = 2;
  for (let i = 0; i < 9; i += 1) {
    const ox = (i - 4) * 18;
    const oy = (i % 3) * 10;
    ctx.beginPath();
    ctx.arc(x + ox, y + oy, 6 + morale / 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + ox, y + oy + 8);
    ctx.lineTo(x + ox, y + oy + 28);
    ctx.stroke();
  }
  ctx.fillStyle = '#f7efd7';
  ctx.font = '900 13px system-ui';
  ctx.textAlign = 'center';
  ctx.shadowColor = '#06070a';
  ctx.shadowBlur = 5;
  ctx.fillText(label, x, y + 58);
  ctx.restore();
}

function drawShieldWall(ctx: CanvasRenderingContext2D, x: number, y: number): void {
  ctx.save();
  ctx.strokeStyle = '#9de4ff';
  ctx.shadowColor = '#7bd8ff';
  ctx.shadowBlur = 13;
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
  ctx.strokeStyle = kind === 'arrow' ? '#f4d39b' : '#ffd35f';
  ctx.shadowColor = kind === 'arrow' ? '#ffe4a6' : '#ff9f3d';
  ctx.shadowBlur = kind === 'arrow' ? 7 : 15;
  ctx.lineWidth = kind === 'arrow' ? 2 : 6;
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
  ctx.strokeStyle = '#9de4ff';
  ctx.shadowColor = '#7bd8ff';
  ctx.shadowBlur = 16;
  ctx.lineWidth = 5;
  if (id === 'hakyikjin') {
    ctx.beginPath();
    ctx.arc(width / 2, fieldHeight * 0.58, 130, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
  } else if (id === 'wonjin') {
    ctx.beginPath();
    ctx.arc(width * 0.5, fieldHeight * 0.61, 76, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(width * 0.24, fieldHeight * 0.55);
    ctx.lineTo(width * 0.76, fieldHeight * 0.55);
    ctx.stroke();
  }
  ctx.restore();
}

function drawShakeMarks(ctx: CanvasRenderingContext2D, x: number, y: number, alpha: number): void {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#fbe0a0';
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

function drawWaterRibbon(ctx: CanvasRenderingContext2D, width: number, height: number, now: number, reducedMotion: boolean): void {
  ctx.save();
  const phase = reducedMotion ? 0 : now / 450;
  const baseY = height * 0.52;

  ctx.fillStyle = 'rgba(98, 215, 232, 0.18)';
  ctx.fillRect(0, baseY - 28, width, 58);

  for (let row = 0; row < 4; row += 1) {
    const y = baseY - 18 + row * 14;
    ctx.beginPath();
    for (let x = -40; x <= width + 40; x += 16) {
      const wave = Math.sin(x / 28 + phase + row) * (7 + row);
      if (x === -40) {
        ctx.moveTo(x, y + wave);
      } else {
        ctx.lineTo(x, y + wave);
      }
    }
    ctx.strokeStyle = row === 0 ? '#c9fbff' : 'rgba(169, 239, 248, 0.74)';
    ctx.lineWidth = row === 0 ? 6 : 3;
    ctx.shadowColor = '#74d8f0';
    ctx.shadowBlur = row === 0 ? 8 : 3;
    ctx.stroke();
  }
  ctx.restore();
}
