import type { LucideIcon } from 'lucide-react';

export type NodeType =
  | 'client'
  | 'gateway'
  | 'service'
  | 'db'
  | 'cache'
  | 'storage'
  | 'queue'
  | 'cdn'
  | 'lb'
  | 'ext'
  | 'note';

export type Port = 'top' | 'right' | 'bottom' | 'left';

export interface DiagramNode extends Position {
  id: number;
  type: NodeType;
  label: string;
  meta: string;
  tag: string;
  icon?: LucideIcon;
}

export type DiagramEdge = {
  id: number;
  label: string;
  from: number;
  to: number;
  fromPort: Port;
  toPort: Port;
};

export type PaletteItem = {
  type: NodeType;
  label: string;
  meta: string;
  tag: string;
};

export type ConnectingState = {
  nodeId: number;
  port: Port;
};

export interface Position {
  x: number;
  y: number;
}
