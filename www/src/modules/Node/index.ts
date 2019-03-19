import LeafNode from './LeafNode';
import { INodes, INodesUndefined, UNDEFINED_NODES, hash } from './misc';
import { power } from '../../util';
import { cache } from '../Universe';

export default class Node extends LeafNode<Node> {
  public result: Node | undefined;

  public static createAliveLeaf = () => new Node(0, UNDEFINED_NODES, true);
  public static createDeadLeaf = () => new Node(1, UNDEFINED_NODES, false);

  public static createRoot = () => Node.createEmpty(3);

  public static create(nodes: INodes<Node>): Node {
    const hashCode = hash(nodes.nw.id, nodes.ne.id, nodes.sw.id, nodes.se.id);

    let cached = cache.get(hashCode);

    if (!cached) {
      cached = new Node(cache.nextId(), nodes);
      cache.put(hashCode, cached);
    }

    if (
      cached.nw === nodes.nw &&
      cached.ne === nodes.ne &&
      cached.sw === nodes.sw &&
      cached.se === nodes.se
    ) {
      return cached;
    }

    cached = new Node(cache.nextId(), nodes);
    cache.put(hashCode, cached);

    cache.incrementCollisions();

    return cached;
  }

  public static createEmpty(level: number): Node {
    if (level === 0) return DEAD_LEAF;

    const node = Node.createEmpty(level - 1);

    return Node.create({
      nw: node,
      ne: node,
      sw: node,
      se: node,
    });
  }

  private constructor(id: number, nodes: INodes<Node> | INodesUndefined, isAlive?: boolean) {
    super(id, nodes, isAlive);
  }

  public setCell(x: number, y: number): Node {
    if (this.level === 0) return ALIVE_LEAF;

    const offset = this.level === 1 ? 0 : power(this.level - 2);

    if (x < 0) {
      return y < 0
        ? Node.create({ ...this.nodes, nw: this.nw.setCell(x + offset, y + offset) })
        : Node.create({ ...this.nodes, sw: this.sw.setCell(x + offset, y - offset) });
    }

    return y < 0
      ? Node.create({ ...this.nodes, ne: this.ne.setCell(x - offset, y + offset) })
      : Node.create({ ...this.nodes, se: this.se.setCell(x - offset, y - offset) });
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

  public get nodes(): INodes<Node> {
    return { nw: this.nw, ne: this.ne, sw: this.sw, se: this.se };
  }

  public calculateNextGeneration() {
    if (!this.result) this.result = this.nextGeneration();
    return this.result;
  }

  public nextGeneration(): Node {
    if (this.population === 0) return this.nw;
    if (this.level === 2) return slowNextGeneration(this);
    // 8x8
    const nwCenterNode = Node.create({
      nw: this.nw.nw.se,
      ne: this.nw.ne.sw,
      sw: this.nw.sw.ne,
      se: this.nw.se.nw,
    });

    // 8x8
    const nwNECenterNode = Node.create({
      nw: this.nw.ne.se,
      ne: this.ne.nw.sw,
      sw: this.nw.se.ne,
      se: this.ne.sw.nw,
    });

    // 8x8
    const neCenterNode = Node.create({
      nw: this.ne.nw.se,
      ne: this.ne.ne.sw,
      sw: this.ne.sw.ne,
      se: this.ne.se.nw,
    });

    // 8x8
    const nwSWCenterNode = Node.create({
      nw: this.nw.sw.se,
      ne: this.nw.se.sw,
      sw: this.sw.nw.ne,
      se: this.sw.ne.nw,
    });

    // 8x8
    const centerNode = Node.create({
      nw: this.nw.se.se,
      ne: this.ne.sw.sw,
      sw: this.sw.ne.ne,
      se: this.se.nw.nw,
    });

    // 8x8
    const neSECenterNode = Node.create({
      nw: this.ne.sw.se,
      ne: this.ne.se.sw,
      sw: this.se.nw.ne,
      se: this.se.ne.nw,
    });

    // 8x8
    const swCenterNode = Node.create({
      nw: this.sw.nw.se,
      ne: this.sw.ne.sw,
      sw: this.sw.sw.ne,
      se: this.sw.se.nw,
    });

    // 8x8
    const swSECenterNode = Node.create({
      nw: this.sw.ne.se,
      ne: this.se.nw.sw,
      sw: this.sw.se.ne,
      se: this.se.sw.nw,
    });

    // 8x8
    const seCenterNode = Node.create({
      nw: this.se.nw.se,
      ne: this.se.ne.sw,
      sw: this.se.sw.ne,
      se: this.se.se.nw,
    });

    return Node.create({
      // NW QuadTree 16x16
      nw: Node.create({
        nw: nwCenterNode,
        ne: nwNECenterNode,
        sw: nwSWCenterNode,
        se: centerNode,
      }).calculateNextGeneration(),
      // NE QuadTree 16x16
      ne: Node.create({
        nw: nwNECenterNode,
        ne: neCenterNode,
        sw: centerNode,
        se: neSECenterNode,
      }).calculateNextGeneration(),
      // SW QuadTree 16x16
      sw: Node.create({
        nw: nwSWCenterNode,
        ne: centerNode,
        sw: swCenterNode,
        se: swSECenterNode,
      }).calculateNextGeneration(),
      // SE QuadTree 16x16
      se: Node.create({
        nw: centerNode,
        ne: neSECenterNode,
        sw: swSECenterNode,
        se: seCenterNode,
      }).calculateNextGeneration(),
    });
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
  return Node.create({
    nw: singleGeneration(allBits >> 5),
    ne: singleGeneration(allBits >> 4),
    sw: singleGeneration(allBits >> 1),
    se: singleGeneration(allBits),
  });
};
