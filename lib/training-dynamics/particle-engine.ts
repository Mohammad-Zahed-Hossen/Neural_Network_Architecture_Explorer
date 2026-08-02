import {
  SimulationParticle,
  SimulationNode,
  SimulationPreset,
} from '../types/training-dynamics';
import { evaluateArcHeight, generateJitter } from './physics';

export class ParticleEngine {
  private particles: SimulationParticle[] = [];
  private nextId = 1;

  public getParticles(): SimulationParticle[] {
    return this.particles;
  }

  public clear(): void {
    this.particles = [];
  }

  public spawnBackpropPulse(
    nodes: SimulationNode[],
    preset: SimulationPreset
  ): void {
    if (nodes.length < 2) return;
    const lastIdx = nodes.length - 1;
    const sourceNode = nodes[lastIdx];

    if (preset.connectionType === 'dense' || preset.parallelConnections) {
      // In DenseNet, output connects to ALL preceding layers directly
      for (let targetIdx = lastIdx - 1; targetIdx >= 0; targetIdx--) {
        this.particles.push({
          id: `particle-${this.nextId++}`,
          x: sourceNode.x,
          y: sourceNode.y,
          speed: preset.particleSpeed + Math.random() * 1.5,
          size: 4,
          color: preset.gradientColor,
          alpha: 1.0,
          sourceNodeIdx: lastIdx,
          targetNodeIdx: targetIdx,
          pathIndex: targetIdx,
          progress: 0.0,
        });
      }
    } else {
      // Standard layer-by-layer step
      this.particles.push({
        id: `particle-${this.nextId++}`,
        x: sourceNode.x,
        y: sourceNode.y,
        speed: preset.particleSpeed,
        size: 5,
        color: preset.gradientColor,
        alpha: 1.0,
        sourceNodeIdx: lastIdx,
        targetNodeIdx: lastIdx - 1,
        pathIndex: 0,
        progress: 0.0,
      });
    }
  }

  public spawnAmbientParticle(
    nodes: SimulationNode[],
    preset: SimulationPreset
  ): void {
    if (nodes.length < 2) return;
    const lastIdx = nodes.length - 1;
    const sourceNode = nodes[lastIdx];

    if (preset.connectionType === 'dense') {
      const targetIdx = Math.floor(Math.random() * lastIdx);
      this.particles.push({
        id: `particle-${this.nextId++}`,
        x: sourceNode.x,
        y: sourceNode.y,
        speed: preset.particleSpeed * (0.8 + Math.random() * 0.4),
        size: 3,
        color: preset.gradientColor,
        alpha: 0.8,
        sourceNodeIdx: lastIdx,
        targetNodeIdx: targetIdx,
        pathIndex: targetIdx,
        progress: 0.0,
      });
    } else {
      this.particles.push({
        id: `particle-${this.nextId++}`,
        x: sourceNode.x,
        y: sourceNode.y,
        speed: preset.particleSpeed,
        size: 4,
        color: preset.gradientColor,
        alpha: 0.8,
        sourceNodeIdx: lastIdx,
        targetNodeIdx: lastIdx - 1,
        pathIndex: 0,
        progress: 0.0,
      });
    }
  }

  public update(
    nodes: SimulationNode[],
    preset: SimulationPreset,
    deltaTime: number = 1.0
  ): void {
    if (nodes.length < 2) {
      this.particles = [];
      return;
    }

    const surviving: SimulationParticle[] = [];

    for (const p of this.particles) {
      const sourceNode = nodes[p.sourceNodeIdx] || nodes[nodes.length - 1];
      const targetNode = nodes[p.targetNodeIdx];

      if (!targetNode) continue;

      if (preset.connectionType === 'dense') {
        // Dense Bezier arc path
        p.alpha -= 0.003 * deltaTime;
        p.x -= p.speed * deltaTime;

        const startX = sourceNode.x;
        const endX = targetNode.x;
        const totalDist = startX - endX;

        if (totalDist > 0) {
          p.progress = (startX - p.x) / totalDist;
          const arcH = evaluateArcHeight(startX, endX, p.progress, 0.3);
          p.y = sourceNode.y - arcH;
        }

        if (p.x <= endX || p.alpha <= 0) {
          continue; // particle reached destination
        }
      } else if (preset.connectionType === 'residual' && p.pathIndex === 1) {
        // Shortcut arc path
        const arcStartNode = nodes[p.targetNodeIdx + 2] || sourceNode;
        const arcEndNode = targetNode;

        p.x -= p.speed * deltaTime;
        const totalDist = arcStartNode.x - arcEndNode.x;

        if (totalDist > 0) {
          p.progress = (arcStartNode.x - p.x) / totalDist;
          const radius = totalDist / 2;
          p.y = arcStartNode.y - Math.sin(p.progress * Math.PI) * radius;
        }

        if (p.x <= arcEndNode.x) {
          // Continue backwards if not yet at input (L0)
          if (p.targetNodeIdx > 0) {
            p.sourceNodeIdx = p.targetNodeIdx;
            p.targetNodeIdx = p.targetNodeIdx - 1;
            p.pathIndex = 0; // next step standard path
            p.x = arcEndNode.x;
            p.y = arcEndNode.y;
          } else {
            continue; // Reached L0
          }
        }
      } else {
        // Standard Layer-by-Layer Linear Path
        const dx = targetNode.x - p.x;
        const dy = targetNode.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const step = p.speed * deltaTime;

        if (dist > step) {
          p.x += (dx / dist) * step;
          p.y += (dy / dist) * step;
        } else {
          // Reached layer target
          if (p.targetNodeIdx > 0) {
            p.x = targetNode.x;
            p.y = targetNode.y;
            p.sourceNodeIdx = p.targetNodeIdx;
            p.targetNodeIdx = p.targetNodeIdx - 1;

            // Shortcut branch selection for ResNet
            if (
              preset.connectionType === 'residual' &&
              p.targetNodeIdx % 2 === 0 &&
              p.targetNodeIdx >= 0
            ) {
              if (Math.random() < preset.skipProbability) {
                p.pathIndex = 1; // Take shortcut
                p.color = '#10B981';
                p.size = 5.5;
              } else {
                p.pathIndex = 0;
              }
            }

            // Vanishing decay effect
            if (preset.gradientDecayRate > 0) {
              p.size = Math.max(1, p.size - preset.gradientDecayRate * 1.5);
              p.alpha = Math.max(0.05, p.alpha - preset.gradientDecayRate * 0.3);
              p.speed = Math.max(0.5, p.speed - preset.gradientDecayRate * 0.5);
            }

            // Exploding growth effect
            if (preset.gradientGrowthRate > 0) {
              p.size += preset.gradientGrowthRate * 2.5;
              const jitter = generateJitter(preset.nodeShake || 3.0);
              p.y += jitter.shakeY;
            }

            // BatchNorm stabilization barrier
            if (preset.normalization) {
              p.alpha = 1.0;
              p.color = '#06B6D4';
              p.size = 4.5;
              p.speed = preset.particleSpeed;
            }
          } else {
            continue; // Reached layer 0
          }
        }
      }

      surviving.push(p);
    }

    this.particles = surviving;
  }
}
