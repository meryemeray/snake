import { LeaderboardEntry } from '../types';

const STORAGE_KEY = 'snake-game-scores';
const MAX_ENTRIES = 10;

export class ScoreStorage {
  save(score: number): void {
    const entries = this.getAll();
    entries.push({
      score,
      date: new Date().toLocaleDateString(),
    });

    entries.sort((a, b) => b.score - a.score);
    entries.splice(MAX_ENTRIES);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  getAll(): LeaderboardEntry[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getHighScore(): number {
    const entries = this.getAll();
    return entries.length > 0 ? entries[0].score : 0;
  }
}
