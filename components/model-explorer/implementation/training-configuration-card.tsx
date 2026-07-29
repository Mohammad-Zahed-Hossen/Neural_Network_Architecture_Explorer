'use client';

import React from 'react';
import { Sliders, Zap } from 'lucide-react';
import { ModelImplementationData } from '@/lib/schema/implementation.schema';
import { CollapsibleCard } from './collapsible-card';

interface TrainingConfigurationCardProps {
  trainingConfig: NonNullable<ModelImplementationData['trainingConfig']>;
}

export function TrainingConfigurationCard({ trainingConfig }: TrainingConfigurationCardProps) {
  if (!trainingConfig) return null;

  const items = [
    { label: 'Optimizer', value: trainingConfig.optimizer },
    { label: 'Loss Function', value: trainingConfig.lossFunction },
    { label: 'Learning Rate', value: trainingConfig.learningRate, highlight: true },
    { label: 'LR Scheduler', value: trainingConfig.lrScheduler },
    { label: 'Epochs', value: trainingConfig.epochs },
    { label: 'Batch Size', value: trainingConfig.batchSize },
    { label: 'Weight Decay', value: trainingConfig.weightDecay },
    { label: 'Mixed Precision', value: trainingConfig.mixedPrecision },
    { label: 'Grad Clipping', value: trainingConfig.gradientClipping },
    { label: 'Grad Accumulation', value: trainingConfig.gradientAccumulation },
    { label: 'Early Stopping', value: trainingConfig.earlyStopping },
    { label: 'Checkpointing', value: trainingConfig.checkpointStrategy },
  ].filter((item) => item.value);

  return (
    <CollapsibleCard
      title="Recommended Training Configuration"
      icon={<Sliders className="h-4 w-4 text-cyan-400 shrink-0" />}
      summaryBadge={
        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
          <Zap className="h-3 w-3" /> Hyperparameters
        </span>
      }
      defaultExpandedDesktop={true}
      defaultExpandedMobile={false}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
        {items.map((item, idx) => (
          <div key={idx} className="bg-slate-950/70 border border-slate-800/80 p-2 sm:p-2.5 rounded-xl">
            <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">
              {item.label}
            </span>
            <span className={`text-[11px] sm:text-xs font-semibold block mt-0.5 font-mono truncate ${item.highlight ? 'text-cyan-300' : 'text-slate-200'}`} title={item.value}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </CollapsibleCard>
  );
}
