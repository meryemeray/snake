import { GameEngine } from './game/GameEngine';

const canvas = document.getElementById('game') as HTMLCanvasElement;
if (!canvas) throw new Error('Canvas element not found');

new GameEngine(canvas);
