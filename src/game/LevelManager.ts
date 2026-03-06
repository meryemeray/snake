import { LEVELS, BASE_TICK_MS } from '../constants';

export class LevelManager {
  private currentLevel = 1;
  private _justLeveledUp = false;

  getTickInterval(score: number): number {
    let interval = BASE_TICK_MS;
    let level = 1;

    for (let i = LEVELS.length - 1; i >= 0; i--) {
      const [threshold, speed] = LEVELS[i];
      if (score >= threshold) {
        interval = speed;
        level = i + 1;
        break;
      }
    }

    if (level > this.currentLevel) {
      this._justLeveledUp = true;
    }
    this.currentLevel = level;

    return interval;
  }

  get level(): number {
    return this.currentLevel;
  }

  consumeLevelUp(): boolean {
    if (this._justLeveledUp) {
      this._justLeveledUp = false;
      return true;
    }
    return false;
  }

  reset(): void {
    this.currentLevel = 1;
    this._justLeveledUp = false;
  }
}
