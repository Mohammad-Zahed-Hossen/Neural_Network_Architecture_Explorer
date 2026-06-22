import { Metadata } from 'next';
import ComparisonClient from '@/components/model-comparison/comparison-client';
import modelsSummary from '@/data/models.json';

export const metadata: Metadata = {
  title: 'Compare CNN Architectures | Neural Network Explorer',
  description: 'Compare classic Convolutional Neural Networks (VGG16, ResNet50, DenseNet121) side-by-side on accuracy, depth, parameters, memory, and architectural styles.',
};

// Map JSON models to match ModelMetadata schema
const modelsData = modelsSummary.map(m => ({
  ...m,
  totalParameters: m.params,
  totalFLOPs: m.flops,
  top1Accuracy: m.top1 / 100,
  top5Accuracy: m.top5 / 100,
  memoryUsage: m.memory_mb,
  releaseYear: m.releaseYear,
  paperYear: m.year,
  depth: m.depth,
  colorTheme: m.colorTheme,
})) as any[];

export default function ComparePage() {
  return <ComparisonClient models={modelsData} />;
}
