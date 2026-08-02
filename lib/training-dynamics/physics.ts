import { SimulationNode, SimulationGraph, SimulationPreset } from '../types/training-dynamics';
import { getNodeStyleColors } from './color-system';

export function calculateNodeLayout(
  depth: number,
  width: number,
  height: number,
  preset: SimulationPreset,
  layerHealth: number[] = []
): SimulationGraph {
  const nodes: SimulationNode[] = [];
  const paddingX = width < 450 ? 35 : 80;
  const stepX = depth > 1 ? (width - paddingX * 2) / (depth - 1) : 0;
  const centerY = height / 2;
  const nodeRadius = width < 450 ? 9 : 12;

  for (let i = 0; i < depth; i++) {
    const health = layerHealth[i] !== undefined ? layerHealth[i] : 1.0;
    const colors = getNodeStyleColors(preset, i, depth, health);

    nodes.push({
      id: `node-L${i}`,
      index: i,
      x: paddingX + i * stepX,
      y: centerY,
      radius: nodeRadius,
      label: `L${i}`,
      color: colors.nodeColor,
      borderColor: colors.borderColor,
      glow: colors.glow,
      health,
    });
  }

  return {
    nodes,
    connections: [],
    width,
    height,
    depth,
  };
}

export function getBezierPoint(
  startX: number,
  startY: number,
  control1X: number,
  control1Y: number,
  control2X: number,
  control2Y: number,
  endX: number,
  endY: number,
  t: number
): { x: number; y: number } {
  const invT = 1 - t;
  const invT2 = invT * invT;
  const invT3 = invT2 * invT;
  const t2 = t * t;
  const t3 = t2 * t;

  const x =
    invT3 * startX +
    3 * invT2 * t * control1X +
    3 * invT * t2 * control2X +
    t3 * endX;

  const y =
    invT3 * startY +
    3 * invT2 * t * control1Y +
    3 * invT * t2 * control2Y +
    t3 * endY;

  return { x, y };
}

export function evaluateArcHeight(
  startX: number,
  endX: number,
  progress: number,
  multiplier: number = 0.3
): number {
  const dist = Math.abs(startX - endX);
  return Math.sin(progress * Math.PI) * (dist * multiplier);
}

export function generateJitter(intensity: number): { shakeX: number; shakeY: number } {
  if (intensity <= 0) return { shakeX: 0, shakeY: 0 };
  return {
    shakeX: (Math.random() - 0.5) * intensity * 2,
    shakeY: (Math.random() - 0.5) * intensity * 2,
  };
}
