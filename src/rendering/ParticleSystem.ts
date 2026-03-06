import { Particle } from '../types';
import { CELL_SIZE, COLORS } from '../constants';

export class ParticleSystem {
  private particles: Particle[] = [];

  emit(gridX: number, gridY: number, type: 'eat' | 'death'): void {
    const cx = (gridX + 0.5) * CELL_SIZE;
    const cy = (gridY + 0.5) * CELL_SIZE;

    const count = type === 'eat' ? 8 : 30;
    const speed = type === 'eat' ? 60 : 100;
    const color = type === 'eat' ? COLORS.FOOD : COLORS.SNAKE_BODY;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = speed * (0.5 + Math.random() * 0.5);

      this.particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        life: 1.0,
        color,
        size: type === 'eat' ? 2 : 3,
      });
    }
  }

  update(dt: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt * 2;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D): void {
    for (const p of this.particles) {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  clear(): void {
    this.particles = [];
  }
}
