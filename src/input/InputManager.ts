import { Direction } from '../types';
import { OPPOSITE } from '../constants';

export class InputManager {
  private queue: Direction[] = [];
  private currentDirection: Direction = 'RIGHT';
  private touchStartX = 0;
  private touchStartY = 0;
  private readonly SWIPE_THRESHOLD = 30;

  onPause: (() => void) | null = null;
  onEnter: (() => void) | null = null;
  onMute: (() => void) | null = null;
  onNavigate: ((dir: Direction) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
    canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const inInput = document.activeElement instanceof HTMLInputElement;

    switch (e.key) {
      case 'ArrowUp':    case 'w': case 'W':
        if (inInput && e.key.startsWith('Arrow')) break;
        this.enqueue('UP');    this.onNavigate?.('UP');    e.preventDefault(); break;
      case 'ArrowDown':  case 's': case 'S':
        if (inInput && e.key.startsWith('Arrow')) break;
        this.enqueue('DOWN');  this.onNavigate?.('DOWN');  e.preventDefault(); break;
      case 'ArrowLeft':  case 'a': case 'A':
        if (inInput && e.key.startsWith('Arrow')) break;
        this.enqueue('LEFT');  this.onNavigate?.('LEFT');  e.preventDefault(); break;
      case 'ArrowRight': case 'd': case 'D':
        if (inInput && e.key.startsWith('Arrow')) break;
        this.enqueue('RIGHT'); this.onNavigate?.('RIGHT'); e.preventDefault(); break;
      case 'Escape': case 'p': case 'P': this.onPause?.(); break;
      case 'Enter': case ' ': this.onEnter?.(); e.preventDefault(); break;
      case 'm': case 'M': this.onMute?.(); break;
    }
  }

  private handleTouchStart(e: TouchEvent): void {
    e.preventDefault();
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  private handleTouchEnd(e: TouchEvent): void {
    e.preventDefault();
    const touch = e.changedTouches[0];
    const dx = touch.clientX - this.touchStartX;
    const dy = touch.clientY - this.touchStartY;

    if (Math.abs(dx) < this.SWIPE_THRESHOLD && Math.abs(dy) < this.SWIPE_THRESHOLD) {
      this.onEnter?.();
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      this.enqueue(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      this.enqueue(dy > 0 ? 'DOWN' : 'UP');
    }
  }

  private enqueue(dir: Direction): void {
    if (this.queue.length >= 2) return;

    const lastDir = this.queue.length > 0
      ? this.queue[this.queue.length - 1]
      : this.currentDirection;

    if (dir === lastDir || dir === OPPOSITE[lastDir]) return;

    this.queue.push(dir);
  }

  getNextDirection(): Direction {
    if (this.queue.length > 0) {
      this.currentDirection = this.queue.shift()!;
    }
    return this.currentDirection;
  }

  reset(): void {
    this.queue = [];
    this.currentDirection = 'RIGHT';
  }
}
