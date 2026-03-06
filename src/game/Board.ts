import { Point } from '../types';
import { GRID_COLS, GRID_ROWS } from '../constants';

export class Board {
  food: Point = { x: 0, y: 0 };

  spawnFood(occupied: Point[]): void {
    const occupiedSet = new Set(occupied.map(p => `${p.x},${p.y}`));

    const freeCells: Point[] = [];
    for (let x = 0; x < GRID_COLS; x++) {
      for (let y = 0; y < GRID_ROWS; y++) {
        if (!occupiedSet.has(`${x},${y}`)) {
          freeCells.push({ x, y });
        }
      }
    }

    if (freeCells.length > 0) {
      this.food = freeCells[Math.floor(Math.random() * freeCells.length)];
    }
  }

  isOutOfBounds(pos: Point): boolean {
    return pos.x < 0 || pos.x >= GRID_COLS || pos.y < 0 || pos.y >= GRID_ROWS;
  }

  isFoodEaten(head: Point): boolean {
    return head.x === this.food.x && head.y === this.food.y;
  }
}
