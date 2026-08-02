import {
  SimulationPreset,
  SimulationState,
  SimulationMetrics,
  SimulationGraph,
  SimulationParticle,
  SimulationEvent,
  SimulationEventType,
  SimulationEventHandler,
  WeightInitialization,
  ActivationFunction,
  OptimizerType,
  NormalizationType,
  TelemetrySnapshot,
  LossHistoryEntry,
  PlaybackEvent,
} from '../types/training-dynamics';
import { ParticleEngine } from './particle-engine';
import { calculateNodeLayout } from './physics';
import { SimulationRenderer } from './renderer';
import { createTelemetrySnapshot } from './telemetry';
import { LossModelFactory } from './loss-models';

export class SimulationEngine {
  private state: SimulationState;
  private preset: SimulationPreset;
  private particleEngine: ParticleEngine;
  private renderer: SimulationRenderer;
  private graph: SimulationGraph;
  private listeners: Map<SimulationEventType, Set<SimulationEventHandler>>;
  private lossHistory: LossHistoryEntry[] = [];
  private timelineEvents: PlaybackEvent[] = [];

  constructor(initialPreset: SimulationPreset, initialDepth: number = 6) {
    this.preset = initialPreset;
    this.particleEngine = new ParticleEngine();
    this.renderer = new SimulationRenderer();
    this.listeners = new Map();

    this.state = {
      currentEpoch: 1,
      currentIteration: 0,
      loss: 2.302,
      gradientNorm: 1.0,
      activationDistribution: [],
      weightMagnitude: 1.0,
      learningRate: 0.01,
      networkDepth: initialDepth,
      simulationSpeed: 1.0,
      isPaused: false,
      activePresetId: initialPreset.id,
      weightInitialization: initialPreset.weightInitialization,
      activationFunction: initialPreset.activationFunction || 'relu',
      optimizer: initialPreset.optimizer || 'adam',
      normalizationType: initialPreset.normalizationType || 'none',
      batchSize: initialPreset.batchSize || 32,
      gradientClipping: false,
      dropoutRate: initialPreset.dropoutRate || 0.0,
      noiseInjection: initialPreset.noiseInjection || 0.0,
      selectedLayerIndex: null,
    };

    this.graph = calculateNodeLayout(
      this.state.networkDepth,
      600,
      320,
      this.preset,
      this.calculateLayerHealth()
    );

    this.seedInitialTimelineEvents();
  }

  private seedInitialTimelineEvents(): void {
    this.timelineEvents = [
      {
        id: 'evt-1',
        epoch: 1,
        type: 'health_change',
        title: 'Training Started',
        description: `Initialized with depth ${this.state.networkDepth} and ${this.state.weightInitialization} weights.`,
        severity: 'info',
      },
    ];
  }

  // --- PUBLIC API ---

  public initialize(width: number = 600, height: number = 320): void {
    const health = this.calculateLayerHealth();
    this.graph = calculateNodeLayout(
      this.state.networkDepth,
      width,
      height,
      this.preset,
      health
    );
    this.emit('SimulationReset', { state: this.state });
  }

  public start(): void {
    this.state.isPaused = false;
    this.emit('StateChanged', { isPaused: false });
  }

  public pause(): void {
    this.state.isPaused = true;
    this.emit('StateChanged', { isPaused: true });
  }

  public togglePlayPause(): boolean {
    if (this.state.isPaused) {
      this.start();
    } else {
      this.pause();
    }
    return !this.state.isPaused;
  }

  public reset(): void {
    this.particleEngine.clear();
    this.state.currentEpoch = 1;
    this.state.currentIteration = 0;
    this.state.loss = 2.302;
    this.state.gradientNorm = 1.0;
    this.state.selectedLayerIndex = null;
    this.lossHistory = [];
    this.seedInitialTimelineEvents();
    this.emit('SimulationReset', { timestamp: Date.now() });
    this.emit('StateChanged', this.state);
    this.emitTelemetry();
  }

  public loadPreset(newPreset: SimulationPreset): void {
    this.preset = newPreset;
    this.state.activePresetId = newPreset.id;
    this.state.weightInitialization = newPreset.weightInitialization;
    this.state.activationFunction = newPreset.activationFunction || 'relu';
    this.state.optimizer = newPreset.optimizer || 'adam';
    this.state.normalizationType = newPreset.normalizationType || 'none';
    this.state.batchSize = newPreset.batchSize || 32;
    this.state.dropoutRate = newPreset.dropoutRate || 0.0;
    this.state.noiseInjection = newPreset.noiseInjection || 0.0;

    this.reset();

    const health = this.calculateLayerHealth();
    this.graph = calculateNodeLayout(
      this.state.networkDepth,
      this.graph.width || 600,
      this.graph.height || 320,
      this.preset,
      health
    );

    this.emit('PresetChanged', { preset: newPreset });
  }

  public setNetworkDepth(depth: number): void {
    const clampedDepth = Math.max(3, Math.min(20, depth));
    this.state.networkDepth = clampedDepth;

    const health = this.calculateLayerHealth();
    this.graph = calculateNodeLayout(
      clampedDepth,
      this.graph.width || 600,
      this.graph.height || 320,
      this.preset,
      health
    );

    this.emit('StateChanged', { networkDepth: clampedDepth });
    this.emitTelemetry();
  }

  public setLearningRate(lr: number): void {
    this.state.learningRate = Math.max(0.0001, Math.min(1.0, lr));
    this.emit('StateChanged', { learningRate: this.state.learningRate });
    this.emitTelemetry();
  }

  public setWeightInitialization(init: WeightInitialization): void {
    this.state.weightInitialization = init;
    this.emit('StateChanged', { weightInitialization: init });
    this.emitTelemetry();
  }

  public setActivationFunction(act: ActivationFunction): void {
    this.state.activationFunction = act;
    this.emit('StateChanged', { activationFunction: act });
    this.emitTelemetry();
  }

  public setOptimizer(opt: OptimizerType): void {
    this.state.optimizer = opt;
    this.emit('StateChanged', { optimizer: opt });
    this.emitTelemetry();
  }

  public setNormalizationType(norm: NormalizationType): void {
    this.state.normalizationType = norm;
    this.emit('StateChanged', { normalizationType: norm });
    this.emitTelemetry();
  }

  public setBatchSize(size: number): void {
    this.state.batchSize = size;
    this.emit('StateChanged', { batchSize: size });
    this.emitTelemetry();
  }

  public setGradientClipping(enabled: boolean): void {
    this.state.gradientClipping = enabled;
    this.emit('StateChanged', { gradientClipping: enabled });
    this.emitTelemetry();
  }

  public setDropoutRate(rate: number): void {
    this.state.dropoutRate = rate;
    this.emit('StateChanged', { dropoutRate: rate });
    this.emitTelemetry();
  }

  public setNoiseInjection(noise: number): void {
    this.state.noiseInjection = noise;
    this.emit('StateChanged', { noiseInjection: noise });
    this.emitTelemetry();
  }

  public setSelectedLayerIndex(idx: number | null): void {
    this.state.selectedLayerIndex = idx;
    this.emit('LayerSelected', { selectedLayerIndex: idx });
  }

  public seekToEpoch(targetEpoch: number): void {
    this.state.currentEpoch = Math.max(1, Math.min(100, targetEpoch));
    this.state.currentIteration = (this.state.currentEpoch - 1) * 50;
    this.emit('StateChanged', { currentEpoch: this.state.currentEpoch });
    this.emitTelemetry();
  }

  public triggerBackprop(): void {
    this.particleEngine.spawnBackpropPulse(this.graph.nodes, this.preset);
    this.emit('Backpropagation', {
      timestamp: Date.now(),
      depth: this.state.networkDepth,
    });
  }

  public update(deltaTime: number = 1.0): void {
    if (!this.state.isPaused) {
      this.state.currentIteration += 1;

      if (this.state.currentIteration % 50 === 0) {
        this.state.currentEpoch += 1;

        // Pluggable Loss Model strategy calculation
        const lossModel = LossModelFactory.getModel(this.preset, this.state);
        this.state.loss = lossModel.calculateNextLoss(
          this.state.currentEpoch,
          this.state.loss,
          this.state,
          this.preset
        );

        // Record loss history
        this.lossHistory.push({
          epoch: this.state.currentEpoch,
          loss: Number(this.state.loss.toFixed(4)),
          gradientNorm: Number(this.state.gradientNorm.toFixed(4)),
          stability: Math.round(this.getMetrics().networkStability),
        });

        if (this.lossHistory.length > 50) {
          this.lossHistory.shift();
        }

        // Timeline event milestones
        this.checkTimelineMilestones();

        this.emit('EpochComplete', { epoch: this.state.currentEpoch, loss: this.state.loss });
      }

      if (Math.random() < 0.06) {
        this.particleEngine.spawnAmbientParticle(this.graph.nodes, this.preset);
      }
    }

    this.particleEngine.update(this.graph.nodes, this.preset, deltaTime);

    const metrics = this.getMetrics();
    this.state.gradientNorm = metrics.gradientMagnitude;
    this.emit('MetricsUpdated', metrics);

    // Emit immutable TelemetrySnapshot
    this.emitTelemetry();
  }

  private checkTimelineMilestones(): void {
    const epoch = this.state.currentEpoch;
    if (epoch === 5) {
      this.timelineEvents.push({
        id: `evt-${epoch}`,
        epoch,
        type: 'health_change',
        title: 'Warmup Complete',
        description: 'Initial weight updates stabilized across network layers.',
        severity: 'info',
      });
    } else if (epoch === 15 && this.state.gradientNorm < 0.1) {
      this.timelineEvents.push({
        id: `evt-${epoch}`,
        epoch,
        type: 'vanishing_risk',
        title: 'Vanishing Gradient Detected',
        description: 'Backpropagated gradients near input layer attenuated below 0.1.',
        severity: 'warning',
      });
    } else if (epoch === 15 && this.state.gradientNorm > 10.0) {
      this.timelineEvents.push({
        id: `evt-${epoch}`,
        epoch,
        type: 'exploding_risk',
        title: 'Exploding Gradient Warning',
        description: 'Gradients expanding exponentially causing instability.',
        severity: 'critical',
      });
    } else if (epoch === 25 && (this.preset.connectionType === 'batchnorm' || this.state.normalizationType === 'batchnorm')) {
      this.timelineEvents.push({
        id: `evt-${epoch}`,
        epoch,
        type: 'normalization_stabilized',
        title: 'BatchNorm Shift Neutralized',
        description: 'Activation distributions normalized to zero mean & unit variance.',
        severity: 'info',
      });
    }
  }

  private emitTelemetry(): void {
    const snapshot = createTelemetrySnapshot(
      this.state,
      this.preset,
      this.graph.nodes,
      this.lossHistory,
      this.timelineEvents
    );
    this.emit('TelemetrySnapshot', snapshot);
  }

  public render(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    if (this.graph.width !== width || this.graph.height !== height) {
      this.graph = calculateNodeLayout(
        this.state.networkDepth,
        width,
        height,
        this.preset,
        this.calculateLayerHealth()
      );
    }

    this.renderer.render(
      ctx,
      this.graph,
      this.particleEngine.getParticles(),
      this.preset,
      this.state
    );
  }

  // --- METRICS ENGINE ---

  public getMetrics(): SimulationMetrics {
    const depth = this.state.networkDepth;
    const health = this.calculateLayerHealth();

    let gradientMagnitude = 1.0;

    if (this.preset.connectionType === 'residual') {
      gradientMagnitude = 1.0;
    } else if (this.preset.connectionType === 'dense') {
      gradientMagnitude = 1.25;
    } else if (this.preset.connectionType === 'batchnorm' || this.state.normalizationType === 'batchnorm') {
      gradientMagnitude = 0.95 + Math.random() * 0.05;
    } else if (this.preset.gradientDecayRate > 0.2 || this.state.activationFunction === 'sigmoid') {
      gradientMagnitude = Math.pow(0.5, depth - 1);
    } else if (this.preset.gradientGrowthRate > 0.3) {
      gradientMagnitude = Math.pow(1.8, depth - 1);
    }

    if (this.state.gradientClipping) {
      gradientMagnitude = Math.min(10.0, gradientMagnitude);
    }

    const averageGradient = health.reduce((a, b) => a + b, 0) / (health.length || 1);
    const maxGradient = Math.max(...health);
    const minGradient = Math.min(...health);
    const updateMagnitude = gradientMagnitude * this.state.learningRate;

    const networkStability =
      this.preset.connectionStyle === 'unstable' || gradientMagnitude > 20
        ? Math.max(5, 100 - gradientMagnitude * 2)
        : Math.min(100, Math.max(10, (minGradient / (maxGradient || 1)) * 100));

    const trainingProgress = Math.min(100, (this.state.currentIteration / 500) * 100);

    return {
      gradientMagnitude,
      averageGradient,
      maximumGradient: maxGradient,
      minimumGradient: minGradient,
      updateMagnitude,
      layerHealth: health,
      networkStability,
      trainingProgress,
      history: [...this.lossHistory],
    };
  }

  private calculateLayerHealth(): number[] {
    const depth = this.state.networkDepth;
    const health: number[] = [];

    for (let i = 0; i < depth; i++) {
      let h = 1.0;
      if (this.preset.connectionType === 'residual') {
        h = 0.95 + Math.random() * 0.05;
      } else if (this.preset.connectionType === 'dense') {
        h = 1.0 + (i / depth) * 0.2;
      } else if (this.preset.connectionType === 'batchnorm' || this.state.normalizationType === 'batchnorm') {
        h = 1.0;
      } else if (this.preset.gradientDecayRate > 0.2 || this.state.activationFunction === 'sigmoid') {
        h = Math.pow(1 - (this.preset.gradientDecayRate || 0.3), depth - 1 - i);
      } else if (this.preset.gradientGrowthRate > 0.3) {
        h = Math.pow(1 + this.preset.gradientGrowthRate, depth - 1 - i);
      }
      health.push(Math.max(0, Math.min(100, h)));
    }

    return health;
  }

  public getTelemetrySnapshot(): TelemetrySnapshot {
    return createTelemetrySnapshot(
      this.state,
      this.preset,
      this.graph.nodes,
      this.lossHistory,
      this.timelineEvents
    );
  }

  public getState(): SimulationState {
    return { ...this.state };
  }

  public getPreset(): SimulationPreset {
    return { ...this.preset };
  }

  public getGraph(): SimulationGraph {
    return this.graph;
  }

  public getParticles(): SimulationParticle[] {
    return this.particleEngine.getParticles();
  }

  // --- EVENT SYSTEM ---

  public on<T = unknown>(type: SimulationEventType, handler: SimulationEventHandler<T>): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(handler as SimulationEventHandler);
  }

  public off<T = unknown>(type: SimulationEventType, handler: SimulationEventHandler<T>): void {
    const set = this.listeners.get(type);
    if (set) {
      set.delete(handler as SimulationEventHandler);
    }
  }

  private emit<T = unknown>(type: SimulationEventType, data: T): void {
    const set = this.listeners.get(type);
    if (set) {
      const event: SimulationEvent<T> = {
        type,
        timestamp: Date.now(),
        data,
      };
      set.forEach((handler) => handler(event as SimulationEvent));
    }
  }
}
