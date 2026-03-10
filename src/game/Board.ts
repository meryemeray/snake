import { Point } from '../types';

export class Board {
  foods: Point[] = [];
  poisonFoods: Point[] = [];
  walls: Point[] = [];
  portals: [Point, Point] | null = null;
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
    const portalPts = this.portals ? [this.portals[0], this.portals[1]] : [];
    const occupiedSet = new Set([
      ...occupied.map(p => `${p.x},${p.y}`),
      ...this.foods.map(p => `${p.x},${p.y}`),
      ...this.poisonFoods.map(p => `${p.x},${p.y}`),
      ...this.walls.map(p => `${p.x},${p.y}`),
      ...portalPts.map(p => `${p.x},${p.y}`),
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

  respawnTrappedFood(): void {
    const trapped = (p: Point) => this.isWall(p);
    const trappedFoodCount = this.foods.filter(trapped).length;
    this.foods = this.foods.filter(f => !trapped(f));
    for (let i = 0; i < trappedFoodCount; i++) {
      this.spawnOneFood([]);
    }
    const trappedPoisonCount = this.poisonFoods.filter(trapped).length;
    this.poisonFoods = this.poisonFoods.filter(f => !trapped(f));
    for (let i = 0; i < trappedPoisonCount; i++) {
      this.spawnOnePoison([]);
    }
  }

  spawnPortals(occupied: Point[]): void {
    const freeCells = this.getFreeCells(occupied);
    if (freeCells.length >= 2) {
      const i1 = Math.floor(Math.random() * freeCells.length);
      const p1 = freeCells.splice(i1, 1)[0];
      const i2 = Math.floor(Math.random() * freeCells.length);
      const p2 = freeCells[i2];
      this.portals = [p1, p2];
    }
  }

  addSurvivalRing(ring: number): void {
    const minX = ring;
    const maxX = this.cols - 1 - ring;
    const minY = ring;
    const maxY = this.rows - 1 - ring;
    if (minX > maxX || minY > maxY) return;
    for (let x = minX; x <= maxX; x++) {
      if (!this.isWall({ x, y: minY })) this.walls.push({ x, y: minY });
      if (!this.isWall({ x, y: maxY })) this.walls.push({ x, y: maxY });
    }
    for (let y = minY + 1; y < maxY; y++) {
      if (!this.isWall({ x: minX, y })) this.walls.push({ x: minX, y });
      if (!this.isWall({ x: maxX, y })) this.walls.push({ x: maxX, y });
    }
  }

  getPortalExit(head: Point): Point | null {
    if (!this.portals) return null;
    const [a, b] = this.portals;
    if (head.x === a.x && head.y === a.y) return { x: b.x, y: b.y };
    if (head.x === b.x && head.y === b.y) return { x: a.x, y: a.y };
    return null;
  }
}
