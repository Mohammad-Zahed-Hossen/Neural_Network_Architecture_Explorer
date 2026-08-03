/**
 * @module Engine
 * @purpose Main TrainingEngine orchestrator operating on canonical EngineState snapshots and DAG scheduling.
 * @layer Layer 6 Engine
 * @dependencies topology-types, engine-types, engine-state, state-machine, scheduler, execution-context, engine-events
 * @api TrainingEngine
 * @limitations Pure TypeScript simulation orchestrator. Free of React, Canvas 2D, and DOM elements.
 */

import { TopologyGraph } from '../topology/topology-types';
import { createSequentialTopology } from '../adapters/sequential-topology-adapter';
import { EngineConfig, EngineStatus } from './engine-types';
import { EngineState, createInitialEngineState } from './engine-state';
import { EngineStateMachine } from './state-machine';
import { TopologyScheduler } from './scheduler';
import { ExecutionContextManager } from './execution-context';
import {
  EngineEventEmitter,
  EngineEventType,
  EngineEventHandler,
} from './engine-events';

export class TrainingEngine {
  private state: EngineState;
  private stateMachine: EngineStateMachine;
  private scheduler: TopologyScheduler;
  private contextManager: ExecutionContextManager;
  private emitter: EngineEventEmitter;
  private config: EngineConfig;

  constructor(config?: Partial<EngineConfig>) {
    const topology: TopologyGraph =
      config?.topology ||
      createSequentialTopology({ depth: 6, connectionType: 'sequential' });

    this.config = {
      topology,
      learningRate: config?.learningRate ?? 0.01,
      batchSize: config?.batchSize ?? 32,
      simulationSpeed: config?.simulationSpeed ?? 1.0,
      maxEpochs: config?.maxEpochs ?? 50,
      iterationsPerEpoch: config?.iterationsPerEpoch ?? 50,
      metadata: config?.metadata,
    };

    this.stateMachine = new EngineStateMachine('idle');
    this.scheduler = new TopologyScheduler(this.config.topology);
    this.contextManager = new ExecutionContextManager();
    this.emitter = new EngineEventEmitter();

    this.state = createInitialEngineState(this.config.topology, {
      learningRate: this.config.learningRate!,
    });
  }

  // --- PUBLIC API ---

  public initialize(configOverride?: Partial<EngineConfig>): EngineState {
    if (configOverride) {
      if (configOverride.topology) {
        this.config = { ...this.config, topology: configOverride.topology };
        this.scheduler.reset(configOverride.topology);
      }
      if (configOverride.learningRate !== undefined) {
        this.config = { ...this.config, learningRate: configOverride.learningRate };
      }
    }

    const prevStatus = this.stateMachine.getStatus();
    this.stateMachine.reset();
    const newStatus = this.stateMachine.transitionTo('initialized');

    this.contextManager.reset();

    this.state = Object.freeze({
      status: newStatus,
      topology: this.config.topology,
      activeNodes: [],
      activeEdges: [],
      currentStep: 0,
      currentEpoch: 1,
      currentIteration: 0,
      metrics: Object.freeze({
        loss: 2.302,
        gradientNorm: 1.0,
        accuracy: 0.1,
        learningRate: this.config.learningRate!,
      }),
      timestamp: Date.now(),
      metadata: Object.freeze({ ...this.config.metadata }),
    });

    this.emitter.emit('EngineInitialized', { state: this.state });
    this.emitter.emit('StateChanged', {
      previousStatus: prevStatus,
      currentStatus: newStatus,
      state: this.state,
    });

    return this.state;
  }

  public start(): EngineState {
    const prevStatus = this.stateMachine.getStatus();
    const newStatus = this.stateMachine.transitionTo('running');
    this.updateStatusState(newStatus, prevStatus);
    this.emitter.emit('EngineStarted', { state: this.state });
    return this.state;
  }

  public pause(): EngineState {
    const prevStatus = this.stateMachine.getStatus();
    const newStatus = this.stateMachine.transitionTo('paused');
    this.updateStatusState(newStatus, prevStatus);
    this.emitter.emit('EnginePaused', { state: this.state });
    return this.state;
  }

  public resume(): EngineState {
    const prevStatus = this.stateMachine.getStatus();
    const newStatus = this.stateMachine.transitionTo('running');
    this.updateStatusState(newStatus, prevStatus);
    this.emitter.emit('EngineStarted', { state: this.state });
    return this.state;
  }

  public reset(): EngineState {
    const prevStatus = this.stateMachine.getStatus();
    this.scheduler.reset();
    this.contextManager.reset();
    this.stateMachine.reset();
    const newStatus = this.stateMachine.transitionTo('initialized');

    this.state = createInitialEngineState(this.config.topology, {
      learningRate: this.config.learningRate!,
    });

    this.emitter.emit('EngineReset', { state: this.state });
    this.emitter.emit('StateChanged', {
      previousStatus: prevStatus,
      currentStatus: newStatus,
      state: this.state,
    });

    return this.state;
  }

  public step(deltaTime: number = 1.0): EngineState {
    if (this.stateMachine.getStatus() === 'idle') {
      this.initialize();
    }

    const { activeNodeIds, activeEdgeIds, completedCycle } = this.scheduler.stepNext();

    let nextIteration = this.state.currentIteration + 1;
    let nextEpoch = this.state.currentEpoch;

    if (completedCycle || nextIteration >= this.config.iterationsPerEpoch!) {
      nextIteration = 0;
      nextEpoch += 1;
    }

    const nextStep = this.state.currentStep + 1;
    this.contextManager.advanceStep(deltaTime, nextEpoch, nextIteration);

    // Compute updated heuristic educational metrics
    const currentLoss = this.state.metrics.loss ?? 2.302;
    const nextLoss = Math.max(0.01, currentLoss * 0.995);
    const nextGradNorm = Math.max(0.001, (this.state.metrics.gradientNorm ?? 1.0) * 0.998);

    const updatedMetrics = Object.freeze({
      ...this.state.metrics,
      loss: Number(nextLoss.toFixed(4)),
      gradientNorm: Number(nextGradNorm.toFixed(4)),
    });

    this.state = Object.freeze({
      ...this.state,
      activeNodes: Object.freeze([...activeNodeIds]),
      activeEdges: Object.freeze([...activeEdgeIds]),
      currentStep: nextStep,
      currentEpoch: nextEpoch,
      currentIteration: nextIteration,
      metrics: updatedMetrics,
      timestamp: Date.now(),
    });

    for (const nodeId of activeNodeIds) {
      this.emitter.emit('NodeExecuted', { nodeId, state: this.state });
    }
    for (const edgeId of activeEdgeIds) {
      this.emitter.emit('EdgeTraversed', { edgeId, state: this.state });
    }
    this.emitter.emit('MetricsUpdated', { metrics: updatedMetrics, state: this.state });

    if (nextEpoch > this.config.maxEpochs!) {
      const prevStatus = this.stateMachine.getStatus();
      const compStatus = this.stateMachine.transitionTo('completed');
      this.updateStatusState(compStatus, prevStatus);
      this.emitter.emit('EngineCompleted', { state: this.state });
    }

    return this.state;
  }

  public update(deltaTime: number = 1.0): EngineState {
    if (this.stateMachine.getStatus() !== 'running') {
      return this.state;
    }
    return this.step(deltaTime);
  }

  public getState(): EngineState {
    return this.state;
  }

  public getStatus(): EngineStatus {
    return this.stateMachine.getStatus();
  }

  public on<K extends EngineEventType>(event: K, handler: EngineEventHandler<K>): void {
    this.emitter.on(event, handler);
  }

  public off<K extends EngineEventType>(event: K, handler: EngineEventHandler<K>): void {
    this.emitter.off(event, handler);
  }

  // --- PRIVATE HELPERS ---

  private updateStatusState(newStatus: EngineStatus, prevStatus: EngineStatus): void {
    this.state = Object.freeze({
      ...this.state,
      status: newStatus,
      timestamp: Date.now(),
    });
    this.emitter.emit('StateChanged', {
      previousStatus: prevStatus,
      currentStatus: newStatus,
      state: this.state,
    });
  }
}
