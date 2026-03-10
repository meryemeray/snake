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

  reset(): void {
    const centerX = Math.floor(this.cols / 2);
    const centerY = Math.floor(this.rows / 2);
    this.segments = [
      { x: centerX, y: centerY },
      { x: centerX - 1, y: centerY },
      { x: centerX - 2, y: centerY },
    ];
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

  checkSelfCollision(): boolean {
    const head = this.head;
    return this.segments.slice(1).some(
      seg => seg.x === head.x && seg.y === head.y
    );
  }
}
