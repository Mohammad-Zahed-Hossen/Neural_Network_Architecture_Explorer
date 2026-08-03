import React, { useState } from 'react';
import ExplorerCanvas from './ExplorerCanvas';
import LayerExplorer from './LayerExplorer';
import ComponentInspector from './ComponentInspector';
import { PATTERN_BLUEPRINTS } from './blueprints';
import type { ArchitectureExplorerProps, ExplorerState } from './types';

export default function ArchitectureExplorer({
  patternId,
  patternName,
}: ArchitectureExplorerProps) {
  const [state, setState] = useState<ExplorerState>({
    hoveredNodeId: null,
    selectedNodeId: null,
    focusedLayerId: null,
    expandedGroups: [],
  });

  const blueprint = PATTERN_BLUEPRINTS[patternId];

  if (!blueprint) {
    return (
      <div className="border border-border/20 rounded-xl bg-slate-950 p-6 text-center text-xs text-slate-500 font-bold uppercase">
        No interactive blueprint model registered for pattern &quot;{patternName}&quot;.
      </div>
    );
  }

  const handleHoverNode = (id: string | null) => {
    setState((prev) => ({ ...prev, hoveredNodeId: id }));
  };

  const handleSelectNode = (id: string) => {
    setState((prev) => ({
      ...prev,
      selectedNodeId: prev.selectedNodeId === id ? null : id,
    }));
  };

  const handleClearSelection = () => {
    setState((prev) => ({ ...prev, selectedNodeId: null }));
  };

  const selectedNode =
    blueprint.nodes.find((n) => n.id === state.selectedNodeId) || null;

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Interactive Blueprint Canvas */}
      <ExplorerCanvas
        blueprint={blueprint}
        state={state}
        onHoverNode={handleHoverNode}
        onSelectNode={handleSelectNode}
      />

      {/* Layer Sequence Browser & Component Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-5">
          <LayerExplorer
            nodes={blueprint.nodes}
            selectedNodeId={state.selectedNodeId}
            hoveredNodeId={state.hoveredNodeId}
            onSelectNode={handleSelectNode}
            onHoverNode={handleHoverNode}
          />
        </div>

        <div className="lg:col-span-7">
          <ComponentInspector
            selectedNode={selectedNode}
            onClearSelection={handleClearSelection}
          />
        </div>
      </div>
    </div>
  );
}
