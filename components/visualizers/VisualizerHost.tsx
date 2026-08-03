'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { EngineState } from '@/lib/training';
import { visualizerRegistry } from '@/lib/visualization/registry/registry';
import { visualizerManager } from '@/lib/visualization/registry/manager';
import { visualizerStore } from '@/lib/visualization/state/visualizer-store';
import { VisualizerContext } from '@/lib/visualization/contracts/visualizer-state';
import { VisualizerToolbar } from './VisualizerToolbar';
import { VisualizerContainer } from './VisualizerContainer';
import { EmptyState } from './EmptyState';

interface VisualizerHostProps {
  engineState: EngineState;
  width?: number;
  height?: number;
}

export function VisualizerHost({
  engineState,
  width = 720,
  height = 360,
}: VisualizerHostProps) {
  const [activePluginId, setActivePluginId] = useState<string>(
    visualizerStore.getActivePluginId() || 'gradient-flow'
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const availablePlugins = useMemo(() => {
    return visualizerRegistry.supports(engineState).map((p) => ({
      id: p.id,
      name: p.name,
      category: p.metadata.category,
    }));
  }, [engineState]);

  const activePlugin = useMemo(() => {
    return visualizerRegistry.get(activePluginId) || visualizerRegistry.getAll()[0];
  }, [activePluginId]);

  const visualizerContext: VisualizerContext = useMemo(() => {
    return {
      state: engineState,
      selection: visualizerStore.getSelectionState(),
      viewport: visualizerStore.getViewport(),
      width,
      height,
    };
  }, [engineState, width, height]);

  // Activate plugin lifecycle
  useEffect(() => {
    if (activePlugin) {
      try {
        visualizerManager.activate(activePlugin.id, visualizerContext);
      } catch (err) {
        console.error(`Failed to activate plugin ${activePlugin.id}:`, err);
      }
    }
  }, [activePlugin, visualizerContext]);

  // Render trigger
  useEffect(() => {
    if (activePlugin) {
      visualizerManager.update(engineState);
      const ctx = canvasRef.current ? canvasRef.current.getContext('2d') : null;
      visualizerManager.render(ctx, visualizerContext);
    }
  }, [engineState, activePlugin, visualizerContext]);

  const handleSelectPlugin = (pluginId: string) => {
    setActivePluginId(pluginId);
    visualizerStore.setActivePluginId(pluginId);
  };

  const isCanvasMode = activePlugin?.metadata.mode === 'canvas-2d';

  return (
    <VisualizerContainer>
      <VisualizerToolbar
        plugins={availablePlugins}
        activePluginId={activePluginId}
        onSelectPlugin={handleSelectPlugin}
        statusText={`Status: ${engineState.status.toUpperCase()} | Step: ${engineState.currentStep}`}
      />

      <div className="relative w-full p-4 flex items-center justify-center bg-zinc-950/60 min-h-[360px]">
        {activePlugin ? (
          isCanvasMode ? (
            <canvas
              ref={canvasRef}
              width={width}
              height={height}
              className="rounded-lg border border-zinc-800 bg-zinc-950 shadow-inner"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center">
              <div className="w-full max-w-2xl bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 shadow-xl text-left">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-3">
                  <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    {activePlugin.name}
                  </h3>
                  <span className="text-xs text-zinc-500 font-mono">
                    Mode: {activePlugin.metadata.mode}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mb-4">{activePlugin.metadata.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-zinc-300">
                  <div>Status: <span className="text-emerald-400">{engineState.status}</span></div>
                  <div>Epoch: <span className="text-emerald-400">{engineState.currentEpoch}</span></div>
                  <div>Iteration: <span className="text-emerald-400">{engineState.currentIteration}</span></div>
                  <div>Nodes Active: <span className="text-emerald-400">{engineState.activeNodes.length}</span></div>
                  <div>Loss: <span className="text-emerald-400">{engineState.metrics.loss ?? 'N/A'}</span></div>
                  <div>GradNorm: <span className="text-emerald-400">{engineState.metrics.gradientNorm ?? 'N/A'}</span></div>
                </div>
              </div>
            </div>
          )
        ) : (
          <EmptyState />
        )}
      </div>
    </VisualizerContainer>
  );
}
