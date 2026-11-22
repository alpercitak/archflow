import type { DiagramEdge, DiagramNode, NodeType, Port } from '@/types';
import { NODE_TYPES } from '@/utils/node-tag';

const PORTS: ReadonlyArray<Port> = ['top', 'right', 'bottom', 'left'];

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const isNode = (value: unknown): value is DiagramNode =>
  isObject(value) &&
  typeof value.id === 'number' &&
  typeof value.x === 'number' &&
  typeof value.y === 'number' &&
  typeof value.label === 'string' &&
  typeof value.meta === 'string' &&
  typeof value.tag === 'string' &&
  NODE_TYPES.includes(value.type as NodeType);

export const isEdge = (value: unknown): value is DiagramEdge =>
  isObject(value) &&
  typeof value.id === 'number' &&
  typeof value.from === 'number' &&
  typeof value.to === 'number' &&
  typeof value.label === 'string' &&
  PORTS.includes(value.fromPort as Port) &&
  PORTS.includes(value.toPort as Port);
