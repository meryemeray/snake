export interface Point {
  x: number;
  y: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GamePhase = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

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
