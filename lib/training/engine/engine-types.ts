/**
 * @module EngineTypes
 * @purpose Defines core types, status enums, and configuration interfaces for the Training Engine.
 * @layer Layer 6 Engine
 * @dependencies topology-types
 * @api EngineStatus, EngineConfig, EngineSnapshot, EngineContext
 * @limitations Framework-agnostic, serializable primitive types only. No UI or autograd objects.
 */

import { TopologyGraph } from '../topology/topology-types';

export type EngineStatus =
  | 'idle'
  | 'initialized'
  | 'running'
  | 'paused'
  | 'completed'
  | 'error';

export interface EngineConfig {
  readonly topology: TopologyGraph;
  readonly learningRate?: number;
  readonly batchSize?: number;
  readonly simulationSpeed?: number;
  readonly maxEpochs?: number;
  readonly iterationsPerEpoch?: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface EngineSnapshot {
  readonly status: EngineStatus;
  readonly topologyId: string;
  readonly step: number;
  readonly epoch: number;
  readonly iteration: number;
  readonly activeNodeIds: readonly string[];
  readonly activeEdgeIds: readonly string[];
  readonly metrics: Readonly<Record<string, number>>;
  readonly timestamp: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface EngineContext {
  readonly step: number;
  readonly epoch: number;
  readonly iteration: number;
  readonly elapsedTime: number;
  readonly deltaTime: number;
  readonly flags: Readonly<Record<string, boolean>>;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
