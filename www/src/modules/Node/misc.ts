import Node from '.';

export type INodes<T> = { nw: T; ne: T; sw: T; se: T };
export type INodesUndefined = { nw: undefined; ne: undefined; sw: undefined; se: undefined };

export const UNDEFINED_NODES: INodesUndefined = {
  nw: undefined,
  ne: undefined,
  sw: undefined,
  se: undefined,
};

// const HASH_PRIME = 8831;
// const HASH_PRIME = 179426549;
// const HASH_PRIME = 32416190071;
const HASH_PRIME = 23;

export const hash = (nwId: number, neId: number, swId: number, seId: number): number =>
  (((((nwId * HASH_PRIME) ^ neId) * HASH_PRIME) ^ swId) * HASH_PRIME) ^ seId;

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
