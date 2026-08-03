/**
 * @module EngineState
 * @purpose Canonical, serializable state snapshot container for the Training Engine.
 * @layer Layer 6 Engine
 * @dependencies topology-types, engine-types
 * @api EngineState, createInitialEngineState
 * @limitations Strictly serializable primitives. No DOM/Canvas/React references.
 */

import { TopologyGraph } from '../topology/topology-types';
import { EngineStatus } from './engine-types';

export interface EngineState {
  readonly status: EngineStatus;
  readonly topology: TopologyGraph;
  readonly activeNodes: readonly string[];
  readonly activeEdges: readonly string[];
  readonly currentStep: number;
  readonly currentEpoch: number;
  readonly currentIteration: number;
  readonly metrics: Readonly<Record<string, number>>;
  readonly timestamp: number;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createInitialEngineState(
  topology: TopologyGraph,
  initialMetrics?: Record<string, number>,
  metadata?: Record<string, unknown>
): EngineState {
  return Object.freeze({
    status: 'idle',
    topology,
    activeNodes: [],
    activeEdges: [],
    currentStep: 0,
    currentEpoch: 1,
    currentIteration: 0,
    metrics: Object.freeze({
      loss: 2.302,
      gradientNorm: 1.0,
      accuracy: 0.1,
      learningRate: 0.01,
      ...initialMetrics,
    }),
    timestamp: Date.now(),
    metadata: Object.freeze({ ...metadata }),
  });
}
