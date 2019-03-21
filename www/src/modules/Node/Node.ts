import LeafNode from './LeafNode';
import { INodes, INodesUndefined, UNDEFINED_NODES, hash, cache } from './misc';
import { power } from '../../util';
import globals from '../globals';

export default class Node extends LeafNode<Node> {
  public result: Node | undefined;

  public static createAliveLeaf = () => new Node(0, UNDEFINED_NODES, true);
  public static createDeadLeaf = () => new Node(1, UNDEFINED_NODES, false);

  public static createRoot = () => Node.createEmpty(3);

  public static create(nw: Node, ne: Node, sw: Node, se: Node): Node {
    const hashCode = hash(nw.id, ne.id, sw.id, se.id);

    let cached = cache.get(hashCode);

    const addToCache = () => {
      cached = new Node(cache.nextId(), { nw, ne, sw, se });
      cache.put(hashCode, cached);
    };

    if (!cached) addToCache();
    if (cached.nw === nw && cached.ne === ne && cached.sw === sw && cached.se === se) return cached;

    cache.incrementCollisions();

    return new Node(cache.nextId(), { nw, ne, sw, se });
  }

  public static createEmpty(level: number): Node {
    if (level === 0) return DEAD_LEAF;

    const node = Node.createEmpty(level - 1);

    return Node.create(node, node, node, node);
  }

  private constructor(id: number, nodes: INodes<Node> | INodesUndefined, isAlive?: boolean) {
    super(id, nodes, isAlive);
  }

  public setCell(x: number, y: number): Node {
    if (this.level === 0) return ALIVE_LEAF;

    const offset = this.level === 1 ? 0 : power(this.level - 2);

    if (x < 0) {
      return y < 0
        ? Node.create(this.nw.setCell(x + offset, y + offset), this.ne, this.sw, this.se)
        : Node.create(this.nw, this.ne, this.sw.setCell(x + offset, y - offset), this.se);
    }

    return y < 0
      ? Node.create(this.nw, this.ne.setCell(x - offset, y + offset), this.sw, this.se)
      : Node.create(this.nw, this.ne, this.sw, this.se.setCell(x - offset, y - offset));
  }

  public getCell(x: number, y: number): boolean {
    if (this.population === 0) return false;
    if (this.level === 0) return true;

    const offset = this.level === 1 ? 0 : power(this.level - 2);

    if (x < 0) {
      return y < 0
        ? this.nw.getCell(x + offset, y + offset)
        : this.sw.getCell(x + offset, y - offset);
    }

    return y < 0
      ? this.ne.getCell(x - offset, y + offset)
      : this.se.getCell(x - offset, y - offset);
  }

  public empty = (): boolean => this.population === 0;
  public isLeaf = (): boolean => this.level === 0;

  public calculateNextGeneration() {
    if (!this.result) this.result = this.nextGeneration();
    if (this.population === 0) this.result = this.nw;
    return this.result;
  }

  public nextQuickGeneration(): Node {
    if (this.result) return this.result;
    if (this.population === 0) {
      this.result = this.nw;
      return this.result;
    }
    if (this.level === 2) {
      this.result = slowNextGeneration(this);
      return this.result;
    }

    const nw = this.nw.nextQuickGeneration();

    const nwNEVerticalLine = Node.create(
      this.nw.ne,
      this.ne.nw,
      this.nw.se,
      this.ne.sw,
    ).nextQuickGeneration();

    const ne = this.ne.nextQuickGeneration();

    const nwSWHorizontalLine = Node.create(
      this.nw.sw,
      this.nw.se,
      this.sw.nw,
      this.sw.ne,
    ).nextQuickGeneration();

    const centerNode = Node.create(
      this.nw.se,
      this.ne.sw,
      this.sw.ne,
      this.se.nw,
    ).nextQuickGeneration();

    const neSEHorizontalLine = Node.create(
      this.ne.sw,
      this.ne.se,
      this.se.nw,
      this.se.ne,
    ).nextQuickGeneration();

    const sw = this.sw.nextQuickGeneration();

    const swSEVerticalLine = Node.create(
      this.sw.ne,
      this.se.nw,
      this.sw.se,
      this.se.sw,
    ).nextQuickGeneration();

    const se = this.se.nextQuickGeneration();

    this.result = Node.create(
      Node.create(nw, nwNEVerticalLine, nwSWHorizontalLine, centerNode).nextQuickGeneration(),
      Node.create(nwNEVerticalLine, ne, centerNode, neSEHorizontalLine).nextQuickGeneration(),
      Node.create(nwSWHorizontalLine, centerNode, sw, swSEVerticalLine).nextQuickGeneration(),
      Node.create(centerNode, neSEHorizontalLine, swSEVerticalLine, se).nextQuickGeneration(),
    );

    return this.result;
  }

  public nextGeneration(): Node {
    if (this.result) return this.result;
    if (this.population === 0) {
      this.result = this.nw;
      return this.result;
    }

    if (globals.stats.get().step === this.level - 2) return this.nextQuickGeneration();

    if (this.level === 2) return slowNextGeneration(this);

    const nwCenterNode = Node.create(this.nw.nw.se, this.nw.ne.sw, this.nw.sw.ne, this.nw.se.nw);
    const nwNECenterNode = Node.create(this.nw.ne.se, this.ne.nw.sw, this.nw.se.ne, this.ne.sw.nw);
    const neCenterNode = Node.create(this.ne.nw.se, this.ne.ne.sw, this.ne.sw.ne, this.ne.se.nw);
    const nwSWCenterNode = Node.create(this.nw.sw.se, this.nw.se.sw, this.sw.nw.ne, this.sw.ne.nw);
    const centerNode = Node.create(this.nw.se.se, this.ne.sw.sw, this.sw.ne.ne, this.se.nw.nw);
    const neSECenterNode = Node.create(this.ne.sw.se, this.ne.se.sw, this.se.nw.ne, this.se.ne.nw);
    const swCenterNode = Node.create(this.sw.nw.se, this.sw.ne.sw, this.sw.sw.ne, this.sw.se.nw);
    const swSECenterNode = Node.create(this.sw.ne.se, this.se.nw.sw, this.sw.se.ne, this.se.sw.nw);
    const seCenterNode = Node.create(this.se.nw.se, this.se.ne.sw, this.se.sw.ne, this.se.se.nw);

    return Node.create(
      Node.create(
        nwCenterNode,
        nwNECenterNode,
        nwSWCenterNode,
        centerNode,
      ).calculateNextGeneration(),
      Node.create(
        nwNECenterNode,
        neCenterNode,
        centerNode,
        neSECenterNode,
      ).calculateNextGeneration(),
      Node.create(
        nwSWCenterNode,
        centerNode,
        swCenterNode,
        swSECenterNode,
      ).calculateNextGeneration(),
      Node.create(
        centerNode,
        neSECenterNode,
        swSECenterNode,
        seCenterNode,
      ).calculateNextGeneration(),
    );
  }
}

const DEAD_LEAF = Node.createDeadLeaf();
const ALIVE_LEAF = Node.createAliveLeaf();

const singleGeneration = (bitMask: number): Node => {
  if (bitMask === 0) return DEAD_LEAF;
  const self = (bitMask >> 5) & 1;
  bitMask &= 0x757;
  let neighborCount = 0;
  while (bitMask !== 0) {
    neighborCount += 1;
    bitMask &= bitMask - 1;
  }
  return neighborCount === 3 || (neighborCount === 2 && self !== 0) ? ALIVE_LEAF : DEAD_LEAF;
};

const slowNextGeneration = (node: Node): Node => {
  let allBits = 0;
  for (let y = -2; y < 2; y += 1) {
    for (let x = -2; x < 2; x += 1) {
      allBits = (allBits << 1) + (node.getCell(x, y) ? 1 : 0);
    }
  }
  return Node.create(
    singleGeneration(allBits >> 5),
    singleGeneration(allBits >> 4),
    singleGeneration(allBits >> 1),
    singleGeneration(allBits),
  );
};
