import type { BaseEngineState } from './engine-state';

export interface DistanceEntry {
  readonly nodeId: string;
  readonly distance: number;
}

export interface GraphAlgorithmEngineState extends BaseEngineState {
  readonly engineType: 'graph-algorithm';
  readonly visitedNodes: readonly string[];
  readonly frontier: readonly string[];
  readonly currentNode: string | null;
  readonly queue: readonly string[];
  readonly stack: readonly string[];
  readonly distanceTable: readonly DistanceEntry[];
}
