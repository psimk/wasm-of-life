export type INodes<T> = { nw: T; ne: T; sw: T; se: T };
export type INodesUndefined = { nw: undefined; ne: undefined; sw: undefined; se: undefined };

export const UNDEFINED_NODES: INodesUndefined = {
  nw: undefined,
  ne: undefined,
  sw: undefined,
  se: undefined,
};

const HASH_PRIME = 8831;

export const hash = (nwId: number, neId: number, swId: number, seId: number): number =>
  (((((nwId * HASH_PRIME) ^ neId) * HASH_PRIME) ^ swId) * HASH_PRIME) ^ seId;
