import Node from './Node';
import { power } from '../util';

export default class Universe {
  private root: Node;
  public generation: number;

  public constructor() {
    this.root = Node.createRoot();
    this.generation = 0;
  }

  public step(): void {
    while (
      this.level < 3 ||
      this.nw.population !== this.nw.se.se.population ||
      this.ne.population !== this.ne.sw.sw.population ||
      this.sw.population !== this.sw.ne.ne.population ||
      this.se.population !== this.se.nw.nw.population
    ) {
      this.grow();
    }
    this.generation += power(this.root.level - 2);
    this.calculateNextGeneration();
  }

  public calculateNextGeneration(): void {
    this.root = this.root.calculateNextGeneration();
  }

  public grow(): void {
    const border = Node.createEmpty(this.level - 1);

    this.root = Node.create(
      Node.create(border, border, border, this.root.nw),
      Node.create(border, border, this.root.ne, border),
      Node.create(border, this.root.sw, border, border),
      Node.create(this.root.se, border, border, border),
    );
  }

  public setCell(x: number, y: number): void {
    let maxCoordinate = 1 << (this.level - 1);
    while (
      maxCoordinate * -1 >= x ||
      x >= maxCoordinate - 1 ||
      maxCoordinate * -1 >= y ||
      y >= maxCoordinate - 1
    ) {
      this.grow();
      maxCoordinate = 1 << (this.level - 1);
    }
    this.root = this.root.setCell(x, y);
  }

  private get level(): number {
    return this.root.level;
  }

  private get nw(): Node {
    return this.root.nw;
  }

  private get ne(): Node {
    return this.root.ne;
  }

  private get sw(): Node {
    return this.root.sw;
  }

  private get se(): Node {
    return this.root.se;
  }

  public get rootNode(): Node {
    return this.root;
  }
}

interface ICacheStore {
  [hash: number]: Node;
}

export const cache = (() => {
  const store: ICacheStore = {};
  let collisionCount: number = 0;
  let cacheLength: number = 0;
  let lastId: number = 2;

  const put = (key: number, value: Node) => {
    store[key] = value;
    cacheLength += 1;
  };

  const get = (key: number): Node => store[key];

  const nextId = (): number => {
    lastId += 1;
    return lastId;
  };

  const incrementCollisions = () => {
    collisionCount += 1;
  };

  return {
    put,
    get,
    nextId,
    incrementCollisions,
    data: () => ({
      lastId,
      cacheLength,
      collisionCount,
    }),
  };
})();
