import type { DiagramEdge, DiagramNode, NodeType } from '@/types';
import { getCubicPath } from '@/utils/cubic-path';
import { getPortPosition } from '@/utils/port-position';
import type { ExportResult } from './types';

const FALLBACK_NODE_WIDTH = 140;
const FALLBACK_NODE_HEIGHT = 80;
const EXPORT_PADDING = 48;

const COLORS = {
  accent: '#4f8ef7',
  bg: '#0e0f13',
  border: '#2a2d38',
  border2: '#363a4a',
  surface2: '#1e2028',
  text: '#e8eaf0',
  text3: '#555e73',
} as const;

const NODE_COLORS: Record<NodeType, string> = {
  cache: '#22d3ee',
  cdn: '#f472b6',
  client: '#5b8dee',
  db: '#fbbf24',
  ext: '#94a3b8',
  gateway: '#8b5cf6',
  lb: '#a78bfa',
  note: '#2d94b4',
  queue: '#f87171',
  service: '#34d399',
  storage: '#fb923c',
};

type NodeBounds = {
  height: number;
  width: number;
  x: number;
  y: number;
};

const escapeXml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const getNodeBounds = (node: DiagramNode): NodeBounds => {
  const el = document.getElementById(`node-${node.id}`);
  return {
    x: node.x,
    y: node.y,
    width: el?.offsetWidth ?? FALLBACK_NODE_WIDTH,
    height: el?.offsetHeight ?? FALLBACK_NODE_HEIGHT,
  };
};

export const exportSvg = (nodes: Array<DiagramNode>, edges: Array<DiagramEdge>): ExportResult => {
  if (nodes.length === 0) {
    return null;
  }

  const nodeBounds = new Map(nodes.map((node) => [node.id, getNodeBounds(node)]));

  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const node of nodes) {
    const bounds = nodeBounds.get(node.id);
    if (!bounds) {
      continue;
    }

    minX = Math.min(minX, bounds.x);
    minY = Math.min(minY, bounds.y);
    maxX = Math.max(maxX, bounds.x + bounds.width);
    maxY = Math.max(maxY, bounds.y + bounds.height);
  }

  for (const edge of edges) {
    const fromNode = nodes.find((node) => node.id === edge.from);
    const toNode = nodes.find((node) => node.id === edge.to);
    if (!fromNode || !toNode) {
      continue;
    }

    const from = getPortPosition(fromNode, edge.fromPort);
    const to = getPortPosition(toNode, edge.toPort);
    const labelX = (from.x + to.x) / 2;
    const labelY = (from.y + to.y) / 2 - 8;

    minX = Math.min(minX, from.x, to.x, labelX);
    minY = Math.min(minY, from.y, to.y, labelY);
    maxX = Math.max(maxX, from.x, to.x, labelX);
    maxY = Math.max(maxY, from.y, to.y, labelY);
  }

  const exportX = minX - EXPORT_PADDING;
  const exportY = minY - EXPORT_PADDING;
  const exportWidth = Math.max(1, maxX - minX + EXPORT_PADDING * 2);
  const exportHeight = Math.max(1, maxY - minY + EXPORT_PADDING * 2);

  const edgesMarkup = edges
    .map((edge) => {
      const fromNode = nodes.find((node) => node.id === edge.from);
      const toNode = nodes.find((node) => node.id === edge.to);
      if (!fromNode || !toNode) {
        return '';
      }

      const from = getPortPosition(fromNode, edge.fromPort);
      const to = getPortPosition(toNode, edge.toPort);
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2 - 8;

      return [
        `<path d="${getCubicPath(from.x, from.y, to.x, to.y)}" fill="none" stroke="${COLORS.border2}" stroke-width="1.5" marker-end="url(#arrowhead)" />`,
        edge.label
          ? `<text x="${midX}" y="${midY}" fill="${COLORS.text3}" font-family="'DM Sans', sans-serif" font-size="10" text-anchor="middle">${escapeXml(edge.label)}</text>`
          : '',
      ].join('');
    })
    .join('');

  const nodesMarkup = nodes
    .map((node) => {
      const bounds = nodeBounds.get(node.id);
      if (!bounds) {
        return '';
      }

      const nodeColor = NODE_COLORS[node.type];
      const headerHeight = 36;
      const tagText = node.tag || '';
      const tagWidth = Math.max(24, tagText.length * 6.3 + 10);

      return `
        <g transform="translate(${bounds.x}, ${bounds.y})">
          <rect width="${bounds.width}" height="${bounds.height}" rx="10" fill="${COLORS.surface2}" stroke="${COLORS.border2}" />
          <line x1="0" y1="${headerHeight}" x2="${bounds.width}" y2="${headerHeight}" stroke="${COLORS.border}" />
          <rect x="12" y="10" width="24" height="24" rx="5" fill="${nodeColor}" fill-opacity="0.12" />
          <circle cx="24" cy="22" r="5" fill="${nodeColor}" />
          <text x="44" y="24" fill="${COLORS.text}" font-family="'DM Sans', sans-serif" font-size="12" font-weight="500">${escapeXml(node.label)}</text>
          <text x="12" y="54" fill="${COLORS.text3}" font-family="'IBM Plex Mono', monospace" font-size="10">${escapeXml(node.meta)}</text>
          <rect x="12" y="${Math.max(headerHeight + 22, bounds.height - 22)}" width="${tagWidth}" height="14" rx="3" fill="${nodeColor}" fill-opacity="0.12" />
          <text x="17" y="${Math.max(headerHeight + 32, bounds.height - 12)}" fill="${nodeColor}" font-family="'IBM Plex Mono', monospace" font-size="9" font-weight="500">${escapeXml(tagText)}</text>
        </g>
      `;
    })
    .join('');

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${exportWidth}" height="${exportHeight}" viewBox="${exportX} ${exportY} ${exportWidth} ${exportHeight}" fill="none">
  <defs>
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="${COLORS.border2}" />
    </marker>
  </defs>
  <rect x="${exportX}" y="${exportY}" width="${exportWidth}" height="${exportHeight}" fill="${COLORS.bg}" />
  ${edgesMarkup}
  ${nodesMarkup}
</svg>`;

  return {
    blob: new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }),
    extension: 'svg',
  };
};
