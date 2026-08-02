'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { SimulationEngine } from '@/lib/training-dynamics/simulation-engine';
import { TrainingConcept, TelemetrySnapshot, SimulationMetrics } from '@/lib/types/training-dynamics';
import Canvas from '@/components/training-dynamics/canvas';
import MetricPanel from '@/components/training-dynamics/metric-panel';
import ArchitectureOverlay from './architecture-overlay';
import SynchronizedControls from './synchronized-controls';
import ComparativeMetrics from './comparative-metrics';
import DifferenceSummary from './difference-summary';

interface ComparisonOrchestratorProps {
  concepts: TrainingConcept[];
  initialConceptAId?: string;
  initialConceptBId?: string;
}

export default function ComparisonOrchestrator({
  concepts,
  initialConceptAId = 'vanishing',
  initialConceptBId = 'residual',
}: ComparisonOrchestratorProps) {
  const [conceptAId, setConceptAId] = useState<string>(initialConceptAId);
  const [conceptBId, setConceptBId] = useState<string>(initialConceptBId);

  const conceptA = useMemo(() => concepts.find((c) => c.id === conceptAId) || concepts[0], [concepts, conceptAId]);
  const conceptB = useMemo(() => concepts.find((c) => c.id === conceptBId) || concepts[1] || concepts[0], [concepts, conceptBId]);

  // Twin simulation engines
  const [engineA] = useState<SimulationEngine>(() => new SimulationEngine(conceptA.simulationPreset, 6));
  const [engineB] = useState<SimulationEngine>(() => new SimulationEngine(conceptB.simulationPreset, 6));

  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  const [snapshotA, setSnapshotA] = useState<TelemetrySnapshot>(() => engineA.getTelemetrySnapshot());
  const [snapshotB, setSnapshotB] = useState<TelemetrySnapshot>(() => engineB.getTelemetrySnapshot());

  const [metricsA, setMetricsA] = useState<SimulationMetrics>(() => engineA.getMetrics());
  const [metricsB, setMetricsB] = useState<SimulationMetrics>(() => engineB.getMetrics());

  // Handle Preset Changes
  const handleSelectConceptA = (id: string) => {
    setConceptAId(id);
    const target = concepts.find((c) => c.id === id);
    if (target) {
      engineA.loadPreset(target.simulationPreset);
      setSnapshotA(engineA.getTelemetrySnapshot());
      setMetricsA(engineA.getMetrics());
    }
  };

  const handleSelectConceptB = (id: string) => {
    setConceptBId(id);
    const target = concepts.find((c) => c.id === id);
    if (target) {
      engineB.loadPreset(target.simulationPreset);
      setSnapshotB(engineB.getTelemetrySnapshot());
      setMetricsB(engineB.getMetrics());
    }
  };

  // Synchronized Playback Handlers
  const handleTogglePlayPauseBoth = useCallback(() => {
    const nextState = !isSimulating;
    setIsSimulating(nextState);
    if (nextState) {
      engineA.start();
      engineB.start();
    } else {
      engineA.pause();
      engineB.pause();
    }
  }, [engineA, engineB, isSimulating]);

  const handleResetBoth = useCallback(() => {
    engineA.reset();
    engineB.reset();
    setSnapshotA(engineA.getTelemetrySnapshot());
    setSnapshotB(engineB.getTelemetrySnapshot());
    setMetricsA(engineA.getMetrics());
    setMetricsB(engineB.getMetrics());
  }, [engineA, engineB]);

  const handleTriggerBackpropBoth = useCallback(() => {
    engineA.triggerBackprop();
    engineB.triggerBackprop();
  }, [engineA, engineB]);

  // Synchronized Telemetry Subscription
  useEffect(() => {
    const onTeleA = (e: { data: unknown }) => setSnapshotA(e.data as TelemetrySnapshot);
    const onTeleB = (e: { data: unknown }) => setSnapshotB(e.data as TelemetrySnapshot);
    const onMetA = (e: { data: unknown }) => setMetricsA(e.data as SimulationMetrics);
    const onMetB = (e: { data: unknown }) => setMetricsB(e.data as SimulationMetrics);

    engineA.on('TelemetrySnapshot', onTeleA);
    engineB.on('TelemetrySnapshot', onTeleB);
    engineA.on('MetricsUpdated', onMetA);
    engineB.on('MetricsUpdated', onMetB);

    return () => {
      engineA.off('TelemetrySnapshot', onTeleA);
      engineB.off('TelemetrySnapshot', onTeleB);
      engineA.off('MetricsUpdated', onMetA);
      engineB.off('MetricsUpdated', onMetB);
    };
  }, [engineA, engineB]);

  return (
    <div className="flex flex-col gap-6 w-full animate-fade-in">
      {/* Top Synchronized Timeline Control Bar */}
      <SynchronizedControls
        isSimulating={isSimulating}
        onTogglePlayPause={handleTogglePlayPauseBoth}
        onResetBoth={handleResetBoth}
        onTriggerBackpropBoth={handleTriggerBackpropBoth}
        speed={playbackSpeed}
        onSpeedChange={setPlaybackSpeed}
      />

      {/* Side-by-Side Dual Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SIDE A */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Select Architecture A:</span>
            <select
              value={conceptAId}
              onChange={(e) => handleSelectConceptA(e.target.value)}
              className="bg-slate-900 border border-border/30 rounded-lg px-2.5 py-1 text-xs text-white font-bold cursor-pointer"
            >
              {concepts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <ArchitectureOverlay preset={conceptA.simulationPreset} side="A" />

          <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-4 backdrop-blur-md flex flex-col gap-4">
            <Canvas engine={engineA} networkDepth={6} />
            <MetricPanel metrics={metricsA} />
          </div>
        </div>

        {/* SIDE B */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Select Architecture B:</span>
            <select
              value={conceptBId}
              onChange={(e) => handleSelectConceptB(e.target.value)}
              className="bg-slate-900 border border-border/30 rounded-lg px-2.5 py-1 text-xs text-white font-bold cursor-pointer"
            >
              {concepts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <ArchitectureOverlay preset={conceptB.simulationPreset} side="B" />

          <div className="glass-card rounded-2xl border border-border/30 bg-slate-950/40 p-4 backdrop-blur-md flex flex-col gap-4">
            <Canvas engine={engineB} networkDepth={6} />
            <MetricPanel metrics={metricsB} />
          </div>
        </div>
      </div>

      {/* Comparative Metrics Table */}
      <ComparativeMetrics
        snapshotA={snapshotA}
        snapshotB={snapshotB}
        presetA={conceptA.simulationPreset}
        presetB={conceptB.simulationPreset}
      />

      {/* Difference Summary Narrative */}
      <DifferenceSummary
        presetA={conceptA.simulationPreset}
        presetB={conceptB.simulationPreset}
      />
    </div>
  );
}
