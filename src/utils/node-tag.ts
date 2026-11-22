import type { NodeType } from '@/types';

const TAG_MAP = {
  cache: 'Cache',
  cdn: 'Static',
  client: 'HTTP/WS',
  db: 'SQL',
  ext: 'HTTP',
  gateway: 'REST',
  lb: 'L7',
  note: 'Note',
  queue: 'Pub/Sub',
  service: 'REST',
  storage: 'Blob',
} as const satisfies Record<NodeType, string>;

export const NODE_TYPES: ReadonlyArray<NodeType> = Object.keys(TAG_MAP) as Array<NodeType>;

export const getNodeTag = (type: NodeType): string => TAG_MAP[type];
