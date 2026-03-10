export interface Point {
  x: number;
  y: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GamePhase = 'MENU' | 'SETTINGS' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface LeaderboardEntry {
  score: number;
  date: string;
}

export interface GridPreset {
  label: string;
  cols: number;
  rows: number;
  cellSize: number;
}

export type GameMode = 'CLASSIC' | 'MIRROR' | 'SPEED';

export const GAME_MODES: GameMode[] = ['CLASSIC', 'MIRROR', 'SPEED'];

export interface GameConfig {
  grid: GridPreset;
  foodCount: number;
  mode: GameMode;
}
