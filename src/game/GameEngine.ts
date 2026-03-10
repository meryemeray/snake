import { Direction, GamePhase, GameConfig, GridPreset, GAME_MODES } from '../types';
import { GRID_PRESETS, FOOD_PRESETS, DEFAULT_GRID, COLORS, GRID_LIMITS, FOOD_LIMITS } from '../constants';
import { Snake } from './Snake';
import { Board } from './Board';
import { LevelManager } from './LevelManager';
import { Renderer } from '../rendering/Renderer';
import { ParticleSystem } from '../rendering/ParticleSystem';
import { InputManager } from '../input/InputManager';
import { AudioManager } from '../audio/AudioManager';
import { ScoreStorage } from '../storage/ScoreStorage';

type SettingsRow = 'mode' | 'grid' | 'food';

const MIRROR_FLIP: Record<string, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.floor(val)));
}

function makeCustomGrid(cols: number, rows: number): GridPreset {
  const c = clamp(cols, GRID_LIMITS.min, GRID_LIMITS.max);
  const r = clamp(rows, GRID_LIMITS.min, GRID_LIMITS.max);
  const cellSize = Math.max(4, Math.floor(500 / Math.max(c, r)));
  return { label: 'CUSTOM', cols: c, rows: r, cellSize };
}

export class GameEngine {
  private phase: GamePhase = 'MENU';
  private score = 0;
  private direction: Direction = 'RIGHT';

  private config: GameConfig = { grid: DEFAULT_GRID, foodCount: 1, mode: 'CLASSIC' };
  private modeSelectIndex = 0;
  private gridSelectIndex = 0;
  private foodSelectIndex = 0;
  private settingsRow: SettingsRow = 'mode';

  private customGridW = 30;
  private customGridH = 30;
  private customFoodCount = 10;

  private gridWidthInput: HTMLInputElement;
  private gridHeightInput: HTMLInputElement;
  private foodInput: HTMLInputElement;

  private snake: Snake;
  private board: Board;
  private levelManager: LevelManager;
  private renderer: Renderer;
  private particles: ParticleSystem;
  private input: InputManager;
  private audio: AudioManager;
  private storage: ScoreStorage;

  private lastTime = 0;
  private accumulator = 0;
  private tickInterval = 150;

  constructor(canvas: HTMLCanvasElement) {
    this.snake = new Snake(DEFAULT_GRID.cols, DEFAULT_GRID.rows);
    this.board = new Board(DEFAULT_GRID.cols, DEFAULT_GRID.rows);
    this.levelManager = new LevelManager();
    this.renderer = new Renderer(canvas, DEFAULT_GRID);
    this.particles = new ParticleSystem(DEFAULT_GRID.cellSize);
    this.audio = new AudioManager();
    this.storage = new ScoreStorage();
    this.input = new InputManager(canvas);

    this.gridWidthInput = document.getElementById('grid-width-input') as HTMLInputElement;
    this.gridHeightInput = document.getElementById('grid-height-input') as HTMLInputElement;
    this.foodInput = document.getElementById('food-input') as HTMLInputElement;

    this.gridWidthInput.addEventListener('input', () => this.onGridInputChange());
    this.gridHeightInput.addEventListener('input', () => this.onGridInputChange());
    this.foodInput.addEventListener('input', () => this.onFoodInputChange());

    const blurAndEnter = (el: HTMLInputElement) => {
      el.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') { e.stopPropagation(); el.blur(); this.handleEnter(); }
      });
    };
    blurAndEnter(this.gridWidthInput);
    blurAndEnter(this.gridHeightInput);
    blurAndEnter(this.foodInput);

    this.input.onPause = () => this.togglePause();
    this.input.onEnter = () => this.handleEnter();
    this.input.onMute = () => this.audio.toggleMute();
    this.input.onNavigate = (dir) => this.handleNavigate(dir);

    requestAnimationFrame((t) => this.loop(t));
  }

  private clampInput(input: HTMLInputElement, min: number, max: number): number {
    const raw = input.valueAsNumber;
    if (!Number.isFinite(raw)) return min;
    const clamped = clamp(raw, min, max);
    if (raw !== clamped) {
      input.value = String(clamped);
      this.flashInput(input);
    }
    return clamped;
  }

  private flashInput(input: HTMLInputElement): void {
    input.style.borderColor = '#ff4444';
    input.style.boxShadow = '0 0 8px rgba(255, 68, 68, 0.6)';
    setTimeout(() => {
      input.style.borderColor = '';
      input.style.boxShadow = '';
    }, 600);
  }

  private onGridInputChange(): void {
    const w = this.gridWidthInput.valueAsNumber;
    const h = this.gridHeightInput.valueAsNumber;
    if (Number.isFinite(w)) this.customGridW = clamp(w, GRID_LIMITS.min, GRID_LIMITS.max);
    if (Number.isFinite(h)) this.customGridH = clamp(h, GRID_LIMITS.min, GRID_LIMITS.max);
    this.config.grid = makeCustomGrid(this.customGridW, this.customGridH);
  }

  private onFoodInputChange(): void {
    const val = this.foodInput.valueAsNumber;
    if (!Number.isFinite(val)) return;
    this.customFoodCount = clamp(val, FOOD_LIMITS.min, FOOD_LIMITS.max);
    this.config.foodCount = this.customFoodCount;
  }

  private isGridCustom(): boolean {
    return GRID_PRESETS[this.gridSelectIndex].label === 'CUSTOM';
  }

  private isFoodCustom(): boolean {
    return FOOD_PRESETS[this.foodSelectIndex] === -1;
  }

  private isAnyGridInputFocused(): boolean {
    return document.activeElement === this.gridWidthInput
        || document.activeElement === this.gridHeightInput;
  }

  private updateInputVisibility(): void {
    const showGrid = this.phase === 'SETTINGS' && this.isGridCustom();
    const showFood = this.phase === 'SETTINGS' && this.isFoodCustom();

    this.gridWidthInput.style.display = showGrid ? 'block' : 'none';
    this.gridHeightInput.style.display = showGrid ? 'block' : 'none';
    this.foodInput.style.display = showFood ? 'block' : 'none';

    const h = this.renderer.height;
    const w = this.renderer.width;
    const gap = 10;

    this.gridWidthInput.style.top = `${h * 0.47}px`;
    this.gridWidthInput.style.left = `${w / 2 - 80 - gap / 2}px`;
    this.gridWidthInput.style.transform = 'none';
    this.gridWidthInput.style.width = '80px';

    this.gridHeightInput.style.top = `${h * 0.47}px`;
    this.gridHeightInput.style.left = `${w / 2 + gap / 2}px`;
    this.gridHeightInput.style.transform = 'none';
    this.gridHeightInput.style.width = '80px';

    this.foodInput.style.top = `${h * 0.73}px`;
    this.foodInput.style.width = '80px';

    if (showGrid && this.settingsRow === 'grid') {
      this.gridWidthInput.focus();
    } else if (showFood && this.settingsRow === 'food') {
      this.foodInput.focus();
    }
  }

  private hideAllInputs(): void {
    this.gridWidthInput.style.display = 'none';
    this.gridHeightInput.style.display = 'none';
    this.foodInput.style.display = 'none';
    this.gridWidthInput.blur();
    this.gridHeightInput.blur();
    this.foodInput.blur();
  }

  private handleNavigate(dir: Direction): void {
    if (this.phase !== 'SETTINGS') return;

    const inGridInput = this.isAnyGridInputFocused();
    const inFoodInput = document.activeElement === this.foodInput;

    const ROWS: SettingsRow[] = ['mode', 'grid', 'food'];

    if (inGridInput || inFoodInput) {
      if (dir === 'UP' || dir === 'DOWN') {
        (document.activeElement as HTMLElement).blur();
        const idx = ROWS.indexOf(this.settingsRow);
        const next = dir === 'DOWN' ? (idx + 1) % ROWS.length : (idx - 1 + ROWS.length) % ROWS.length;
        this.settingsRow = ROWS[next];
        this.updateInputVisibility();
      }
      return;
    }

    if (dir === 'UP' || dir === 'DOWN') {
      const idx = ROWS.indexOf(this.settingsRow);
      const next = dir === 'DOWN' ? (idx + 1) % ROWS.length : (idx - 1 + ROWS.length) % ROWS.length;
      this.settingsRow = ROWS[next];
    }

    if (dir === 'LEFT' || dir === 'RIGHT') {
      const delta = dir === 'RIGHT' ? 1 : -1;

      if (this.settingsRow === 'mode') {
        this.modeSelectIndex = (this.modeSelectIndex + delta + GAME_MODES.length) % GAME_MODES.length;
        this.config.mode = GAME_MODES[this.modeSelectIndex];
      } else if (this.settingsRow === 'grid') {
        this.gridSelectIndex = (this.gridSelectIndex + delta + GRID_PRESETS.length) % GRID_PRESETS.length;
        if (!this.isGridCustom()) {
          this.config.grid = GRID_PRESETS[this.gridSelectIndex];
        } else {
          this.config.grid = makeCustomGrid(this.customGridW, this.customGridH);
        }
      } else {
        this.foodSelectIndex = (this.foodSelectIndex + delta + FOOD_PRESETS.length) % FOOD_PRESETS.length;
        if (!this.isFoodCustom()) {
          this.config.foodCount = FOOD_PRESETS[this.foodSelectIndex];
        } else {
          this.config.foodCount = this.customFoodCount;
        }
      }
    }

    this.updateInputVisibility();
  }

  private togglePause(): void {
    if (this.phase === 'PLAYING') {
      this.phase = 'PAUSED';
    } else if (this.phase === 'PAUSED') {
      this.phase = 'PLAYING';
      this.lastTime = performance.now();
    }
  }

  private handleEnter(): void {
    if (this.phase === 'MENU') {
      this.phase = 'SETTINGS';
      this.updateInputVisibility();
    } else if (this.phase === 'SETTINGS') {
      let corrected = false;

      if (this.isGridCustom()) {
        const oldW = this.gridWidthInput.valueAsNumber;
        const oldH = this.gridHeightInput.valueAsNumber;
        this.customGridW = this.clampInput(this.gridWidthInput, GRID_LIMITS.min, GRID_LIMITS.max);
        this.customGridH = this.clampInput(this.gridHeightInput, GRID_LIMITS.min, GRID_LIMITS.max);
        this.config.grid = makeCustomGrid(this.customGridW, this.customGridH);
        if (oldW !== this.customGridW || oldH !== this.customGridH) corrected = true;
      }
      if (this.isFoodCustom()) {
        const oldFood = this.foodInput.valueAsNumber;
        this.customFoodCount = this.clampInput(this.foodInput, FOOD_LIMITS.min, FOOD_LIMITS.max);
        this.config.foodCount = this.customFoodCount;
        if (oldFood !== this.customFoodCount) corrected = true;
      }

      if (corrected) return;

      this.hideAllInputs();
      this.applyConfig();
      this.startGame();
    } else if (this.phase === 'GAME_OVER') {
      this.phase = 'SETTINGS';
      this.updateInputVisibility();
    } else if (this.phase === 'PAUSED') {
      this.togglePause();
    }
  }

  private applyConfig(): void {
    const grid = this.config.grid;
    this.renderer.applyGrid(grid);
    this.snake.setGridSize(grid.cols, grid.rows);
    this.board.setGridSize(grid.cols, grid.rows);
    this.board.setFoodCount(this.config.foodCount);
    this.particles.setCellSize(grid.cellSize);
  }

  private startGame(): void {
    const grid = this.config.grid;
    const startLen = this.config.mode === 'SHRINK'
      ? Math.floor((grid.cols * grid.rows) / 2)
      : 3;
    this.snake.reset(startLen);
    this.levelManager.reset();
    this.particles.clear();
    this.score = 0;
    this.direction = this.config.mode === 'MIRROR' ? 'LEFT' : 'RIGHT';
    this.input.reset(this.direction);
    this.board.spawnAllFood(this.snake.segments);
    this.phase = 'PLAYING';
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.tickInterval = this.config.mode === 'SPEED' ? 120 : this.levelManager.getTickInterval(0);
  }

  private tick(): void {
    let dir = this.input.getNextDirection();
    if (this.config.mode === 'MIRROR') dir = MIRROR_FLIP[dir] as Direction;
    this.direction = dir;
    const newHead = this.snake.move(this.direction);

    if (this.config.mode === 'NO WALLS') {
      const grid = this.config.grid;
      newHead.x = ((newHead.x % grid.cols) + grid.cols) % grid.cols;
      newHead.y = ((newHead.y % grid.rows) + grid.rows) % grid.rows;
    }

    if (this.config.mode !== 'NO WALLS' && this.board.isOutOfBounds(newHead)) {
      this.die();
      return;
    }
    if (this.snake.checkSelfCollision()) {
      this.die();
      return;
    }

    if (this.board.eatFoodAt(newHead)) {
      if (this.config.mode === 'SHRINK') {
        this.snake.shrink();
      } else {
        this.snake.grow();
      }
      this.score++;
      this.board.spawnOneFood(this.snake.segments);
      this.particles.emit(newHead.x, newHead.y, 'eat');
      this.audio.playEat();

      if (this.config.mode === 'SHRINK' && this.snake.segments.length <= 1) {
        this.phase = 'GAME_OVER';
        this.audio.playLevelUp();
        this.storage.save(this.score);
        return;
      }

      if (this.config.mode === 'SPEED') {
        this.tickInterval = Math.max(35, this.tickInterval - 2);
      }
    }
  }

  private die(): void {
    this.phase = 'GAME_OVER';
    this.audio.playDie();

    for (const seg of this.snake.segments) {
      this.particles.emit(seg.x, seg.y, 'death');
    }

    this.storage.save(this.score);
  }

  private loop(timestamp: number): void {
    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    if (this.phase === 'PLAYING') {
      this.accumulator += dt;
      while (this.accumulator >= this.tickInterval) {
        this.tick();
        this.accumulator -= this.tickInterval;
        if (this.phase !== 'PLAYING') break;
      }
    }

    this.particles.update(dt / 1000);

    this.renderer.clear();
    this.renderer.drawGrid();

    if (this.phase === 'MENU') {
      this.drawMenuScreen();
    } else if (this.phase === 'SETTINGS') {
      this.drawSettingsScreen();
    } else {
      this.renderer.drawFoods(this.board.foods, timestamp);
      this.renderer.drawSnake(this.snake.segments, this.direction);
      this.renderer.drawParticles(this.particles);
      this.renderer.drawHUD(this.score, this.storage.getHighScore(), this.levelManager.level);

      if (this.phase === 'PAUSED') {
        this.drawPauseScreen();
      } else if (this.phase === 'GAME_OVER') {
        this.drawGameOverScreen();
      }
    }

    requestAnimationFrame((t) => this.loop(t));
  }

  private drawMenuScreen(): void {
    const h = this.renderer.height;
    this.renderer.drawCenteredText('SNAKE', h * 0.3, 24);
    this.renderer.drawCenteredText('Press ENTER', h * 0.55, 8);
    this.renderer.drawCenteredText('to start', h * 0.65, 8);
    this.renderer.drawCenteredText('WASD / Arrows', h * 0.8, 6, COLORS.TEXT_DIM);
    this.renderer.drawCenteredText('P:Pause  M:Mute', h * 0.88, 6, COLORS.TEXT_DIM);
  }

  private drawSettingsScreen(): void {
    const h = this.renderer.height;
    this.renderer.drawCenteredText('SETTINGS', h * 0.08, 14);

    const modeActive = this.settingsRow === 'mode';
    const gridActive = this.settingsRow === 'grid';
    const foodActive = this.settingsRow === 'food';

    this.renderer.drawCenteredText('MODE', h * 0.18, 8, modeActive ? COLORS.TEXT : COLORS.TEXT_DIM);
    const modeLabel = `< ${this.config.mode} >`;
    this.renderer.drawCenteredText(modeLabel, h * 0.25, modeActive ? 10 : 8, modeActive ? COLORS.TEXT : COLORS.TEXT_DIM);

    this.renderer.drawCenteredText('GRID SIZE', h * 0.36, 8, gridActive ? COLORS.TEXT : COLORS.TEXT_DIM);
    if (this.isGridCustom()) {
      this.renderer.drawCenteredText('< CUSTOM >', h * 0.43, gridActive ? 10 : 8, gridActive ? COLORS.TEXT : COLORS.TEXT_DIM);
      const sizeStr = `${this.customGridW}x${this.customGridH}`;
      this.renderer.drawCenteredText(sizeStr, h * 0.50, 6, COLORS.TEXT_DIM);
    } else {
      const gridLabel = `< ${this.config.grid.label} >`;
      const gridDetail = `${this.config.grid.cols}x${this.config.grid.rows}`;
      this.renderer.drawCenteredText(gridLabel, h * 0.43, gridActive ? 10 : 8, gridActive ? COLORS.TEXT : COLORS.TEXT_DIM);
      this.renderer.drawCenteredText(gridDetail, h * 0.50, 6, COLORS.TEXT_DIM);
    }

    this.renderer.drawCenteredText('FOOD COUNT', h * 0.61, 8, foodActive ? COLORS.TEXT : COLORS.TEXT_DIM);
    if (this.isFoodCustom()) {
      this.renderer.drawCenteredText('< CUSTOM >', h * 0.68, foodActive ? 10 : 8, foodActive ? COLORS.TEXT : COLORS.TEXT_DIM);
      this.renderer.drawCenteredText(`${this.customFoodCount}`, h * 0.75, 6, COLORS.TEXT_DIM);
    } else {
      const foodLabel = `< ${this.config.foodCount} >`;
      this.renderer.drawCenteredText(foodLabel, h * 0.68, foodActive ? 10 : 8, foodActive ? COLORS.TEXT : COLORS.TEXT_DIM);
    }

    this.renderer.drawCenteredText('Press ENTER', h * 0.85, 8);
    this.renderer.drawCenteredText('to play', h * 0.92, 8);
  }

  private drawPauseScreen(): void {
    const h = this.renderer.height;
    this.renderer.drawOverlay();
    this.renderer.drawCenteredText('PAUSED', h * 0.45, 16);
    this.renderer.drawCenteredText('Press P or ESC', h * 0.58, 8);
  }

  private drawGameOverScreen(): void {
    const h = this.renderer.height;
    this.renderer.drawOverlay();
    this.renderer.drawCenteredText('GAME OVER', h * 0.3, 14);
    this.renderer.drawCenteredText(`Score: ${this.score}`, h * 0.45, 10);
    this.renderer.drawCenteredText(`Best: ${this.storage.getHighScore()}`, h * 0.55, 8);
    this.renderer.drawCenteredText('Press ENTER', h * 0.7, 8);
    this.renderer.drawCenteredText('to continue', h * 0.8, 8);
  }
}
