import { Point, Direction } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, CELL_SIZE, GRID_COLS, GRID_ROWS, COLORS } from '../constants';
import { ParticleSystem } from './ParticleSystem';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private foodPulse = 0;

  constructor(canvas: HTMLCanvasElement) {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas 2D context');
    this.ctx = ctx;
    ctx.imageSmoothingEnabled = false;
  }

  clear(): void {
    this.ctx.fillStyle = COLORS.BG;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  drawGrid(): void {
    this.ctx.strokeStyle = COLORS.GRID;
    this.ctx.lineWidth = 0.5;

    for (let x = 0; x <= GRID_COLS; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * CELL_SIZE, 0);
      this.ctx.lineTo(x * CELL_SIZE, CANVAS_HEIGHT);
      this.ctx.stroke();
    }
    for (let y = 0; y <= GRID_ROWS; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * CELL_SIZE);
      this.ctx.lineTo(CANVAS_WIDTH, y * CELL_SIZE);
      this.ctx.stroke();
    }
  }

  drawSnake(segments: Point[], direction: Direction): void {
    const ctx = this.ctx;
    const inset = 1;

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const isHead = i === 0;

      ctx.fillStyle = isHead ? COLORS.SNAKE_HEAD : COLORS.SNAKE_BODY;
      ctx.fillRect(
        seg.x * CELL_SIZE + inset,
        seg.y * CELL_SIZE + inset,
        CELL_SIZE - inset * 2,
        CELL_SIZE - inset * 2,
      );

      if (isHead) {
        ctx.fillStyle = COLORS.BG;
        const cx = seg.x * CELL_SIZE;
        const cy = seg.y * CELL_SIZE;
        const eyeSize = 3;

        switch (direction) {
          case 'UP':
            ctx.fillRect(cx + 4, cy + 4, eyeSize, eyeSize);
            ctx.fillRect(cx + 13, cy + 4, eyeSize, eyeSize);
            break;
          case 'DOWN':
            ctx.fillRect(cx + 4, cy + 13, eyeSize, eyeSize);
            ctx.fillRect(cx + 13, cy + 13, eyeSize, eyeSize);
            break;
          case 'LEFT':
            ctx.fillRect(cx + 4, cy + 4, eyeSize, eyeSize);
            ctx.fillRect(cx + 4, cy + 13, eyeSize, eyeSize);
            break;
          case 'RIGHT':
            ctx.fillRect(cx + 13, cy + 4, eyeSize, eyeSize);
            ctx.fillRect(cx + 13, cy + 13, eyeSize, eyeSize);
            break;
        }
      }
    }
  }

  drawFood(food: Point, timestamp: number): void {
    this.foodPulse = timestamp;
    const pulse = 0.85 + 0.15 * Math.sin(this.foodPulse * 0.005);
    const size = CELL_SIZE * pulse;
    const offset = (CELL_SIZE - size) / 2;

    this.ctx.fillStyle = COLORS.FOOD;
    this.ctx.fillRect(
      food.x * CELL_SIZE + offset,
      food.y * CELL_SIZE + offset,
      size,
      size,
    );
  }

  drawParticles(particles: ParticleSystem): void {
    particles.draw(this.ctx);
  }

  drawCenteredText(text: string, y: number, size: number, color = COLORS.TEXT): void {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.font = `${size}px "Press Start 2P", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, CANVAS_WIDTH / 2, y);
  }

  drawOverlay(): void {
    this.ctx.fillStyle = COLORS.OVERLAY;
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  drawHUD(score: number, highScore: number, level: number): void {
    const ctx = this.ctx;
    ctx.fillStyle = COLORS.TEXT;
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`SCR:${score}`, 4, 4);

    ctx.textAlign = 'center';
    ctx.fillText(`LV:${level}`, CANVAS_WIDTH / 2, 4);

    ctx.textAlign = 'right';
    ctx.fillText(`HI:${highScore}`, CANVAS_WIDTH - 4, 4);
  }
}
