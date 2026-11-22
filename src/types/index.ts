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
  load?: number;
  capacity?: number;
  latencyMs?: number;
}

export type NodeTemplate = Pick<DiagramNode, 'type' | 'label' | 'meta'>;

export type DiagramEdge = {
  id: number;
  label: string;
  from: number;
  to: number;
  fromPort: Port;
  toPort: Port;
};

export type ConnectingState = {
  nodeId: number;
  port: Port;
};

export interface Position {
  x: number;
  y: number;
}

export type SimStatus = 'idle' | 'ok' | 'warn' | 'overloaded';

export interface SimNodeResult {
  inRps: number;
  utilization: number;
  status: SimStatus;
  latencyMs: number;
}

export interface SimResult {
  nodes: Map<number, SimNodeResult>;
  edges: Map<number, number>;
  clientLatencyMs: Map<number, number>;
  throughputRps: number;
  droppedRps: number;
  cycleNodeIds: Array<number>;
}
