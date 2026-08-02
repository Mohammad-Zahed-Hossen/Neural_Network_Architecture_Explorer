import {
  SimulationGraph,
  SimulationParticle,
  SimulationPreset,
  SimulationState,
} from '../types/training-dynamics';
import { generateJitter } from './physics';
import { hexToRgba } from './color-system';

export class SimulationRenderer {
  public render(
    ctx: CanvasRenderingContext2D,
    graph: SimulationGraph,
    particles: SimulationParticle[],
    preset: SimulationPreset,
    state: SimulationState
  ): void {
    const { width, height, nodes } = graph;

    // 0. Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (!nodes || nodes.length === 0) return;

    // 1. Draw Main Connections
    ctx.lineWidth = 2;
    for (let i = 0; i < nodes.length - 1; i++) {
      const start = nodes[i];
      const end = nodes[i + 1];

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);

      if (preset.connectionStyle === 'weak') {
        const alpha = 0.15 + (i / nodes.length) * 0.45;
        ctx.strokeStyle = hexToRgba(preset.gradientColor, alpha);
      } else if (preset.connectionStyle === 'unstable') {
        ctx.strokeStyle = hexToRgba(preset.gradientColor, 0.4 + Math.random() * 0.3);
        ctx.lineWidth = 3;
      } else if (preset.connectionType === 'residual') {
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.2)';
      } else if (preset.connectionType === 'dense') {
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
      } else if (preset.connectionType === 'batchnorm') {
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      } else {
        ctx.strokeStyle = hexToRgba(preset.gradientColor, 0.3);
      }

      ctx.stroke();

      // 2. Draw Special Connections (ResNet Skip Arcs & DenseNet Curves)
      if (preset.connectionType === 'residual' && i % 2 === 0 && i + 2 < nodes.length) {
        const nodeStart = nodes[i];
        const nodeEnd = nodes[i + 2];
        ctx.beginPath();
        ctx.arc(
          (nodeStart.x + nodeEnd.x) / 2,
          nodeStart.y,
          (nodeEnd.x - nodeStart.x) / 2,
          Math.PI,
          0,
          false
        );
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      if (preset.connectionType === 'dense') {
        for (let j = i + 2; j < nodes.length; j++) {
          const nodeStart = nodes[i];
          const nodeEnd = nodes[j];
          ctx.beginPath();
          const arcH = (nodeEnd.x - nodeStart.x) * 0.3;
          ctx.moveTo(nodeStart.x, nodeStart.y);
          ctx.bezierCurveTo(
            nodeStart.x + (nodeEnd.x - nodeStart.x) / 3,
            nodeStart.y - arcH,
            nodeStart.x + ((nodeEnd.x - nodeStart.x) * 2) / 3,
            nodeStart.y - arcH,
            nodeEnd.x,
            nodeEnd.y
          );
          const alpha = Math.max(0.05, 0.25 - (j - i) * 0.03);
          ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    }

    // 3. Draw Normalization Barriers (BatchNorm)
    if (preset.normalization) {
      ctx.lineWidth = 1.5;
      for (let i = 1; i < nodes.length - 1; i++) {
        const node = nodes[i];
        ctx.beginPath();
        ctx.moveTo(node.x - 15, node.y - 30);
        ctx.lineTo(node.x - 15, node.y + 30);
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.7)';
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(node.x - 15, node.y, 4, 15, 0, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.12)';
        ctx.fill();
      }
    }

    // 4. Draw Particles
    particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(1, p.size), 0, 2 * Math.PI);
      ctx.fillStyle = p.color;

      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;

      ctx.fill();
      ctx.restore();
    });

    // 5. Draw Layer Nodes
    nodes.forEach((node) => {
      ctx.save();

      let nodeX = node.x;
      let nodeY = node.y;

      if (preset.nodeShake > 0 || state.weightInitialization === 'random_large') {
        const jitter = generateJitter(preset.nodeShake || 2.0);
        nodeX += jitter.shakeX;
        nodeY += jitter.shakeY;
      }

      ctx.beginPath();
      ctx.arc(nodeX, nodeY, node.radius, 0, 2 * Math.PI);

      ctx.fillStyle = node.color;
      ctx.shadowBlur = node.glow;
      ctx.shadowColor = node.borderColor;
      ctx.fill();

      ctx.strokeStyle = node.borderColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Node Label
      ctx.fillStyle = '#94A3B8';
      ctx.font = width < 450 ? 'bold 8px monospace' : 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 0;
      ctx.fillText(node.label, nodeX, nodeY);

      ctx.restore();
    });
  }
}
