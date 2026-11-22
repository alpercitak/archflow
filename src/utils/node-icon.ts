import {
  Cog,
  Database,
  Globe,
  Link,
  type LucideIcon,
  Mail,
  Network,
  Package,
  Scale,
  Shield,
  StickyNote,
  Zap,
} from 'lucide-react';
import type { NodeType } from '@/types';

const ICON_MAP = {
  cache: Zap,
  cdn: Network,
  client: Globe,
  db: Database,
  ext: Link,
  gateway: Shield,
  lb: Scale,
  note: StickyNote,
  queue: Mail,
  service: Cog,
  storage: Package,
} as const satisfies Record<NodeType, LucideIcon>;

export const getNodeIcon = (type: NodeType): LucideIcon => ICON_MAP[type];
