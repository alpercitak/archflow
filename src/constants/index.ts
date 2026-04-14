import type { DiagramEdge, DiagramNode, NodeType, Port } from '@/types';
import { getNodeTag } from '@/utils/node-tag';

export const GITHUB_LINK = 'https://github.com/alpercitak/archflow' as const;

const n = (
  id: number,
  type: NodeType,
  label: string,
  meta: string,
  x: number,
  y: number,
  tag?: string,
): DiagramNode => ({ id, type, label, meta, tag: tag ?? getNodeTag(type), x, y });

const e = (id: number, from: number, fromPort: Port, to: number, toPort: Port): DiagramEdge => ({
  id,
  from,
  fromPort,
  to,
  toPort,
  label: '',
});

export const DEFAULT_EDGES: Array<DiagramEdge> = [
  e(1, 1, 'right', 4, 'left'), // Web Client → API Gateway
  e(2, 2, 'right', 4, 'left'), // Mobile App → API Gateway
  e(3, 3, 'bottom', 4, 'top'), // CDN → API Gateway
  e(4, 4, 'right', 5, 'left'), // API Gateway → Load Balancer
  e(5, 5, 'right', 6, 'left'), // LB → Auth Service
  e(6, 5, 'right', 7, 'left'), // LB → User Service
  e(7, 5, 'right', 8, 'left'), // LB → Payment Service
  e(8, 6, 'right', 12, 'left'), // Auth Service → Redis
  e(9, 7, 'right', 11, 'left'), // User Service → PostgreSQL
  e(10, 8, 'right', 11, 'bottom'), // Payment Service → PostgreSQL
  e(11, 8, 'right', 9, 'left'), // Payment Service → Message Queue
  e(12, 9, 'right', 10, 'left'), // Message Queue → Notification
] as const satisfies Array<DiagramEdge>;

export const DEFAULT_NODES: Array<DiagramNode> = [
  n(1, 'client', 'Web Client', 'Browser / SPA', 40, 200),
  n(2, 'client', 'Mobile App', 'iOS / Android', 40, 340),
  n(3, 'cdn', 'CDN', 'Edge cache', 40, 80),
  n(4, 'gateway', 'API Gateway', 'Auth / Rate Limit', 240, 260),
  n(5, 'lb', 'Load Balancer', 'Round-robin', 430, 260),
  n(6, 'service', 'Auth Service', 'JWT / OAuth2', 600, 140, 'gRPC'),
  n(7, 'service', 'User Service', 'CRUD users', 600, 280),
  n(8, 'service', 'Payment Service', 'Stripe / PSP', 600, 420),
  n(9, 'queue', 'Message Queue', 'Kafka', 800, 350),
  n(10, 'service', 'Notification', 'Email / Push', 1000, 350, 'Async'),
  n(11, 'db', 'PostgreSQL', 'Primary DB', 800, 180),
  n(12, 'cache', 'Redis Cache', 'Sessions / TTL', 800, 60),
] as const satisfies Array<DiagramNode>;
