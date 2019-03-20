import globals from './globals';
import Node from './Node';
import { power } from '../util';

// type TCellGetter = (x: number, y: number) => boolean;

let mouseLast = { x: 0, y: 0 };

export default class Drawer {
  // private getCell: TCellGetter | undefined;
  private borderWidth: number;
  private offset: { x: number; y: number };

  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly imageData: ImageData;
  private readonly grid: Int32Array;

  private isMouseDown: boolean;

  constructor() {
    this.borderWidth = 0;
    this.offset = { x: 0, y: 0 };

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    const { dimensions, cellSize } = globals.config.get();

    if (!dimensions) throw 'You need to set the global dimensions';
    if (!cellSize) throw 'You need to set the global cellSize';

    this.canvas.height = dimensions.height;
    this.canvas.width = dimensions.width;

    this.offset = {
      x: this.canvas.width >> 1,
      y: this.canvas.height >> 1,
    };

    this.imageData = this.context.createImageData(this.canvas.width, this.canvas.height);
    this.grid = new Int32Array(this.imageData.data.buffer);

    for (let i = 0; i < this.canvas.width * this.canvas.height; i++) {
      this.grid[i] = 0xff << 24;
    }

    document.body.appendChild(this.canvas);

    this.isMouseDown = false;

    window.addEventListener('mousedown', ({ clientX, clientY }) => {
      mouseLast.x = clientX;
      mouseLast.y = clientY;
      this.isMouseDown = true;
    });
    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;

      mouseLast.x = 0;
      mouseLast.y = 0;
    });

    window.addEventListener('mousemove', ({ clientX, clientY }) => {
      if (this.isMouseDown) {
        const x = Math.round(clientX - mouseLast.x);
        const y = Math.round(clientY - mouseLast.y);

        this.offset = { x: this.offset.x + x, y: this.offset.y + y };

        mouseLast.x += x;
        mouseLast.y += y;
      }
    });

    // @ts-ignore
    window.addEventListener('mousewheel', (event: WheelEvent) => {
      // event.preventDefault();
      // @ts-ignore
      this.zoom((event.wheelDelta || -event.detail) < 0, {
        x: event.clientX,
        y: event.clientY,
      });
    });
  }

  public zoom(isDown: boolean, mouseLocation: { x: number; y: number }) {
    const { cellSize } = globals.config.get();
    globals.config.set({ cellSize: isDown ? (cellSize || 1) / 2 : (cellSize || 1) * 2 });

    const offsetX = this.offset.x - mouseLocation.x;
    const offsetY = this.offset.y - mouseLocation.y;

    if (isDown) {
      this.offset.x -= Math.round(offsetX / 2);
      this.offset.y -= Math.round(offsetY / 2);
    } else {
      this.offset.x += Math.round(offsetX);
      this.offset.y += Math.round(offsetY);
    }
  }

  public get canvasArea(): number {
    return this.canvas.width * this.canvas.height;
  }

  public draw(rootNode: Node) {
    const blackInt = 0 | (0 << 8) | (0 << 16) | (0xff << 24);

    const { cellSize } = globals.config.get();
    if (!cellSize) throw 'You need to set the global cellSize';

    this.borderWidth = (this.borderWidth * cellSize) | 0;

    for (let i = 0; i < this.canvasArea; i++) {
      this.grid[i] = blackInt;
    }

    const drawSize = power(rootNode.level - 1) * cellSize;

    this.drawNode(rootNode, 2 * drawSize, drawSize * -1, drawSize * -1);

    this.context.putImageData(this.imageData, 0, 0);
  }

  private drawNode(node: Node, size: number, offsetX: number, offsetY: number) {
    if (node.empty()) return;

    if (
      offsetX + size + this.offset.x < 0 ||
      offsetY + size + this.offset.y < 0 ||
      offsetX + this.offset.x >= this.canvas.width ||
      offsetY + this.offset.y >= this.canvas.height
    )
      return;

    const { cellSize } = globals.config.get();
    if (!cellSize) throw 'You need to set the global cellSize';

    if (size <= 1) {
      this.drawCell(offsetX + this.offset.x, offsetY + this.offset.y, 1);
      return;
    }
    if (node.isLeaf()) {
      this.drawCell(offsetX + this.offset.x, offsetY + this.offset.y, cellSize);
      return;
    }

    const nextLevelSize = size / 2;

    this.drawNode(node.nw, nextLevelSize, offsetX, offsetY);
    this.drawNode(node.ne, nextLevelSize, offsetX + nextLevelSize, offsetY);
    this.drawNode(node.sw, nextLevelSize, offsetX, offsetY + nextLevelSize);
    this.drawNode(node.se, nextLevelSize, offsetX + nextLevelSize, offsetY + nextLevelSize);
  }

  private drawCell(x: number, y: number, size: number) {
    let cellWidth = size - this.borderWidth;
    let cellHeight = cellWidth;

    if (x < 0) {
      cellWidth += x;
      x = 0;
    }

    if (x + cellWidth > this.canvas.width) cellWidth = this.canvas.width - x;

    if (y < 0) {
      cellHeight += y;
      y = 0;
    }

    if (y + cellHeight > this.canvas.height) cellHeight = this.canvas.height - y;

    if (cellHeight <= 0 || cellWidth <= 0) return;

    let pointer = x + y * this.canvas.width;
    const row_width = this.canvas.width - cellWidth;

    const color = 0xffffffff;

    for (let i = 0; i < cellHeight; i++) {
      for (var j = 0; j < cellWidth; j++) {
        this.grid[pointer] = color;

        pointer++;
      }
      pointer += row_width;
    }
  }
}
