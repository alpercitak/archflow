import type { DiagramNode } from '@/types';

type DiagramNodeGroup = {
  title: string;
  items: ReadonlyArray<Partial<DiagramNode>>;
};

export const NODE_GROUPS: ReadonlyArray<DiagramNodeGroup> = [
  {
    title: 'Client',
    items: [
      { type: 'client', label: 'Web Client', meta: 'Browser / SPA' },
      { type: 'client', label: 'Mobile App', meta: 'iOS / Android' },
    ],
  },
  {
    title: 'Network',
    items: [
      { type: 'gateway', label: 'API Gateway', meta: 'Auth / Rate Limit' },
      { type: 'lb', label: 'Load Balancer', meta: 'Round-robin' },
      { type: 'cdn', label: 'CDN', meta: 'Edge cache' },
    ],
  },
  {
    title: 'Services',
    items: [
      { type: 'service', label: 'Auth Service', meta: 'JWT / OAuth2' },
      { type: 'service', label: 'User Service', meta: 'CRUD users' },
      { type: 'service', label: 'Payment Service', meta: 'Stripe / PSP' },
      { type: 'service', label: 'Notification', meta: 'Email / Push / SMS' },
      { type: 'service', label: 'Search Service', meta: 'Elasticsearch' },
    ],
  },
  {
    title: 'Data',
    items: [
      { type: 'db', label: 'PostgreSQL', meta: 'Primary DB' },
      { type: 'db', label: 'MongoDB', meta: 'Document store' },
      { type: 'cache', label: 'Redis Cache', meta: 'TTL / Sessions' },
      { type: 'storage', label: 'Object Storage', meta: 'S3 / GCS' },
    ],
  },
  {
    title: 'Messaging',
    items: [
      { type: 'queue', label: 'Message Queue', meta: 'Kafka / RabbitMQ' },
      { type: 'queue', label: 'Event Bus', meta: 'Async events' },
    ],
  },
  { title: 'External', items: [{ type: 'ext', label: '3rd Party API', meta: 'External service' }] },
];
