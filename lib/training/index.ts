/**
 * @module TrainingDynamicsPlatform
 * @purpose Canonical Public API barrel for the Training Dynamics Simulation Platform (Phase 3.1 & 3.2).
 * @layer Layer 6 Engine / Layer 8 Adapters Barrel API
 * @dependencies topology, engine, adapters
 * @api TrainingEngine, EngineState, TopologyGraph, TopologyBuilder, TopologyValidator, TopologyRepository
 * @limitations Pure infrastructure exports. Free of React/DOM rendering code.
 */

// Topology Core Exports
export * from './topology/topology-types';
export * from './topology/topology-schema';
export * from './topology/topology-builder';
export * from './topology/topology-validator';
export * from './topology/topology-utils';
export * from './topology/repository';

// Adapter Exports
export * from './adapters/sequential-topology-adapter';
export * from './adapters/architecture-topology-adapter';

// Engine Core Exports
export * from './engine/engine-types';
export * from './engine/engine-state';
export * from './engine/state-machine';
export * from './engine/execution-context';
export * from './engine/scheduler';
export * from './engine/engine-events';
export * from './engine/engine';
