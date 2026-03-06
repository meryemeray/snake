export const GRID_COLS = 20;
export const GRID_ROWS = 20;
export const CELL_SIZE = 20;
export const CANVAS_WIDTH = GRID_COLS * CELL_SIZE;
export const CANVAS_HEIGHT = GRID_ROWS * CELL_SIZE;
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
