export default class Coordinate {
  constructor(public x: number = 0, public y: number = 0) {}

  public add(newX: number, newY: number): void {
    this.x += newX;
    this.y += newY;
  }

  public sub(newX: number, newY: number): void {
    this.x -= newX;
    this.y -= newY;
  }

  public set(newX: number, newY: number): void {
    this.x = newX;
    this.y = newY;
  }
}
