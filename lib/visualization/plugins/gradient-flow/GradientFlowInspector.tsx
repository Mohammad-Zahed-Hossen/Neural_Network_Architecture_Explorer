'use client';

import React from 'react';
import { EngineState } from '../../../../lib/training';

interface GradientFlowInspectorProps {
  state: EngineState;
  selectedNodeId?: string | null;
}

export function GradientFlowInspector({ state, selectedNodeId }: GradientFlowInspectorProps) {
  const activeNode = state.topology.nodes.find((n) => n.id === selectedNodeId) || state.topology.nodes[0];

  return (
    <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs space-y-2 text-zinc-300">
      <div className="font-semibold text-emerald-400 border-b border-zinc-800 pb-1 flex justify-between">
        <span>Layer Inspector</span>
        <span className="font-mono text-zinc-400">{activeNode?.id ?? 'N/A'}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[11px]">
        <div className="text-zinc-400">Label:</div>
        <div className="text-zinc-200">{activeNode?.label ?? 'Layer'}</div>
        <div className="text-zinc-400">Type:</div>
        <div className="text-zinc-200 uppercase">{activeNode?.type ?? 'layer'}</div>
        <div className="text-zinc-400">Status:</div>
        <div className="text-emerald-400">{state.status}</div>
      </div>
    </div>
  );
}
