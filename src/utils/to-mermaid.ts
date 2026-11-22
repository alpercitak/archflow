import type { DiagramEdge, DiagramNode, NodeType } from '@/types';

const SHAPES: Record<Exclude<NodeType, 'note'>, readonly [open: string, close: string]> = {
  cache: ['((', '))'],
  cdn: ['[', ']'],
  client: ['([', '])'],
  db: ['[(', ')]'],
  ext: ['[', ']'],
  gateway: ['{{', '}}'],
  lb: ['{{', '}}'],
  queue: ['[[', ']]'],
  service: ['[', ']'],
  storage: ['[(', ')]'],
};

type ShapedNode = DiagramNode & { type: Exclude<NodeType, 'note'> };

const escapeText = (text: string): string => text.replace(/\r?\n/g, ' ').replaceAll('"', '#quot;');

const toNodeLine = (node: ShapedNode): string => {
  const [open, close] = SHAPES[node.type];
  const label = escapeText(node.label);
  const text = node.meta ? `${label}<br/>${escapeText(node.meta)}` : label;
  return `n${node.id}${open}"${text}"${close}`;
};

const toEdgeLine = (edge: DiagramEdge): string => {
  const arrow = edge.label ? `-->|"${escapeText(edge.label)}"|` : '-->';
  return `n${edge.from} ${arrow} n${edge.to}`;
};

const isShapedNode = (node: DiagramNode): node is ShapedNode => node.type !== 'note';

export const toMermaid = (nodes: Array<DiagramNode>, edges: Array<DiagramEdge>): string => {
  const shapedNodes = nodes.filter(isShapedNode);
  const nodeIds = new Set(shapedNodes.map((node) => node.id));
  const shapedEdges = edges.filter((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to));

  const lines = [...shapedNodes.map(toNodeLine), ...shapedEdges.map(toEdgeLine)];
  return `${['flowchart LR', ...lines.map((line) => `  ${line}`)].join('\n')}\n`;
};
