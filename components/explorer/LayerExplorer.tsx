import React from 'react';
import { Layers, ChevronRight } from 'lucide-react';
import type { LayerExplorerProps } from './types';

export default function LayerExplorer({
  nodes,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
}: LayerExplorerProps) {
  return (
    <div className="bg-[#020617]/50 border border-white/5 rounded-xl p-3.5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-[#22d3ee]" />
          Layer Sequence Browser
        </span>
        <span className="text-[9px] text-slate-500 font-mono font-bold">
          {nodes.length} Components
        </span>
      </div>

      <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
        {nodes.map((node, index) => {
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNodeId === node.id;

          return (
            <button
              key={node.id}
              onClick={() => onSelectNode(node.id)}
              onMouseEnter={() => onHoverNode(node.id)}
              onMouseLeave={() => onHoverNode(null)}
              className={`flex items-center justify-between p-2 rounded-lg text-left transition-all duration-200 cursor-pointer border ${
                isSelected
                  ? 'bg-slate-900 border-[#22d3ee]/60 text-white shadow-[0_0_8px_rgba(34,211,238,0.15)]'
                  : isHovered
                  ? 'bg-slate-900/40 border-slate-800 text-slate-200'
                  : 'bg-slate-950/40 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span className="text-[9px] font-mono font-bold text-slate-500 w-4 text-center shrink-0">
                  {index + 1}
                </span>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-bold truncate">{node.label}</span>
                  <span className="text-[9px] text-slate-500 truncate font-medium">{node.role}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {node.badge && (
                  <span
                    className="text-[8px] font-mono px-1.5 py-0.5 rounded font-extrabold uppercase border"
                    style={{
                      color: node.textColor || '#22d3ee',
                      borderColor: node.strokeColor || '#22d3ee',
                      backgroundColor: 'rgba(15,23,42,0.6)',
                    }}
                  >
                    {node.badge}
                  </span>
                )}
                <ChevronRight
                  className={`h-3.5 w-3.5 transition-transform ${
                    isSelected ? 'rotate-90 text-[#22d3ee]' : 'text-slate-600'
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
