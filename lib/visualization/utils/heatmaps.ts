/**
 * @module Heatmaps
 * @purpose Generates heatmap matrix data for layer stability and gradient norms.
 * @layer Layer 7 Visualizer / Utils
 * @dependencies None
 * @api generateLayerHeatmapData
 */

export interface HeatmapCell {
  readonly layerIndex: number;
  readonly stepIndex: number;
  readonly value: number;
  readonly color: string;
}

export function generateLayerHeatmapData(
  depth: number,
  gradientNorm: number,
  healthArray: number[]
): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  for (let i = 0; i < depth; i++) {
    const health = healthArray[i] ?? 100;
    const value = Number((health / 100).toFixed(2));
    let color = '#10B981';
    if (value < 0.5) color = '#EF4444';
    else if (value < 0.8) color = '#F59E0B';

    cells.push({
      layerIndex: i,
      stepIndex: 0,
      value,
      color,
    });
  }
  return cells;
}
