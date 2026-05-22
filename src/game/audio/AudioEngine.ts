import type { JudgementName, StrokeType } from '../types';
import { strokeFrequency } from './synth';

export class AudioEngine {
  private context?: AudioContext;

  async resume(): Promise<void> {
    if (!this.context) {
      this.context = new AudioContext();
    }
    if (this.context.state !== 'running') {
      await this.context.resume();
    }
  }

  playStroke(stroke: StrokeType, judgement: JudgementName, volume: number, muted: boolean): void {
    if (muted || volume <= 0 || !this.context || stroke === 'Rest') {
      return;
    }

    const ctx = this.context;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const freq = strokeFrequency(stroke);

    osc.type = stroke === 'Tta' || stroke === 'Da' ? 'square' : 'sine';
    osc.frequency.setValueAtTime(freq, now);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(stroke === 'Dung' ? 620 : 1400, now);

    const strength = judgement === 'perfect' ? 1.1 : judgement === 'great' ? 0.9 : judgement === 'good' ? 0.65 : 0.35;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume * 0.35 * strength), now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (stroke === 'Dung' ? 0.42 : 0.18));

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  playEffect(kind: 'formation' | 'enemy' | 'clear', volume: number, muted: boolean): void {
    if (muted || volume <= 0 || !this.context) {
      return;
    }

    const ctx = this.context;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(kind === 'formation' ? 330 : kind === 'clear' ? 520 : 90, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume * 0.22, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.55);
  }
}
