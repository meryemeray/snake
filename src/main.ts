import { GameEngine } from './game/GameEngine';

const canvas = document.getElementById('game') as HTMLCanvasElement;
if (!canvas) throw new Error('Canvas element not found');

new GameEngine(canvas);

const helpBtn = document.getElementById('help-btn')!;
const helpModal = document.getElementById('help-modal')!;

helpBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  helpModal.classList.toggle('visible');
});

helpModal.addEventListener('click', () => {
  helpModal.classList.remove('visible');
});
