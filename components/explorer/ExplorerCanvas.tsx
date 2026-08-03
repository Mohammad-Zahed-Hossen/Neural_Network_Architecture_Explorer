import React from 'react';
import ExplorerNode from './ExplorerNode';
import ExplorerEdge from './ExplorerEdge';
import type { ExplorerCanvasProps } from './types';

export default function ExplorerCanvas({
  blueprint,
  state,
  onHoverNode,
  onSelectNode,
}: ExplorerCanvasProps) {
  const { viewBox = '0 0 520 160', nodes, edges } = blueprint;
  const { hoveredNodeId, selectedNodeId } = state;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <div className="border border-border/20 rounded-xl bg-slate-950/90 overflow-hidden flex flex-col items-center justify-center p-4 relative shadow-inner w-full">
      {/* Top Banner Indicator */}
      <div className="w-full flex items-center justify-between pb-2 mb-1 border-b border-border/10">
        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#22d3ee] animate-ping inline-block" />
          Interactive Routing Blueprint
        </span>
        <span className="text-[9px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono font-bold">
          Click node to inspect
        </span>
      </div>

      {/* SVG Canvas Viewport Container */}
      <div className="w-full flex justify-center items-center py-2 overflow-x-auto scrollbar-none">
        <svg
          className="w-full max-w-[620px] h-auto min-h-[140px] select-none shrink-0"
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Render Edges */}
          <g id="explorer-edges-layer">
            {edges.map((edge) => {
              const sourceNode = nodeMap.get(edge.source);
              const targetNode = nodeMap.get(edge.target);
              const isHighlighted =
                hoveredNodeId === edge.source ||
                hoveredNodeId === edge.target ||
                selectedNodeId === edge.source ||
                selectedNodeId === edge.target;

              return (
                <ExplorerEdge
                  key={edge.id}
                  edge={edge}
                  sourceNode={sourceNode}
                  targetNode={targetNode}
                  isHighlighted={isHighlighted}
                />
              );
            })}
          </g>

          {/* Render Nodes */}
          <g id="explorer-nodes-layer">
            {nodes.map((node) => {
              const isHovered = hoveredNodeId === node.id;
              const isSelected = selectedNodeId === node.id;

              return (
                <ExplorerNode
                  key={node.id}
                  node={node}
                  isHovered={isHovered}
                  isSelected={isSelected}
                  onHover={onHoverNode}
                  onSelect={onSelectNode}
                />
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
}
