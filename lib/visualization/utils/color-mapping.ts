/**
 * @module ColorMapping
 * @purpose Shared color scale interpolators for layer health, gradient magnitude, and stability status.
 * @layer Layer 7 Visualizer / Utils
 * @dependencies None
 * @api getHealthColor, getGradientColor, getStatusColor
 */

export function getHealthColor(healthScore: number): string {
  const score = Math.max(0, Math.min(100, healthScore));
  if (score >= 80) return '#10B981'; // Green (healthy)
  if (score >= 50) return '#F59E0B'; // Amber (warning)
  return '#EF4444'; // Red (critical)
}

export function getGradientColor(magnitude: number): string {
  if (magnitude > 10.0) return '#EF4444'; // Exploding (Red)
  if (magnitude < 0.1) return '#3B82F6'; // Vanishing (Blue)
  return '#10B981'; // Stable (Green)
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'running':
      return '#10B981';
    case 'paused':
      return '#F59E0B';
    case 'completed':
      return '#6366F1';
    case 'error':
    case 'exploded':
      return '#EF4444';
    case 'vanished':
      return '#3B82F6';
    default:
      return '#6B7280';
  }
}
