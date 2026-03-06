export class AudioManager {
  private ctx: AudioContext | null = null;
  private muted = false;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  private playTone(
    startFreq: number,
    endFreq: number,
    duration: number,
    type: OscillatorType,
    gain: number = 0.3,
  ): void {
    if (this.muted) return;

    const ctx = this.ensureContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(endFreq, ctx.currentTime + duration);

    gainNode.gain.setValueAtTime(gain, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  playEat(): void {
    this.playTone(600, 900, 0.08, 'square', 0.2); //beeeep
  }

  playDie(): void {
    this.playTone(400, 80, 0.5, 'sawtooth', 0.3); //wuh-huh
  }

  playLevelUp(): void {
    if (this.muted) return;
    const ctx = this.ensureContext();
    const notes = [523, 659, 784]; //C5, E5, G5

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + i * 0.1;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.2, start);
      gain.gain.linearRampToValueAtTime(0, start + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.1);
    });
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    return this.muted;
  }

  get isMuted(): boolean {
    return this.muted;
  }
}
