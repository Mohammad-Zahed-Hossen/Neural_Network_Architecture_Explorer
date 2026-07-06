import { Metadata } from 'next';
import ComparisonClient from '@/components/model-comparison/comparison-client';
import { getModelSummaries } from '@/lib/data-access/models';

export const metadata: Metadata = {
  title: 'Compare CNN Architectures | Neural Network Explorer',
  description: 'Compare classic Convolutional Neural Networks (VGG16, ResNet50, DenseNet121) side-by-side on accuracy, depth, parameters, memory, and architectural styles.',
};

// Get normalized model summaries from data access layer
const modelsData = getModelSummaries();

export default function ComparePage() {
  return <ComparisonClient models={modelsData} />;
}
