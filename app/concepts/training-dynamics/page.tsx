'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Activity, Columns, Monitor } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import ContinueLearning from '@/components/ui/continue-learning';
import { getTrainingConcepts } from '@/lib/data-access/training-dynamics';
import { getLiveExplanation, getEducationalWarnings, ScenarioItem } from '@/lib/data-access/learning-engine';
import { SimulationEngine } from '@/lib/training-dynamics/simulation-engine';
import {
  SimulationMetrics,
  WeightInitialization,
  TelemetrySnapshot,
  ActivationFunction,
  OptimizerType,
  NormalizationType,
  LayerTelemetryRaw,
} from '@/lib/types/training-dynamics';

import ConceptSelector from '@/components/training-dynamics/concept-selector';
import ExplanationPanel from '@/components/training-dynamics/explanation-panel';
import Canvas from '@/components/training-dynamics/canvas';
import ControlPanel from '@/components/training-dynamics/control-panel';
import MetricPanel from '@/components/training-dynamics/metric-panel';
import Legend from '@/components/training-dynamics/legend';
import ArchitecturePreview from '@/components/training-dynamics/architecture-preview';

// Phase 3-5 Telemetry & Comparison Components
import TelemetryDashboard from '@/components/training-dynamics/telemetry-dashboard';
import GradientHeatmap from '@/components/training-dynamics/gradient-heatmap';
import ActivationStats from '@/components/training-dynamics/activation-stats';
import LossCurve from '@/components/training-dynamics/loss-curve';
import LayerInspector from '@/components/training-dynamics/layer-inspector';
import PlaybackTimeline from '@/components/training-dynamics/playback-timeline';
import AdaptiveExplanation from '@/components/training-dynamics/adaptive-explanation';
import ComparisonOrchestrator from '@/components/training-dynamics/comparison/comparison-orchestrator';

export default function TrainingDynamicsVisualizer() {
  const concepts = useMemo(() => getTrainingConcepts(), []);
  const searchParams = useSearchParams();
  const initialConceptId = searchParams.get('concept');

  const [viewMode, setViewMode] = useState<'single' | 'comparison'>('single');

  const [activeConceptId, setActiveConceptId] = useState<string>(
    initialConceptId && concepts.some((c) => c.id === initialConceptId)
      ? initialConceptId
      : 'vanishing'
  );

  const activeConcept = useMemo(
    () => concepts.find((c) => c.id === activeConceptId) || concepts[0],
    [concepts, activeConceptId]
  );

  // Single Simulation Engine instance
  const [engine] = useState<SimulationEngine>(
    () => new SimulationEngine(activeConcept.simulationPreset, 6)
  );

  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [networkDepth, setNetworkDepth] = useState<number>(6);
  const [learningRate, setLearningRate] = useState<number>(0.01);
  const [weightInit, setWeightInit] = useState<WeightInitialization>(
    activeConcept.simulationPreset.weightInitialization
  );
  const [activationFunction, setActivationFunction] = useState<ActivationFunction>(
    activeConcept.simulationPreset.activationFunction || 'relu'
  );
  const [optimizer, setOptimizer] = useState<OptimizerType>(
    activeConcept.simulationPreset.optimizer || 'adam'
  );
  const [normalizationType, setNormalizationType] = useState<NormalizationType>(
    activeConcept.simulationPreset.normalizationType || 'none'
  );
  const [gradientClipping, setGradientClipping] = useState<boolean>(false);

  const [metrics, setMetrics] = useState<SimulationMetrics>(() => engine.getMetrics());
  const [snapshot, setSnapshot] = useState<TelemetrySnapshot>(() => engine.getTelemetrySnapshot());
  const [selectedLayerIndex, setSelectedLayerIndex] = useState<number | null>(null);

  // Concept selection handler
  const handleSelectConcept = useCallback(
    (id: string) => {
      setActiveConceptId(id);
      const nextConcept = concepts.find((c) => c.id === id);
      if (nextConcept) {
        engine.loadPreset(nextConcept.simulationPreset);
        setWeightInit(nextConcept.simulationPreset.weightInitialization);
        setActivationFunction(nextConcept.simulationPreset.activationFunction || 'relu');
        setOptimizer(nextConcept.simulationPreset.optimizer || 'adam');
        setNormalizationType(nextConcept.simulationPreset.normalizationType || 'none');
        setMetrics(engine.getMetrics());
        setSnapshot(engine.getTelemetrySnapshot());
      }
    },
    [concepts, engine]
  );

  // Engine event listeners
  useEffect(() => {
    const handleMetrics = (e: { data: unknown }) => {
      setMetrics(e.data as SimulationMetrics);
    };

    const handleTelemetry = (e: { data: unknown }) => {
      setSnapshot(e.data as TelemetrySnapshot);
    };

    engine.on('MetricsUpdated', handleMetrics);
    engine.on('TelemetrySnapshot', handleTelemetry);

    return () => {
      engine.off('MetricsUpdated', handleMetrics);
      engine.off('TelemetrySnapshot', handleTelemetry);
    };
  }, [engine]);

  // Handlers for adaptive controls
  const handleToggleSimulate = () => {
    const nextState = engine.togglePlayPause();
    setIsSimulating(!nextState);
  };

  const handleTriggerBackprop = () => {
    engine.triggerBackprop();
  };

  const handleDepthChange = (newDepth: number) => {
    setNetworkDepth(newDepth);
    engine.setNetworkDepth(newDepth);
  };

  const handleLearningRateChange = (newLr: number) => {
    setLearningRate(newLr);
    engine.setLearningRate(newLr);
  };

  const handleWeightInitChange = (newInit: WeightInitialization) => {
    setWeightInit(newInit);
    engine.setWeightInitialization(newInit);
  };

  const handleActivationChange = (act: ActivationFunction) => {
    setActivationFunction(act);
    engine.setActivationFunction(act);
  };

  const handleOptimizerChange = (opt: OptimizerType) => {
    setOptimizer(opt);
    engine.setOptimizer(opt);
  };

  const handleNormalizationChange = (norm: NormalizationType) => {
    setNormalizationType(norm);
    engine.setNormalizationType(norm);
  };

  const handleClippingToggle = (enabled: boolean) => {
    setGradientClipping(enabled);
    engine.setGradientClipping(enabled);
  };

  const handleLoadScenario = (scenario: ScenarioItem) => {
    engine.loadPreset(scenario.preset);
    setWeightInit(scenario.preset.weightInitialization);
    setActivationFunction(scenario.preset.activationFunction || 'relu');
    setOptimizer(scenario.preset.optimizer || 'adam');
    setNormalizationType(scenario.preset.normalizationType || 'none');
    setMetrics(engine.getMetrics());
    setSnapshot(engine.getTelemetrySnapshot());
  };

  const handleSeekToEpoch = (targetEpoch: number) => {
    engine.seekToEpoch(targetEpoch);
  };

  // Educational rules & warnings evaluation
  const liveExplanation = useMemo(
    () => getLiveExplanation(engine.getState(), activeConcept.simulationPreset),
    [engine, activeConcept]
  );
  const educationalWarnings = useMemo(
    () => getEducationalWarnings(engine.getState(), activeConcept.simulationPreset),
    [engine, activeConcept]
  );

  const inspectedLayer: LayerTelemetryRaw | null = useMemo(() => {
    if (selectedLayerIndex === null) return null;
    return snapshot.layers.find((l) => l.layerIndex === selectedLayerIndex) || null;
  }, [snapshot, selectedLayerIndex]);

  return (
    <div className="relative flex flex-col flex-1 bg-background grid-bg pb-24 overflow-x-hidden">
      <div className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full filter blur-[150px] pointer-events-none opacity-[0.05] bg-primary z-0" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] rounded-full filter blur-[150px] pointer-events-none opacity-[0.05] bg-purple-500 z-0" />

      <section className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 sm:py-7 lg:py-9 w-full flex-1 flex flex-col gap-4 sm:gap-6">
        {/* Header & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/10 pb-4 sm:pb-5">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <Activity className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              Training Dynamics Simulator v2.0
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 font-medium leading-snug max-w-3xl">
              Real-time telemetry, adaptive training controls, educational rule predictions, and side-by-side architecture comparison mode.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-border/20 self-start sm:self-auto">
            <button
              onClick={() => setViewMode('single')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'single'
                  ? 'bg-primary text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="h-3.5 w-3.5" />
              Single Simulator
            </button>
            <button
              onClick={() => setViewMode('comparison')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'comparison'
                  ? 'bg-primary text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              Comparison Mode
            </button>
          </div>
        </div>

        {/* VIEW 1: SINGLE SIMULATOR MODE WITH RICH TELEMETRY */}
        {viewMode === 'single' && (
          <div className="flex flex-col gap-6">
            {/* Top Telemetry Dashboard */}
            <TelemetryDashboard snapshot={snapshot} />

            {/* Playback Event Timeline */}
            <PlaybackTimeline
              events={snapshot.timelineEvents}
              currentEpoch={snapshot.epoch}
              onSeekToEpoch={handleSeekToEpoch}
            />

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* LEFT 5-COL: Selector, Explanation & Rules */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <ConceptSelector
                  concepts={concepts}
                  activeConceptId={activeConceptId}
                  onSelect={handleSelectConcept}
                />

                <ExplanationPanel concept={activeConcept} />

                {/* Adaptive Educational Rules & Predictions */}
                <AdaptiveExplanation
                  explanation={liveExplanation}
                  warnings={educationalWarnings}
                />
              </div>

              {/* RIGHT 7-COL: Simulation Canvas, Heatmap, Stats & Curves */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-6 backdrop-blur-md flex-1 flex flex-col justify-between gap-4">
                  {/* Extended Adaptive Controls */}
                  <ControlPanel
                    isSimulating={isSimulating}
                    networkDepth={networkDepth}
                    learningRate={learningRate}
                    weightInit={weightInit}
                    activationFunction={activationFunction}
                    optimizer={optimizer}
                    normalizationType={normalizationType}
                    gradientClipping={gradientClipping}
                    onToggleSimulate={handleToggleSimulate}
                    onTriggerBackprop={handleTriggerBackprop}
                    onDepthChange={handleDepthChange}
                    onLearningRateChange={handleLearningRateChange}
                    onWeightInitChange={handleWeightInitChange}
                    onActivationChange={handleActivationChange}
                    onOptimizerChange={handleOptimizerChange}
                    onNormalizationChange={handleNormalizationChange}
                    onClippingToggle={handleClippingToggle}
                    onLoadScenario={handleLoadScenario}
                  />

                  {/* Interactive Canvas */}
                  <Canvas engine={engine} networkDepth={networkDepth} />

                  <Legend preset={activeConcept.simulationPreset} />

                  <MetricPanel metrics={metrics} />
                </div>

                {/* Real-time Telemetry Visualizers */}
                <GradientHeatmap
                  layers={snapshot.layers}
                  onSelectLayer={(idx) => setSelectedLayerIndex(idx)}
                  selectedIndex={selectedLayerIndex}
                />

                <ActivationStats
                  layers={snapshot.layers}
                  normalizationType={normalizationType}
                />

                <LossCurve history={snapshot.lossHistory} />

                <ArchitecturePreview />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: COMPARISON MODE */}
        {viewMode === 'comparison' && (
          <ComparisonOrchestrator
            concepts={concepts}
            initialConceptAId="vanishing"
            initialConceptBId="residual"
          />
        )}

        {/* Layer Inspector Modal */}
        <LayerInspector
          layer={inspectedLayer}
          learningRate={learningRate}
          onClose={() => setSelectedLayerIndex(null)}
        />

        {/* Continue Learning Section */}
        <ContinueLearning
          items={[
            { title: 'Residual Connections Pattern', type: 'pattern', href: '/architecture-patterns?pattern=residual', description: 'Deep dive into ResNet identity skip math.' },
            { title: 'Dense Connectivity Pattern', type: 'pattern', href: '/architecture-patterns?pattern=dense', description: 'Explore DenseNet feature concatenation.' },
            { title: 'ResNet-50 Model Page', type: 'model', href: '/models/resnet50', description: 'Inspect layer topology and benchmark metrics.' },
            { title: 'Receptive Field Calculator', type: 'concept', href: '/concepts/receptive-field', description: 'Calculate spatial coverage across layers.' },
            { title: 'Compare ResNet vs DenseNet', type: 'compare', href: '/compare?models=resnet50,densenet121', description: 'Compare parameter efficiency side-by-side.' }
          ]}
        />
      </section>
    </div>
  );
}
