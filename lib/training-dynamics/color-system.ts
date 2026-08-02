import { SimulationPreset } from '../types/training-dynamics';

export function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) || 0;
  const g = parseInt(cleanHex.substring(2, 4), 16) || 0;
  const b = parseInt(cleanHex.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;
}

export function getPresetPrimaryColor(preset: SimulationPreset): string {
  return preset.gradientColor || '#3B82F6';
}

export function getNodeStyleColors(
  preset: SimulationPreset,
  nodeIndex: number,
  totalNodes: number,
  health: number
): { nodeColor: string; borderColor: string; glow: number } {
  const primaryColor = preset.gradientColor;
  const ratio = totalNodes > 1 ? nodeIndex / (totalNodes - 1) : 1;

  switch (preset.connectionType) {
    case 'residual': {
      const isEven = nodeIndex % 2 === 0;
      return {
        nodeColor: '#0F172A',
        borderColor: isEven ? '#10B981' : 'rgba(255, 255, 255, 0.2)',
        glow: isEven ? 6 : 0,
      };
    }

    case 'dense': {
      return {
        nodeColor: '#0F172A',
        borderColor: '#8B5CF6',
        glow: 4,
      };
    }

    case 'batchnorm': {
      return {
        nodeColor: '#0F172A',
        borderColor: '#06B6D4',
        glow: 3,
      };
    }

    default: {
      if (preset.connectionStyle === 'unstable' || preset.gradientGrowthRate > 0.3) {
        return {
          nodeColor: primaryColor,
          borderColor: '#FCA5A5',
          glow: 12 + Math.random() * 4,
        };
      }

      if (preset.connectionStyle === 'weak' || preset.gradientDecayRate > 0.2) {
        const minAlpha = 0.05 + health * 0.1;
        const maxAlpha = 0.2 + ratio * 0.45;
        const opacity = Math.min(maxAlpha, minAlpha + ratio * 0.4);
        return {
          nodeColor: hexToRgba(primaryColor, opacity),
          borderColor: hexToRgba(primaryColor, opacity + 0.15),
          glow: ratio > 0.7 ? 4 : 0,
        };
      }

      return {
        nodeColor: '#334155',
        borderColor: 'rgba(255, 255, 255, 0.15)',
        glow: 0,
      };
    }
  }
}
