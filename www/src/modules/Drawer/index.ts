import globals from '../globals';
import Node from '../Node';
import { power } from '../../util';
import mouseEvents from './mouseEvents';
import Drawer, { IDimensions } from './Drawer';
import Coordinate from './Coordinate';

export interface IColors {
  alive: string;
  dead: string;
}

export default class LifeDrawer extends Drawer {
  private readonly offset: Coordinate;
  private readonly grid: Int32Array;

  private borderWidth: number;
  private cellSize: number;

  public colors: IColors;

  constructor(dimensions: IDimensions, colors: IColors, startingCellSize: number) {
    super(dimensions);

    this.colors = colors;
    this.cellSize = startingCellSize;

    this.borderWidth = 0;

    this.offset = new Coordinate();

    this.grid = this.createImageDataBuffer(Int32Array) as Int32Array;

    for (let i = 0; i < this.area; i++) {
      this.grid[i] = 0xff << 24;
    }

    mouseEvents.set({
      onScroll: this.zoom.bind(this),
      onMove: this.offset.add.bind(this.offset),
    });

    this.centerView();
  }

  public centerView(): void {
    this.offset.set(this.dimensions.height >> 1, this.dimensions.height >> 1);
  }

  public zoom(isDown: boolean, x: number, y: number) {
    this.cellSize = isDown ? this.cellSize / 2 : this.cellSize * 2;

    const offsetX = this.offset.x - x;
    const offsetY = this.offset.y - y;

    if (isDown) this.offset.sub(Math.round(offsetX / 2), Math.round(offsetY / 2));
    else this.offset.add(Math.round(offsetX), Math.round(offsetY));
  }

  public draw(rootNode: Node) {
    const blackInt = 0 | (0 << 8) | (0 << 16) | (0xff << 24);

    this.borderWidth = (this.borderWidth * this.cellSize) | 0;

    for (let i = 0; i < this.area; i++) {
      this.grid[i] = blackInt;
    }

    const drawSize = power(rootNode.level - 1) * this.cellSize;

    this.drawNode(rootNode, 2 * drawSize, drawSize * -1, drawSize * -1);

    this.update();
  }

  private drawNode(node: Node, size: number, offsetX: number, offsetY: number) {
    if (node.empty()) return;

    if (
      offsetX + size + this.offset.x < 0 ||
      offsetY + size + this.offset.y < 0 ||
      offsetX + this.offset.x >= this.dimensions.width ||
      offsetY + this.offset.y >= this.dimensions.height
    )
      return;

    if (size <= 1 || node.isLeaf()) {
      this.drawCell(
        offsetX + this.offset.x,
        offsetY + this.offset.y,
        size <= 1 ? 1 : this.cellSize,
      );
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

    if (x + cellWidth > this.dimensions.width) cellWidth = this.dimensions.width - x;

    if (y < 0) {
      cellHeight += y;
      y = 0;
    }

    if (y + cellHeight > this.dimensions.height) cellHeight = this.dimensions.height - y;

    if (cellHeight <= 0 || cellWidth <= 0) return;

    let pointer = x + y * this.dimensions.width;
    const row_width = this.dimensions.width - cellWidth;

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
