import { GridPreset } from './types';

export const GRID_PRESETS: GridPreset[] = [
  { label: 'SMALL',  cols: 20, rows: 20, cellSize: 20 },
  { label: 'MEDIUM', cols: 35, rows: 35, cellSize: 14 },
  { label: 'LARGE',  cols: 50, rows: 50, cellSize: 10 },
  { label: 'CUSTOM', cols: 0,  rows: 0,  cellSize: 0 },
];

export const DEFAULT_GRID = GRID_PRESETS[0];
export const FOOD_PRESETS = [1, 3, 5, 15, -1]; // -1 = custom

export const GRID_LIMITS = { min: 15, max: 100 };
export const FOOD_LIMITS = { min: 1, max: 50 };
export const BASE_TICK_MS = 150;

export const COLORS = {
  BG:         '#0f380f',
  GRID:       '#1a4a1a',
  SNAKE_BODY: '#8bac0f',
  SNAKE_HEAD: '#9bbc0f',
  FOOD:       '#9bbc0f',
  TEXT:       '#9bbc0f',
  TEXT_DIM:   '#306230',
  OVERLAY:    'rgba(15, 56, 15, 0.85)',
  HIGHLIGHT:  '#9bbc0f',
};

export const OPPOSITE: Record<string, string> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

// [score threshold, tick interval ms]
export const LEVELS: [number, number][] = [
  [0,   150],
  [5,   130],
  [10,  110],
  [20,   90],
  [35,   75],
  [50,   60],
];
