import BaseNode from './BaseNode';
import { INodes, INodesUndefined } from './misc';

export default class LeafNode<T extends BaseNode> extends BaseNode {
  private readonly NW: T | undefined;
  private readonly NE: T | undefined;
  private readonly SW: T | undefined;
  private readonly SE: T | undefined;

  constructor(id: number, { nw, ne, sw, se }: INodes<T> | INodesUndefined, isAlive?: boolean) {
    if (!nw || !ne || !sw || !se) {
      super(id, 0, isAlive ? 1 : 0);
      return;
    }
    super(id, nw.level + 1, nw.population + ne.population + sw.population + se.population);
    this.NW = nw;
    this.NE = ne;
    this.SW = sw;
    this.SE = se;
  }

  public get nw(): T {
    if (this.NW === undefined) throw 'NorthWestern Node is undefined';
    return this.NW;
  }

  public get ne(): T {
    if (this.NE === undefined) throw 'NorthEastern Node is undefined';
    return this.NE;
  }

  public get sw(): T {
    if (this.SW === undefined) throw 'SouthWestern Node is undefined';
    return this.SW;
  }

  public get se(): T {
    if (this.SE === undefined) throw 'SouthEastern Node is undefined';
    return this.SE;
  }
}
