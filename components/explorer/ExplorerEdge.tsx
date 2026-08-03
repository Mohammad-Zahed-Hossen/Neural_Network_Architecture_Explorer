import React from 'react';
import type { ExplorerEdgeProps } from './types';

export default function ExplorerEdge({
  edge,
  sourceNode,
  targetNode,
  isHighlighted,
}: ExplorerEdgeProps) {
  const { id, label, color = '#64748b', dashed = false, pathD } = edge;

  const strokeColor = isHighlighted ? '#22d3ee' : color;
  const strokeWidth = isHighlighted ? 2.8 : 1.8;
  const markerId = `arrow-${id}`;

  // Default straight line path if custom pathD is not specified
  const d =
    pathD ||
    (sourceNode && targetNode
      ? `M ${sourceNode.x},${sourceNode.y} L ${targetNode.x},${targetNode.y}`
      : '');

  if (!d) return null;

  const midX = sourceNode && targetNode ? (sourceNode.x + targetNode.x) / 2 : 0;
  const midY = sourceNode && targetNode ? (sourceNode.y + targetNode.y) / 2 - 8 : 0;

  return (
    <g id={`explorer-edge-${id}`} className="transition-all duration-300 pointer-events-none">
      <defs>
        <marker
          id={markerId}
          viewBox="0 0 10 10"
          refX="7"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill={strokeColor} />
        </marker>
      </defs>

      {/* Path Line */}
      <path
        d={d}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray={dashed ? '5 4' : 'none'}
        markerEnd={`url(#${markerId})`}
        className="transition-all duration-300"
      />

      {/* Edge Label */}
      {label && (
        <g>
          {/* Label Text Shadow / Halo for crisp readability */}
          <text
            x={midX}
            y={midY}
            fill="none"
            stroke="#0f172a"
            strokeWidth="3.5"
            strokeLinejoin="round"
            fontSize="8"
            fontWeight="800"
            fontFamily="monospace"
            textAnchor="middle"
            className="select-none"
          >
            {label}
          </text>
          {/* Foreground Text */}
          <text
            x={midX}
            y={midY}
            fill={isHighlighted ? '#22d3ee' : '#94a3b8'}
            fontSize="8"
            fontWeight="800"
            fontFamily="monospace"
            textAnchor="middle"
            stroke="none"
            className="transition-colors select-none"
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
}
