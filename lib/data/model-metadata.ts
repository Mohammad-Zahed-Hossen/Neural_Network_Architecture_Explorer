export type ModelCategory = 'VGG' | 'ResNet' | 'Inception' | 'Xception' | 'MobileNet' | 'EfficientNet' | 'DenseNet' | 'NASNet' | 'Foundational' | 'Transformer';
export type EfficiencyLevel = 'lightweight' | 'balanced' | 'powerful';

export interface ModelMetadata {
  id: string;
  name: string;
  fullName: string;
  paperYear: number;
  authors: string[];
  paperUrl: string;
  category: ModelCategory;
  efficiency: EfficiencyLevel;
  releaseYear?: number;
  depth: number;
  totalParameters: number;
  totalFLOPs: number;
  top1Accuracy: number;
  top5Accuracy: number;
  memoryUsage: number;
  description: string;
  tags: string[];
  colorTheme: string;
}
