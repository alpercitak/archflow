import type { DiagramEdge, DiagramNode, NodeTemplate, NodeType, Port } from '@/types';
import { NODE_TYPES } from '@/utils/node-tag';

const PORTS: ReadonlyArray<Port> = ['top', 'right', 'bottom', 'left'];

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isOptionalNumber = (value: unknown): boolean => value === undefined || Number.isFinite(value);

export const isNodeTemplate = (value: unknown): value is NodeTemplate =>
  isObject(value) &&
  NODE_TYPES.includes(value.type as NodeType) &&
  typeof value.label === 'string' &&
  typeof value.meta === 'string';

export const isNode = (value: unknown): value is DiagramNode =>
  isObject(value) &&
  typeof value.id === 'number' &&
  typeof value.x === 'number' &&
  typeof value.y === 'number' &&
  typeof value.label === 'string' &&
  typeof value.meta === 'string' &&
  typeof value.tag === 'string' &&
  NODE_TYPES.includes(value.type as NodeType) &&
  isOptionalNumber(value.load) &&
  isOptionalNumber(value.capacity) &&
  isOptionalNumber(value.latencyMs);

export const isEdge = (value: unknown): value is DiagramEdge =>
  isObject(value) &&
  typeof value.id === 'number' &&
  typeof value.from === 'number' &&
  typeof value.to === 'number' &&
  typeof value.label === 'string' &&
  PORTS.includes(value.fromPort as Port) &&
  PORTS.includes(value.toPort as Port);
