import { Point, Direction, GridPreset } from '../types';
import { COLORS } from '../constants';
import { ParticleSystem } from './ParticleSystem';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private foodPulse = 0;
  private cols = 0;
  private rows = 0;
  private cellSize = 0;
  private canvasW = 0;
  private canvasH = 0;

  constructor(canvas: HTMLCanvasElement, grid: GridPreset) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas 2D context');
    this.ctx = ctx;
    this.applyGrid(grid);
  }

  applyGrid(grid: GridPreset): void {
    this.cols = grid.cols;
    this.rows = grid.rows;
    this.cellSize = grid.cellSize;
    this.canvasW = grid.cols * grid.cellSize;
    this.canvasH = grid.rows * grid.cellSize;
    this.canvas.width = this.canvasW;
    this.canvas.height = this.canvasH;
    this.ctx.imageSmoothingEnabled = false;
  }

  clear(): void {
    this.ctx.fillStyle = COLORS.BG;
    this.ctx.fillRect(0, 0, this.canvasW, this.canvasH);
  }

  drawGrid(): void {
    this.ctx.strokeStyle = COLORS.GRID;
    this.ctx.lineWidth = 0.5;

    for (let x = 0; x <= this.cols; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.cellSize, 0);
      this.ctx.lineTo(x * this.cellSize, this.canvasH);
      this.ctx.stroke();
    }
    for (let y = 0; y <= this.rows; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.cellSize);
      this.ctx.lineTo(this.canvasW, y * this.cellSize);
      this.ctx.stroke();
    }
  }

  drawSnake(segments: Point[], direction: Direction): void {
    const ctx = this.ctx;
    const cs = this.cellSize;
    const inset = Math.max(1, Math.floor(cs * 0.05));

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const isHead = i === 0;

      ctx.fillStyle = isHead ? COLORS.SNAKE_HEAD : COLORS.SNAKE_BODY;
      ctx.fillRect(
        seg.x * cs + inset,
        seg.y * cs + inset,
        cs - inset * 2,
        cs - inset * 2,
      );

      if (isHead) {
        ctx.fillStyle = COLORS.BG;
        const cx = seg.x * cs;
        const cy = seg.y * cs;
        const eyeSize = Math.max(2, Math.floor(cs * 0.15));
        const near = Math.floor(cs * 0.2);
        const far = Math.floor(cs * 0.65);

        switch (direction) {
          case 'UP':
            ctx.fillRect(cx + near, cy + near, eyeSize, eyeSize);
            ctx.fillRect(cx + far, cy + near, eyeSize, eyeSize);
            break;
          case 'DOWN':
            ctx.fillRect(cx + near, cy + far, eyeSize, eyeSize);
            ctx.fillRect(cx + far, cy + far, eyeSize, eyeSize);
            break;
          case 'LEFT':
            ctx.fillRect(cx + near, cy + near, eyeSize, eyeSize);
            ctx.fillRect(cx + near, cy + far, eyeSize, eyeSize);
            break;
          case 'RIGHT':
            ctx.fillRect(cx + far, cy + near, eyeSize, eyeSize);
            ctx.fillRect(cx + far, cy + far, eyeSize, eyeSize);
            break;
        }
      }
    }
  }

  drawWalls(walls: Point[]): void {
    const cs = this.cellSize;
    this.ctx.fillStyle = COLORS.WALL;
    for (const w of walls) {
      this.ctx.fillRect(w.x * cs, w.y * cs, cs, cs);
    }
  }

  drawPortals(portals: [Point, Point], timestamp: number): void {
    const cs = this.cellSize;
    const pulse = 0.7 + 0.3 * Math.sin(timestamp * 0.008);
    const size = cs * pulse;
    const offset = (cs - size) / 2;
    this.ctx.fillStyle = COLORS.PORTAL;
    for (const p of portals) {
      this.ctx.fillRect(p.x * cs + offset, p.y * cs + offset, size, size);
    }
  }

  drawFoods(foods: Point[], timestamp: number, color = COLORS.FOOD): void {
    this.foodPulse = timestamp;
    const cs = this.cellSize;
    const pulse = 0.85 + 0.15 * Math.sin(this.foodPulse * 0.005);
    const size = cs * pulse;
    const offset = (cs - size) / 2;

    this.ctx.fillStyle = color;
    for (const food of foods) {
      this.ctx.fillRect(
        food.x * cs + offset,
        food.y * cs + offset,
        size,
        size,
      );
    }
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
    ctx.fillText(text, this.canvasW / 2, y);
  }

  drawOverlay(): void {
    this.ctx.fillStyle = COLORS.OVERLAY;
    this.ctx.fillRect(0, 0, this.canvasW, this.canvasH);
  }

  drawHUD(score: number, highScore: number, level: number, timer?: number): void {
    const ctx = this.ctx;
    ctx.fillStyle = COLORS.TEXT;
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`SCR:${score}`, 4, 4);

    ctx.textAlign = 'center';
    if (timer !== undefined) {
      const secs = Math.ceil(timer / 1000);
      ctx.fillText(`${secs}s`, this.canvasW / 2, 4);
    } else {
      ctx.fillText(`LV:${level}`, this.canvasW / 2, 4);
    }

    ctx.textAlign = 'right';
    ctx.fillText(`HI:${highScore}`, this.canvasW - 4, 4);
  }

  get height(): number {
    return this.canvasH;
  }

  get width(): number {
    return this.canvasW;
  }

  get cell(): number {
    return this.cellSize;
  }
}
