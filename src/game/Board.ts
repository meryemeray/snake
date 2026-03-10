import { Point } from '../types';

export class Board {
  foods: Point[] = [];
  poisonFoods: Point[] = [];
  walls: Point[] = [];
  private cols: number;
  private rows: number;
  private foodCount: number;

  constructor(cols: number, rows: number, foodCount = 1) {
    this.cols = cols;
    this.rows = rows;
    this.foodCount = foodCount;
  }

  setGridSize(cols: number, rows: number): void {
    this.cols = cols;
    this.rows = rows;
  }

  setFoodCount(count: number): void {
    this.foodCount = count;
  }

  private getFreeCells(occupied: Point[]): Point[] {
    const occupiedSet = new Set([
      ...occupied.map(p => `${p.x},${p.y}`),
      ...this.foods.map(p => `${p.x},${p.y}`),
      ...this.poisonFoods.map(p => `${p.x},${p.y}`),
      ...this.walls.map(p => `${p.x},${p.y}`),
    ]);
    const freeCells: Point[] = [];
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        if (!occupiedSet.has(`${x},${y}`)) {
          freeCells.push({ x, y });
        }
      }
    }
    return freeCells;
  }

  spawnAllFood(occupied: Point[]): void {
    this.foods = [];
    for (let i = 0; i < this.foodCount; i++) {
      this.spawnOneFood(occupied);
    }
  }

  spawnOneFood(occupied: Point[]): void {
    const freeCells = this.getFreeCells(occupied);
    if (freeCells.length > 0) {
      this.foods.push(freeCells[Math.floor(Math.random() * freeCells.length)]);
    }
  }

  spawnAllPoison(count: number, occupied: Point[]): void {
    this.poisonFoods = [];
    for (let i = 0; i < count; i++) {
      this.spawnOnePoison(occupied);
    }
  }

  spawnOnePoison(occupied: Point[]): void {
    const freeCells = this.getFreeCells(occupied);
    if (freeCells.length > 0) {
      this.poisonFoods.push(freeCells[Math.floor(Math.random() * freeCells.length)]);
    }
  }

  eatPoisonAt(head: Point): boolean {
    const idx = this.poisonFoods.findIndex(f => f.x === head.x && f.y === head.y);
    if (idx !== -1) {
      this.poisonFoods.splice(idx, 1);
      return true;
    }
    return false;
  }

  isOutOfBounds(pos: Point): boolean {
    return pos.x < 0 || pos.x >= this.cols || pos.y < 0 || pos.y >= this.rows;
  }

  eatFoodAt(head: Point): boolean {
    const idx = this.foods.findIndex(f => f.x === head.x && f.y === head.y);
    if (idx !== -1) {
      this.foods.splice(idx, 1);
      return true;
    }
    return false;
  }

  spawnWalls(count: number, occupied: Point[]): void {
    const freeCells = this.getFreeCells(occupied);
    for (let i = 0; i < count && freeCells.length > 0; i++) {
      const idx = Math.floor(Math.random() * freeCells.length);
      const cell = freeCells.splice(idx, 1)[0];
      this.walls.push(cell);
    }
  }

  isWall(pos: Point): boolean {
    return this.walls.some(w => w.x === pos.x && w.y === pos.y);
  }

  clearWalls(): void {
    this.walls = [];
  }
}
