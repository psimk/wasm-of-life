import globals from './globals';

type TCellGetter = (x: number, y: number) => boolean;

export default class Drawer {
  private getCell: TCellGetter | undefined;

  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d') as CanvasRenderingContext2D;

    const { dimensions, cellSize } = globals.config.get();

    if (!dimensions) throw 'You need to set the global dimensions';
    if (!cellSize) throw 'You need to set the global cellSize';

    this.canvas.height = (cellSize + 1) * dimensions.height + 1;
    this.canvas.width = (cellSize + 1) * dimensions.width + 1;

    document.body.appendChild(this.canvas);
  }

  public set cellGetter(getCell: TCellGetter) {
    this.getCell = getCell;
  }

  public drawCells() {
    if (!this.getCell) throw 'getCell is not set';
    this.context.beginPath();

    const { dimensions, cellSize, colors } = globals.config.get();

    if (!dimensions) throw 'You need to set the global dimensions';
    if (!cellSize) throw 'You need to set the global cellSize';
    if (!colors) throw 'You need to set the global colors';

    for (let row = 0; row < dimensions.height; row += 1) {
      for (let col = 0; col < dimensions.width; col += 1) {
        const isAlive = this.getCell(row, col);

        this.context.fillStyle = isAlive ? colors.alive : colors.dead;

        this.context.fillRect(
          col * (cellSize + 1) + 1,
          row * (cellSize + 1) + 1,
          cellSize,
          cellSize,
        );
      }
    }

    this.context.stroke();
  }
}
