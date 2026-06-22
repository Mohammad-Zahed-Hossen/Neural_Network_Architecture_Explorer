import { Layer } from '@/lib/types/layer';

export interface LayerRFInfo {
  layerId: string;
  layerName: string;
  layerType: string;
  kernelSize: [number, number] | null;
  strides: [number, number] | null;
  padding: 'same' | 'valid' | null;
  effectiveRF: number;
  effectiveStride: number;
}

/**
 * Calculates the receptive field growth layer-by-layer for a given array of layers
 */
export function calculateReceptiveFields(layers: Layer[]): LayerRFInfo[] {
  const result: LayerRFInfo[] = [];
  
  let currentRF = 1;      // R_0 = 1 (input pixel)
  let currentStride = 1;  // S_0 = 1 (input stride)

  for (const layer of layers) {
    let k: [number, number] | null = null;
    let s: [number, number] | null = null;
    let pad: 'same' | 'valid' | null = null;

    // Extract kernel/pool size and strides based on layer type
    if (layer.type === 'conv2d') {
      const config = layer.config as any;
      k = config.kernelSize || [3, 3];
      s = config.strides || [1, 1];
      pad = config.padding || 'same';
    } else if (layer.type === 'max_pooling2d' || layer.type === 'average_pooling2d') {
      const config = layer.config as any;
      k = config.poolSize || [2, 2];
      s = config.strides || [2, 2];
      pad = config.padding || 'valid';
    }

    // If it is a spatial layer that alters receptive field
    if (k && s) {
      // Receptive field equation: RF_i = RF_{i-1} + (k_i - 1) * S_{i-1}
      // Note: We use the height dimension of the kernel/stride for the 1D timeline RF representation
      const kernelH = k[0];
      const strideH = s[0];
      
      currentRF = currentRF + (kernelH - 1) * currentStride;
      currentStride = currentStride * strideH;
    }

    result.push({
      layerId: layer.id,
      layerName: layer.name,
      layerType: layer.type,
      kernelSize: k,
      strides: s,
      padding: pad,
      effectiveRF: currentRF,
      effectiveStride: currentStride
    });
  }

  return result;
}
