import React from 'react';
import type { ExplorerNodeProps } from './types';

export default function ExplorerNode({
  node,
  isHovered,
  isSelected,
  onHover,
  onSelect,
}: ExplorerNodeProps) {
  const {
    id,
    label,
    sublabel,
    x,
    y,
    width = 90,
    height = 44,
    shape = 'rect',
    strokeColor = '#3b82f6',
    fillColor = '#0f172a',
    textColor = '#3b82f6',
    badge,
  } = node;

  const isActive = isSelected || isHovered;
  const currentStroke = isSelected
    ? '#22d3ee'
    : isHovered
    ? '#38bdf8'
    : strokeColor;
  const strokeWidth = isSelected ? 3 : isHovered ? 2.5 : 1.8;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(id);
    }
  };

  return (
    <g
      id={`explorer-node-${id}`}
      transform={`translate(${x}, ${y})`}
      className="cursor-pointer transition-all duration-200 select-none outline-none group"
      onMouseEnter={() => onHover(id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onSelect(id)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${label} - ${node.role}`}
      aria-pressed={isSelected}
    >
      {/* Node Glow Effect when Hovered or Selected */}
      {isActive && (
        <circle
          cx="0"
          cy="0"
          r={shape === 'circle' ? width / 2 + 8 : Math.max(width, height) / 2 + 8}
          fill={isSelected ? 'rgba(34,211,238,0.16)' : 'rgba(56,189,248,0.1)'}
          className="animate-pulse pointer-events-none"
        />
      )}

      {/* Node Shape */}
      {shape === 'circle' && (
        <circle
          cx="0"
          cy="0"
          r={width / 2}
          fill={fillColor}
          stroke={currentStroke}
          strokeWidth={strokeWidth}
          className="transition-all duration-300"
        />
      )}

      {shape === 'pill' && (
        <rect
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          rx={height / 2}
          fill={fillColor}
          stroke={currentStroke}
          strokeWidth={strokeWidth}
          className="transition-all duration-300"
        />
      )}

      {shape === 'rect' && (
        <rect
          x={-width / 2}
          y={-height / 2}
          width={width}
          height={height}
          rx={8}
          fill={fillColor}
          stroke={currentStroke}
          strokeWidth={strokeWidth}
          className="transition-all duration-300"
        />
      )}

      {/* Primary Label Text */}
      <text
        x="0"
        y={sublabel ? -3 : 3}
        fill={isSelected ? '#22d3ee' : textColor}
        fontSize={shape === 'circle' ? '14' : '10'}
        fontWeight="800"
        fontFamily="sans-serif"
        textAnchor="middle"
        stroke="none"
        className="pointer-events-none transition-colors"
      >
        {label}
      </text>

      {/* Sublabel Text */}
      {sublabel && (
        <text
          x="0"
          y="10"
          fill="#64748b"
          fontSize="8"
          fontWeight="600"
          fontFamily="sans-serif"
          textAnchor="middle"
          stroke="none"
          className="pointer-events-none"
        >
          {sublabel}
        </text>
      )}

      {/* Type Badge Checkmark */}
      {badge && isSelected && (
        <g transform={`translate(${width / 2 - 2}, ${-height / 2 - 2})`}>
          <circle cx="0" cy="0" r="6" fill="#22d3ee" />
          <text x="0" y="3" fill="#020617" fontSize="7" fontWeight="900" textAnchor="middle" stroke="none">
            ✓
          </text>
        </g>
      )}
    </g>
  );
}
