/**
 * @module MetricScaling
 * @purpose Metric normalization and scaling helpers for visualizer charts and histograms.
 * @layer Layer 7 Visualizer / Utils
 * @dependencies None
 * @api normalizeMetric, scaleHistogramValues, formatNumber
 */

export function normalizeMetric(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return Math.max(0, Math.min(1, (value - min) / (max - min)));
}

export function scaleHistogramValues(values: number[], targetHeight: number = 100): number[] {
  const maxVal = Math.max(...values, 0.001);
  return values.map((v) => (v / maxVal) * targetHeight);
}

export function formatNumber(val: number, decimals: number = 4): string {
  if (Math.abs(val) < 0.0001 && val !== 0) {
    return val.toExponential(2);
  }
  return val.toFixed(decimals);
}
