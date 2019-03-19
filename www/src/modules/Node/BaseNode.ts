export default abstract class BaseNode {
  constructor(
    public readonly id: number,
    public readonly level: number,
    public readonly population: number,
  ) {}
}
