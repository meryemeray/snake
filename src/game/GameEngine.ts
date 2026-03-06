import { Direction, GamePhase } from '../types';
import { CANVAS_HEIGHT, COLORS } from '../constants';
import { Snake } from './Snake';
import { Board } from './Board';
import { LevelManager } from './LevelManager';
import { Renderer } from '../rendering/Renderer';
import { ParticleSystem } from '../rendering/ParticleSystem';
import { InputManager } from '../input/InputManager';
import { AudioManager } from '../audio/AudioManager';
import { ScoreStorage } from '../storage/ScoreStorage';

export class GameEngine {
  private phase: GamePhase = 'MENU';
  private score = 0;
  private direction: Direction = 'RIGHT';

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
    this.snake = new Snake();
    this.board = new Board();
    this.levelManager = new LevelManager();
    this.renderer = new Renderer(canvas);
    this.particles = new ParticleSystem();
    this.audio = new AudioManager();
    this.storage = new ScoreStorage();
    this.input = new InputManager(canvas);

    this.input.onPause = () => this.togglePause();
    this.input.onEnter = () => this.handleEnter();
    this.input.onMute = () => this.audio.toggleMute();

    requestAnimationFrame((t) => this.loop(t));
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
    if (this.phase === 'MENU' || this.phase === 'GAME_OVER') {
      this.startGame();
    } else if (this.phase === 'PAUSED') {
      this.togglePause();
    }
  }

  private startGame(): void {
    this.snake.reset();
    this.input.reset();
    this.levelManager.reset();
    this.particles.clear();
    this.score = 0;
    this.direction = 'RIGHT';
    this.board.spawnFood(this.snake.segments);
    this.phase = 'PLAYING';
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.tickInterval = this.levelManager.getTickInterval(0);
  }

  private tick(): void {
    this.direction = this.input.getNextDirection();
    const newHead = this.snake.move(this.direction);

    if (this.board.isOutOfBounds(newHead) || this.snake.checkSelfCollision()) {
      this.die();
      return;
    }

    if (this.board.isFoodEaten(newHead)) {
      this.snake.grow();
      this.score++;
      this.board.spawnFood(this.snake.segments);
      this.particles.emit(newHead.x, newHead.y, 'eat');
      this.audio.playEat();

      this.tickInterval = this.levelManager.getTickInterval(this.score);
      if (this.levelManager.consumeLevelUp()) {
        this.audio.playLevelUp();
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
    } else {
      this.renderer.drawFood(this.board.food, timestamp);
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
    this.renderer.drawCenteredText('SNAKE', CANVAS_HEIGHT * 0.3, 24);
    this.renderer.drawCenteredText('Press ENTER', CANVAS_HEIGHT * 0.55, 8);
    this.renderer.drawCenteredText('to start', CANVAS_HEIGHT * 0.65, 8);
    this.renderer.drawCenteredText('WASD / Arrows', CANVAS_HEIGHT * 0.8, 6, COLORS.TEXT_DIM);
    this.renderer.drawCenteredText('P:Pause  M:Mute', CANVAS_HEIGHT * 0.88, 6, COLORS.TEXT_DIM);
  }

  private drawPauseScreen(): void {
    this.renderer.drawOverlay();
    this.renderer.drawCenteredText('PAUSED', CANVAS_HEIGHT * 0.45, 16);
    this.renderer.drawCenteredText('Press P or ESC', CANVAS_HEIGHT * 0.58, 8);
  }

  private drawGameOverScreen(): void {
    this.renderer.drawOverlay();
    this.renderer.drawCenteredText('GAME OVER', CANVAS_HEIGHT * 0.3, 14);
    this.renderer.drawCenteredText(`Score: ${this.score}`, CANVAS_HEIGHT * 0.45, 10);
    this.renderer.drawCenteredText(`Best: ${this.storage.getHighScore()}`, CANVAS_HEIGHT * 0.55, 8);
    this.renderer.drawCenteredText('Press ENTER', CANVAS_HEIGHT * 0.7, 8);
    this.renderer.drawCenteredText('to restart', CANVAS_HEIGHT * 0.8, 8);
  }
}
