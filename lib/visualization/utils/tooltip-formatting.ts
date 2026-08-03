/**
 * @module TooltipFormatting
 * @purpose Formats node and metric telemetry tooltips.
 * @layer Layer 7 Visualizer / Utils
 * @dependencies None
 * @api formatNodeTooltip, formatMetricTooltip
 */

export function formatNodeTooltip(nodeId: string, nodeLabel: string, nodeType: string): string {
  return `Node: ${nodeLabel} (${nodeId}) | Type: ${nodeType}`;
}

export function formatMetricTooltip(metricName: string, value: number): string {
  return `${metricName}: ${value.toFixed(4)}`;
}
