'use client';

import React from 'react';
import { Activity, Play, Pause, RefreshCw, Sparkles } from 'lucide-react';
import {
  WeightInitialization,
  ActivationFunction,
  OptimizerType,
  NormalizationType,
} from '@/lib/types/training-dynamics';
import { getCategorizedScenarios, ScenarioItem } from '@/lib/data-access/learning-engine';

interface ControlPanelProps {
  isSimulating: boolean;
  networkDepth: number;
  learningRate: number;
  weightInit: WeightInitialization;
  activationFunction?: ActivationFunction;
  optimizer?: OptimizerType;
  normalizationType?: NormalizationType;
  batchSize?: number;
  gradientClipping?: boolean;
  onToggleSimulate: () => void;
  onTriggerBackprop: () => void;
  onDepthChange: (depth: number) => void;
  onLearningRateChange: (lr: number) => void;
  onWeightInitChange: (init: WeightInitialization) => void;
  onActivationChange?: (act: ActivationFunction) => void;
  onOptimizerChange?: (opt: OptimizerType) => void;
  onNormalizationChange?: (norm: NormalizationType) => void;
  onClippingToggle?: (enabled: boolean) => void;
  onLoadScenario?: (scenario: ScenarioItem) => void;
  className?: string;
}

export default function ControlPanel({
  isSimulating,
  networkDepth,
  learningRate,
  weightInit,
  activationFunction = 'relu',
  optimizer = 'adam',
  normalizationType = 'none',
  gradientClipping = false,
  onToggleSimulate,
  onTriggerBackprop,
  onDepthChange,
  onLearningRateChange,
  onWeightInitChange,
  onActivationChange,
  onOptimizerChange,
  onNormalizationChange,
  onClippingToggle,
  onLoadScenario,
  className = '',
}: ControlPanelProps) {
  const scenarios = getCategorizedScenarios();

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header controls bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/10 pb-4 shrink-0">
        <span className="text-xs font-bold text-white tracking-tight flex items-center gap-2">
          <Activity className="h-4.5 w-4.5 text-primary" />
          Adaptive Simulation Control Panel
        </span>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleSimulate}
            className="p-2 rounded-xl border border-border/30 bg-slate-900/30 text-slate-400 hover:text-white transition-all cursor-pointer"
            title={isSimulating ? 'Pause particles' : 'Play particles'}
          >
            {isSimulating ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={onTriggerBackprop}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary border border-primary/20 text-xs font-bold text-slate-950 hover:bg-primary/95 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Trigger Backprop Pulse
          </button>
        </div>
      </div>

      {/* Preset Scenarios Selector Bar */}
      {onLoadScenario && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" /> Presets:
          </span>
          {[...scenarios.architecture, ...scenarios.training].map((item) => (
            <button
              key={item.id}
              onClick={() => onLoadScenario(item)}
              className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-border/20 text-[11px] font-semibold text-slate-300 hover:text-white transition-all"
            >
              {item.name}
            </button>
          ))}
        </div>
      )}

      {/* Adaptive Param Controls Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 border-t border-border/10 pt-3">
        {/* Activation Function */}
        <div className="flex flex-col gap-1 bg-slate-900/30 border border-border/15 p-2.5 rounded-xl">
          <label className="text-[11px] font-bold text-white block">Activation Function</label>
          <select
            value={activationFunction}
            onChange={(e) => onActivationChange?.(e.target.value as ActivationFunction)}
            className="w-full bg-slate-950 border border-border/30 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="sigmoid">Sigmoid (High Vanishing Risk)</option>
            <option value="tanh">Tanh (Saturating)</option>
            <option value="relu">ReLU (Non-saturating)</option>
            <option value="gelu">GELU (Smooth Gaussian)</option>
            <option value="swish">Swish (SiLU)</option>
          </select>
        </div>

        {/* Optimizer */}
        <div className="flex flex-col gap-1 bg-slate-900/30 border border-border/15 p-2.5 rounded-xl">
          <label className="text-[11px] font-bold text-white block">Optimizer</label>
          <select
            value={optimizer}
            onChange={(e) => onOptimizerChange?.(e.target.value as OptimizerType)}
            className="w-full bg-slate-950 border border-border/30 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="sgd">SGD</option>
            <option value="momentum">SGD + Momentum</option>
            <option value="rmsprop">RMSProp</option>
            <option value="adam">Adam</option>
            <option value="adamw">AdamW</option>
          </select>
        </div>

        {/* Normalization */}
        <div className="flex flex-col gap-1 bg-slate-900/30 border border-border/15 p-2.5 rounded-xl">
          <label className="text-[11px] font-bold text-white block">Normalization</label>
          <select
            value={normalizationType}
            onChange={(e) => onNormalizationChange?.(e.target.value as NormalizationType)}
            className="w-full bg-slate-950 border border-border/30 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="none">None</option>
            <option value="batchnorm">BatchNorm</option>
            <option value="layernorm">LayerNorm</option>
          </select>
        </div>

        {/* Weight Initialization */}
        <div className="flex flex-col gap-1 bg-slate-900/30 border border-border/15 p-2.5 rounded-xl">
          <label className="text-[11px] font-bold text-white block">Weight Init</label>
          <select
            value={weightInit}
            onChange={(e) => onWeightInitChange(e.target.value as WeightInitialization)}
            className="w-full bg-slate-950 border border-border/30 rounded-lg px-2 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="he">He (Kaiming Normal)</option>
            <option value="xavier">Xavier (Glorot)</option>
            <option value="random_large">Random Large (&gt;1.0)</option>
            <option value="random_small">Random Small (&lt;0.2)</option>
          </select>
        </div>

        {/* Network Depth Slider */}
        <div className="flex flex-col gap-1 bg-slate-900/30 border border-border/15 p-2.5 rounded-xl">
          <div className="flex items-center justify-between text-[11px] font-bold text-white">
            <span>Depth: {networkDepth} Layers</span>
          </div>
          <input
            type="range"
            min={3}
            max={16}
            step={1}
            value={networkDepth}
            onChange={(e) => onDepthChange(parseInt(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        {/* Learning Rate Slider */}
        <div className="flex flex-col gap-1 bg-slate-900/30 border border-border/15 p-2.5 rounded-xl">
          <div className="flex items-center justify-between text-[11px] font-bold text-white">
            <span>LR: {learningRate.toFixed(3)}</span>
          </div>
          <input
            type="range"
            min={0.001}
            max={0.5}
            step={0.005}
            value={learningRate}
            onChange={(e) => onLearningRateChange(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>

        {/* Gradient Clipping Toggle */}
        <div className="flex items-center justify-between bg-slate-900/30 border border-border/15 p-2.5 rounded-xl sm:col-span-2">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-white">Gradient Clipping (Max Norm 10.0)</span>
            <span className="text-[9px] text-slate-500">Caps gradient norms to prevent exploding vectors.</span>
          </div>
          <button
            onClick={() => onClippingToggle?.(!gradientClipping)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              gradientClipping
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 border border-slate-800'
            }`}
          >
            {gradientClipping ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>
    </div>
  );
}
