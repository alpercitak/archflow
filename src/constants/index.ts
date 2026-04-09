import type { DiagramEdge, DiagramNode, NodeType } from '@/types';
import { getNodeTag } from '@/utils/node-tag';

const n = (
  id: number,
  type: NodeType,
  label: string,
  meta: string,
  x: number,
  y: number,
  tag?: string,
): DiagramNode => ({ id, type, label, meta, tag: tag ?? getNodeTag(type), x, y });

const e = (id: number, from: number, to: number): DiagramEdge => ({ id, from, to, label: '' });

export const DEFAULT_EDGES: Array<DiagramEdge> = [
  e(1, 1, 4),
  e(2, 2, 4),
  e(3, 3, 4),
  e(4, 4, 5),
  e(5, 5, 6),
  e(6, 5, 7),
  e(7, 5, 8),
  e(8, 6, 12),
  e(9, 7, 11),
  e(10, 8, 11),
  e(11, 8, 9),
  e(12, 9, 10),
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
