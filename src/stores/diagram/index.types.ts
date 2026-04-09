import type { DiagramNode, PaletteItem, Position } from '@/types';

export interface AddNodeArgs extends Partial<Position> {
  item: PaletteItem;
}

export interface UpdateNodeArgs {
  nodeId: number;
  updater: (prev: DiagramNode) => DiagramNode;
}
