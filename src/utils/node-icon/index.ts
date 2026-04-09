import type { NodeType } from '@/types';
import {
  Cog,
  Database,
  Globe,
  Link,
  Mail,
  Network,
  Package,
  Scale,
  Shield,
  StickyNote,
  Zap,
  type LucideIcon,
} from 'lucide-react';

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
