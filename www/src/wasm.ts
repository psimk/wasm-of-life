import { Universe, Cell } from '../../pkg/wasm_of_life';
import { memory } from '../../pkg/wasm_of_life_bg';
import { IDS } from './dom';

const CELL_SIZE = 2;
const DEAD_COLOR = '#000000';
const GRID_COLOR = DEAD_COLOR;
// const ALIVE_COLOR = '#FFFFFF';
const DIMENSIONS = { height: 320, width: 512 };

const universe = Universe.new(DIMENSIONS.width, DIMENSIONS.height);

const canvas = document.createElement('canvas');

canvas.height = (CELL_SIZE + 1) * DIMENSIONS.height + 1;
canvas.width = (CELL_SIZE + 1) * DIMENSIONS.width + 1;

document.body.appendChild(canvas);

const context = canvas.getContext('2d') as CanvasRenderingContext2D;

// const fpsCounter = document.getElementById(IDS.FPS_COUNTER) as HTMLElement;

let lastTime: number;

const renderLoop = (currentTime: number) => {
  universe.tick();

  drawGrid();
  drawCells();

  if (lastTime === undefined) {
    lastTime = currentTime;
    return requestAnimationFrame(renderLoop);
  }

  // fpsCounter.innerText = String(Math.round(1000 / (currentTime - lastTime) * 100) / 100);

  lastTime = currentTime;

  return requestAnimationFrame(renderLoop);
};

const drawGrid = () => {
  context.beginPath();
  context.strokeStyle = GRID_COLOR;

  for (let i = 0; i <= DIMENSIONS.width; i += 1) {
    context.moveTo(i * (CELL_SIZE + 1) + 1, 0);
    context.lineTo(i * (CELL_SIZE + 1) + 1, i * (CELL_SIZE + 1) * DIMENSIONS.height + 1);
  }

  for (let i = 0; i <= DIMENSIONS.height; i += 1) {
    context.moveTo(0, i * (CELL_SIZE + 1) + 1);
    context.lineTo(i * (CELL_SIZE + 1) * DIMENSIONS.width + 1, i * (CELL_SIZE + 1) + 1);
  }

  context.stroke();
};

const getIndex = (row: number, column: number) => row * DIMENSIONS.width + column;

let hueOffset = 0;

const drawCells = () => {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, DIMENSIONS.width * DIMENSIONS.height);

  context.beginPath();

  for (let row = 0; row < DIMENSIONS.height; row += 1) {
    for (let col = 0; col < DIMENSIONS.width; col += 1) {
      const index = getIndex(row, col);

      const deltaX = DIMENSIONS.width / 2 - row;
      const deltaY = col - DIMENSIONS.height / 2;
      const rad = Math.atan2(deltaY, deltaX);
      const deg = rad * (180 / Math.PI);

      context.fillStyle =
        cells[index] === Cell.Dead ? DEAD_COLOR : `hsl(${deg + hueOffset},100%,50%)`;

      context.fillRect(col * (CELL_SIZE + 1) + 1, row * (CELL_SIZE + 1) + 1, CELL_SIZE, CELL_SIZE);
    }
  }

  if (hueOffset === 360) hueOffset = 0;
  else hueOffset += 1;

  context.stroke();
};

(() => {
  drawGrid();
  drawCells();

  requestAnimationFrame(renderLoop);
})();
