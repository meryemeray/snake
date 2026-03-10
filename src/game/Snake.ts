import { Point, Direction } from '../types';

export class Snake {
  segments: Point[] = [];
  private growing = false;
  private cols: number;
  private rows: number;

  constructor(cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;
    this.reset();
  }

  setGridSize(cols: number, rows: number): void {
    this.cols = cols;
    this.rows = rows;
  }

  reset(startLength = 3): void {
    this.segments = [];
    const centerY = Math.floor(this.rows / 2);
    const centerX = Math.floor(this.cols / 2);

    if (startLength <= this.cols) {
      for (let i = 0; i < startLength; i++) {
        this.segments.push({ x: centerX - i, y: centerY });
      }
    } else {
      let x = centerX;
      let y = centerY;
      let dx = -1;
      for (let i = 0; i < startLength; i++) {
        if (x < 0 || x >= this.cols) break;
        if (y < 0 || y >= this.rows) break;
        this.segments.push({ x, y });
        const nextX = x + dx;
        if (nextX < 0 || nextX >= this.cols) {
          y++;
          dx = -dx;
        } else {
          x = nextX;
        }
      }
    }

    if (this.segments.length === 0) {
      this.segments.push({ x: centerX, y: centerY });
    }
    this.growing = false;
  }

  get head(): Point {
    return this.segments[0];
  }

  move(direction: Direction): Point {
    const head = this.head;
    let newHead: Point;

    switch (direction) {
      case 'UP':    newHead = { x: head.x, y: head.y - 1 }; break;
      case 'DOWN':  newHead = { x: head.x, y: head.y + 1 }; break;
      case 'LEFT':  newHead = { x: head.x - 1, y: head.y }; break;
      case 'RIGHT': newHead = { x: head.x + 1, y: head.y }; break;
    }

    this.segments.unshift(newHead);

    if (this.growing) {
      this.growing = false;
    } else {
      this.segments.pop();
    }

    return newHead;
  }

  grow(): void {
    this.growing = true;
  }

  shrink(): void {
    if (this.segments.length > 1) {
      this.segments.pop();
    }
  }

  checkSelfCollision(): boolean {
    const head = this.head;
    return this.segments.slice(1).some(
      seg => seg.x === head.x && seg.y === head.y
    );
  }
}
